const express=require('express');
const { register,adminRegister, login, logout, getprofile,DeleteUserData, updatepassword } = require("../Controller/userAuthent");
const adminmiddleware = require('../middleware/adminmiddleware');
const router=express.Router();
const usermiddleware=require("../middleware/usermiddleware");

// register
router.post("/register",register);
// admin Register
router.post("/admin/register", adminmiddleware ,adminRegister);
// login
router.post("/login",login);
// logout
router.post("/logout",usermiddleware,logout);
// getprofile
router.get("/profile",getprofile);
router.delete("/profile/delete",usermiddleware,DeleteUserData);
router.post("/updatepassword",usermiddleware,updatepassword);
module.exports=router;