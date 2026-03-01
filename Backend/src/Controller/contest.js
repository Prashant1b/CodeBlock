const mongoose = require('mongoose');
const Contest = require('../models/contest');
const ContestSubmission = require('../models/contestSubmission');
const ContestParticipant = require('../models/contestParticipant');
const Problem = require('../models/problems');
const { getlanguagebyid, submitBatch, submittoken } = require('../utils/language');

const calcStatus = (contest) => {
  const now = new Date();
  const start = new Date(contest.startTime);
  const end = new Date(contest.endTime);

  if (!contest.isActive) return 'Inactive';
  if (now < start) return 'Upcoming';
  if (now > end) return 'Ended';
  return 'Live';
};

const formatContest = (contestDoc) => {
  const contest = contestDoc.toObject ? contestDoc.toObject() : contestDoc;
  return {
    ...contest,
    status: calcStatus(contest),
  };
};

const validateProblemIds = async (problemIds) => {
  if (!Array.isArray(problemIds) || !problemIds.length) {
    throw new Error('At least one problem is required');
  }

  for (const id of problemIds) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid problem ID in contest problems');
    }
  }

  const count = await Problem.countDocuments({ _id: { $in: problemIds } });
  if (count !== problemIds.length) {
    throw new Error('One or more problems were not found');
  }
};

const listContests = async (req, res) => {
  try {
    const contests = await Contest.find({ isVisible: true })
      .populate('createdBy', '_id firstname emailid')
      .populate('problems', '_id title difficulty')
      .sort({ createdAt: -1 });

    return res.status(200).json(contests.map(formatContest));
  } catch (error) {
    return res.status(500).send('Error ' + error.message);
  }
};

const listContestsForAdmin = async (req, res) => {
  try {
    const contests = await Contest.find()
      .populate('createdBy', '_id firstname emailid')
      .populate('problems', '_id title difficulty')
      .sort({ createdAt: -1 });

    return res.status(200).json(contests.map(formatContest));
  } catch (error) {
    return res.status(500).send('Error ' + error.message);
  }
};

const getContestById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send('Invalid contest ID');
    }

    const contest = await Contest.findById(id)
      .populate('createdBy', '_id firstname emailid')
      .populate(
        'problems',
        '_id title description difficulty tags visibletestcases startcode'
      );

    if (!contest) return res.status(404).send('Contest not found');
    if (contest.isVisible === false) return res.status(404).send('Contest not found');

    return res.status(200).json(formatContest(contest));
  } catch (error) {
    return res.status(500).send('Error ' + error.message);
  }
};

const createContest = async (req, res) => {
  try {
    const { title, description, isActive, isVisible, startTime, endTime, problems } = req.body;

    if (!title || !startTime || !endTime) {
      return res
        .status(400)
        .send('title, startTime, endTime and problems are required');
    }

    await validateProblemIds(problems);

    const created = await Contest.create({
      title,
      description: description || '',
      isActive: Boolean(isActive),
      isVisible: isVisible === undefined ? true : Boolean(isVisible),
      startTime,
      endTime,
      problems,
      createdBy: req.user._id,
    });

    const populated = await Contest.findById(created._id)
      .populate('createdBy', '_id firstname emailid')
      .populate('problems', '_id title difficulty');

    return res.status(201).json(formatContest(populated));
  } catch (error) {
    return res.status(400).send('Error ' + error.message);
  }
};

const updateContest = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send('Invalid contest ID');
    }

    const contest = await Contest.findById(id);
    if (!contest) return res.status(404).send('Contest not found');

    const { title, description, isActive, isVisible, startTime, endTime, problems } = req.body;

    if (problems !== undefined) {
      await validateProblemIds(problems);
      contest.problems = problems;
    }
    if (title !== undefined) contest.title = title;
    if (description !== undefined) contest.description = description;
    if (isActive !== undefined) contest.isActive = Boolean(isActive);
    if (isVisible !== undefined) contest.isVisible = Boolean(isVisible);
    if (startTime !== undefined) contest.startTime = new Date(startTime);
    if (endTime !== undefined) contest.endTime = new Date(endTime);

    await contest.save();

    const populated = await Contest.findById(id)
      .populate('createdBy', '_id firstname emailid')
      .populate('problems', '_id title difficulty');

    return res.status(200).json(formatContest(populated));
  } catch (error) {
    return res.status(400).send('Error ' + error.message);
  }
};

const setContestActive = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send('Invalid contest ID');
    }
    if (typeof isActive !== 'boolean') {
      return res.status(400).send('isActive must be boolean');
    }

    const updated = await Contest.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    )
      .populate('createdBy', '_id firstname emailid')
      .populate('problems', '_id title difficulty');

    if (!updated) return res.status(404).send('Contest not found');
    return res.status(200).json(formatContest(updated));
  } catch (error) {
    return res.status(500).send('Error ' + error.message);
  }
};

const setContestVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const { isVisible } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send('Invalid contest ID');
    }
    if (typeof isVisible !== 'boolean') {
      return res.status(400).send('isVisible must be boolean');
    }

    const updated = await Contest.findByIdAndUpdate(
      id,
      { isVisible },
      { new: true }
    )
      .populate('createdBy', '_id firstname emailid')
      .populate('problems', '_id title difficulty');

    if (!updated) return res.status(404).send('Contest not found');
    return res.status(200).json(formatContest(updated));
  } catch (error) {
    return res.status(500).send('Error ' + error.message);
  }
};

const submitContestProblem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id, problemId } = req.params;
    const { code, language } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(problemId)) {
      return res.status(400).send('Invalid contest or problem ID');
    }
    if (!code || !language) {
      return res.status(400).send('code and language are required');
    }

    const contest = await Contest.findById(id);
    if (!contest) return res.status(404).send('Contest not found');

    const now = new Date();
    if (!contest.isActive || now < contest.startTime || now > contest.endTime) {
      return res.status(400).send('Contest is not live');
    }

    const isInContest = contest.problems.some(
      (pid) => String(pid) === String(problemId)
    );
    if (!isInContest) return res.status(400).send('Problem is not part of this contest');

    const participant = await ContestParticipant.findOne({
      contestId: id,
      userId,
    });
    if (!participant) {
      return res.status(403).send('Enter contest first to submit');
    }
    if (participant.hasExited) {
      return res.status(403).send('You exited this contest and cannot access it again');
    }
    if (participant.isDisqualified) {
      return res.status(403).send('You are removed from this contest due to violations');
    }

    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).send('Problem not found');

    const previousAttempts = await ContestSubmission.countDocuments({
      contestId: id,
      userId,
      problemId,
    });

    const submissionDoc = await ContestSubmission.create({
      contestId: id,
      problemId,
      userId,
      code,
      language,
      status: 'pending',
      testcasesTotal: problem.hiddentestcases.length,
      attemptNo: previousAttempts + 1,
    });

    const languageId = getlanguagebyid(language);
    const judgePayload = problem.hiddentestcases.map((testcase) => ({
      source_code: code,
      language_id: languageId,
      stdin: testcase.input.trim(),
      expected_output: testcase.output.trim(),
    }));

    const submitResult = await submitBatch(judgePayload);
    const tokens = submitResult.map((value) => value.token);
    const testResult = await submittoken(tokens);

    let testcasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let status = 'accepted';
    let errorMessage = '';

    for (const test of testResult) {
      if (test.status_id == 3) {
        testcasesPassed++;
        runtime += parseFloat(test.time || '0') * 1000;
        memory = Math.max(memory, test.memory || 0);
      } else if (status === 'accepted') {
        status = test.status_id == 4 ? 'wrong' : 'error';
        errorMessage = test.stderr || test.compile_output || 'Execution error';
      }
    }

    submissionDoc.status = status;
    submissionDoc.runtime = Math.round(runtime);
    submissionDoc.memory = memory;
    submissionDoc.testcasesPassed = testcasesPassed;
    submissionDoc.errorMessage = errorMessage;
    if (status === 'accepted') submissionDoc.acceptedAt = new Date();

    await submissionDoc.save();

    return res.status(200).json({
      ok: true,
      submissionId: submissionDoc._id,
      status: submissionDoc.status,
      passed: submissionDoc.testcasesPassed,
      total: submissionDoc.testcasesTotal,
      runtimeMs: submissionDoc.runtime,
      memoryKb: submissionDoc.memory,
      errorMessage: submissionDoc.errorMessage || '',
      acceptedAt: submissionDoc.acceptedAt,
      attemptNo: submissionDoc.attemptNo,
    });
  } catch (error) {
    return res.status(500).send('Error ' + error.message);
  }
};

const enterContest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send('Invalid contest ID');
    }

    const contest = await Contest.findById(id);
    if (!contest) return res.status(404).send('Contest not found');

    const now = new Date();
    if (!contest.isActive || now < contest.startTime || now > contest.endTime) {
      return res.status(400).send('Contest is not live');
    }

    const existing = await ContestParticipant.findOne({ contestId: id, userId });
    if (existing) {
      if (existing.hasExited) {
        return res.status(403).send('You already exited this contest and cannot re-enter');
      }
      return res.status(200).json({
        alreadyEntered: true,
        participant: existing,
      });
    }

    const participant = await ContestParticipant.create({
      contestId: id,
      userId,
      joinedAt: now,
    });

    return res.status(201).json({
      alreadyEntered: false,
      participant,
    });
  } catch (error) {
    if (error?.code === 11000) {
      const participant = await ContestParticipant.findOne({
        contestId: req.params.id,
        userId: req.user._id,
      });
      return res.status(200).json({
        alreadyEntered: true,
        participant,
      });
    }
    return res.status(500).send('Error ' + error.message);
  }
};

