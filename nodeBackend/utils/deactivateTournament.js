const cron = require('node-cron');
const Tournament = require('../models/tournamentModel');
const TournamentWinnerService = require('../services/tournamentWinningServices');

// Schedule task to run every hour
// Format: second minute hour day-of-month month day-of-week
const scheduleTournamentDeactivation = () => {
  console.log('scheduled');
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('Running scheduled task: Deactivating expired tournaments');

      const result = await Tournament.deactivateExpiredTournaments();

      console.log(
        `Successfully deactivated ${result.modifiedCount} expired tournaments`,
      );
    } catch (error) {
      console.error('Error in tournament deactivation task:', error);
    }
  });
};

function initTournamentSchedulers() {
  // Schedule winner calculation checks every 15 minutes
  console.log();
  cron.schedule('*/15 * * * *', async () => {
    try {
      console.log('Running scheduled tournament winner calculations...');
      await TournamentWinnerService.scheduleWinnerCalculations();
    } catch (error) {
      console.error(
        'Error in scheduled tournament winner calculations:',
        error,
      );
    }
  });
}

// module.exports = scheduleTournamentDeactivation;
module.exports = { initTournamentSchedulers, scheduleTournamentDeactivation };
