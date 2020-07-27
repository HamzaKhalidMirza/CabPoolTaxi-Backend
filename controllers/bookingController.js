const Booking = require('../models/bookinModel');
const factory = require('./handlerFactory');
const catchAsync = require('./../utils/catchAsync');

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};

exports.filterData = catchAsync(async (req, res, next) => {
    const filteredBody = filterObj(req.body, 'status', 'cancellationReason', 'cancellationEnd');
    req.body = filteredBody;
    next();
});

exports.setTripClientIds = async (req, res, next) => {
    // Allow nested routes
    if (!req.body.trip) req.body.trip = req.params.tripId;
    if (!req.body.client) req.body.client = req.user.id;
    next();
};

exports.getMe = (req, res, next) => {
    req.params.clientId = req.user.id;
    next();
};

exports.getDriver = (req, res, next) => {
    req.params.driverId = req.user.id;
    next();
};

exports.cancelBooking = catchAsync(async (req, res, next) => {
    req.body.status = "cancelled";
    req.body.cancellationEnd = req.user.role;
    next();
});

exports.getSpecificClientAllBookings = factory.getAll(Booking);
exports.getSpecificTripAllBookings = factory.getAll(Booking);
exports.getCurrentClientBookings = factory.getAll(Booking);
exports.getCurrentDriverBookings = factory.getAll(Booking);

exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);

exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
