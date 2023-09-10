const User = require('../models/user');
const CustomError = require('../utils/customError');
const BigPromise = require('./bigPromise');
const jwt = require('jsonwebtoken');

exports.isLoggedIn = BigPromise(async(req,res,next)=>{
        const token = req.cookies.token || req.header("Authorization").replace("Bearer ","");
        if(!token){
                return next(new CustomError("Login first to access the page ",401));
        }

        const decode = jwt.verify(token,process.env.JWT_SECRET);
        console.log(decode);
        req.user = await User.findById(decode.id);
        next();
})

exports.customRole = (...roles) => {
        return (req,res,next) => {
                if( ! roles.includes(req.user.role)){
                        return next(new CustomError("u are not authorised to use this route",403))
                }
                next();
        }
}