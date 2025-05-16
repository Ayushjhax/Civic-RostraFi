const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const User = require('./userModal');

const tourSchema = new mongoose.Schema(
  {
    //fisrt argument of tourschema is object with schema definations
    name: {
      type: String,
      required: [true, 'A tour must have a name'], //validator
      unique: true, //due this unique here mongoose will add it to the indexes section as the name field is uniqe so to ensure unique it creates unique index for it
      trim: true,
      maxlength: [40, 'A tour name must have less or equal then 40 characters'], //validator
      minlength: [10, 'A tour name must have more or equal then 10 characters'], //validators
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a durations'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either:easy,medium,difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'], //validator
      max: [5, 'Rating must be below 5.0'], //validator
      set: (val) => Math.round(val * 10) / 10, //this setter function is gonna run each time there is a new value for the rating average field
    },
    ratingQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },

    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          //(this) keyword only points to current doc on NEW document creation
          return val < this.price; //100<200 true
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    //as mongoDB supports geospatial data,this data is basically data that describes places on earth using longitude and latitude coordinates
    startLocation: {
      //GeoJSON ,it is a data format for geospatial data
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      //this is how we impliment refrences between different data sets
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    // this second argument of tourSchema is object of schema options
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

//adding index in mongodb so that when we query for sort by price mongodb dont have to scan all the documents to get the result this will increase performance

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });

tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//Implimention virtual populate so that we can get access to the reviews of the tour data from review dataset as review is child data set refrencing to tour and same for the user for reviews
//below is how we connect these two models together
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour', //as in reviewSchema we have a field called tour so that we can connect them
  localField: '_id', //for current model ,like _id is how it is called in local model and is called tour in foreign model
});

//Document middleware
//IMP->the function below will be called before an actual document is saved to the database so be can manipulate the data according to us and then it will get saved to database
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//Query middleware
//this middleware allows us to run functions before and after a certain query is executed

tourSchema.pre(/^find/, function (next) {
  //here this (/^find/) will make this middleware to trigger for all the commands like which have find in it
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  //In query middleware (this) keyword always points to the current query
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
