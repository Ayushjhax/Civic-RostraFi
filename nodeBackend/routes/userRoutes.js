const express = require('express');
const userControlleer = require('./../controllers/userController');
const authControlleer = require('./../controllers/authController');
const reviewController = require('./../controllers/reviewController');

const router = express.Router();

//Below code is also a middleware function
//we have signup as special endpoint it dosent come in REST architechure

router.post('/signup', authControlleer.signUp); // this is only related to the user
router.post('/login', authControlleer.login);

router.post('/forgotPassword', authControlleer.forgetPassword);
router.patch('/resetPassword/:token', authControlleer.resetPassword);

//we know that protect function below is a middleware and we know middleware runs always in sequence so this below code will run before any code below it written so now we are able to put (authControlleer.protect) this code on all the below routes so now we can remove this function from all the routes and the code will work same as before

router.use(authControlleer.protect); // this will protect all the routes that come after this point

router.patch(
  '/updateMyPassword',

  authControlleer.updatePassword,
);

router.get(
  '/me',

  userControlleer.getMe,
  userControlleer.getUser,
);
router.patch('/updateMe', userControlleer.updateMe);
router.delete('/deleteMe', userControlleer.deleteMe);

//here this follows 100% REST philosphy where the name of the url has nothing to with the action that is performed
//here below all of the actions should only we executed by admin
router.use(authControlleer.restrictTo('admin')); //so now this middleware run before below codes as middlewares run in sequence and this will only allow to impliment below code

router
  .route('/')
  .get(userControlleer.getAllUsers)
  .post(userControlleer.createUser);
router
  .route('/:id')
  .get(userControlleer.getUser)
  .patch(userControlleer.updateUser)
  .delete(userControlleer.deleteUser);

module.exports = router;
