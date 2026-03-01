const express = require('express');
const adminmiddleware = require('../middleware/adminmiddleware');
const usermiddleware = require('../middleware/usermiddleware');
const {
  listContests,
  getContestById,
  createContest,
  updateContest,
  setContestActive,
  enterContest,
  exitContest,
  getMyContestParticipation,
  reportContestViolation,
  submitContestProblem,
  getMyContestSubmissions,
  getContestLeaderboard,
  getContestParticipantsForAdmin,
  adminUpdateParticipantViolations,
} = require('../Controller/contest');

const contestRouter = express.Router();

contestRouter.get('/', listContests);
contestRouter.get('/:id/leaderboard', getContestLeaderboard);
contestRouter.get('/:id/participants', adminmiddleware, getContestParticipantsForAdmin);
contestRouter.get('/:id/me', usermiddleware, getMyContestParticipation);
contestRouter.get('/:id/mysubmissions', usermiddleware, getMyContestSubmissions);
contestRouter.get('/:id', getContestById);

contestRouter.post('/', adminmiddleware, createContest);
contestRouter.put('/:id', adminmiddleware, updateContest);
contestRouter.patch('/:id/active', adminmiddleware, setContestActive);
contestRouter.patch(
  '/:id/participants/:userId/violations',
  adminmiddleware,
  adminUpdateParticipantViolations
);
contestRouter.post('/:id/enter', usermiddleware, enterContest);
contestRouter.post('/:id/exit', usermiddleware, exitContest);
contestRouter.post('/:id/violation', usermiddleware, reportContestViolation);

contestRouter.post('/:id/submit/:problemId', usermiddleware, submitContestProblem);

module.exports = contestRouter;
