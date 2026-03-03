const express=require('express');
const aiRouter=express.Router();
const usermiddleware=require("../middleware/usermiddleware");
const SolveDoubt = require('../Controller/SolveDoubt');

aiRouter.post("/chat",usermiddleware,SolveDoubt);
module.exports=aiRouter;