const UserTeam = require('../models/userTeamModel');
const Section = require('../models/section');
const WalletUser = require('../models/walletUserModel');
const AppError = require('../utils/appError');
const logger = require('../config/logger');
const { MAX_TEAMS_PER_SECTION } = require('../utils/constants');
const mongoose = require('mongoose');
const { TwitterApi } = require('twitter-api-v2');
const twitterService = require('../services/twitterService');
const TwitterData = require('../models/twitterDataModel');

exports.createUserTeam = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      userId,
      teamName,
      sections,
      walletUserId,
      tournamentId,
      totalPoints,
    } = req.body;

    if (!tournamentId) {
      return next(new AppError('Invalid tournament ID', 400));
    }

    const walletUser = await WalletUser.findById(walletUserId).session(session);
    if (!walletUser) {
      return next(new AppError('Wallet user not found', 404));
    }

    const existingTeam = await UserTeam.findOne({
      userId,
      teamName,
      isActive: true,
    }).session(session);

    if (existingTeam) {
      return next(new AppError('Team name already exists for this user', 400));
    }

    const validatedSections = await Promise.all(
      sections.map(async (section) => {
        const existingSection = await Section.findById(section.sectionId)
          .populate('teams')
          .session(session);

        if (!existingSection) {
          return next(
            new AppError(`Section not found: ${section.sectionId}`, 400),
          );
        }

        if (existingSection.name !== section.name) {
          return next(
            new AppError(
              `Section name does not match for: ${section.sectionId}`,
              400,
            ),
          );
        }

        const validTeamIds = new Set(
          existingSection.teams.map((team) => team._id.toString()),
        );

        const invalidTeams = section.selectedTeams.filter(
          (teamId) => !validTeamIds.has(teamId.toString()),
        );

        if (invalidTeams.length > 0) {
          throw new AppError(
            `Some selected teams do not belong to section: ${section.sectionId}`,
            400,
          );
        }

        return {
          name: existingSection.name,
          sectionId: existingSection._id,
          selectedTeams: section.selectedTeams,
        };
      }),
    );

    const userTeam = new UserTeam({
      walletUserId,
      userId,
      teamName,
      sections: validatedSections,
      tournamentId,
    });

    await userTeam.save({ session });

    if (tournamentId) {
      await walletUser.deductPoints(totalPoints);
    }

    const populatedTeam = await UserTeam.findById(userTeam._id)
      .populate('sections.sectionId')
      .populate('sections.selectedTeams')
      .session(session);

    await session.commitTransaction();

    logger.info('User team created successfully', {
      walletUserId,
      userId,
      teamId: userTeam._id,
      sections: validatedSections.map((s) => s.sectionId),
      tournamentId,
    });

    res.status(201).json({
      status: 'success',
      data: populatedTeam,
    });
  } catch (error) {
    console.log(error);
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

exports.getTwitterDataByTournamentAndTwitterId = async (req, res) => {
  try {
    const { tournamentId, twitterId } = req.params;
    console.log(tournamentId, twitterId);

    if (!tournamentId || !twitterId) {
      return res.status(400).json({
        success: false,
        message: 'Both tournamentId and twitterId are required',
      });
    }

    const twitterData = await TwitterData.findOne({
      tournamentId,
      twitterId,
    });

    console.log(twitterData);

    if (!twitterData) {
      return res.status(404).json({
        success: false,
        message:
          'No Twitter data found for the given tournament and Twitter ID',
      });
    }

    return res.status(200).json({
      success: true,
      data: twitterData,
    });
  } catch (error) {
    console.error('Error fetching Twitter data:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching Twitter data',
      error: error.message,
    });
  }
};

// exports.getUserTeams = async (req, res, next) => {
//   try {
//     const { userId, walletUserId } = req.params;

//     // Check if wallet user exists
//     const walletUser = await WalletUser.findById(walletUserId);
//     if (!walletUser) {
//       return next(new AppError('Wallet user not found', 404));
//     }

//     const teams = await UserTeam.find({
//       userId: userId,
//       isActive: true,
//     }).populate([
//       {
//         path: 'sections.sectionId',
//         select: '_id name',
//       },
//       {
//         path: 'sections.selectedTeams',
//       },
//       {
//         path: 'tournamentId',
//         select:
//           'name startDate endDate prizePool image icon platform  registrationEndDate isActive',
//       },
//     ]);

//     // Filter teams to get only those with active tournaments
//     const activeTeams = teams.filter(
//       (team) => team.tournamentId && team.tournamentId.isActive === true,
//     );

//     console.log(activeTeams);

//     // Check if there are any active tournament teams
//     if (!activeTeams.length) {
//       return res.status(200).json({
//         status: 'success',
//         message: 'No active tournaments you are participating in',
//         data: [],
//       });
//     }

//     if (!teams.length) {
//       return next(new AppError('No teams found for this user', 404));
//     }

//     // Process each tournament to include Twitter data
//     const enhancedTeams = await Promise.all(
//       activeTeams.map(async (team) => {
//         // Convert Mongoose document to plain JavaScript object for manipulation
//         const teamObj = team.toObject();
//         // console.log(`Single teams: ${team}`);

//         // Extract all selected teams from all sections
//         const allTeams = teamObj.sections.flatMap((section) =>
//           section.selectedTeams.map((selectedTeam) => ({
//             ...selectedTeam,
//             section: section.sectionId.name,
//           })),
//         );

//         // console.log(`All the teams: `, allTeams);

//         try {
//           // Initialize or update the queue for this tournament
//           await twitterService.initializeQueueForTournament(
//             team.tournamentId._id,
//             allTeams,
//             team.tournamentId.startDate,
//             team.tournamentId.endDate,
//           );

