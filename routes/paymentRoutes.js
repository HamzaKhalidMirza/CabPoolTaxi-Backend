const express = require('express');
const authController = require('../controllers/authController');
const paymentController = require('../controllers/paymentController');

const router = express.Router({ mergeParams: true });

// Protect all routes after this middleware
router.use(authController.protect);

router.get(
    '/getCurrentDriverPayments',
    authController.restrictTo('driver'),
    paymentController.getDriver,
    paymentController.getCurrentDriverPayments
);
router.get(
    '/getCurrentClientPayments',
    authController.restrictTo('client'),
    paymentController.getClient,
    paymentController.getCurrentClientPayments
);

router
    .route('/')
    .get(
        authController.restrictTo('lead-admin', 'assistant-admin'),
        paymentController.getAllPayments
    )
    .post(
        authController.restrictTo('driver'),
        paymentController.createPayment
    );

router
    .route('/:id')
    .get(
        authController.restrictTo('lead-admin', 'assistant-admin'),
        paymentController.getPayment
    )
    .patch(
        authController.restrictTo('lead-admin', 'assistant-admin'),
        paymentController.updatePayment
    )
    .delete(
        authController.restrictTo('lead-admin', 'assistant-admin'),
        paymentController.deletePayment
    );

module.exports = router;