const getMyContestParticipation = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send('Invalid contest ID');
    }

    const participant = await ContestParticipant.findOne({
      contestId: id,
      userId: req.user._id,
    });

    if (!participant) return res.status(404).send('Not entered in this contest');
    return res.status(200).json(participant);
  } catch (error) {
    return res.status(500).send('Error ' + error.message);
  }
};

const reportContestViolation = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send('Invalid contest ID');
    }

    const participant = await ContestParticipant.findOne({
      contestId: id,
      userId: req.user._id,
    });

    if (!participant) return res.status(403).send('Enter contest first');
    if (participant.hasExited) {
      return res.status(403).send('You exited this contest and cannot access it again');
    }
    if (participant.isDisqualified) {
      return res.status(200).json({
        message: 'Already disqualified',
        participant,
      });
    }

    participant.violations += 1;
    if (participant.violations >= 3) {
      participant.isDisqualified = true;
      participant.disqualifiedAt = new Date();
    }
    await participant.save();

    const isDisqualified = participant.isDisqualified;
    let message = `Warning ${participant.violations}/3: Tab switch detected.`;
    if (isDisqualified) {
      message = 'Violation limit reached (3/3). You are removed from this contest.';
    }

    return res.status(200).json({
      message,
      violations: participant.violations,
      isDisqualified,
      disqualifiedAt: participant.disqualifiedAt,
    });
  } catch (error) {
    return res.status(500).send('Error ' + error.message);
  }
};

const exitContest = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send('Invalid contest ID');
    }

    const participant = await ContestParticipant.findOne({
      contestId: id,
      userId: req.user._id,
    });
    if (!participant) return res.status(403).send('Enter contest first');

    if (participant.hasExited) {
      return res.status(200).json({
        message: 'You already exited this contest',
        participant,
      });
    }

    participant.hasExited = true;
    participant.exitedAt = new Date();
    participant.isDisqualified = true;
    if (!participant.disqualifiedAt) participant.disqualifiedAt = new Date();
    await participant.save();

    return res.status(200).json({
      message: 'You exited this contest. Re-entry is not allowed.',
      participant,
    });
  } catch (error) {
    return res.status(500).send('Error ' + error.message);
  }
};

const getMyContestSubmissions = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send('Invalid contest ID');
    }

    const items = await ContestSubmission.find({
      contestId: id,
      userId: req.user._id,
    })
      .sort({ createdAt: -1 })
      .select(
        '_id problemId status runtime memory testcasesPassed testcasesTotal acceptedAt createdAt attemptNo'
      );

    return res.status(200).json(items);
  } catch (error) {
    return res.status(500).send('Error ' + error.message);
  }
};

