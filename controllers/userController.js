const User = require('../models/user');
const BigPromise = require('../middlewares/bigPromise');
const CustomError = require('../utils/customError');
const cookieToken = require('../utils/cookieToken');
const fileUpload = require('express-fileupload');
const cloudinary = require('cloudinary');
const mailHelper = require('../utils/emailHealper');
const crypto= require('crypto');


exports.signup = BigPromise( async (req , res , next) => {
        if(!req.files){
                return next(new CustomError("Please upload a photo",400));
        }
        const { name , email , password } = req.body;
        if(!email || !name || !password){
                return next(new CustomError("name email password required", 400));
        }

        let file = req.files.photo;
        // console.log(`file--->${file.tempFilePath}`);
        const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
                folder: "users",
                width:150,
                crop:"scale",
        });
        //writing to db
        const user = await User.create({
                name,
                email,
                password,
                photo:{
                        id : result.public_id,
                        secure_url : result.secure_url,
                },
        })

        cookieToken(user,res);

});

exports.login = BigPromise( async(req,res,next)=>{
        const { email , password } = req.body;
        if(!email || !password){
                return next(new CustomError("Please provide an email and Password",400))
        }

        const user = await User.findOne({email}).select("+password");
        if(!user){
                return next(new CustomError("Invalid Credentials---not an user",400))
        }

        const isPasswordCurrect = await user.isValidatedPassword( password );
        if(!isPasswordCurrect){
                return next(new CustomError("Invalid Credentials ----not the currect password",400))
        }
        cookieToken(user,res);
});

exports.logout = BigPromise(async(req,res,next)=>{
        // console.log(`cookie before logout --->${res.cookie}`);
        res.cookie("token",null,{
                expires:new Date(Date.now()),
                httpOnly:true,
        })
        // console.log(`cookie after logout --->${cookie}`);
        res.status(200).json({
                status:'success',
                message:'User logged out successfully'
        });
});

exports.forgotPassword = BigPromise(async(req,res,next)=>{
        const {email} = req.body;

        const user = await User.findOne({email});
        if(!user){
                return next(new CustomError("email not found",400));
        }

        const forgotToken = user.getForgotPasswordToken();

        await user.save({validateBeforeSave:false});

        const myurl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${forgotToken}`

        console.log(`myurl----->${myurl}`);

        const message = `${myurl}`

        try {
                await mailHelper({
                        email: user.email,
                        subject:"Password reset email--T SHIRT STORE",
                        message,
                })
                res.status(200).json({
                        success:true,
                        message:`An email has been sent to your registered email address with further instructions on how to proceed`
                });
        } catch (error) {
                user.forgotPasswordToken = undefined;
                user.forgotPasswordExpiry = undefined;
                await user.save({validateBeforeSave:false});

                return next(new CustomError(error.message , 500));
        };
});

exports.passwordReset = BigPromise( async(req,res,next) => {
        const token = req.params.token;
        // console.log(`token params---------->${token}`);
        const encryToken = crypto.createHash("sha256").update(token).digest("hex");
        // console.log(`encryToken is ---------->${encryToken}`);
        const user = await User.findOne({forgotPasswordToken:encryToken,
                forgotPasswordExpiry: {$gt:Date.now()},
        });

        // console.log(user.email);
        // console.log(user.forgotPasswordToken);
        // console.log(user.forgotPasswordExpiry);

        if(!user){
                return next(new CustomError("Token is invalid or expires"))
        }
        if(req.body.password !== req.body.confirmPassword){
                return next(new CustomError("Password and Confirm Password didnt match",400));
        }
        user.password = req.body.password;
        user.forgotPasswordExpiry = undefined;
        user.forgotPasswordToken = undefined;

        await user.save();

        //sending token to user

        cookieToken(user,res);

})

exports.getLoggedInUserDetails = BigPromise( async(req,res,next) => {
        const user = await User.findById(req.user.id)
        res.status(200).json({
                success: true,
                user,
        });
});

exports.changePassword = BigPromise(async(req,res,next) => {
        const userId = req.user.id;
        const user = await User.findById(userId).select("+password");
        //first check oldpassword is currect
        const isOldPassword = await user.isValidatedPassword(req.body.oldPassword)
        //
        if(!isOldPassword){
                return next(new CustomError("Old password is incurrect",400));
        }

        user.password = req.body.password;

        await user.save()

        cookieToken(user,res);
});

exports.updateUser = BigPromise(async(req,res,next)=>{
        const newData = {
                name : req.body.name,
                email:req.body.email
        };
        if(req.files.photo !== ""){
                const user = await User.findById(req.user.id);
                const resp = await cloudinary.v2.uploader.destroy(user.photo.id); //del the old photo
                const result = await cloudinary.v2.uploader.upload(req.files.photo.tempFilePath,{
                        folder:"users",
                        width:150,
                        crop:"scale",
                });
                newData.photo ={
                        id:result.public_id,
                        secure_url:result.secure_url
                };
        }
        const user = await User.findByIdAndUpdate(req.user.id , newData , {
                new:true,
                runValidators:true,
                useFindAndModify:false
        });
        res.status(200).json({
                success:true,
        });
});

exports.adminUser = BigPromise(async(req,res,next) =>{
        const users = await User.find();
        console.log(users);
        res.status(200).json({
                success:true,
                users,
        });
});

exports.adminUserDetails = BigPromise( async(req,res,next) => {
        const user =await User.findById(req.params.id);
        if(!user){
                return next(new CustomError("No user with the above credentials",400));
        }
        res.status(200).json({
                success: true,
                user,
        })

});

exports.adminUserUpdate = BigPromise(async(req,res,next) => {
        // const user = await User.findById(req.params.id)
        // if(!user){
        //         return next(new CustomError("No user with this id",400))
        // }

        const {name , email} = req.body;
        if(!name ||!email){
                return next(new CustomError("name and email fields are required",400));
        }
        const newData = {
                name : name,
                email : email,
        };
        const user = await User.findByIdAndUpdate(req.params.id , newData , {
                new:true,
                runValidators:true,
                useFindAndModify:false
        });
        res.status(200).json({
                success:true,
        });

});

exports.adminDelUser = BigPromise(async(req,res,next) => {
        const user = await User.findById(req.params.id);
        console.log(user);
        if(!user){
                return  next (new CustomError ("no such a user exists" , 401 )) ;
        }
        await cloudinary.v2.uploader.destroy(user.photo.id);

        await user.deleteOne()

        res.status(200).json({
                success: true,
        })

});

exports.managerAllUsers = BigPromise( async(req,res,next) => {
        const user = await User.find({role:'user'});
        res.status(200).json({
                sucess : true,
                user,
        })
});

