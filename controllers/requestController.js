const Request = require("../models/requestModel");
const Booking = require("../models/bookinModel");
const Trip = require("../models/tripModel");
const factory = require("./handlerFactory");
const catchAsync = require("./../utils/catchAsync");

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.filterData = catchAsync(async (req, res, next) => {
  const filteredBody = filterObj(req.body, "status");
  req.body = filteredBody;
  next();
});

exports.setTripClientIds = async (req, res, next) => {
  // Allow nested routes
  if (!req.body.trip) req.body.trip = req.params.tripId;
  if (!req.body.driver) req.body.driver = req.params.driverId;
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

exports.cancelRequest = catchAsync(async (req, res, next) => {
  req.body.status = "cancelled";
  const doc = await Request.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!doc) {
    return next(new AppError("No document found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      data: doc,
    },
  });
});

exports.rejectRequest = catchAsync(async (req, res, next) => {
  req.body.status = "rejected";
  const doc = await Request.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  const io = req.io;
  const requestEvent = doc.client.id + '-clientReceivedRequest';

  if (!doc) {
    return next(new AppError("No document found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      data: doc,
    },
  });
  io.emit(requestEvent, doc);
});

exports.approvedRequest = catchAsync(async (req, res, next) => {
  req.body.status = "approved";
  const doc = await Request.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  const io = req.io;
  const requestEvent = doc.client.id + '-clientReceivedRequest';

  if (!doc) {
    return next(new AppError("No document found with that ID", 404));
  }
  console.log(doc);

  let booking = new Booking();
  let trip = await Trip.findById(doc.trip);
  booking.seatsReserved = doc.seatsReserved,
  booking.startLocation = doc.startLocation,
  booking.endLocation = doc.endLocation,
  booking.trip = doc.trip,
  booking.client = doc.client
  booking.driver = doc.driver;
  trip.seatsAvailable = trip.seatsAvailable - doc.seatsReserved;
  await booking.save();
  await trip.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    data: {
      data: doc,
    },
  });
  io.emit(requestEvent, doc);
});

exports.getSpecificClientAllRequests = factory.getAll(Request);
exports.getSpecificTripAllRequests = factory.getAll(Request);
exports.getCurrentClientRequests = factory.getAll(Request);
exports.getCurrentDriverRequests = factory.getAll(Request);

exports.getRequest = factory.getOne(Request);
exports.getAllRequests = factory.getAll(Request);
exports.createRequest =   catchAsync(async (req, res, next) => {
  const doc = await Request.create(req.body);
  const io = req.io;
  const requestEvent = doc.driver + '-driverReceivedRequest';

  res.status(201).json({
    status: 'success',
    data: {
      data: doc
    }
  });
  io.emit(requestEvent, doc);
});


exports.updateRequest = factory.updateOne(Request);
exports.deleteRequest = factory.deleteOne(Request);
