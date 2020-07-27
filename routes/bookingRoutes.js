const express = require('express');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');
// const paymentRouter = require('./../routes/paymentRoutes');

const router = express.Router({ mergeParams: true });

// Protect all routes after this middleware
router.use(authController.protect);

// Booking related routes for a specific Payment
// router.use('/:bookingId/payments', paymentRouter);

router.get(
    '/getClientBookings',
    authController.restrictTo('lead-admin', 'assistant-admin'),
    bookingController.getSpecificClientAllBookings
);

router.get(
    '/getTripBookings',
    authController.restrictTo('lead-admin', 'assistant-admin', 'client', 'driver'),
    bookingController.getSpecificTripAllBookings
);

router.get(
    '/getCurrentClientBookings',
    authController.restrictTo('client'),
    bookingController.getMe,
    bookingController.getCurrentClientBookings
);

router.get(
    '/getCurrentDriverBookings',
    authController.restrictTo('driver'),
    bookingController.getDriver,
    bookingController.getCurrentDriverBookings
);

router.patch(
    '/cancelBooking/:id',
    authController.restrictTo('client', 'driver'),
    bookingController.cancelBooking,
    bookingController.filterData,
    bookingController.updateBooking
);

router
    .route('/')
    .get(
        authController.restrictTo('lead-admin', 'assistant-admin'),
        bookingController.getAllBookings
    );

router
    .route('/:id')
    .get(
        authController.restrictTo('lead-admin', 'assistant-admin', 'driver', 'client'),
        bookingController.getBooking
    )
    .patch(
        authController.restrictTo('client'),
        bookingController.updateBooking
    )
    .delete(
        authController.restrictTo('lead-admin', 'assistant-admin'),
        bookingController.deleteBooking
    );

module.exports = router;