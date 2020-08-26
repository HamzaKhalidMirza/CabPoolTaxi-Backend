const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
    {
        method: {
            type: String,
            required: [true, "Please provide payment method"],
            enum: {
                values: ['cash', 'credit-card', 'debit-card'],
                message: 'Payment Method is either: Cash, Credit or Debit Card'
            }
        },
        totalFare: {
            type: Number,
            require: [true, "Please provide total fare"],
        },
        totalPaid: {
            type: Number,
            required: [true, "Please provide total paid"],
        },
        createdAt: {
            type: Date,
            default: Date.now(),
            select: false
        }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;