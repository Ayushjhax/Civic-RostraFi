const WalletUser = require('../models/walletUserModel');
const UserTeam = require('../models/userTeamModel');
const { isValidSolanaAddress } = require('../utils/validate');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getWallet = catchAsync(async (req, res) => {
  const { address } = req.params;

  // Validate Solana wallet address
  if (!isValidSolanaAddress(address)) {
    return next(new AppError('Invalid Solana wallet address', 400));
  }

  const wallet = await WalletUser.findOne({ walletAddress: address });

  if (!wallet) {
    return next(new AppError('Wallet not found', 404));
  }

  res.status(200).json({
    success: true,
    data: wallet,
  });
});

// exports.getUserTournaments = catchAsync(async (req, res, next) => {
//   const { address } = req.params;

//   // Find the wallet and populate the tournaments array with ALL tournament details
//   const wallet = await WalletUser.findOne({ walletAddress: address }).populate({
//     path: 'tournaments.tournamentId',
//   });

//   if (!wallet) {
//     return next(new AppError('Wallet not found', 404));
//   }

//   // Get all user teams for this wallet user in a single query
//   console.log(wallet);
//   const userTeams = await UserTeam.find({
//     walletUserId: wallet._id,
//   }).populate({
//     path: 'sections.selectedTeams',
//   });
//   console.log('userTeams:', userTeams);

//   // Create a map of tournament ID to user team for quick lookup
//   const tournamentTeamMap = {};
//   userTeams.forEach((team) => {
//     if (team.tournamentId) {
//       tournamentTeamMap[team.tournamentId.toString()] = team;
//     }
//   });

//   // For each tournament, add the user-specific points and team
//   const tournamentsWithDetails = wallet.tournaments
//     .map((tournament) => {
//       // Add null check for tournamentId
//       if (!tournament.tournamentId) {
//         return null; // or you could return a placeholder object
//       }

//       const tournamentId = tournament.tournamentId._id.toString();
//       console.log('TournamentIds:', tournamentId);

//       // Get the user team for this tournament from our map
//       const userTeam = tournamentTeamMap[tournamentId] || null;
//       console.log(userTeam);

//       // Convert tournament to plain object if it's a Mongoose document
//       const tournamentObj = tournament.toObject
//         ? tournament.toObject()
//         : tournament;

//       return {
//         ...tournamentObj,
//         userTeam: userTeam,
//         // Spread the entire tournament document to include all fields
//         tournamentDetails: tournament.tournamentId,
//       };
//     })
//     .filter((tournament) => tournament !== null); // Remove any null entries

//   res.status(200).json({
//     success: true,
//     count: tournamentsWithDetails.length,
//     data: tournamentsWithDetails,
//   });
// });

exports.getUserTournaments = catchAsync(async (req, res, next) => {
  const { address } = req.params;

  const wallet = await WalletUser.findOne({ walletAddress: address }).populate({
    path: 'tournaments._id',
    model: 'Tournament',
  });

  if (!wallet) {
    return next(new AppError('Wallet not found', 404));
  }
  console.log('Wallet:', wallet);

  const userTeams = await UserTeam.find({
    walletUserId: wallet._id,
  }).populate({
    path: 'sections.selectedTeams',
  });
  console.log('User Teams:', userTeams);

  const tournamentTeamMap = {};
  userTeams.forEach((team) => {
    if (team.tournamentId) {
      tournamentTeamMap[team.tournamentId.toString()] = team;
    }
  });

  console.log('Map:', tournamentTeamMap);

  const tournamentsWithDetails = wallet.tournaments
    .map((tournament) => {
      // Add null check for tournament details
      if (!tournament._id) {
        return null;
      }

      const tournamentId = tournament._id._id.toString();
      console.log('tournamentId:', tournamentId);

      const userTeam = tournamentTeamMap[tournamentId] || null;

      const tournamentObj = tournament.toObject
        ? tournament.toObject()
        : tournament;

      return {
        // ...tournamentObj,
        userTeam: userTeam,
        tournamentDetails: tournament._id,
        rank: tournament.rank,
        prize: tournament.prize,
      };
    })
    .filter((tournament) => tournament !== null);

  res.status(200).json({
    success: true,
    count: tournamentsWithDetails.length,
    data: tournamentsWithDetails,
  });
});

exports.registerOrRetrieveWallet = catchAsync(async (req, res, next) => {
  const { walletAddress } = req.body;

  if (!walletAddress) {
    return next(new AppError('Wallet address is required', 400));
  }

  const { wallet, isNewWallet } =
    await WalletUser.findOrCreateWallet(walletAddress);

  let message = 'Wallet retrieved successfully';
  let statusCode = 200;

  if (isNewWallet) {
    await wallet.addPoints(150);
    statusCode = 201;
    message = 'Wallet created successfully and 150 bonus points added';
  }

  res.status(statusCode).json({
    success: true,
    data: wallet,
    isNewUser: isNewWallet,
    message: message,
  });
});

exports.addPoints = catchAsync(async (req, res) => {
  const { walletAddress, points } = req.body;

  if (!walletAddress || points === undefined) {
    return next(new AppError('Wallet address and points are required', 400));
  }

  if (!isValidSolanaAddress(walletAddress)) {
    return next(new AppError('Invalid Solana wallet address', 400));
  }

  if (typeof points !== 'number' || points <= 0) {
    return next(new AppError('Points must be a positive number', 400));
  }

  const wallet = await WalletUser.findOne({ walletAddress });

  if (!wallet) {
    return next(new AppError('Wallet not found', 404));
  }

  await wallet.addPoints(points);

  res.status(200).json({
    success: true,
    data: wallet,
    message: `${points} points added successfully`,
  });
});

exports.deductPoints = catchAsync(async (req, res, next) => {
  const { walletAddress, points } = req.body;

  if (!walletAddress || points === undefined) {
    return next(new AppError('Wallet address and points are required', 400));
  }

  if (!isValidSolanaAddress(walletAddress)) {
    return next(new AppError('Invalid Solana wallet address', 400));
  }

  if (typeof points !== 'number' || points <= 0) {
    return next(new AppError('Points must be a positive number', 400));
  }

  const wallet = await WalletUser.findOne({ walletAddress });

  if (!wallet) {
    return next(new AppError('Wallet not found', 404));
  }

  if (wallet.points < points) {
    return next(new AppError(400, 'Insufficient points balance'));
  }

  await wallet.deductPoints(points);

  res.status(200).json({
    success: true,
    data: wallet,
    message: `${points} points deducted successfully`,
  });
});

exports.getWalletPoints = catchAsync(async (req, res, next) => {
  const { address } = req.params;

  if (!isValidSolanaAddress(address)) {
    return next(new AppError(400, 'Invalid Solana wallet address'));
  }

  const wallet = await WalletUser.findOne({ walletAddress: address });

  if (!wallet) {
    return next(new AppError(404, 'Wallet not found'));
  }

  res.status(200).json({
    success: true,
    data: {
      walletAddress: wallet.walletAddress,
      points: wallet.points,
    },
  });
});
