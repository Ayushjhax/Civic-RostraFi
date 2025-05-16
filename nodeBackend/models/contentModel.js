const mongoose = require('mongoose');
const { Schema } = mongoose;

const contentSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
    points: {
      type: Number,
      default: 0,
      min: 0,
    },
    voteCost: {
      type: Number,
      default: 1,
      min: 1,
      required: true,
    },
    yesVotes: {
      type: Number,
      default: 0,
    },
    noVotes: {
      type: Number,
      default: 0,
    },
    totalVotes: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Time limit fields
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,

      // default: function () {
      //   const date = new Date(this.startDate || Date.now());
      //   date.setDate(date.getDate() + 7);
      //   return date;
      // },
    },
    duration: {
      type: Number,
      default: 7,
      min: 1,
      description: 'Duration in days',
    },
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual for vote percentage calculations
contentSchema.virtual('yesPercentage').get(function () {
  if (this.totalVotes === 0) return 0;
  return Math.round((this.yesVotes / this.totalVotes) * 100);
});

contentSchema.virtual('noPercentage').get(function () {
  if (this.totalVotes === 0) return 0;
  return Math.round((this.noVotes / this.totalVotes) * 100);
});

// Virtual for time remaining
contentSchema.virtual('timeRemaining').get(function () {
  const now = new Date();
  const end = new Date(this.endDate);
  if (now > end) return 0;

  // Return time remaining in milliseconds
  return end - now;
});

// Virtual for checking if content is expired
contentSchema.virtual('isExpired').get(function () {
  return new Date() > new Date(this.endDate);
});

// Pre-save hook to update isActive based on date
contentSchema.pre('save', function (next) {
  if (this.isNew) {
    // If duration is set and startDate exists, calculate endDate
    if (this.duration && this.startDate) {
      const endDate = new Date(this.startDate);
      endDate.setHours(endDate.getHours() + this.duration);
      this.endDate = endDate;
    }
  }

  // Check if the content has expired and update isActive accordingly
  if (new Date() > new Date(this.endDate)) {
    this.isActive = false;
  }

  next();
});

// Define indexes
contentSchema.index({ createdAt: -1 });
contentSchema.index({ endDate: 1 });
contentSchema.index({ isActive: 1, totalVotes: -1 });

const Content = mongoose.model('Content', contentSchema);
module.exports = Content;
