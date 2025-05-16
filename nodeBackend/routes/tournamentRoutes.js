const express = require('express');
const tournamentController = require('../controllers/tournamentController');
const TournamentWinnerService = require('../services/tournamentWinningServices');
const Tournament = require('../models/tournamentModel');

const router = express.Router();

// Tournament CRUD routes
router.post('/tournaments', tournamentController.createTournament);
router.get('/tournaments', tournamentController.getAllTournaments);
router.get(
  '/tournaments/open-registration',
  tournamentController.getOpenRegistrationTournaments,
);
router.get('/tournaments/:id', tournamentController.getTournamentById);
router.put('/tournaments/:id', tournamentController.updateTournament);

router.get(
  '/tournaments/:tournamentId/points',
  tournamentController.getUserTournamentPoints,
);

router.get(
  '/tournaments/:id/participants',
  tournamentController.getTournamentParticipants,
);

// Tournament interaction routes
router.post(
  '/tournaments/:tournamentId/visit',
  tournamentController.visitTournament,
);
router.post(
  '/tournaments/:tournamentId/participate',
  tournamentController.participateInTournament,
);
router.post(
  '/tournaments/:tournamentId/leave',
  tournamentController.leaveFromTournament,
);

// Admin routes
router.post(
  '/tournaments/deactivate-expired',
  tournamentController.deactivateExpiredTournaments,
);

// Get tournament leaderboard
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

// Manually trigger winner calculation (admin only)
router.post(
  '/admin/tournaments/:tournamentId/calculate-winners',

  async (req, res) => {
    try {
      // Check if user is admin (implement your admin check)
      if (!req.user) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: Admin access required',
        });
      }

      const { tournamentId } = req.params;

      // Validate tournament existence
      const tournament = await Tournament.findById(tournamentId);
      if (!tournament) {
        return res.status(404).json({
          success: false,
          message: 'Tournament not found',
        });
      }

      // Schedule calculation
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

// Manually trigger prize distribution (admin only)
router.post(
  '/admin/tournaments/:tournamentId/distribute-prizes',

  async (req, res) => {
    try {
      // Check if user is admin
      // if (!req.user.isAdmin) {
      //   return res.status(403).json({
      //     success: false,
      //     message: 'Unauthorized: Admin access required',
      //   });
      // }

      const { tournamentId } = req.params;

      // Validate tournament existence
      const tournament = await Tournament.findById(tournamentId);
      if (!tournament) {
        return res.status(404).json({
          success: false,
          message: 'Tournament not found',
        });
      }

      // Check if tournament has ended
      const now = new Date();
      if (now < tournament.endDate) {
        return res.status(400).json({
          success: false,
          message: 'Tournament has not ended yet',
        });
      }

      // Distribute prizes
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
