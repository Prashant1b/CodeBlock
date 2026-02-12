const express=require('express');
const submitrouter=express.Router();
const usermiddleware=require('../middleware/usermiddleware');
const {UserSubmission,runCode}=require('../Controller/submittedProblem');
const SubmitcodeRatelimiter = require('../middleware/ratelimitermiddleware');
submitrouter.post("/submit/:id",usermiddleware,SubmitcodeRatelimiter,UserSubmission);
submitrouter.post("/runcode/:id",usermiddleware,runCode);
module.exports=submitrouter;