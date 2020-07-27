const express = require('express');
const tripController = require('../controllers/tripController');
const authController = require('../controllers/authController');
const requestRouter = require('./../routes/requestRoutes');
// const bookingRouter = require('./../routes/bookingRoutes');
// const reviewRouter = require('./../routes/reviewRoutes');

const router = express.Router({ mergeParams: true });

// Protect all routes after this middleware
router.use(authController.protect);

// Administration Related Routes
// router.use(authController.restrictTo('lead-admin', 'assistant-admin'));

router.get(
    '/getDriverTrips',
    authController.restrictTo('lead-admin', 'assistant-admin'),
    tripController.getSpecificDriverAllTrips
);
router.get(
    '/getDriverTrip/:id',
    authController.restrictTo('lead-admin', 'assistant-admin'),
    tripController.getSpecificDriverTrip
);

router.get(
    '/getClientTrips',
    authController.restrictTo('lead-admin', 'assistant-admin'),
    tripController.getSpecificClientAllTrips
);
router.get(
    '/getClientTrip/:tripId',
    authController.restrictTo('lead-admin', 'assistant-admin'),
    tripController.getSpecificClientTrip
);

router.get(
    '/getCurrentDriverTrips',
    authController.restrictTo('driver'),
    tripController.getMe,
    tripController.getCurrentDriverTrips
);
router.get(
    '/getCurrentDriverTrip/:id',
    authController.restrictTo('driver'),
    tripController.getMe,
    tripController.getCurrentDriverTrip
);

router.get(
    '/getCurrentClientTrips',
    authController.restrictTo('client'),
    tripController.getCuurentClientTrips
);
router.get(
    '/getCurrentClientTrip/:tripId',
    authController.restrictTo('client'),
    tripController.getCurrentClientTrip
);

router.get(
    '/trips-within/start-loc/:startLatLng/end-loc/:endLatLng',
    authController.restrictTo('client', 'lead-admin', 'assistant-admin'),
    tripController.getTripsWithin
);

router.patch(
    '/cancelTrip/:id',
    authController.restrictTo('driver'),
    tripController.cancelTrip,
    tripController.filterData,
    tripController.updateTrip
);

// // Booking related routes for a specific Trip
router.use('/:tripId/requests', requestRouter);
// // Booking related routes for a specific Trip
// router.use('/:tripId/bookings', bookingRouter);
// // Review related routes for a specific Trip
// router.use('/:tripId/reviews', reviewRouter);

router
    .route('/')
    .get(
        authController.restrictTo('lead-admin', 'assistant-admin'),
        tripController.getAllTrips
    )
    .post(
        authController.restrictTo('driver'),
        tripController.setDriverId,
        tripController.setVehicleId,
        tripController.createTrip
    );

router
    .route('/:id')
    .get(
        authController.restrictTo('lead-admin', 'assistant-admin', 'client'),
        tripController.getTrip
    )
    .patch(
        authController.restrictTo('driver'),
        tripController.updateTrip
    )
    .delete(
        authController.restrictTo('lead-admin', 'assistant-admin'),
        tripController.deleteTrip
    );

module.exports = router;