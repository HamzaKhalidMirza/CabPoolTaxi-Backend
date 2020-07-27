const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
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
      default: "pending",
      enum: {
        values: ["pending", "approved", "rejected", 'cancelled'],
        message: "Status is either: pending, approved, rejected or cancelled",
      },
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
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);


requestSchema.pre(/^find/, function (next) {
  this.populate({
    path: "client"
  });
  this.populate({
    path: "driver"
  });
  this.populate({
    path: "trip"
  });
  next();
});

requestSchema.post(/^find/, function (doc, next) {
  if (Array.isArray(doc)) {
    doc.forEach((request) => {
      if (request.client) {
        if (Array.isArray(request.client)) {
          request.client.forEach((client) => {
            client.booking = undefined;
            client.review = undefined;
          });
        } else {
          request.client.booking = undefined;
          request.client.review = undefined;
        }
      }
      if (request.driver) {
        if (Array.isArray(request.driver)) {
          request.driver.forEach((driver) => {
            driver.vehicle = undefined;
            driver.trip = undefined;
          });
        } else {
          request.driver.vehicle = undefined;
          request.driver.trip = undefined;
        }
      }
      if (request.trip) {
        if (Array.isArray(request.trip)) {
          request.trip.forEach((trip) => {
            trip.driver = undefined;
            trip.review = undefined;
            trip.booking = undefined;
          });
        } else {
          request.trip.driver = undefined;
          request.trip.review = undefined;
          request.trip.booking = undefined;
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
            driver.vehicle = undefined;
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

const Request = mongoose.model("Request", requestSchema);

module.exports = Request;
