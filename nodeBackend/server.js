const mongoose = require('mongoose');
const TournamentWinnerService = require('./services/tournamentWinningServices');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION!!  Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');
const {
  scheduleTournamentDeactivation,
} = require('./utils/deactivateTournament');

const DB = process.env.DATABASE.replace(
  '<db_password>',
  process.env.DATABASE_PASSWORD,
);

mongoose.connect(DB, {}).then(() => {
  console.log('DB connection successful');

  // Initialize the TournamentWinnerService here
  TournamentWinnerService.initialize();
  scheduleTournamentDeactivation();
});

const port = process.env.PORT || 3000;

// Create HTTP server from Express app
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'https://rostrafi.fun/'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their personal notification room`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

app.set('io', io);

server.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION!!  Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = { io };
