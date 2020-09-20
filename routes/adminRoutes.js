const express = require('express');
const adminController = require('./../controllers/adminController');
const authController = require('./../controllers/authController');

const router = express.Router();

// Login Related Routes
router.post('/login', adminController.login);

// Frogot Password Related Routes
router.post('/forgotPassword', adminController.forgotPassword);
router.post('/verifyForgotPasswordCode', adminController.verifyForgotPasswordCode);
router.patch('/resetPassword', adminController.resetPassword);

// Protect all routes after this middleware
router.use(authController.protect);

// Current User Related
router.get(
    '/me',
    authController.restrictTo('lead-admin','assistant-admin'),
    adminController.getMe,
    adminController.getUser
);
router.delete(
    '/deleteMe',
    authController.restrictTo('lead-admin','assistant-admin'),
    adminController.getMe,
    adminController.deleteUser
);
router.patch(
    '/deactivateMe',
    authController.restrictTo('lead-admin','assistant-admin'),
    adminController.deactivateMe
);
router.patch(
    '/updateMyPassword',
    authController.restrictTo('lead-admin','assistant-admin'),
    authController.updatePassword
);
router.patch(
    '/updateMe',
    authController.restrictTo('lead-admin','assistant-admin'),
    adminController.generatePasswordError,
    adminController.updateMe
);

// Administration Related Routes
router.use(authController.restrictTo('lead-admin'));

router.post('/getVerificationCode', adminController.getVerificationCode);
router.post('/verifyCode', adminController.verifyCode);

router.get('/getDashboardData', adminController.getDashboardData);

router
    .route('/')
    .get(adminController.getAllUsers)
    .post(
        adminController.setUsername,
        adminController.createUser
    );

router
    .route('/:id')
    .get(adminController.getUser)
    .patch(
        adminController.generatePasswordError,
        adminController.setUsername,
        adminController.updateUser
    )
    .delete(adminController.deleteUser);

module.exports = router;