const path = require('path');
const Client = require('../models/clientModel');
const authController = require('./authController')
const factory = require('./handlerFactory');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');

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
    await Client.findByIdAndUpdate(req.user.id, { isActive: false });

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
        'dob', 'age');

    req.body = filteredBody;

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
    const updatedUser = await Client.findByIdAndUpdate(req.user.id, req.body, {
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

// Signup Related Controllers
exports.checkPhoneExistance = authController.checkPhoneExistance(Client);
exports.checkEmailExistance = authController.checkEmailExistance(Client);
exports.getVerificationCode = authController.getVerificationCode;
exports.verifyCode = authController.verifyCode;
exports.signup = authController.signup(Client);

// Login Related Controllers
exports.verifyPhoneExistance = authController.verifyPhoneExistance(Client);
exports.login = authController.userLogin(Client);

// Phone Code Forgot Password Related Controllers
exports.forgotPassword = authController.getVerificationCode;
exports.verifyForgotPasswordCode = authController.verifyCode;
exports.resetPassword = authController.resetPassword(Client);
// Email Token Related Forgot Password Controllers
// exports.forgotPassword = authController.forgotPassword(Client);
// exports.resetPassword = authController.resetPassword(Client);

// Administration Related Controllers
exports.getAllUsers = factory.getAll(Client, { path: 'booking review' });
exports.getUser = factory.getOne(Client, { path: 'booking review' });
// Do NOT update passwords with this!
exports.updateUser = factory.updateOne(Client);
exports.deleteUser = factory.deleteOne(Client);


exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not defined! Please use /signup instead'
    });
};

