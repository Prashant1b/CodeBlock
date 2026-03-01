const mongoose=require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    commenter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    commenterName: {
      type: String,
      required: true,
      trim: true,
      maxLength: 60,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      minLength: 1,
      maxLength: 1000,
    },
  },
  {
    timestamps: true,
    _id: true,
  }
);

const discussschema = new mongoose.Schema(
  {
    username: {
      type: String,
      minLength: 3,
      maxLength: 60,
      default: 'Anonymous User',
      trim: true,
    },
    title: {
      type: String,
      required: true,
      minLength: 6,
      maxLength: 120,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minLength: 10,
      maxLength: 5000,
    },
    category: {
      type: String,
      enum: [
        'Interview',
        'Contest',
        'Career',
        'Compensation',
        'Feedback',
        'General',
        'For you',
        'Most Votes',
        'Newest',
      ],
      required: true,
      default: 'General',
    },
    problemcreator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    likesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
      },
    ],
    comments: [commentSchema],
  },
  {
    timestamps: true,
  }
);

const Discussion = mongoose.model('discuss', discussschema);
module.exports = Discussion;
