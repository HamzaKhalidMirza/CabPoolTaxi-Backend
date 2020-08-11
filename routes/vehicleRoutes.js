const express = require('express');
const vehicleController = require('../controllers/vehicleController');
const authController = require('./../controllers/authController');

const router = express.Router({ mergeParams: true });

// Protect all routes after this middleware
router.use(authController.protect);

router.get(
    '/getMyVehicle',
    authController.restrictTo('driver'),
    vehicleController.getMyVehicle
);

// Administration Related Routes
router.use(authController.restrictTo('lead-admin','assistant-admin'));

router
    .route('/')
    .get(vehicleController.getAllVehicles)
    .post(
        vehicleController.setDriverId,
        vehicleController.createVehicle
    );

router
    .route('/:id')
    .get(vehicleController.getVehicle)
    .patch(
        vehicleController.filterData,
        vehicleController.updateVehicle
    )
    .delete(vehicleController.deleteVehicle);

module.exports = router;