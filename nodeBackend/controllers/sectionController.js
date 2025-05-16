const Section = require('../models/section');
const Team = require('../models/team');
const AppError = require('../utils/appError');

exports.createSection = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) next(new AppError('Section name is required', 400));

    const existingSection = await Section.findOne({ name });
    if (existingSection) next(new AppError('Section already exists', 400));

    const section = new Section({ name });
    await section.save();
    res.status(201).json(section);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.addTeamToSection = async (req, res, next) => {
  try {
    const { sectionId } = req.params;
    const { name, image, followers, description, audio, points, twitterId } =
      req.body;

    if (!name || !image || !description || !audio) {
      next(new AppError('All fields are required', 400));
    }

    const section = await Section.findById(sectionId);
    if (!section) next(new AppError('Section not found', 400));

    const team = new Team({
      name,
      image,
      followers,
      description,
      audio,
      points,
      twitterId,
    });
    await team.save();

    section.teams.push(team._id);
    await section.save();
    res.status(201).json(team);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getSections = async (req, res, next) => {
  try {
    const sections = await Section.find().populate('teams');
    res.status(200).json(sections);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.updateSection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) next(new AppError('Section name is required', 400));
    const section = await Section.findByIdAndUpdate(
      id,
      { name },
      { new: true },
    );
    if (!section) next(new AppError('Section not found', 404));

    res.status(200).json(section);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.deleteSection = async (req, res) => {
  try {
    const { id } = req.params;
    const section = await Section.findByIdAndDelete(id);
    if (!section) next(new AppError('Section name is required', 400));

    res.status(200).json({ message: 'Section deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.removeTeamFromSection = async (req, res) => {
  try {
    const { sectionId, teamId } = req.params;
    const section = await Section.findById(sectionId);
    if (!section) next(new AppError('Section name is required', 400));

    section.teams = section.teams.filter((team) => team.toString() !== teamId);
    await section.save();

    res.status(200).json({ message: 'Team removed from section successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
