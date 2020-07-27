const mongoose = require('mongoose');

const baseVehicleSchema = new mongoose.Schema(
    {
        baseFare: {
            type: Number,
            required: [true, 'Please provide base fare']
        },
        type: {
            type: String,
            required: [true, 'Please provide base type']
        },
        description: {
            type: String,
            trim: true,
            maxlength: [40, 'Description must be less or equal then 40 characters.'],
            minlength: [10, 'Description must be more or equal then 10 characters.']
        },
        createdAt: {
            type: Date,
            default: Date.now(),
            select: false
        },
        driver: {
            type: mongoose.Schema.ObjectId,
            ref: 'Driver',
            required: [true, 'Vehicle must belong to a driver.']
        }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

const BaseVehicle = mongoose.model('BaseVehicle', baseVehicleSchema);

module.exports = BaseVehicle;