//           // Get the current Twitter stats from our database
//           const twitterStats = await twitterService.getAggregatedTwitterStats(
//             team.tournamentId._id,
//           );
//           teamObj.twitterStats = twitterStats;
//         } catch (error) {
//           console.error(
//             `Error processing Twitter data for tournament ${teamObj.tournamentId.name}:`,
//             error,
//           );
//           // Fallback to sample data if there's an error
//           teamObj.twitterStats = twitterService.generateFallbackData(allTeams);
//         }

//         return teamObj;
//       }),
//     );

//     res.status(200).json({
//       status: 'success',
//       count: enhancedTeams.length,
//       data: enhancedTeams,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

exports.getUserTeams = async (req, res, next) => {
  try {
    const { userId, walletUserId } = req.params;

    const walletUser = await WalletUser.findById(walletUserId);
    if (!walletUser) {
      return next(new AppError('Wallet user not found', 404));
    }

    const teams = await UserTeam.find({
      userId: userId,
      isActive: true,
    }).populate([
      {
        path: 'sections.sectionId',
        select: '_id name',
      },
      {
        path: 'sections.selectedTeams',
      },
      {
        path: 'tournamentId',
        select:
          'name startDate endDate prizePool image icon platform registrationEndDate isActive',
      },
    ]);

    const activeTeams = teams.filter(
      (team) => team.tournamentId && team.tournamentId.isActive === true,
    );

    if (!activeTeams.length) {
      return res.status(200).json({
        status: 'success',
        message: 'No active tournaments you are participating in',
        data: [],
      });
    }

    if (!teams.length) {
      return next(new AppError('No teams found for this user', 404));
    }

    const processedTeams = await Promise.all(
      activeTeams.map(async (team) => {
        const teamObj = team.toObject();

        const allTeams = teamObj.sections.flatMap((section) =>
          section.selectedTeams.map((selectedTeam) => ({
            ...selectedTeam,
            section: section.sectionId.name,
          })),
        );

        const now = new Date();
        const tournamentStartDate = new Date(team.tournamentId.startDate);

        // If tournament has not started, return basic tournament data
        if (now < tournamentStartDate) {
          console.log(
            `Tournament ${teamObj.tournamentId.name} has not started yet, returning basic data`,
          );
          return teamObj;
        }

        try {
          await twitterService.initializeQueueForTournament(
            team.tournamentId._id,
            allTeams,
            team.tournamentId.startDate,
            team.tournamentId.endDate,
            team.tournamentId.registrationEndDate,
          );

          const twitterStats = await twitterService.getAggregatedTwitterStats(
            team.tournamentId._id,
          );
          teamObj.twitterStats = twitterStats;
        } catch (error) {
          console.error(
            `Error processing Twitter data for tournament ${teamObj.tournamentId.name}:`,
            error,
          );
          teamObj.twitterStats = twitterService.generateFallbackData(allTeams);
        }

        return teamObj;
      }),
    );

    res.status(200).json({
      status: 'success',
      count: processedTeams.length,
      data: processedTeams,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateUserTeam = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { teamId } = req.params;
    const { userId, sections, walletUserId } = req.body;

    const walletUser = await WalletUser.findById(walletUserId).session(session);
    if (!walletUser) {
      return next(new AppError('Wallet user not found', 404));
    }

    const userTeam = await UserTeam.findOne({
      _id: teamId,
      userId,
      isActive: true,
    }).session(session);

    if (!userTeam) {
      return next(new AppError('Team not found or unauthorized', 404));
    }

    if (sections && sections.length > 0) {
      const validatedSections = await Promise.all(
        sections.map(async (section) => {
          const existingSection = await Section.findById(section.sectionId)
            .populate('teams')
            .session(session);

          if (!existingSection) {
            return next(
              new AppError(`Section not found: ${section.sectionId}`, 400),
            );
          }

          if (existingSection.name !== section.name) {
            return next(
              new AppError(
                `Section name does not match for: ${section.sectionId}`,
                400,
              ),
            );
          }

          // Validate selected teams exist in section
          const validTeamIds = new Set(
            existingSection.teams.map((team) => team._id.toString()),
          );

          const invalidTeams = section.selectedTeams.filter(
            (teamId) => !validTeamIds.has(teamId.toString()),
          );

          if (invalidTeams.length > 0) {
            return next(
              new AppError(
                `Some selected teams do not belong to section: ${section.sectionId}`,
                400,
              ),
            );
          }

          return {
            name: existingSection.name,
            sectionId: existingSection._id,
            selectedTeams: section.selectedTeams,
          };
        }),
      );

      userTeam.sections = validatedSections;
    } else if (req.body.teamName) {
      // If only team name is being updated
      userTeam.teamName = req.body.teamName;
    }

    await userTeam.save({ session });

    const updatedTeam = await UserTeam.findById(teamId)
      .populate('sections.sectionId')
      .populate('sections.selectedTeams')
      .session(session);

    await session.commitTransaction();

    logger.info('User team updated successfully', {
      userId,
      teamId,
    });

    res.status(200).json({
      status: 'success',
      data: updatedTeam,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

exports.deleteUserTeam = async (req, res, next) => {
  try {
    const { userId, teamId, walletUserId } = req.params;

    // Check if wallet user exists
    const walletUser = await WalletUser.findById(walletUserId);
    if (!walletUser) {
      return next(new AppError('Wallet user not found', 404));
    }

    // Soft delete
    const deletedTeam = await UserTeam.findOneAndUpdate(
      { _id: teamId, userId, isActive: true },
      { isActive: false },
      { new: true },
    );

    if (!deletedTeam) {
      return next(new AppError('Team not found or unauthorized', 404));
    }

    logger.info('User team deleted successfully', { userId, teamId });

    res.status(200).json({
      status: 'success',
      message: 'Team deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
