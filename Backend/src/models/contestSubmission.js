const mongoose = require('mongoose');

const contestSubmissionSchema = new mongoose.Schema(
  {
    contestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'contest',
      required: true,
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'problem',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
      enum: ['javascript', 'python', 'cpp', 'java'],
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'accepted', 'wrong', 'error'],
      default: 'pending',
    },
    runtime: {
      type: Number,
      default: 0,
    },
    memory: {
      type: Number,
      default: 0,
    },
    errorMessage: {
      type: String,
      default: '',
      trim: true,
    },
    testcasesPassed: {
      type: Number,
      default: 0,
    },
    testcasesTotal: {
      type: Number,
      default: 0,
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
    attemptNo: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

contestSubmissionSchema.index({ contestId: 1, userId: 1, problemId: 1, createdAt: 1 });

const ContestSubmission = mongoose.model(
  'contestSubmission',
  contestSubmissionSchema
);
module.exports = ContestSubmission;
