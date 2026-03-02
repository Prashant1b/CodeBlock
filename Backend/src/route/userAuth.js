const express=require('express');
const {
  register,
  registerWithOtp,
  adminRegister,
  sendOtp,
  verifyOtp,
  login,
  loginWithOtp,
  logout,
  getprofile,
  DeleteUserData,
  updatepassword,
  resetPasswordWithOtp,
} = require('../Controller/userAuthent');
const adminmiddleware = require('../middleware/adminmiddleware');
const router=express.Router();
const usermiddleware=require('../middleware/usermiddleware');

router.post('/register', registerWithOtp);
router.post('/register/otp', registerWithOtp);
router.post('/admin/register', adminmiddleware, adminRegister);

router.post('/otp/send', sendOtp);
router.post('/otp/verify', verifyOtp);

router.post('/login', login);
router.post('/login/otp', loginWithOtp);

router.post('/logout', logout);
router.get('/profile', getprofile);
router.delete('/profile/delete', usermiddleware, DeleteUserData);
router.post('/updatepassword', usermiddleware, updatepassword);
router.post('/password/forgot/reset', resetPasswordWithOtp);

module.exports=router;
