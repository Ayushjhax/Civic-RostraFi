const mongoose = require('mongoose');

const TournamentResultSchema = new mongoose.Schema({
  tournamentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true,
  },
  results: [
    {
      walletUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WalletUser',
        required: true,
      },
      userId: String,
      teamName: String,
      score: Number,
      prize: Number,
      rank: Number,
      paid: {
        type: Boolean,
        default: false,
      },
    },
  ],
  calculatedAt: {
    type: Date,
    default: Date.now,
  },
  distributed: {
    type: Boolean,
    default: false,
  },
});

const TournamentResult = mongoose.model(
  'TournamentResult',
  TournamentResultSchema,
);
module.exports = TournamentResult;
