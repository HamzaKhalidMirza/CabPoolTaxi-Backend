const express = require('express');
const driverController = require('./../controllers/driverController');
const authController = require('./../controllers/authController');
const vehicleRouter = require('./../routes/vehicleRoutes');
const tripRouter = require('./../routes/tripRoutes');
// const reviewRouter = require('./../routes/reviewRoutes');

const router = express.Router();

// Login Related Routes
router.post('/verifyPhoneExistance', driverController.verifyPhoneExistance);
router.post('/login', driverController.login);

// Frogot Password Related Routes
router.post('/forgotPassword', driverController.forgotPassword);
router.post('/verifyForgotPasswordCode', driverController.verifyForgotPasswordCode);
router.patch('/resetPassword', driverController.resetPassword);

// Protect all routes after this middleware
router.use(authController.protect);

// Current User Related
router.get(
    '/me',
    authController.restrictTo('driver'),
    driverController.getMe,
    driverController.getUser
);
router.delete(
    '/deleteMe',
    authController.restrictTo('driver'),
    driverController.getMe,
    driverController.deleteUser
);
router.patch(
    '/deactivateMe',
    authController.restrictTo('driver'),
    driverController.deactivateMe
);
router.patch(
    '/updateMyPassword',
    authController.restrictTo('driver'),
    authController.updatePassword
);
router.post(
    '/updateMe',
    authController.restrictTo('driver'),
    driverController.generatePasswordError,
    driverController.updateMe
);

// Vehicle related routes for a specific Driver
router.use('/:driverId/vehicles', vehicleRouter);
// // Trip related routes for a specific Driver
router.use('/:driverId/trips', tripRouter);
// // Review related routes for a specific Driver
// router.use('/:driverId/reviews', reviewRouter);

// Administration Related Routes
router.use(authController.restrictTo('lead-admin', 'assistant-admin'));

router
    .route('/')
    .get(driverController.getAllUsers)
    .post(
        driverController.setUsername,
        driverController.createUser
    );

router
    .route('/:id')
    .get(driverController.getUser)
    .patch(
        driverController.generatePasswordError,
        driverController.setUsername,
        driverController.updateUser
    )
    .delete(driverController.deleteUser);

module.exports = router;