const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({

        name:{
                type:String,
                required:[true,'please provide the name of the product'],
                maxlength:[120,'should not exceed more than 120 charactors'],
                trim:true,
        },
        price:{
                type:Number,
                required:[true,'please provide the value of the product'],
                maxlength:[5,'price should not exceed more than 5 digits'],
        },
        description:{
                type:String,
                required:[true,'please write the description  of the product'],
        },
        photos:[
                {
                        id:{
                                type:String,
                                required:true,
                        },
                        secure_url:{
                                type:String,
                                required:true,
                        }
                }
        ],
        category:{
                type:String,
                required:[true,'please select the category from- short-sleeves,long-sleeves,sweat-shirts,hoodies'],
                enum:{
                        values:['shortsleeves','longsleeves','sweatshirts','hoodies'],
                        message:"please select the category ONLY from- short-sleeves long-sleeves sweat-shirt hoodies"
                },
        },
        stock:{
                type:Number,
                required:[true,"please add the stock details"]
        },
        brand:{
                type:String,
                required:[true,'please select the brand  of the product'],
        },
        ratings:{
                type:Number,
                default:0
        },
        numOfReviews:{
                type:Number,
                default:0
        },
        reviews:[
                {
                        user:{
                                type:mongoose.Schema.ObjectId,
                                ref:'User',
                                required:true
                        },
                        name:{
                                type:String,
                                required: true
                        },
                        rating:{
                                type:Number,
                                required:true
                        },
                        comment:{
                                type:String,
                                required:true
                        }
                }
        ],
        user:{
                type:mongoose.Schema.ObjectId,
                required:true,
                ref:'User',
        },
        createdAt:{
                type:Date,
                default : Date.now,
        },
});

module.exports = mongoose.model('Product',productSchema);