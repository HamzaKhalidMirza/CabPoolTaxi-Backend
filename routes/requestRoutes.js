const express = require('express');
const requestController = require('../controllers/requestController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

// Protect all routes after this middleware
router.use(authController.protect);

router.get(
    '/getClientRequests',
    authController.restrictTo('lead-admin', 'assistant-admin'),
    requestController.getSpecificClientAllRequests
);

router.get(
    '/getTripRequests',
    authController.restrictTo('lead-admin', 'assistant-admin'),
    requestController.getSpecificTripAllRequests
);

router.get(
    '/getCurrentClientRequests',
    authController.restrictTo('client'),
    requestController.getMe,
    requestController.getCurrentClientRequests
);

router.get(
    '/getCurrentDriverRequests',
    authController.restrictTo('driver'),
    requestController.getDriver,
    requestController.getCurrentDriverRequests
);

router.get(
    '/cancelRequest/:id',
    authController.restrictTo('client'),
    requestController.cancelRequest
);

router.get(
    '/rejectRequest/:id',
    authController.restrictTo('driver'),
    requestController.rejectRequest
);

router.get(
    '/approvedRequest/:id',
    authController.restrictTo('driver'),
    requestController.approvedRequest
);

router
    .route('/')
    .get(
        authController.restrictTo('lead-admin', 'assistant-admin'),
        requestController.getAllRequests
    )
    .post(
        authController.restrictTo('client'),
        requestController.setTripClientIds,
        requestController.createRequest
    );

router
    .route('/:id')
    .get(
        authController.restrictTo('lead-admin', 'assistant-admin', 'driver', 'client'),
        requestController.getRequest
    )
    .patch(
        authController.restrictTo('client'),
        requestController.updateRequest
    )
    .delete(
        authController.restrictTo('lead-admin', 'assistant-admin'),
        requestController.deleteRequest
    );

module.exports = router;