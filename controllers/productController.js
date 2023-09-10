const Product = require('../models/product');
const BigPromise = require('../middlewares/bigPromise');
const CustomError = require('../utils/customError');
const cloudinary = require('cloudinary');
const WhereClause = require('../utils/whereClause');


exports.addProduct = BigPromise( async(req, res, next) => {
        //images
        let imageArray = [];
        if(!req.files){
                return next(new CustomError("images are required",401));
        }
        if(req.files){
                for(let i=0; i < req.files.photos.length; i++){
                        let result = await cloudinary.v2.uploader.upload(req.files.photos[i].tempFilePath , {
                                folder:"products"
                        })

                        imageArray.push({
                                id: result.public_id,
                                secure_url:result.secure_url,
                        })
                }
        }

        req.body.photos = imageArray;
        req.body.user = req.user.id;

        const product = await Product.create(req.body);

        res.status(200).json({
                success:true,
                product,
        })

});

exports.getAllProducts = BigPromise(async(req,res,next) => {

        // console.log(req.query);
        const resultPerPage = 6;
        const totalProductCount = await Product.countDocuments() //builtin method

        const productsObj = new WhereClause(Product.find(),req.query).search().filter();

        let products = await productsObj.base;

        const filteredProductCount = products.length;

        productsObj.pager(resultPerPage)
        products = await productsObj.base.clone();

        res.status(200).json({
                success : true,
                products,
                filteredProductCount,
                totalProductCount,
        });
});

exports.getProduct = BigPromise(async(req,res,next) => {
        const product = await Product.findById(req.params.id);
        if(!product){
                return next(new CustomError("No Product found with this id",401));
        }
        res.status(200).json({
                success : true ,
                product,
        });
});

exports.adminGetAllProduct = BigPromise( async(req,res,next) => {
        const products = await Product.find();

        res.status(200).json({
                success:true,
                products
        });
});

exports.adminUpdateAProduct = BigPromise(async(req,res,next) => {
        let product = await Product.findById(req.params.id);
        if(!product){
                return next(new CustomError("No product with this ID",401));
        }

        let imageArray = [];
        if(req.files){
                //del the old images
                for (let i = 0; i < product.photos.length; i++) {
                        const res = await cloudinary.v2.uploader.destroy(product.photos[i].id);
                }
                for (let i = 0; i < req.files.photos.length; i++) {
                        let result = await cloudinary.v2.uploader.upload(req.files.photos[i].tempFilePath,{
                                folder:"products"  //
                        })
                        imageArray.push({
                                id:result.public_id,
                                secure_url:result.secure_url,
                        });
                }
                req.body.photos = imageArray; //if photos are present then update
        }
        if(!req.files){
                // console.log("product photos is ",product.photos);
                req.body.photos = product.photos; //if no photos then pass old photo reff if u r not updating the photos
        }
        product = await Product.findByIdAndUpdate(req.params.id,req.body,{
                new:true,
                runValidators:true,
                useFindAndModify:false
        });

        res.status(200).json({
                success:true,
                product
        });
});

exports.admindeleteAProduct = BigPromise(async(req,res,next) => {
        const product = await Product.findById(req.params.id);
        if(!product){
                return next(new CustomError("we didnt found the product with this id",400))
        };
        for(let i = 0; i<product.photos.length ;i++){
                await cloudinary.v2.uploader.destroy(product.photos[i].id)
        };
        const delProduct = await product.remove();

        res.status(200).json({
                success:true,
                delProduct,

        })
});

exports.addReview = BigPromise( async(req, res,next) => {
        const {comment,rating,productId} = req.body;

        const review = {
                user : req.user._id,
                name : req.user.name,
                rating : Number(rating),
                comment
        };
        const product = await Product.findById(productId);
        const alreadyreviewed = product.reviews.find((ele) => ele.user.toString() === req.user._id.toString());
        if(alreadyreviewed){
                product.reviews.forEach((ele) => {
                        if(ele.user.toString() === req.user._id.toString()){
                                ele.comment = comment
                                ele.rating = rating
                        }
                })
        }else{
                product.reviews.push(review);
                product.numOfReviews = product.reviews.length;
        }

        product.ratings = product.reviews.reduce((acc,val) => val.rating+acc,0) /product.reviews.length ;

        await product.save({validateBeforeSave:false});

        res.status(200).json({
                success:true
        });


} );

exports.deleteReview = BigPromise(async(req,res,next) => {
        const {productId} = req.query;
        const product = await Product.findById(productId);
        const reviews = product.reviews.filter((ele) => ele.user.toString() ===req.user._id.toString())
        const numOfReviews = reviews.length;
        product.ratings = product.reviews.reduce((acc,val) => val.rating+acc,0) /product.reviews.length ;

        await Product.findByIdAndUpdate(productId,{
                reviews,
                ratings,
                numOfReviews
        },{new:true, runValidators:true,useFindAndModify:false});

        res.status(200).json({
                success:true
        });

});

exports.getReviewsForOneProduct = BigPromise(async(req,res,next) => {
        const product = await Product.findById(req.query.id)
        res.status(200).json({
                sucess:true,
                rewiews:product.reviews,
        })
});

exports.testProduct = async(req,res) => {

        //api/v1/testproduct?search=sreekanth&page=2&category=shortsleeves&ratings[gte]=4&price[lte]=999&price[gte]=199
        //https://www.amazon.in/s?i=shoes&bbn=1983518031
        //&rh=n%3A1571283031%2Cn%3A1983396031%2Cn%3A1983518031%2Cn%3A9780814031%2Cp_n_feature_nineteen_browse-bin%3A11301363031
        //&dc
        //&ds=v1%3A5IBxOr1aS1NV3LKXKnk3Zfm%2Bzm6JXa%2FUm%2FIHncnWaYI&rnid=1571283031&ref=sr_nr_n_1
        console.log(req.query);
        res.status(200).json({
                success:true,
                greetings:"hello from test product route"
        });
};
