const mongoose = require('mongoose');

const contestParticipantSchema = new mongoose.Schema(
  {
    contestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'contest',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    violations: {
      type: Number,
      default: 0,
      min: 0,
    },
    isDisqualified: {
      type: Boolean,
      default: false,
    },
    hasExited: {
      type: Boolean,
      default: false,
    },
    disqualifiedAt: {
      type: Date,
      default: null,
    },
    exitedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

contestParticipantSchema.index({ contestId: 1, userId: 1 }, { unique: true });

const ContestParticipant = mongoose.model('contestParticipant', contestParticipantSchema);
module.exports = ContestParticipant;
