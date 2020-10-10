const Admin = require("../models/adminModel");
const Driver = require("../models/driverModel");
const Client = require("../models/clientModel");
const Payment = require("../models/paymentModel");
const authController = require("./authController");
const factory = require("./handlerFactory");
const AppError = require("./../utils/appError");
const catchAsync = require("./../utils/catchAsync");

exports.setUsername = catchAsync(async (req, res, next) => {
  const { username } = req.body;
  req.body.fName = username.split(" ")[0];
  if(username.split(" ")[1]) {
    req.body.lName = username.split(" ")[1];
  }

  next();
});

exports.generatePasswordError = (req, res, next) => {
  if (req.body.password) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /updateMyPassword.",
        400
      )
    );
  }
  next();
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.deactivateMe = catchAsync(async (req, res, next) => {
  await Admin.findByIdAndUpdate(req.user.id, { isActive: false });

  res.status(200).json({
    status: "success",
    data: null,
  });
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.filterData = catchAsync(async (req, res, next) => {
  const filteredBody = filterObj(
    req.body,
    "username",
    "lName",
    "fName",
    "email",
    "gender",
    "dob",
    "age"
  );

  req.body = filteredBody;

  next();
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data

  // 2) Filtered out unwanted fields names that are not allowed to be updated

  // 3) Update user document
  const updatedUser = await Admin.findByIdAndUpdate(req.user.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

exports.getDashboardData = catchAsync(async (req, res, next) => {

  const driversCount = await Driver.count();
  const clientsCount = await Client.count();
  const adminsCount = await Admin.count();

  const monthlyEarnings = [];
  const monthlyAdmins = [];
  const monthlyDrivers = [];
  const monthlyPassengers = [];

  var currentMonth = new Date().getMonth();

  for(let i=0; i<=currentMonth; i++) {
    const monthlyPaymentData = await Payment.aggregate([
      {$project: {method: 1, totalFare: 1, totalPaid: 1, month: {$month: '$createdAt'}}},
      {$match: {month: i+1}}
    ]);
    const monthlyAdminData = await Admin.aggregate([
      {$project: {month: {$month: '$createdAt'}}},
      {$match: {month: i+1}}
    ]);
    const monthlyDriverData = await Driver.aggregate([
      {$project: {month: {$month: '$createdAt'}}},
      {$match: {month: i+1}}
    ]);
    const monthlyPassengerData = await Client.aggregate([
      {$project: {month: {$month: '$createdAt'}}},
      {$match: {month: i+1}}
    ]);

    let earning = 0;
    monthlyPaymentData.forEach(element => {
      earning += element.totalPaid;
    });
    monthlyAdmins.push(monthlyAdminData.length);
    monthlyDrivers.push(monthlyDriverData.length);
    monthlyPassengers.push(monthlyPassengerData.length);

    monthlyEarnings.push(earning);
  }

  const yearlyPaymentData = await Payment.aggregate([
    {$project: {method: 1, totalFare: 1, totalPaid: 1, year: {$year: '$createdAt'}}},
    {$match: {year: 2020}}
  ]);

  res.status(200).json({
    status: "success",
    data: {
      adminsCount,
      driversCount,
      clientsCount,
      monthlyEarnings,
      yearlyPaymentData,
      monthlyAdmins,
      monthlyDrivers,
      monthlyPassengers
    }
  });
});

// Login Related Controllers
exports.login = authController.adminLogin(Admin);
exports.getVerificationCode = authController.getVerificationCode;
exports.verifyCode = authController.verifyCode;

// Phone Code Forgot Password Related Controllers
exports.forgotPassword = authController.getVerificationCode;
exports.verifyForgotPasswordCode = authController.verifyCode;
exports.resetPassword = authController.resetPassword(Admin);
// Email Token Related Forgot Password Controllers
// exports.forgotPassword = authController.forgotPassword(Admin);
// exports.resetPassword = authController.resetPassword(Admin);

// Administration Related Controllers
exports.getUser = factory.getOne(Admin);
exports.getAllUsers = factory.getAll(Admin);
exports.createUser = factory.createOne(Admin);
// Do NOT update passwords with this!
exports.updateUser = factory.updateOne(Admin);
exports.deleteUser = factory.deleteOne(Admin);
