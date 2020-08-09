const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const chatSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      default: "unread",
      enum: {
        values: ["unread", "read"],
        message: "Status is either: unread or read",
      },
    },
    senderName: {
      type: String,
      trim: true,
      required: [true, "Chat must have a SenderName."],
    },
    senderId: {
      type: mongoose.Schema.ObjectId,
      required: [true, "Chat must have a SenderId."],
    },
    senderRole: {
      type: String,
      enum: {
        values: ["driver", "client"],
        message: "Status is either: driver or client",
      },
      required: [true, "Chat must have a SenderRole."],
    },
    receiverName: {
      type: String,
      trim: true,
      required: [true, "Chat must have a ReceiverName."],
    },
    receiverId: {
      type: mongoose.Schema.ObjectId,
      required: [true, "Chat must have a ReceiveId."],
    },
    message: {
      type: String,
      trim: true,
      maxlength: [200, "LName must be less or equal then 20 characters."],
      minlength: [1, "LName must be more or equal then 8 characters."],
      required: [true, "Chat must have a Message."],
    },
    driver: {
      type: mongoose.Schema.ObjectId,
      ref: "Driver",
      required: [true, "Chat must have a driver."],
    },
    client: {
      type: mongoose.Schema.ObjectId,
      ref: "Client",
      required: [true, "Chat must have a client."],
    },
    createdAt: {
      type: Date,
      default: Date.now()
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
