const TwitterQueue = require('../models/twitterQueueModel');
const TwitterData = require('../models/twitterDataModel');
const mongoose = require('mongoose');

exports.createTwitterQueue = async (req, res) => {
  try {
    const { tournamentId, teamsToProcess } = req.body;

    if (!mongoose.Types.ObjectId.isValid(tournamentId)) {
      return res.status(400).json({ message: 'Invalid Tournament ID' });
    }

    const processedTeams = teamsToProcess.map((team) => ({
      teamId: mongoose.Types.ObjectId.isValid(team.teamId)
        ? team.teamId
        : new mongoose.Types.ObjectId(),
      twitterId: team.twitterId || '',
      teamName: team.teamName || '',
      teamImage: team.teamImage || '',
      teamSection: team.teamSection || '',
      priority: team.priority || 0,
      lastProcessed: team.lastProcessed || new Date(),
    }));

    const twitterQueue = new TwitterQueue({
      tournamentId: tournamentId,
      teamsToProcess: processedTeams,
      isActive: req.body.isActive || true,
      startDate: req.body.startDate || new Date(),
      endDate:
        req.body.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      lastProcessedIndex: req.body.lastProcessedIndex || 0,
      processingStartTime: req.body.processingStartTime || new Date(),
    });

    const savedQueue = await twitterQueue.save();
    res.status(201).json(savedQueue);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Controller for TwitterData
exports.createTwitterData = async (req, res) => {
  try {
    const {
      tournamentId,
      teamId,
      twitterId,
      teamName,
      teamImage,
      teamSection,
      stats,
      tweets,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(tournamentId)) {
      return res.status(400).json({ message: 'Invalid Tournament ID' });
    }

    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      return res.status(400).json({ message: 'Invalid Team ID' });
    }

    const processedTweets = (tweets || []).map((tweet) => ({
      id: tweet.id || '',
      content: tweet.content || '',
      createdAt: tweet.createdAt || new Date(),
      metrics: {
        likeCount: tweet.metrics?.likeCount || 0,
        replyCount: tweet.metrics?.replyCount || 0,
        retweetCount: tweet.metrics?.retweetCount || 0,
        viewCount: tweet.metrics?.viewCount || 0,
      },
    }));

    const twitterData = new TwitterData({
      tournamentId: tournamentId,
      teamId: teamId,
      twitterId: twitterId || '',
      teamName: teamName || '',
      teamImage: teamImage || '',
      teamSection: teamSection || '',
      stats: {
        tweetCount: stats?.tweetCount || 0,
        likeCount: stats?.likeCount || 0,
        replyCount: stats?.replyCount || 0,
        retweetCount: stats?.retweetCount || 0,
        viewCount: stats?.viewCount || 0,
      },
      tweets: processedTweets,
    });

    const savedData = await twitterData.save();
    res.status(201).json(savedData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAllTwitterQueues = async (req, res) => {
  try {
    const queues = await TwitterQueue.find();
    res.status(200).json(queues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllTwitterData = async (req, res) => {
  try {
    const data = await TwitterData.find();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTwitterDataByTeamId = async (req, res) => {
  try {
    const { teamId } = req.params;

    // Validate teamId
    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      return res.status(400).json({ message: 'Invalid Team ID' });
    }

    const data = await TwitterData.find({ teamId: teamId });

    if (data.length === 0) {
      return res.status(404).json({ message: 'No data found for this team' });
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