const getContestLeaderboard = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send('Invalid contest ID');
    }

    const contest = await Contest.findById(id).select('_id title problems');
    if (!contest) return res.status(404).send('Contest not found');

    const participants = await ContestParticipant.find({ contestId: id });
    const participantMap = new Map(
      participants.map((p) => [
        String(p.userId),
        {
          violations: p.violations,
          isDisqualified: p.isDisqualified,
          hasExited: p.hasExited,
        },
      ])
    );

    const submissions = await ContestSubmission.find({ contestId: id })
      .populate('userId', '_id firstname emailid')
      .sort({ createdAt: 1 });

    const userMap = new Map();

    for (const sub of submissions) {
      const key = String(sub.userId?._id || sub.userId);
      if (!key) continue;
      const participant = participantMap.get(key);
      if (!participant) continue;

      if (!userMap.has(key)) {
        userMap.set(key, {
          userId: key,
          name: sub.userId?.firstname || sub.userId?.emailid || 'User',
          email: sub.userId?.emailid || '',
          solvedSet: new Set(),
          attemptedSet: new Set(),
          lastAcceptedAt: null,
          totalRuntime: 0,
          firstSubmissionAt: sub.createdAt,
          hasExited: Boolean(participant.hasExited),
          isDisqualified: Boolean(participant.isDisqualified),
        });
      }

      const row = userMap.get(key);
      row.attemptedSet.add(String(sub.problemId));

      if (sub.status === 'accepted') {
        row.solvedSet.add(String(sub.problemId));
        row.totalRuntime += sub.runtime || 0;

        if (!row.lastAcceptedAt || new Date(sub.acceptedAt) > new Date(row.lastAcceptedAt)) {
          row.lastAcceptedAt = sub.acceptedAt;
        }
      }
    }

    const board = Array.from(userMap.values()).map((row) => ({
      userId: row.userId,
      name: row.name,
      email: row.email,
      solved: row.solvedSet.size,
      attempted: row.attemptedSet.size,
      totalRuntime: row.totalRuntime,
      lastAcceptedAt: row.lastAcceptedAt,
      firstSubmissionAt: row.firstSubmissionAt,
    }));

    board.sort((a, b) => {
      if (b.solved !== a.solved) return b.solved - a.solved;

      const aTime = a.lastAcceptedAt ? new Date(a.lastAcceptedAt).getTime() : Number.MAX_SAFE_INTEGER;
      const bTime = b.lastAcceptedAt ? new Date(b.lastAcceptedAt).getTime() : Number.MAX_SAFE_INTEGER;
      if (aTime !== bTime) return aTime - bTime;

      if (a.totalRuntime !== b.totalRuntime) return a.totalRuntime - b.totalRuntime;

      return new Date(a.firstSubmissionAt).getTime() - new Date(b.firstSubmissionAt).getTime();
    });

    const ranked = board.map((row, index) => ({
      rank: index + 1,
      ...row,
      violations: participantMap.get(String(row.userId))?.violations || 0,
      hasExited: participantMap.get(String(row.userId))?.hasExited || false,
      isDisqualified: participantMap.get(String(row.userId))?.isDisqualified || false,
    }));

    return res.status(200).json({
      contest: {
        _id: contest._id,
        title: contest.title,
        totalProblems: contest.problems.length,
      },
      leaderboard: ranked,
    });
  } catch (error) {
    return res.status(500).send('Error ' + error.message);
  }
};

const getContestParticipantsForAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send('Invalid contest ID');
    }

    const contest = await Contest.findById(id).select('_id title');
    if (!contest) return res.status(404).send('Contest not found');

    const participants = await ContestParticipant.find({ contestId: id })
      .populate('userId', '_id firstname emailid role')
      .sort({ violations: -1, createdAt: 1 });

    return res.status(200).json({
      contest,
      participants,
    });
  } catch (error) {
    return res.status(500).send('Error ' + error.message);
  }
};

const adminUpdateParticipantViolations = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const { violations } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send('Invalid contest or user ID');
    }

    const nextViolations = violations === undefined ? 0 : Number(violations);
    if (!Number.isInteger(nextViolations) || nextViolations < 0) {
      return res.status(400).send('violations must be a non-negative integer');
    }

    const participant = await ContestParticipant.findOne({
      contestId: id,
      userId,
    });
    if (!participant) return res.status(404).send('Participant not found in this contest');

    participant.violations = nextViolations;
    participant.isDisqualified = nextViolations >= 3;
    participant.disqualifiedAt = participant.isDisqualified ? new Date() : null;

    await participant.save();

    const populated = await ContestParticipant.findById(participant._id).populate(
      'userId',
      '_id firstname emailid role'
    );

    return res.status(200).json({
      message: 'Participant violations updated',
      participant: populated,
    });
  } catch (error) {
    return res.status(500).send('Error ' + error.message);
  }
};

const adminUpdateParticipantStatus = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const { hasExited, isDisqualified } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send('Invalid contest or user ID');
    }

    const participant = await ContestParticipant.findOne({
      contestId: id,
      userId,
    });
    if (!participant) return res.status(404).send('Participant not found in this contest');

    if (typeof hasExited === 'boolean') {
      participant.hasExited = hasExited;
      participant.exitedAt = hasExited ? new Date() : null;
    }

    if (typeof isDisqualified === 'boolean') {
      participant.isDisqualified = isDisqualified;
      participant.disqualifiedAt = isDisqualified ? new Date() : null;
    }

    if (!participant.isDisqualified && participant.violations < 3) {
      participant.disqualifiedAt = null;
    }

    await participant.save();

    const populated = await ContestParticipant.findById(participant._id).populate(
      'userId',
      '_id firstname emailid role'
    );

    return res.status(200).json({
      message: 'Participant status updated',
      participant: populated,
    });
  } catch (error) {
    return res.status(500).send('Error ' + error.message);
  }
};

module.exports = {
  listContests,
  listContestsForAdmin,
  getContestById,
  createContest,
  updateContest,
  setContestActive,
  setContestVisibility,
  enterContest,
  exitContest,
  getMyContestParticipation,
  reportContestViolation,
  submitContestProblem,
  getMyContestSubmissions,
  getContestLeaderboard,
  getContestParticipantsForAdmin,
  adminUpdateParticipantViolations,
  adminUpdateParticipantStatus,
};
