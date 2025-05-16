const express = require('express');
const router = express.Router();
const TournamentWinnerService = require('../services/tournamentWinningServices');
const Tournament = require('../models/tournamentModel');

router.get('/tournaments/:tournamentId/leaderboard', async (req, res) => {
  try {
    const { tournamentId } = req.params;

    // Validate tournament existence
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found',
      });
    }

    const leaderboard =
      await TournamentWinnerService.getTournamentLeaderboard(tournamentId);

    return res.status(200).json({
      success: true,
      tournament: {
        id: tournament._id,
        name: tournament.name,
        startDate: tournament.startDate,
        endDate: tournament.endDate,
        prizePool: tournament.prizePool,
        isActive: tournament.isActive,
        isOngoing: tournament.isOngoing,
      },
      ...leaderboard,
    });
  } catch (error) {
    console.error('Error fetching tournament leaderboard:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch tournament leaderboard',
    });
  }
});

router.post(
  '/admin/tournaments/:tournamentId/calculate-winners',

  async (req, res) => {
    try {
      if (!req.user) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: Admin access required',
        });
      }

      const { tournamentId } = req.params;

      const tournament = await Tournament.findById(tournamentId);
      if (!tournament) {
        return res.status(404).json({
          success: false,
          message: 'Tournament not found',
        });
      }

      await TournamentWinnerService.calculateTournamentWinners(tournamentId);

      return res.status(200).json({
        success: true,
        message: 'Tournament winner calculation started',
      });
    } catch (error) {
      console.error('Error triggering winner calculation:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to trigger winner calculation',
      });
    }
  },
);

router.post(
  '/admin/tournaments/:tournamentId/distribute-prizes',

  async (req, res) => {
    try {
      // Check if user is admin
      if (!req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: Admin access required',
        });
      }

      const { tournamentId } = req.params;

      const tournament = await Tournament.findById(tournamentId);
      if (!tournament) {
        return res.status(404).json({
          success: false,
          message: 'Tournament not found',
        });
      }

      const now = new Date();
      if (now < tournament.endDate) {
        return res.status(400).json({
          success: false,
          message: 'Tournament has not ended yet',
        });
      }

      await TournamentWinnerService.distributePrizes(tournamentId);

      return res.status(200).json({
        success: true,
        message: 'Prize distribution completed',
      });
    } catch (error) {
      console.error('Error distributing prizes:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to distribute prizes',
      });
    }
  },
);

module.exports = router;
