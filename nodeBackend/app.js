// const fs = require('fs');
const express = require('express');
const morgan = require('morgan'); // Third party middleware
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const sectionRouter = require('./routes/sectionRoutes');
const userTeamRouter = require('./routes/userTeamRoutes');
const walletUserRouter = require('./routes/walletUserRoutes');
const tournamentRouter = require('./routes/tournamentRoutes');
const voteRouter = require('./routes/voteRoutes');
const contentRoutes = require('./routes/contentRoutes');
const dummyDataRoutes = require('./routes/dummyDataRoutes');

const app = express();

//Security HTTP headers
app.use(helmet());

//Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); //third party middleware
}

app.use(cors());

app.use(express.json({ limit: '10kb' })); // it is a middleware and it is a function that can modify the incoming request data

app.use(mongoSanitize()); //this will filter out any sign like $ and other which mongo used and from the body

app.use(xss());

//Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

//Serving static files
app.use(express.static(`${__dirname}/public`));

//Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

/////////////////////////////////
//2.ROUTE HANDLERS

//This router(tourRouter,userRouter,reviewRouter) that we are specifieng below are middleware that we mount upon this path so whenever there is a request in this route first it will go url then call the middleware function
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/walletUser', walletUserRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/sections', sectionRouter);
app.use('/api/v1/userTeams', userTeamRouter);
app.use('/api/v1/compitition', tournamentRouter);
app.use('/api/v1/vote', voteRouter);
app.use('/api/v1/content', contentRoutes);
app.use('/api/v1/dummy', dummyDataRoutes);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
