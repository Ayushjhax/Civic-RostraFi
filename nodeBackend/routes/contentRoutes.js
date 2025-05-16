const express = require('express');
const contentController = require('../controllers/contentController');

const router = express.Router();

router
  .route('/')
  .get(contentController.getAllContent)
  .post(contentController.createContent);

router
  .route('/:id')
  .get(contentController.getContentById)
  .put(contentController.updateContent)
  .delete(contentController.deleteContent);

router.route('/trending').get(contentController.getTrendingContent);

router.route('/ending-soon').get(contentController.getContentEndingSoon);

module.exports = router;
