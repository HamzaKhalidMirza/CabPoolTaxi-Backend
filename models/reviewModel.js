const mongoose = require("mongoose");
const validator = require("validator");

const reviewSchema = new mongoose.Schema(
  {
    givenBy: {
      type: String,
      required: [true, "A review must have a givenBy role."],
      enum: {
        values: ["client", "driver"],
        message: "Review is either given by: client or driver",
      },
    },
    review: {
      type: String,
      maxlength: [100, "Review must be less or equal then 100 characters."],
      minlength: [5, "Review must be more or equal then 5 characters."],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "Rating must be provided!"],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    trip: {
      type: mongoose.Schema.ObjectId,
      ref: "Trip",
      required: [true, "Review must belong to a trip."],
    },
    client: {
      type: mongoose.Schema.ObjectId,
      ref: "Client",
      required: [true, "Review must belong to a client."],
    },
    driver: {
      type: mongoose.Schema.ObjectId,
      ref: "Driver",
      required: [true, "Review must belong to a driver."],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "client",
    select: `-passwordChangedAt -passwordResetToken -passwordResetExpires
        -isActive -createdAt -ratingsQuantity`,
  })
    .populate({
      path: "driver",
      select: `-photoAvatarFile -passwordChangedAt -passwordResetToken -passwordResetExpires
        -isActive -createdAt -ratingsAverage -ratingsQuantity`,
    })
    .populate({
      path: "trip",
      select: `-estimatedTime -cancellationReason -ratingsAverage -ratingsQuantity
        -createdAt`,
    });
  next();
});

reviewSchema.post(/^find/, function (doc, next) {
  if (Array.isArray(doc)) {
    doc.forEach((review) => {
      if (review.driver) {
        if (Array.isArray(review.driver)) {
          review.driver.forEach((driver) => {
            driver.trip = undefined;
            driver.review = undefined;
          });
        } else {
          review.driver.trip = undefined;
          review.driver.review = undefined;
        }
      }
      if (review.client) {
        if (Array.isArray(review.client)) {
          review.client.forEach((client) => {
            client.booking = undefined;
            client.review = undefined;
          });
        } else {
          review.client.booking = undefined;
          review.client.review = undefined;
        }
      }
      if (review.trip) {
        if (Array.isArray(review.trip)) {
          review.trip.forEach((trip) => {
            trip.booking = undefined;
            trip.driver = undefined;
            trip.review = undefined;
          });
        } else {
          review.trip.booking = undefined;
          review.trip.driver = undefined;
          review.trip.review = undefined;
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

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
