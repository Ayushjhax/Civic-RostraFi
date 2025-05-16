const express = require('express');
const twitterController = require('../controllers/dummyDataController');

const router = express.Router();
// Routes for TwitterQueue
router.post('/queue', twitterController.createTwitterQueue);
router.get('/queues', twitterController.getAllTwitterQueues);

// Routes for TwitterData
router.post('/data', twitterController.createTwitterData);
router.get('/data', twitterController.getAllTwitterData);
router.get('/data/team/:teamId', twitterController.getTwitterDataByTeamId);

module.exports = router;
