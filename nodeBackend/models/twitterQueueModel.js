const mongoose = require('mongoose');

const TwitterQueueSchema = new mongoose.Schema({
  tournamentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true,
  },
  teamsToProcess: [
    {
      teamId: mongoose.Schema.Types.ObjectId,
      twitterId: String,
      teamName: String,
      teamImage: String,
      teamSection: String,
      priority: { type: Number, default: 0 }, // Higher numbers = higher priority
      lastProcessed: Date,
    },
  ],
  isActive: {
    type: Boolean,
    default: true,
  },
  startDate: Date,
  endDate: Date,
  lastProcessedIndex: {
    type: Number,
    default: 0,
  },
  processingStartTime: Date,
});

const TwitterQueue = mongoose.model('TwitterQueue', TwitterQueueSchema);
module.exports = TwitterQueue;
