const express=require('express');
const submitrouter=express.Router();
const usermiddleware=require('../middleware/usermiddleware');
const {UserSubmission,runCode}=require('../Controller/submittedProblem')
submitrouter.post("/submit/:id",usermiddleware,UserSubmission);
submitrouter.post("/runcode/:id",usermiddleware,runCode);
module.exports=submitrouter;