const express = require('express');
const reviewController = require('../controllers/reviewController');
const authControlleer = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(authControlleer.protect); // this will protect all the routes that come after this point

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authControlleer.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.creatingReviews,
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authControlleer.restrictTo('user', 'admin'),
    reviewController.updateReview,
  )
  .delete(
    authControlleer.restrictTo('user', 'admin'),
    reviewController.deleteReview,
  );

module.exports = router;
