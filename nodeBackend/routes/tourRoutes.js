const express = require('express');
const tourController = require('../controllers/tourController');
const authControlleer = require('../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');

const router = express.Router();

//router itself is just a middleware so we can use use method on it and then say for the specific route below we want to use the review router instead
router.use('/:tourId/reviews', reviewRouter); // it is also a mounting of router
//but right now this reviewrouter does not get access to this tour id in the url,
//so to get access the tourId parameter we will go to reviewRoutes.js file and we use mergeParams

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(
    authControlleer.protect,
    authControlleer.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan,
  );

router
  .route('/tour-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);
//we can also impliment above route like this->/tours-distance?distance=233&center=40,45&unit=mi but above way is more clean

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router
  .route('/')
  // here below we added (authControlleer.protect) function which is a middleware function which gonna run first to check if the user in logged in and then the other function which give details of all the tours
  .get(tourController.getAllTours)
  .post(
    authControlleer.protect,
    authControlleer.restrictTo('admin', 'lead-guide'),
    tourController.createTour,
  );
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authControlleer.protect,
    authControlleer.restrictTo('admin', 'lead-guide'), // this means only admin and lead-guide role which implimented in schema will we able to update the tour
    tourController.updateTour,
  )
  .delete(
    authControlleer.protect,
    authControlleer.restrictTo('admin', 'lead-guide'), // this means only admin and lead-guide role which implimented in schema will we able to delete the tour
    tourController.deleteTour,
  );

module.exports = router;
