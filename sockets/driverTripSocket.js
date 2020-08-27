const Trip = require("./../models/tripModel");
const Booking = require("./../models/bookinModel");
const DriverTrack = require("./../models/driverTrackModel");
const Payment = require("./../models/paymentModel");
const Review = require("./../models/reviewModel");
const Client = require("./../models/clientModel");

module.exports = function (io) {

  io.on("connection", (socket) => {

    // let count = 0;

    socket.on("driverStartTrip", async (data) => {
      const driver = data.driver;
      const trip = data.trip;
      const bookings = data.trip.booking;
      const clients = data.clients;
      const driverMessageEvent = driver + "-driverStartTripEvent";

      const doc = await Trip.findByIdAndUpdate(trip.id, {status: 'current'}, {
        new: true,
        runValidators: true
      }).populate({path: 'booking'});

      await bookings.forEach(async (booking) => {
        await Booking.findByIdAndUpdate(booking.id, {status: 'current'}, {
          new: true,
          runValidators: true
        });  
      });
  
      if (doc) {
        io.emit(driverMessageEvent, doc);
        clients.forEach(client => {
          const clientMessageEvent = client.id + "-clientStartTripEvent";
          io.emit(clientMessageEvent, doc);
        });
      } else {
        io.emit(driverMessageEvent, {
          data: "None",
        });
      }
    });

    socket.on('driverTrackTrip', async (data) => {
      const driverId = data.driver.id;
      const tripId = data.trip.id;
      const clients = data.clients;
      const location = data.location;

      const obj = {
        driver: driverId,
        trip: tripId,
        locations: [{
          coordinates: [location.lat, location.lng]
        }],
        clients: []
      }
      clients.forEach(client => {
        let clientObj = {};
        clientObj = client.id;
        obj.clients.push({client: clientObj});
      });

      let doc = await DriverTrack.findOne({trip: tripId});
      if(doc) {
        doc.locations.push({coordinates: [location.lat, location.lng]});
        doc = await doc.save();
      } else {
        doc = await DriverTrack.create(obj);
      }

      clients.forEach(client => {
        const clientMessageEvent = client.id + "-clientTrackTripEvent";
        io.emit(clientMessageEvent, doc);
      });
    });

    socket.on('driverArrived', async (data) => {
      const client = data.client;
      const trip = data.trip;

      let doc = await DriverTrack.findOne({trip: trip.id});
      if(doc) {
        let i = 0;
        doc.clients.forEach(async (clientObj) => {
          if(clientObj.client == client.id) {
            doc.clients[i].status = 'arrived';
          }
          i++;
        });
        await DriverTrack.findByIdAndUpdate(doc.id, {clients: doc.clients}, {
          new: true,
          runValidators: true
        });  
      }

      const clientMessageEvent = client.id + "-client-driverArrived";
      io.emit(clientMessageEvent);
    });

    socket.on('driverPickup', async (data) => {
      const client = data.client;
      const trip = data.trip;
      const center = data.center;

      let doc = await DriverTrack.findOne({trip: trip.id});
      if(doc) {
        let i = 0;
        doc.clients.forEach(async (clientObj) => {
          if(clientObj.client == client.id) {
            doc.clients[i].status = 'pickup';
            doc.clients[i].startLocation.coordinates = [center.lat, center.lng]
          }
          i++;
        });
        await DriverTrack.findByIdAndUpdate(doc.id, 
          {clients: doc.clients}, {
          new: true,
          runValidators: true
        });  
      }

      const clientMessageEvent = client.id + "-client-driverPickup";
      io.emit(clientMessageEvent);
    });

    socket.on('driverDropoff', async (data) => {
      console.log('Hello');
      const client = data.client;
      const trip = data.trip;
      const center = data.center;
      const payment = data.payment;
      const booking = data.booking;
      const review = data.review;
      const driver = trip.driver;

      let doc, paymentDoc, bookingDoc, reviewDoc;

      doc = await DriverTrack.findOne({trip: trip.id});
      if(doc) {
        let i = 0;
        doc.clients.forEach(async (clientObj) => {
          if(clientObj.client == client.id) {
            doc.clients[i].status = 'dropoff';
            doc.clients[i].endLocation.coordinates = [center.lat, center.lng]
          }
          i++;
        });
        doc = await DriverTrack.findByIdAndUpdate(doc.id, 
          {clients: doc.clients}, {
          new: true,
          runValidators: true
        });

        if(doc) {
          paymentDoc = await Payment.create(payment);
          if(paymentDoc) {
            bookingDoc = await Booking.findByIdAndUpdate(booking.id,
              {payment: paymentDoc.id, status: 'complete'});
          }

          if(review) {
            if(review.review && review.rating) {
              reviewDoc = await Review.create(review);

              const clientReviewDoc = await Review.find({client: client.id});
              tripRatingsAverage = 0.0, tripRatingsQuantity = 0.0;
              if(clientReviewDoc) {
                for(let i=0; i<clientReviewDoc.length; i++) {
                  tripRatingsQuantity++;
                  tripRatingsAverage = (tripRatingsAverage +
                   parseInt(clientReviewDoc[i].rating)) / tripRatingsQuantity;
                }
              }
              console.log(tripRatingsAverage, tripRatingsQuantity);
              const clientDoc = await Client.findById(client.id);
              if(clientDoc) {
                clientDoc.ratingsAverage = tripRatingsAverage;
                clientDoc.ratingsQuantity = parseInt(tripRatingsQuantity);
                await clientDoc.save();
              }
            }
          }
        }
      }

      const driverMessageEvent = trip.driver.id + "-bookingCompleted";
      const clientMessageEvent = client.id + "-client-driverDropoff";
      io.emit(driverMessageEvent, {doc, paymentDoc, bookingDoc, reviewDoc});
      io.emit(clientMessageEvent);
    });

    socket.on('driverRideCompleted', async (data) => {
      const trip = data.trip;
      const driverMessageEvent = trip.driver.id + "-rideCompleted";

      const doc = await Trip.findByIdAndUpdate(trip.id, {status: 'complete'});
      if(doc) {
        io.emit(driverMessageEvent, doc);
      } else {
        io.emit(driverMessageEvent, {
          data: "None",
        });
      }
    });
  });
};
