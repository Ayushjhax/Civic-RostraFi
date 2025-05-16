const mongoose = require('mongoose');
const Tour = require('./tourModal');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty'],
    },
    rating: {
      type: Number,
      maxlength: [5, 'A review should not have more then 5 rating'],
      minlength: [1, 'A review should not have less then 1 rating'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },

    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.'],
    },
    //Refrencing to User dataset
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// to avoid duplicate reviews ,now each combination of tour and user has always to be unique
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },

    //here _id in $group means how we want to group them like in below case we want to group them by tour
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.tour); // here this code points to the model as here (this) keyword points to the current document/review and contructor is a model who created that document
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.clone().findOne(); //here goal is to get the access to the current review document but here the (this) keyword is the current query,so what we gonna do is basically execute a query and then that will give us the document

  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calcAverageRatings(this.r.tour); //so here to get tourId we will pass data from pre-middleware to the post-middleware so in above pre code we will not save the document to const some variable but we use (this) keyword
});
const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
