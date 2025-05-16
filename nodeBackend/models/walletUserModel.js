const mongoose = require('mongoose');
const { Schema } = mongoose;

const userWalletSchema = new Schema(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    points: {
      type: Number,
      default: 0,
      min: 0,
    },
    visitedTournaments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Tournament',
      },
    ],
    tournaments: [
      {
        tournamentId: {
          type: Schema.Types.ObjectId,
          ref: 'Tournament',
        },
        rank: {
          type: Number,
          default: null,
        },
        prize: {
          type: Number,
          default: 0,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
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

userWalletSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

userWalletSchema.methods.addPoints = function (pointsToAdd) {
  if (pointsToAdd <= 0)
    throw new Error('Points to add must be greater than zero');
  this.points += pointsToAdd;
  this.lastActivity = Date.now();
  return this.save();
};

userWalletSchema.methods.addPointsForTournamentVisit = function (
  tournamentId,
  pointsToAdd,
  session = null,
) {
  if (pointsToAdd <= 0)
    throw new Error('Points to add must be greater than zero');

  if (this.visitedTournaments.length === 0) {
    this.points += pointsToAdd;
    this.visitedTournaments.push(tournamentId);
    this.lastActivity = Date.now();
  } else if (this.visitedTournaments.length === 1) {
  }

  const saveOptions = session ? { session } : {};
  return this.save(saveOptions);
};

userWalletSchema.methods.hasVisitedAnyTournament = function () {
  return this.visitedTournaments.length > 0;
};

userWalletSchema.methods.addTournament = function (
  tournamentId,
  session = null,
) {
  const alreadyParticipated = this.tournaments.some(
    (id) => id.toString() === tournamentId.toString(),
  );

  if (!alreadyParticipated) {
    this.tournaments.push(tournamentId);
    this.lastActivity = Date.now();
  }

  const saveOptions = session ? { session } : {};
  return this.save(saveOptions);
};

userWalletSchema.methods.hasParticipatedInTournament = function (tournamentId) {
  return this.tournaments.some(
    (id) => id.toString() === tournamentId.toString(),
  );
};

userWalletSchema.methods.addTournamentPoints = function (
  tournamentId,
  pointsToAdd,
  rank = null,
  prize = 0,
  session = null,
) {
  if (pointsToAdd <= 0)
    throw new Error('Points to add must be greater than zero');

  this.points += pointsToAdd;
  console.log('working');

  console.log(this.tournaments);
  const existingTournamentIndex = this.tournaments.findIndex(
    (t) => t._id.toString() === tournamentId.toString(),
  );
  console.log('something');

  if (existingTournamentIndex !== -1) {
    this.tournaments[existingTournamentIndex].rank = rank;
    this.tournaments[existingTournamentIndex].prize = prize;
  } else {
    this.tournaments.push({
      tournamentId,
      rank,
      prize,
    });
  }

  this.lastActivity = Date.now();

  const saveOptions = session ? { session } : {};
  return this.save(saveOptions);
};

userWalletSchema.methods.deductPoints = function (pointsToDeduct) {
  if (pointsToDeduct <= 0)
    throw new Error('Points to deduct must be greater than zero');
  if (this.points < pointsToDeduct)
    throw new Error('Insufficient points balance');
  this.points -= pointsToDeduct;
  this.lastActivity = Date.now();
  return this.save();
};

// Static method to find or create wallet by address
userWalletSchema.statics.findOrCreateWallet = async function (walletAddress) {
  if (!walletAddress) throw new Error('Wallet address is required');

  let wallet = await this.findOne({ walletAddress });
  let isNewWallet = false;

  if (!wallet) {
    wallet = await this.create({ walletAddress });
    isNewWallet = true;
  }

  return { wallet, isNewWallet };
};

const WalletUser = mongoose.model('WalletUser', userWalletSchema);

module.exports = WalletUser;
