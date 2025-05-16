const Content = require('../models/contentModel');
const UserWallet = require('../models/walletUserModel');
const mongoose = require('mongoose');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const updateExpiredContent = async () => {
  try {
    // const Content = require('../models/Content');
    const now = new Date();

    // Find and update all expired content
    await Content.updateMany(
      {
        isActive: true,
        endDate: { $lt: now },
      },
      {
        $set: { isActive: false },
      },
    );

    return true;
  } catch (error) {
    console.error('Error updating expired content:', error);
    return false;
  }
};

exports.createContent = catchAsync(async (req, res, next) => {
  const { title, description, image, points, voteCost, startDate, duration } =
    req.body;

  if (!title || !description) {
    return next(new AppError('Title and description are required', 400));
  }

  const start = startDate ? new Date(startDate) : new Date();
  let end;

  if (duration) {
    end = new Date(start);
    end.setHours(end.getHours() + parseInt(duration));
  } else {
    // Default 7 days
    end = new Date(start);
    end.setDate(end.getDate() + 7);
  }

  const newContent = new Content({
    title,
    description,
    image,
    points: points || 0,
    voteCost: voteCost || 1,
    startDate: start,
    endDate: end,
    duration: duration || 7,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  await newContent.save();

  res.status(201).json({
    success: true,
    data: newContent,
  });
});

/**
 * Get all content
 */
exports.getAllContent = catchAsync(async (req, res, next) => {
  const {
    limit = 20,
    page = 1,
    sortBy = 'createdAt',
    order = 'desc',
    includeExpired = false,
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOrder = order === 'asc' ? 1 : -1;
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder;

  // Filter parameters
  const filter =
    includeExpired === 'true'
      ? {}
      : {
          isActive: true,
          endDate: { $gt: new Date() },
        };

  // Update any expired content
  await updateExpiredContent();

  const content = await Content.find(filter)
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Content.countDocuments(filter);

  res.status(200).json({
    success: true,
    count: content.length,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    },
    data: content,
  });
});

exports.getContentById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const content = await Content.findById(id);

  if (!content) {
    return next(new AppError('Content not found', 404));
  }

  if (new Date() > new Date(content.endDate) && content.isActive) {
    content.isActive = false;
    await content.save();
  }

  res.status(200).json({
    success: true,
    data: content,
  });
});

exports.updateContent = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const {
    title,
    description,
    image,
    points,
    voteCost,
    isActive,
    startDate,
    duration,
  } = req.body;

  const content = await Content.findById(id);
  if (!content) {
    return next(new AppError('Content not found', 404));
  }

  if (new Date() > new Date(content.endDate)) {
    content.isActive = false;
    await content.save();
    return next(
      new AppError('This content has expired and cannot be updated', 400),
    );
  }

  // Update fields if provided
  if (title) content.title = title;
  if (description) content.description = description;
  if (image !== undefined) content.image = image;
  if (points !== undefined) content.points = points;
  if (voteCost !== undefined) content.voteCost = voteCost;
  if (isActive !== undefined) content.isActive = isActive;

  // Handle time-related updates
  if (startDate) {
    const newStartDate = new Date(startDate);
    content.startDate = newStartDate;

    if (duration) {
      content.duration = duration;
      const newEndDate = new Date(newStartDate);
      newEndDate.setDate(newEndDate.getDate() + parseInt(duration));
      content.endDate = newEndDate;
    } else {
      const newEndDate = new Date(newStartDate);
      newEndDate.setDate(newEndDate.getDate() + content.duration);
      content.endDate = newEndDate;
    }
  } else if (duration) {
    content.duration = duration;
    const newEndDate = new Date(content.startDate);
    newEndDate.setDate(newEndDate.getDate() + parseInt(duration));
    content.endDate = newEndDate;
  }

  content.updatedAt = Date.now();

  await content.save();

  res.status(200).json({
    success: true,
    data: content,
  });
});

exports.deleteContent = catchAsync(async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    const content = await Content.findById(id).session(session);
    if (!content) {
      await session.abortTransaction();
      session.endSession();
      return next(new AppError('Content not found', 404));
    }

    // Instead of actually deleting, mark as inactive
    content.isActive = false;
    content.updatedAt = Date.now();
    await content.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: 'Content successfully deactivated',
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return next(new AppError(error.message, 500));
  }
});

exports.getTrendingContent = catchAsync(async (req, res, next) => {
  const { limit = 10 } = req.query;

  const content = await Content.find({
    isActive: true,
    endDate: { $gt: new Date() },
  })
    .sort({ totalVotes: -1, createdAt: -1 })
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    count: content.length,
    data: content,
  });
});

exports.getContentEndingSoon = catchAsync(async (req, res, next) => {
  const { limit = 10, hoursThreshold = 24 } = req.query;

  const now = new Date();
  const thresholdDate = new Date(now);
  thresholdDate.setHours(now.getHours() + parseInt(hoursThreshold));

  const content = await Content.find({
    isActive: true,
    endDate: {
      $gt: now,
      $lt: thresholdDate,
    },
  })
    .sort({ endDate: 1 })
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    count: content.length,
    data: content,
  });
});
