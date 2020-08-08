const path = require('path');
const Driver = require('../models/driverModel');
const authController = require('./authController')
const factory = require('./handlerFactory');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const multer = require('multer');
const sharp = require('sharp');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('Not an image! Please upload only images.', 400), false);
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.uploadUserPhoto = upload.single('photoAvatar');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    if (!req.file) return next();

    req.file.filename = `driver${req.user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/drivers/${req.file.filename}`);

    next();
});

exports.generatePasswordError = (req, res, next) => {
    if (req.body.password) {
        return next(
            new AppError(
                'This route is not for password updates. Please use /updateMyPassword.',
                400
            )
        );
    }
    next();
}

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};

exports.deactivateMe = catchAsync(async (req, res, next) => {
    await Driver.findByIdAndUpdate(req.user.id, { isActive: false });

    res.status(200).json({
        status: 'success',
        data: null
    });
});

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};

exports.filterData = catchAsync(async (req, res, next) => {
    const filteredBody = filterObj(req.body, 'username', 'lName', 'fName', 'email', 'gender',
        'dob', 'age', 'address', 'postalCode');

    req.body = filteredBody;

    next();
});

exports.setPhotoData = catchAsync(async (req, res, next) => {

    req.body.photoAvatar = `${process.env.HOST}/img/drivers/${req.file.filename}`;
    req.body.orignalPhoto = req.file.originalname.split('.')[0];
    req.body.photoAvatarExt = path.extname(req.file.originalname);
next();
});

exports.setUsername = catchAsync(async (req, res, next) => {
    const { username } = req.body;
    req.body.fName = username.split(" ")[0];
    req.body.lName = username.split(" ")[1];
  
    next();
  });

exports.updateMe = catchAsync(async (req, res, next) => {
    // 1) Create error if user POSTs password data
    // 2) Filtered out unwanted fields names that are not allowed to be updated
    if(req.body.fName) {
        if(req.body.lName) {
            req.body.username = req.body.fName + ' ' + req.body.lName;
        } else {
            req.body.username = req.body.fName;
        }
    } else if(req.body.lName) {
        req.body.username = req.body.lName;
    }

    // 3) Update user document
    const updatedUser = await Driver.findByIdAndUpdate(req.user.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
});

// Login Related Controllers
exports.verifyPhoneExistance = authController.verifyPhoneExistance(Driver);
exports.login = authController.userLogin(Driver);

// Phone Code Forgot Password Related Controllers
exports.forgotPassword = authController.getVerificationCode;
exports.verifyForgotPasswordCode = authController.verifyCode;
exports.resetPassword = authController.resetPassword(Driver);
// Email Token Related Forgot Password Controllers
// exports.forgotPassword = authController.forgotPassword(Driver);
// exports.resetPassword = authController.resetPassword(Driver);

// Administration Related Controllers
exports.getUser = factory.getOne(Driver, { path: 'trip vehicle review' });
exports.getAllUsers = factory.getAll(Driver, { path: 'trip vehicle review' });
exports.createUser = factory.createOne(Driver);
// Do NOT update passwords with this!
exports.updateUser = factory.updateOne(Driver);
exports.deleteUser = factory.deleteOne(Driver);
