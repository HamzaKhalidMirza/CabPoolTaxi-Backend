const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    seatsAvailable: {
      type: Number,
      required: [true, "Please provide number of available seats."],
      min: [1, "Available Seats must be at least 1."],
    },
    totalSeats: {
      type: Number,
      required: [true, "Please provide total number of seats."],
      min: [1, "Total Seats must be at least 1."],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [
        100,
        "Description must be less or equal then 100 characters.",
      ],
      minlength: [10, "Description must be more or equal then 10 characters."],
    },
    startDate: {
      type: Date,
      required: [true, "Please provide start date."],
    },
    startTime: {
      type: Date,
      required: [true, "Please provide start time."],
    },
    estimatedTime: Date,
    status: {
      type: String,
      default: "upcoming",
      enum: {
        values: ["upcoming", "current", "complete", "cancelled"],
        message: "Status is either: upcoming, current, complete or cancelled",
      },
    },
    cancellationReason: {
      type: String,
      trim: true,
      maxlength: [100, "Reason must be less or equal then 100 characters."],
      minlength: [10, "Reason must be more or equal then 10 characters."],
    },
    ratingsAverage: {
      type: Number,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
      set: (val) => Math.round(val * 10) / 10, // 4.666666, 46.6666, 47, 4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    appEndTime: Date,
    appEstimatedTime: Date,
    appDistance: String,
    appTotalFare: Number,
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startLocation: {
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      address: String,
      description: String,
      staticImage: String,
    },
    endLocation: {
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      address: String,
      description: String,
      staticImage: String,
    },
    stops: [{
      location: {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        address: String,
        description: String,
        staticImage: String,
      },
    }],
    driver: {
      type: mongoose.Schema.ObjectId,
      ref: "Driver",
      required: [true, "Trip must belong to a driver."],
    },
    vehicle: {
      type: mongoose.Schema.ObjectId,
      ref: "Vehicle",
      required: [true, "Trip must have a vehicle."],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tripSchema.index({ startLocation: "2dsphere" });
tripSchema.index({ endLocation: "2dsphere" });
tripSchema.index({ location: "2dsphere" });

// Virtual Populate Vehicle
tripSchema.virtual("booking", {
  ref: "Booking",
  foreignField: "trip",
  localField: "_id",
});
// tripSchema.virtual("review", {
//   ref: "Review",
//   foreignField: "trip",
//   localField: "_id",
// });

tripSchema.pre(/^find/, function (next) {
  this.populate({
    path: "driver",
    select: `-photoAvatarFile -passwordChangedAt -passwordResetToken -passwordResetExpires
        -isActive -createdAt`,
  });
  this.populate({
    path: "vehicle"
  });
  next();
});

tripSchema.post(/^find/, function (doc, next) {

  if (Array.isArray(doc)) {
    doc.forEach((trip) => {
      if (trip.driver) {
        if (Array.isArray(trip.driver)) {
          trip.driver.forEach((driver) => {
            driver.trip = undefined;
            driver.review = undefined;
          });
        } else {
          trip.driver.trip = undefined;
          trip.driver.review = undefined;
        }
      }
      if (trip.review) {
        if (Array.isArray(trip.review)) {
          trip.review.forEach((review) => {
            review.client = undefined;
            review.driver = undefined;
            review.trip = undefined;
          });
        } else {
          trip.review.client = undefined;
          trip.review.driver = undefined;
          trip.review.trip = undefined;
        }
      }
      if (trip.booking) {
        if (Array.isArray(trip.booking)) {
          trip.booking.forEach((booking) => {
            booking.trip = undefined;
            booking.driver = undefined;
          });
        } else {
          trip.booking.trip = undefined;
          trip.booking.driver = undefined;
        }
      }
    });
  } else {
    if(doc) {
      if (doc.driver) {
        if (Array.isArray(doc.driver)) {
          doc.driver.forEach((driver) => {
            driver.trip = undefined;
            driver.review = undefined;
          });
        } else {
          doc.driver.trip = undefined;
          doc.driver.review = undefined;
        }
      }
      if (doc.review) {
        if (Array.isArray(doc.review)) {
          doc.review.forEach((review) => {
            review.client = undefined;
            review.driver = undefined;
            review.trip = undefined;
          });
        } else {
          doc.review.client = undefined;
          doc.review.driver = undefined;
          doc.review.trip = undefined;
        }
      }
      if (doc.booking) {
        if (Array.isArray(doc.booking)) {
          doc.booking.forEach((booking) => {
            booking.trip = undefined;
            booking.trip = undefined;
          });
        } else {
          doc.booking.trip = undefined;
          doc.booking.trip = undefined;
        }
      }  
    }
  }
  next();
});

const Trip = mongoose.model("Trip", tripSchema);

module.exports = Trip;
