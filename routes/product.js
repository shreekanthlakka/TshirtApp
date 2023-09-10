const express = require('express');
const router = express.Router();

const {
        testProduct,
        addProduct,
        getAllProducts,
        adminGetAllProduct,
        getProduct,
        adminUpdateAProduct,
        admindeleteAProduct,
        addReview,
        deleteReview,
        getReviewsForOneProduct,
} = require('../controllers/productController');
const { isLoggedIn, customRole } = require('../middlewares/user');
//test route
router.route('/testproduct').get(testProduct);

//user routes
router.route('/products').get(getAllProducts);
router.route('/product/:id').get(getProduct);
router.route('/review')
.put(isLoggedIn,addReview)
.delete(isLoggedIn,deleteReview);
router.route('/reviews').get(getReviewsForOneProduct)


//admin routes
router.route('/admin/product/add').post(isLoggedIn , customRole('admin') , addProduct);
router.route('/admin/products').get(isLoggedIn , customRole('admin') , adminGetAllProduct);
router.route('/admin/product/:id')
.put(isLoggedIn,customRole('admin'),adminUpdateAProduct)
.delete(isLoggedIn , customRole('admin'),admindeleteAProduct)




module.exports = router;