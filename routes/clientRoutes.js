const express = require('express');
const clientController = require('../controllers/clientController');
const authController = require('../controllers/authController');
const requestRouter = require('./../routes/requestRoutes');
// const bookingRouter = require('./../routes/bookingRoutes');
// const reviewRouter = require('./../routes/reviewRoutes');

const router = express.Router();

// Signup Related Routes
router.post('/checkPhoneExistance', clientController.checkPhoneExistance);
router.post('/checkEmailExistance', clientController.checkEmailExistance);
router.post('/getVerificationCode', clientController.getVerificationCode);
router.post('/verifyCode', clientController.verifyCode);
router.post('/signup', clientController.signup);

// Login Related Routes
router.post('/verifyPhoneExistance', clientController.verifyPhoneExistance);
router.post('/login', clientController.login);

// Frogot Password Related Routes
router.post('/forgotPassword', clientController.forgotPassword);
router.post('/verifyForgotPasswordCode', clientController.verifyForgotPasswordCode);
router.patch('/resetPassword', clientController.resetPassword);
// router.post('/forgotPassword', clientController.forgotPassword);
// router.patch('/resetPassword/:token', clientController.resetPassword);

// Protect all routes after this middleware
router.use(authController.protect);

// Review related routes for a specific Client
// router.use('/:clientId/reviews', reviewRouter);
// Trip related routes for a specific Driver
// router.use('/:clientId/bookings', bookingRouter);
// Trip related routes for a specific Driver
router.use('/:clientId/requests', requestRouter);

// Current User Related
router.get(
    '/me',
    authController.restrictTo('client'),
    clientController.getMe,
    clientController.getUser
);
router.delete(
    '/deleteMe',
    authController.restrictTo('client'),
    clientController.getMe,
    clientController.deleteUser
);
router.patch(
    '/deactivateMe',
    authController.restrictTo('client'),
    clientController.deactivateMe
);
router.patch(
    '/updateMyPassword',
    authController.restrictTo('client'),
    authController.updatePassword
);
router.patch(
    '/updateMe',
    authController.restrictTo('client'),
    clientController.generatePasswordError,
    clientController.updateMe
);

// Administration Related Routes
router.use(authController.restrictTo('lead-admin', 'assistant-admin'));

router
    .route('/')
    .get(clientController.getAllUsers)
    .post(clientController.createUser);

router
    .route('/:id')
    .get(clientController.getUser)
    .patch(
        clientController.generatePasswordError,
        clientController.updateUser
    )
    .delete(clientController.deleteUser);

module.exports = router;