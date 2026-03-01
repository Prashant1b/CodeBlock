const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minLength: 4,
      maxLength: 120,
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxLength: 5000,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    problems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'problem',
        required: true,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

contestSchema.path('problems').validate(function (arr) {
  return Array.isArray(arr) && arr.length > 0;
}, 'At least one problem is required');

contestSchema.path('endTime').validate(function (value) {
  return this.startTime && value && value > this.startTime;
}, 'End time must be after start time');

const Contest = mongoose.model('contest', contestSchema);
module.exports = Contest;
