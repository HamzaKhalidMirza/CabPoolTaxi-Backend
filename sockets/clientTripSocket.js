const DriverTrack = require("./../models/driverTrackModel");
const Review = require("./../models/reviewModel");
const Trip = require("./../models/tripModel");
const Driver = require("./../models/driverModel");

module.exports = function (io) {
  io.on("connection", (socket) => {
    socket.on("clientQueriedDriverTracings", async (data) => {
      const driverTrackingEvent = data.client + "-clientGetDriverTrackings";
      const doc = await DriverTrack.findOne({ trip: data.trip });
      if (doc) {
        io.emit(driverTrackingEvent, doc);
      } else {
        io.emit(driverTrackingEvent, {
          data: "None",
        });
      }
    });

    socket.on("clientSubmitReview", async (data) => {
      const review = data.review;
      const client = data.client;
      const driver = data.driver;
      const trip = data.trip;
      const clientEvent = client.id + "-clientReviewSubmitted";

      if (review) {
        if (review.review && review.rating) {
          reviewDoc = await Review.create(review);

          const tripReviewDoc = await Review.find({ trip: trip.id });
          let tripRatingsAverage = 0.0,
            tripRatingsQuantity = 0.0;
          if (tripReviewDoc) {
            for (let i = 0; i < tripReviewDoc.length; i++) {
              tripRatingsQuantity++;
              tripRatingsAverage =
                (tripRatingsAverage + parseInt(tripReviewDoc[i].rating)) /
                tripRatingsQuantity;
            }
          }
          console.log(tripRatingsAverage, tripRatingsQuantity);
          const tripDoc = await Trip.findById(trip.id);
          if (tripDoc) {
            tripDoc.ratingsAverage = tripRatingsAverage;
            tripDoc.ratingsQuantity = parseInt(tripRatingsQuantity);
            await tripDoc.save();
          }

          const driverReviewDoc = await Review.find({ driver: driver.id });
          (tripRatingsAverage = 0.0), (tripRatingsQuantity = 0.0);
          if (driverReviewDoc) {
            for (let i = 0; i < driverReviewDoc.length; i++) {
              tripRatingsQuantity++;
              tripRatingsAverage =
                (tripRatingsAverage + parseInt(driverReviewDoc[i].rating)) /
                tripRatingsQuantity;
            }
          }
          console.log(tripRatingsAverage, tripRatingsQuantity);
          const driverDoc = await Driver.findById(driver.id);
          if (driverDoc) {
            driverDoc.ratingsAverage = tripRatingsAverage;
            driverDoc.ratingsQuantity = parseInt(tripRatingsQuantity);
            await driverDoc.save();
          }

          if (tripDoc && driverDoc) {
            io.emit(clientEvent, { tripDoc, driverDoc });
          } else {
            io.emit(clientEvent, {
              data: "None",
            });
          }
        }
      }
    });
  });
};
