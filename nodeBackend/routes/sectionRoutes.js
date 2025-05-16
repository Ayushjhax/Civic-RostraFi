const express = require('express');
const sectionController = require('../controllers/sectionController');

const router = express.Router();

router
  .route('/')
  .get(sectionController.getSections)
  .post(sectionController.createSection);
router
  .route('/:id')
  .put(sectionController.updateSection)
  .delete(sectionController.deleteSection);
router.route('/:sectionId/teams').post(sectionController.addTeamToSection);
router
  .route('/:sectionId/teams/:teamId')
  .delete(sectionController.removeTeamFromSection);

module.exports = router;
