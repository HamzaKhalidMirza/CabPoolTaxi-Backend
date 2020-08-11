const path = require("path");
const Vehicle = require("../models/vehicleModel");
const factory = require("./handlerFactory");
const AppError = require("./../utils/appError");
const catchAsync = require("./../utils/catchAsync");

exports.setDriverId = async (req, res, next) => {
  // Allow nested routes
  if (!req.body.driver) req.body.driver = req.params.driverId;

  const vehicle = await Vehicle.find({ driver: req.body.driver });
  if (vehicle.length > 0) {
    return next(
      new AppError("Already a Vehicle Exits for specified Driver.", 400)
    );
  }

  next();
};

exports.getMyVehicle = async (req, res, next) => {
  const driverId = req.user.id;
  console.log("driverId", driverId);

  const vehicle = await Vehicle.findOne({ driver: driverId });
  if (!vehicle) {
    return next(new AppError("You dont' have any vehicle currently."));
  }

  res.status(200).json({
    status: "success",
    data: {
      vehicle,
    },
  });
};

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.filterData = catchAsync(async (req, res, next) => {
  const filteredBody = filterObj(req.body, "milage", "description");

  req.body = filteredBody;

  next();
});

exports.getVehicle = factory.getOne(Vehicle);
exports.getAllVehicles = factory.getAll(Vehicle);
exports.createVehicle = factory.createOne(Vehicle);
exports.updateVehicle = factory.updateOne(Vehicle);
exports.deleteVehicle = factory.deleteOne(Vehicle);
