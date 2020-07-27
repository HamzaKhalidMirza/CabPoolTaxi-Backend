const path = require('path');
const Vehicle = require('../models/vehicleModel');
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

exports.uploadUserPhoto = upload.single('vehicleAvatar');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    if (!req.file) return next();

    req.file.filename = `vehicle-${req.file.originalname.split('.')[0]}-${Date.now()}.jpeg`;
    console.log(req.file.filename);
    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/vehicles/${req.file.filename}`);

    next();
});

exports.setDriverId = async (req, res, next) => {
    // Allow nested routes
    if (!req.body.driver) req.body.driver = req.params.driverId;

    const vehicle = await Vehicle.find({driver: req.body.driver});
    if(vehicle.length > 0) {
        return next(new AppError('Already a Vehicle Exits for specified Driver.', 400));
    }

    next();
};

exports.getMyVehicle = async (req, res, next) => {
    const driverId = req.user.id;
    console.log('driverId',driverId);

    const vehicle = await Vehicle.findOne({ driver: driverId });
    if(!vehicle) {
        return next(new AppError('You dont\' have any vehicle currently.'));
    }
    
    res.status(200).json({
        status: 'success',
        data: {
            vehicle
        }
    });
};

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};

exports.filterData = catchAsync(async (req, res, next) => {
    const filteredBody = filterObj(req.body, 'milage', 'description');

    req.body = filteredBody;

    next();
});

exports.setPhotoData = catchAsync(async (req, res, next) => {

    if (req.file) {
        req.body.vehicleAvatar = `${process.env.HOST}/img/vehicles/${req.file.filename}`;
        req.body.orignalVehicle = req.file.originalname.split('.')[0];
        req.body.vehicleAvatarExt = path.extname(req.file.originalname);
    }
    next();
});

exports.getVehicle = factory.getOne(Vehicle);
exports.getAllVehicles = factory.getAll(Vehicle);
exports.createVehicle = factory.createOne(Vehicle);
exports.updateVehicle = factory.updateOne(Vehicle);
exports.deleteVehicle = factory.deleteOne(Vehicle);
