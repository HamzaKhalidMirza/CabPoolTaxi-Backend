const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    seatsReserved: {
      type: Number,
      required: [true, "Please provide number of reserved seats."],
      min: [1, "Available Seats must be at least 1."],
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
    status: {
      type: String,
      default: "upcoming",
      enum: {
        values: ["upcoming", "current", "complete", "cancelled"],
        message: "Status is either: upcoming, current, complete or cancelled",
      },
    },
    cancellationEnd: {
      type: String,
      enum: {
        values: ["client", "driver"],
        message: "Cancellation End is either: driver or client",
      },
    },
    cancellationReason: {
      type: String,
      trim: true,
      maxlength: [100, "Reason must be less or equal then 100 characters."],
      minlength: [10, "Reason must be more or equal then 10 characters."],
    },
    appStartTime: Date,
    appEndTime: Date,
    appEstimatedTime: Date,
    appDistance: String,
    appFare: Number,
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
    client: {
      type: mongoose.Schema.ObjectId,
      ref: "Client",
      required: [true, "Booking must belong to a client."],
    },
    driver: {
      type: mongoose.Schema.ObjectId,
      ref: "Driver",
      required: [true, "Booking must belong to a driver."],
    },
    trip: {
      type: mongoose.Schema.ObjectId,
      ref: "Trip",
      required: [true, "Booking must belong to a trip."],
    },
    payment: {
      type: mongoose.Schema.ObjectId,
      ref: "Payment",
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

bookingSchema.pre(/^find/, function (next) {
  this.populate({
    path: "client",
    select: `-passwordChangedAt -passwordResetToken -passwordResetExpires
        -isActive -createdAt -ratingsQuantity`,
  }).populate({
    path: "driver"
  }).populate({
      path: "trip",
      select: `-estimatedTime -cancellationReason -ratingsAverage -ratingsQuantity
        -createdAt`,
    })
    .populate({
      path: "payment",
      select: "-createdAt -isPaid",
    });
  next();
});

bookingSchema.post(/^find/, function (doc, next) {
  if (Array.isArray(doc)) {
    doc.forEach((booking) => {
      if (booking.client) {
        if (Array.isArray(booking.client)) {
          booking.client.forEach((client) => {
            client.booking = undefined;
            client.review = undefined;
          });
        } else {
          booking.client.booking = undefined;
          booking.client.review = undefined;
        }
      }
      if (booking.driver) {
        if (Array.isArray(booking.driver)) {
          booking.driver.forEach((driver) => {
            driver.vehicle = undefined;
            driver.trip = undefined;
          });
        } else {
          booking.driver.vehicle = undefined;
          booking.driver.trip = undefined;
        }
      }
      if (booking.trip) {
        if (Array.isArray(booking.trip)) {
          booking.trip.forEach((trip) => {
            trip.driver = undefined;
            trip.review = undefined;
            trip.booking = undefined;
          });
        } else {
          booking.trip.driver = undefined;
          booking.trip.review = undefined;
          booking.trip.booking = undefined;
        }
      }
    });
  } else {
    if(doc) {
      if (doc.client) {
        if (Array.isArray(doc.client)) {
          doc.client.forEach((client) => {
            client.booking = undefined;
            client.review = undefined;
          });
        } else {
          doc.client.booking = undefined;
          doc.client.review = undefined;
        }
      }
      if (doc.driver) {
        if (Array.isArray(doc.driver)) {
          doc.driver.forEach((driver) => {
            driver.booking = undefined;
            driver.trip = undefined;
          });
        } else {
          doc.driver.vehicle = undefined;
          doc.driver.trip = undefined;
        }
      }
      if (doc.trip) {
        if (Array.isArray(doc.trip)) {
          doc.trip.forEach((trip) => {
            trip.driver = undefined;
            trip.review = undefined;
            trip.booking = undefined;
          });
        } else {
          doc.trip.driver = undefined;
          doc.trip.review = undefined;
          doc.trip.booking = undefined;
        }
      }  
    }
  }
  next();
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
