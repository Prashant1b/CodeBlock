const express=require('express');
const {createproblem,updateproblem,getproblemById,getallproblem,deleteproblem,solvedAllproblemByUser,SubmittedProblem,  allUser, updateUserRole}=require('../Controller/leetcodeproblem');
const adminmiddleware = require('../middleware/adminmiddleware');
const usermiddleware=require("../middleware/usermiddleware");
const problemrouter=express.Router();
// create
// fetch
// update
// delete
// admin authentication required
problemrouter.post("/createproblem",adminmiddleware,createproblem);
problemrouter.delete("/removeproblem/:id",adminmiddleware,deleteproblem);
problemrouter.put("/updateproblem/:id",adminmiddleware,updateproblem);
problemrouter.get("/users", adminmiddleware, allUser);
problemrouter.patch("/users/:id/role", adminmiddleware, updateUserRole);

problemrouter.get("/showproblem/:id", usermiddleware ,getproblemById);
problemrouter.get("/showproblem",getallproblem);
problemrouter.get("/problemsolved/user",usermiddleware,solvedAllproblemByUser)    //konsi problem solve kari hai user ne
problemrouter.get("/submittedproblem/:pid",usermiddleware,SubmittedProblem);

module.exports=problemrouter;