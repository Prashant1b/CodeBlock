const Problem = require('../models/problems')
const jwt = require("jsonwebtoken");
const { getlanguagebyid, submitBatch, submittoken } = require('../utils/language');
const mongoose = require('mongoose');
const User = require('../models/user');

const createproblem = async (req, res) => {
  const { title, description, difficulty, tags,
    visibletestcases, hiddentestcases, startcode, refsolution, problemcreator } = req.body;
  // language id: 
  // sourcecode
  // stdin -standard input
  // expected_output
  try {

    for (const { language, solution } of refsolution) {
      const languageid = getlanguagebyid(language);

      const submission = visibletestcases.map((testcases) => ({
        source_code: solution,
        language_id: languageid,
        stdin: testcases.input.trim(),
        expected_output: testcases.output.trim()
      }));
      const submitresult = await submitBatch(submission);
      const resulttoken = submitresult.map((value) => value.token)
      const testresult = await submittoken(resulttoken);
      console.log(testresult);
      for (const test of testresult) {
        if (test.status_id == 4) return res.status(400).send("Wrong answer");
        if (test.status_id == 5) return res.status(400).send("Time Limit Exceed");
        if (test.status_id == 6) return res.status(400).send("Compilation Error");
        if ([7, 8, 9, 10, 11, 12].includes(test.status_id))
          return res.status(400).send("Runtime Error");
        if (test.status_id == 13) return res.status(400).send("Error Occured")


      }
    }
    const userproblem = await Problem.create({
      ...req.body,
      problemcreator: req.user._id
    });

    res.status(201).send("Problem Submitted Sucessfully");

  } catch (error) {
    res.status(404).send("Error " + error.message);
  }

}

const updateproblem = async (req, res) => {
  const id = req.params.id;
  const { title, description, difficulty, tags,
    visibletestcases, hiddentestcases, startcode, refsolution, problemcreator } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).send("Invalid Problem ID");
    }
    const DSA = await Problem.findById(id);
    if (!DSA) {
      return res.status(404).send("Problem does not exist");
    }
    for (const { language, solution } of refsolution) {
      const languageid = getlanguagebyid(language);

      const submission = visibletestcases.map((testcases) => ({
        source_code: solution,
        language_id: languageid,
        stdin: testcases.input.trim(),
        expected_output: testcases.output.trim()
      }));
      const submitresult = await submitBatch(submission);
      const resulttoken = submitresult.map((value) => value.token)
      const testresult = await submittoken(resulttoken);
      for (const test of testresult) {
        if (test.status_id == 4) return res.status(400).send("Wrong answer");
        if (test.status_id == 5) return res.status(400).send("Time Limit Exceed");
        if (test.status_id == 6) return res.status(400).send("Compilation Error");
        if ([7, 8, 9, 10, 11, 12].includes(test.status_id))
          return res.status(400).send("Runtime Error");
        if (test.status_id == 13) return res.status(400).send("Error Occured")


      }
    }


    const newProblem = await Problem.findByIdAndUpdate(id, { ...req.body }, { runValidators: true, new: true });


    res.status(200).send(newProblem);
  }
  catch (err) {
    res.status(500).send("Error " + err.message)
  }
}

const getproblemById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).send("Invalid Problem ID");
    }
    const id = req.params.id;
    const problem = await Problem.findById(id).select('_id title description difficulty tags visibletestcases startcode  refsolution');
    if (!problem) throw new Error("Problem doesn't exists");
    res.status(200).send(problem);
  } catch (error) {
    res.status(404).send("Error " + error.message);
  }
}

const getallproblem = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page
    const limit = parseInt(req.query.limit) || 10; // Items per page
    const skip = (page - 1) * limit; // How many items to skip
    const total = await Problem.countDocuments();
    const problems = await Problem.find().select('_id title difficulty tags ').skip(skip).limit(limit);
    if (problems.length === 0) throw new Error("Problems are missing");
    res.status(200).json({
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalProblems: total,
      problems
    });
  } catch (error) {
    res.status(404).send("Error: " + error.message);
  }
};


const deleteproblem = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).send("Invalid Problem ID");
    }
    const deletedProblem = await Problem.findByIdAndDelete(req.params.id);
    if (!deletedProblem) {
      return res.status(404).send("Problem does not exist");
    }
    res.status(200).send("Problem deleted successfully");
  } catch (error) {
    res.status(500).send("Error " + error.message);
  }
}

const solvedAllproblemByUser = async (req, res) => {
  try {
    const userid=req.user._id;
    const person=await User.findById(userid).populate({
      path:"problemsolved",
      select:"_id title difficulty tags"
    });//hamne ref use kiya tha jo reference dega hame problem ka isliye ham populate use karenge
    res.status(200).send(person.problemsolved);
  }
  catch (error) {
    res.status(500).send("Error " + error.message);
  }


}

const SubmittedProblem=async(req,res)=>{
   try {
       const problemid=req.params.pid;
       const userid=req.user._id;
       const ans=await Submission.find({userid,problemid});
       if(ans.lenght==0)
        return res.status(200).send("Submit Your First Problem");
        res.status(200).send(ans);
   } catch (error) {
      res.status(500).send("Error "+error.message);
   }
}

const allUser=async(req,res)=>{
   try {
     const users = await User.find().select("_id firstname emailid role createdAt").sort({ createdAt: -1 });
      res.json({ users });
   } catch (error) {
      res.status(500).send("Error "+error.message);
   }

}

const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send("Invalid User ID");
    }

    if (!["user", "admin"].includes(role)) {
      return res.status(400).send("Invalid role (use 'user' or 'admin')");
    }

    // optional safety: admin apna role remove na kare
    if (String(req.user._id) === String(userId) && role !== "admin") {
      return res.status(400).send("You can't remove your own admin role");
    }

    const updated = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select("_id firstname emailid role createdAt");

    if (!updated) return res.status(404).send("User not found");

    return res.status(200).json({ user: updated });
  } catch (error) {
    return res.status(500).send("Error " + error.message);
  }
};

module.exports = { createproblem, updateproblem, getproblemById, getallproblem, deleteproblem, solvedAllproblemByUser,SubmittedProblem ,allUser,updateUserRole};