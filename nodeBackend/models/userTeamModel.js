const mongoose = require('mongoose');
const { MAX_TEAMS_PER_SECTION } = require('../utils/constants');

const UserTeamSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
    },
    walletUserId: {
      type: mongoose.Schema.ObjectId,
      ref: 'WalletUser',
      required: true,
    },
    teamName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    sections: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        sectionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Section',
          required: true,
        },
        selectedTeams: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Team',
          },
        ],
      },
    ],
    tournamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tournament',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Updated indexes for better query performance
UserTeamSchema.index({ userId: 1 });
UserTeamSchema.index({ 'sections.sectionId': 1 });
UserTeamSchema.index({ createdAt: 1 });

// Validate maximum teams per section
UserTeamSchema.path('sections').validate(function (sections) {
  return sections.every(
    (section) => section.selectedTeams.length <= MAX_TEAMS_PER_SECTION,
  );
}, `Maximum ${MAX_TEAMS_PER_SECTION} teams allowed per section`);

// Virtual for total followers across all sections
UserTeamSchema.virtual('totalFollowers').get(function () {
  return this.sections.reduce((total, section) => {
    return (
      total +
      section.selectedTeams.reduce(
        (sum, team) => sum + (team.followers || 0),
        0,
      )
    );
  }, 0);
});

const UserTeam = mongoose.model('UserTeam', UserTeamSchema);
module.exports = UserTeam;
