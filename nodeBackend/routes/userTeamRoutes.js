const express = require('express');
const userTeamController = require('../controllers/userTeamController');
const { validate, schemas } = require('../utils/validate');
const rateLimit = require('express-rate-limit');
const { RATE_LIMIT } = require('../utils/constants');

const router = express.Router();

const limiter = rateLimit(RATE_LIMIT);
router.use(limiter);

router.post(
  '/',
  validate(schemas.createUserTeam),
  userTeamController.createUserTeam,
);

router.get('/:walletUserId/:userId', userTeamController.getUserTeams);
router.get(
  '/twitter/:tournamentId/:twitterId',
  userTeamController.getTwitterDataByTournamentAndTwitterId,
);

router.patch(
  '/:teamId',
  validate(schemas.updateUserTeam),
  userTeamController.updateUserTeam,
);

router.delete('/:userId/:teamId', userTeamController.deleteUserTeam);

module.exports = router;
