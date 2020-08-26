const mongoose = require("mongoose");

const driverTrackSchema = new mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.ObjectId,
      ref: "Driver",
      required: [true, "Driver Required."],
    },
    trip: {
      type: mongoose.Schema.ObjectId,
      ref: "Trip",
      required: [true, "Trip Required."],
    },
    locations: [
      {
        coordinates: [Number],
      },
    ],
    clients: [
      {
        client: {
          type: mongoose.Schema.ObjectId,
          ref: "Client",
          required: [true, "Client Required."],
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
        status: {
          type: String,
          default: "start",
          enum: {
            values: ["start", "arrived", "pickup", "dropoff"],
            message: "Status is either: start, arrived, pickup or dropoff",
          },
        },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const DriverTrack = mongoose.model("DriverTrack", driverTrackSchema);

module.exports = DriverTrack;
