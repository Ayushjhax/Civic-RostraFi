const mongoose = require('mongoose');

const SectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    teams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
      },
    ],
  },
  { timestamps: true },
);

const Section = mongoose.model('Section', SectionSchema);
module.exports = Section;
