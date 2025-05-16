const express = require('express');
const voteController = require('../controllers/voteController');

const router = express.Router();

router.route('/').post(voteController.createVote);

router.route('/user/:userId').get(voteController.getVotesByUser);

router.route('/content/:contentId').get(voteController.getVotesByContent);
router.route('/user/:userId/yes').get(voteController.getYesVotesByUser);

router.route('/user/:userId/no').get(voteController.getNoVotesByUser);

module.exports = router;
