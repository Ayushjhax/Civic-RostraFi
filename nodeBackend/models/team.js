const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    followers: {
      type: Number,
      default: 0,
      min: 0,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    audio: {
      type: String,
      required: false,
    },
    twitterId: {
      type: String,
      required: true,
    },
    points: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true },
);

const Team = mongoose.model('Team', TeamSchema);
module.exports = Team;
