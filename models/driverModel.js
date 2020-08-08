const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const driverSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
      maxlength: [20, "Username must be less or equal then 30 characters."],
      minlength: [3, "Username must be more or equal then 8 characters."],
    },
    fName: {
      type: String,
      trim: true,
      maxlength: [20, "FName must be less or equal then 20 characters."],
    },
    lName: {
      type: String,
      trim: true,
      maxlength: [20, "LName must be less or equal then 20 characters."],
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    phone: {
      type: String,
      required: [true, "Please provide your phone"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 8,
      select: false,
    },
    gender: {
      type: String,
      enum: {
        values: ["male", "female"],
        message: "Gender is either: male or female",
      },
    },
    role: {
      type: String,
      enum: ["driver"],
      default: "driver",
    },
    photoAvatar: {
      type: String,
      required: [true, "Please provide driver photo"],
    },
    orignalPhoto: String,
    photoAvatarExt: String,
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    nationality: String,
    licenseNo: {
      type: String,
      required: [true, "Please provide a license no."],
      unique: true
    },
    cnicNo: {
      type: String,
      required: [true, "Please provide a cnic."],
      unique: true
    },
    dob: Date,
    isActive: {
      type: Boolean,
      default: true,
      select: false,
    },
    address: {
      type: String,
      trim: true,
      required: [true, "Please provide an address"],
      maxlength: [40, "Address must be less or equal then 30 characters."],
      minlength: [8, "Address must be more or equal then 8 characters."],
    },
    postalCode: {
      type: String,
      // validate: [validator.isPostalCodeLocales, 'Please provide valid postal code']
    },
    age: {
      type: Number,
      validate: {
        validator: function (val) {
          return val > 15;
        },
      },
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

// Virtual Populate Vehicle
driverSchema.virtual("vehicle", {
  ref: "Vehicle",
  foreignField: "driver",
  localField: "_id",
});
driverSchema.virtual("trip", {
  ref: "Trip",
  foreignField: "driver",
  localField: "_id",
});
// // driverSchema.virtual('review', {
// //     ref: 'Review',
// //     foreignField: 'driver',
// //     localField: '_id'
// // });

driverSchema.post(/^find/, function (doc, next) {
  if (Array.isArray(doc)) {
    doc.forEach((driver) => {
      if (driver.trip) {
        if (Array.isArray(driver.trip)) {
          driver.trip.forEach((trip) => {
            trip.driver = undefined;
            trip.review = undefined;
            trip.booking = undefined;
            trip.request = undefined;
          });
        } else {
          driver.trip.driver = undefined;
          driver.trip.review = undefined;
          driver.trip.booking = undefined;
          driver.trip.request = undefined;
        }
      }
    });
  } else {
    if (doc) {
      if (doc.trip) {
        if (Array.isArray(doc.trip)) {
          doc.trip.forEach((trip) => {
            trip.driver = undefined;
            trip.review = undefined;
            trip.booking = undefined;
            trip.request = undefined;
          });
        } else {
          doc.trip.driver = undefined;
          doc.trip.review = undefined;
          doc.trip.booking = undefined;
          doc.trip.request = undefined;
        }
      }
    }
  }
  next();
});

driverSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified("password")) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  next();
});

driverSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

driverSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ isActive: { $ne: false } });
  next();
});

driverSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

driverSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

driverSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const Driver = mongoose.model("Driver", driverSchema);

module.exports = Driver;
