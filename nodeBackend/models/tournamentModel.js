const { required } = require('joi');
const mongoose = require('mongoose');
const { Schema } = mongoose;

const tournamentSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    timeLimit: {
      type: Number, // Time limit in hours
      required: true,
      default: 24,
    },
    registrationTimeLimit: {
      type: Number, // Registration time limit in hours before tournament starts
      required: true,
      default: 12,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    prizePool: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    platform: {
      type: String,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    registrationEndDate: {
      type: Date,
      required: true,
    },
    pointsForVisit: {
      type: Number,
      default: 10, // Default points awarded for first visit
    },
    visited: [
      {
        type: Schema.Types.ObjectId,
        ref: 'WalletUser',
      },
    ],
    participated: [
      {
        type: Schema.Types.ObjectId,
        ref: 'WalletUser',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
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

// Add index for better query performance
tournamentSchema.index({ startDate: 1, endDate: 1, isActive: 1 });
tournamentSchema.index({ registrationEndDate: 1 });

// Virtual for checking if tournament is ongoing
tournamentSchema.virtual('isOngoing').get(function () {
  const now = new Date();
  return this.isActive && now >= this.startDate && now <= this.endDate;
});

// Virtual for checking if registration is open
tournamentSchema.virtual('isRegistrationOpen').get(function () {
  const now = new Date();
  return this.isActive && now <= this.registrationEndDate;
});

// Pre-save middleware
tournamentSchema.pre('save', function (next) {
  this.updatedAt = Date.now();

  // Calculate end date if not provided
  if (!this.endDate) {
    const endDate = new Date(this.startDate);
    endDate.setHours(endDate.getHours() + this.timeLimit);
    this.endDate = endDate;
  }

  // Calculate registration end date if not provided
  if (!this.registrationEndDate) {
    const registrationEnd = new Date(this.startDate);
    registrationEnd.setHours(
      registrationEnd.getHours() - (this.registrationTimeLimit || 12),
    );
    this.registrationEndDate = registrationEnd;
  }

  next();
});

// Method to check if a user has visited
tournamentSchema.methods.hasVisited = function (userId) {
  return this.visited.some((id) => id.toString() === userId);
};

// Method to check if a user has participated
tournamentSchema.methods.hasParticipated = function (userId) {
  return this.participated.some((id) => id.toString() === userId);
};

// Method to add a visitor and return whether they're a first-time visitor
tournamentSchema.methods.addVisitor = function (userId) {
  if (this.hasVisited(userId)) {
    return false; // Not a first-time visitor
  }

  this.visited.push(userId);
  return true; // Is a first-time visitor
};

// Method to add a participant
tournamentSchema.methods.addParticipant = function (userId) {
  if (this.hasParticipated(userId)) {
    return false; // Already participated
  }

  this.participated.push(userId);
  return true; // Successfully added as participant
};

// Method to remove a participant
tournamentSchema.methods.removeParticipant = function (userId) {
  if (!this.hasParticipated(userId)) {
    return false; // Not a participant
  }

  this.participated = this.participated.filter(
    (id) => id.toString() !== userId.toString(),
  );
  return true; // Successfully removed
};

// Static method to get active tournaments
tournamentSchema.statics.getActiveTournaments = function () {
  const now = new Date();
  return this.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  }).sort({ endDate: 1 });
};

// Static method to get tournaments with open registration
tournamentSchema.statics.getTournamentsWithOpenRegistration = function () {
  const now = new Date();
  return this.find({
    isActive: true,
    registrationEndDate: { $gte: now },
  }).sort({ startDate: 1 });
};

// Static method to deactivate expired tournaments
tournamentSchema.statics.deactivateExpiredTournaments = function () {
  const now = new Date();
  return this.updateMany(
    { endDate: { $lt: now }, isActive: true },
    { isActive: false },
  );
};

const Tournament = mongoose.model('Tournament', tournamentSchema);

module.exports = Tournament;
