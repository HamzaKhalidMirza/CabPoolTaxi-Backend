const path = require("path");
const Admin = require("../models/adminModel");
const authController = require("./authController");
const factory = require("./handlerFactory");
const AppError = require("./../utils/appError");
const catchAsync = require("./../utils/catchAsync");
const multer = require("multer");
const sharp = require("sharp");

// const multerStorage = multer.memoryStorage();

// const multerFilter = (req, file, cb) => {
//   if (file.mimetype.startsWith("image")) {
//     cb(null, true);
//   } else {
//     cb(new AppError("Not an image! Please upload only images.", 400), false);
//   }
// };

// const upload = multer({
//   storage: multerStorage,
//   fileFilter: multerFilter,
// });

// exports.uploadUserPhoto = upload.single("photoAvatar");

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `admin${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/admins/${req.file.filename}`);

  next();
});

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

exports.setPhotoData = catchAsync(async (req, res, next) => {
  req.body.photoAvatar = `${process.env.HOST}/img/admins/${req.file.filename}`;
  req.body.orignalPhoto = req.file.originalname.split(".")[0];
  req.body.photoAvatarExt = path.extname(req.file.originalname);
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
