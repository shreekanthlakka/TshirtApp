const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt= require('jsonwebtoken');
const crypto = require('crypto');


const userSchema = new mongoose.Schema({
        name:{
                type: String,
                requires:[true,"Please Provide the name"],
                maxlength:[40,"Name should be under 40 charactors"]
        },
        email:{
                type: String,
                requires:[true,"Please provide an email"],
                validate:[validator.isEmail,"Please provide a valid email"],
                unique:true
        },
        password:{
                type :String ,
                required : [true,'Please provide the password'],
                minlength:[6,'provide atleast 6 charactors'],
                select:false
        },
        role:{
                type:String,
                default:'user'
        },
        photo:{
                id:{
                        type:String,
                        required:true,
                        default:"id value"
                },
                secure_url:{
                        type:String,
                        required:true,
                        default:"secure url value"
                }
        },
        forgotPasswordToken: String,
        forgotPasswordExpiry :Date,
        createdAt:{
                type:Date,
                default:Date.now,
        }

});


//encrypt password before save --HOOKS
userSchema.pre('save', async function(next){
        if(! this.isModified('password')){
                return next();
        }
        this.password = await bcrypt.hash(this.password , 10);
});
//validate the password
userSchema.methods.isValidatedPassword = async function(userSendPassword){
        return await bcrypt.compare(userSendPassword, this.password);
};

userSchema.methods.getJwtToken = function(){
        return jwt.sign({id:this._id},process.env.JWT_SECRET,{
                expiresIn: process.env.JWT_EXPIRY
        });
};


//
userSchema.methods.getForgotPasswordToken = function(){
        //generate a long and random string
        const forgotToken = crypto.randomBytes(20).toString("hex");

        this.forgotPasswordToken = crypto.createHash("sha256").update(forgotToken).digest("hex");

        //time for token
        this.forgotPasswordExpiry = Date.now() + 20*60*1000;

        return forgotToken;

}

module.exports = mongoose.model('User', userSchema);