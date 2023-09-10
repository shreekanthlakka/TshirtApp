const express = require('express');
const router = express.Router()

const { signup, 
        login, 
        logout, 
        forgotPassword, 
        passwordReset, 
        getLoggedInUserDetails, 
        changePassword, 
        updateUser, 
        adminUser,
        managerAllUsers,
        adminUserDetails,
        adminUserUpdate,
        adminDelUser,
} = require('../controllers/userController');
const { isLoggedIn , customRole } = require('../middlewares/user');


router.route('/signup').post(signup);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/forgotPassword').post(forgotPassword);
router.route('/password/reset/:token').post(passwordReset);
router.route('/userdashboard').get(isLoggedIn, getLoggedInUserDetails);
router.route('/password/update').post(isLoggedIn, changePassword);
router.route('/userdashboard/update').post( isLoggedIn, updateUser);

//admin routes
router.route('/admin/users').get(isLoggedIn, customRole('admin'), adminUser);
router.route('/admin/user/:id')
.get(isLoggedIn,customRole('admin'),adminUserDetails)
.put(isLoggedIn,customRole('admin'),adminUserUpdate)
.delete(isLoggedIn,customRole('admin'),adminDelUser)


router.route('/manager/users').get(isLoggedIn, customRole('manager'), managerAllUsers);

module.exports = router;