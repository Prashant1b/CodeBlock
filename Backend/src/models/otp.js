const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
  {
    emailid: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    purpose: {
      type: String,
      enum: ['signup', 'login', 'reset'],
      required: true,
      default: 'login',
    },
    otpHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ emailid: 1, purpose: 1 }, { unique: true });

const Otp = mongoose.model('otp', otpSchema);
module.exports = Otp;
