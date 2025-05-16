const mongoose = require('mongoose');

const TwitterDataSchema = new mongoose.Schema({
  tournamentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true,
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    // required: true,
  },
  twitterId: {
    type: String,
    required: true,
  },
  teamName: String,
  teamImage: String,
  teamSection: String,
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  stats: {
    tweetCount: { type: Number, default: 0 },
    likeCount: { type: Number, default: 0 },
    replyCount: { type: Number, default: 0 },
    retweetCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
  },
  tweets: [
    {
      id: String,
      content: String,
      createdAt: Date,
      metrics: {
        likeCount: { type: Number, default: 0 },
        replyCount: { type: Number, default: 0 },
        retweetCount: { type: Number, default: 0 },
        viewCount: { type: Number, default: 0 },
      },
    },
  ],
});

const TwitterData = mongoose.model('TwitterData', TwitterDataSchema);
module.exports = TwitterData;
