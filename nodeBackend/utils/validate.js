const Joi = require('joi');
const bs58 = require('bs58');
const AppError = require('../utils/appError');
const { MAX_TEAMS_PER_SECTION } = require('../utils/constants');

const schemas = {
  createUserTeam: Joi.object({
    userId: Joi.string().required().trim(),
    teamName: Joi.string().required().trim().min(3).max(50),
    walletUserId: Joi.string()
      .required()
      .trim()
      .regex(/^[0-9a-fA-F]{24}$/),
    tournamentId: Joi.string()
      .trim()
      .regex(/^[0-9a-fA-F]{24}$/)
      .allow(null, ''),
    totalPoints: Joi.number().min(0).required(),
    sections: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required().trim(),
          sectionId: Joi.string()
            .required()
            .regex(/^[0-9a-fA-F]{24}$/),
          selectedTeams: Joi.array()
            .items(Joi.string().regex(/^[0-9a-fA-F]{24}$/))
            .max(MAX_TEAMS_PER_SECTION),
        }),
      )
      .required(),
    isActive: Joi.boolean().default(true),
  }),
};

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(', ');
    return next(new AppError(errorMessage, 400));
  }
  next();
};

const isValidSolanaAddress = (address) => {
  try {
    // Solana addresses are base58 encoded and 32 bytes long
    if (!address || typeof address !== 'string') return false;

    // Check if the address is valid base58
    const decoded = bs58.decode(address);

    // Solana addresses are 32 bytes
    return decoded.length === 32;
  } catch (error) {
    return false;
  }
};

module.exports = {
  schemas,
  validate,
  isValidSolanaAddress,
};