const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
    {
        ac: {
            type: String,
            required: [true, "Please provide AC info."],
            enum: {
                values: ['AC', 'Non-AC'],
                message: 'Type is either: Ac or Non-A'
            }
        },
        modelName: {
            type: String,
            required: [true, "Please provide vehicle model name"]
        },
        totalSeats: {
            type: Number,
            required: [true, "Please provide total number of seats."],
            min: [1, "Total Seats must be at least 1."],
        },
        registrationNo: {
            type: String,
            unique: true,
            required: [true, "Please provide vehicle registration no"]
        },
        color: {
            type: String,
            required: [true, "Please provide vehicle color"]
        },
        milage: {
            type: Number,
            // required: [true, "Please provide vehicle milage"]
        },
        baseFare: {
            type: Number,
        },
        vehicleAvatar: {
            type: String,
            required: [true, 'Please provide vehicle photo']
        },
        orignalVehicle: String,
        vehicleAvatarExt: String,
        description: {
            type: String,
            trim: true,
            maxlength: [40, 'Description must be less or equal then 40 characters.'],
            minlength: [10, 'Description must be more or equal then 10 characters.']
        },
        type: {
            type: String,
            enum: {
                values: ['mini', 'moto'],
                message: 'Type is either: mini, moto or bike'
            }
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

// vehicleSchema.pre(/^find/, function (next) {
//     this.populate({
//         path: 'driver',
//         select: `-photoAvatar -photoAvatarFile -passwordChangedAt -passwordResetToken -passwordResetExpires
//         -isActive -createdAt -ratingsAverage -ratingsQuantity`
//     });
//     next();
// });

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle;