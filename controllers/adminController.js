const path = require("path");
const Admin = require("../models/adminModel");
const authController = require("./authController");
const factory = require("./handlerFactory");
const AppError = require("./../utils/appError");
const catchAsync = require("./../utils/catchAsync");

exports.setUsername = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const { username } = req.body;
  req.body.fName = username.split(" ")[0];
  req.body.lName = username.split(" ")[1];

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
