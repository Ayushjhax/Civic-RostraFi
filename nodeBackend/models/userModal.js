const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { type } = require('os');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid emain'],
  },
  photo: String,
  role: {
    type: String,
    //enum is validator
    enum: ['user', 'guide', 'lead-guide', 'admin'], //these are roles
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false, //this will not show password only when we try to access all user in /alluserroute but these will not hide the password in output when the signUp happens and the output will show the password so we have the function to hide it in authroller.js file in function createSendToken function
  },

  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Password are not the same',
    },
  },
  passwordChangedAt: Date, //this property will only exist if the user has changed the password it will not get shown on document by default
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false, //as we dont want to show this field in the output we use false
  },
});

//Using mongoose middleware to encrypt the password we save on the mongoDB
//this pre and save middleware will run b/w getting the data and saving it to the database

userSchema.pre('save', async function (next) {
  //Only run this function if password was actually modified
  //here below (this) keyword refers to the current document/user
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12); // here we encrypted the real password

  //now we need to delete the confirm password as we only need to encrypt the real password
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

//this middleware will do not show the deleted user to output which we implimented in this route(/deleteMe) in userRoutes.js file it will just use the property of user which is deleted have a property active:false
//so here /^find/ this will work for any query which starts with find
userSchema.pre(/^find/, function (next) {
  //this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

//Function which will check if the given password is the same as the one stored in the document
//This function is an instance method so it is available on all the user documents
userSchema.methods.correctPassWord = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

//Function to check if the user had recently changed password after the token was issued

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return JWTTimestamp < changedTimestamp;
  }

  return false; //by default assuming that user has not changed the password
};

//here we are creating a function which will create a token so that user can change its password
userSchema.methods.createPasswordResetToken = function () {
  // here we are using this crypto which we imported from nodemodules which make the random strings
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
