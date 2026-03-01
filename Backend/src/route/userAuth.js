const express=require('express');
const {
  register,
  registerWithOtp,
  adminRegister,
  sendOtp,
  verifyOtp,
  login,
  loginWithOtp,
  googleLogin,
  logout,
  getprofile,
  DeleteUserData,
  updatepassword,
  resetPasswordWithOtp,
  sendSignupSmsOtp,
  verifySignupSmsOtp,
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
router.post('/login/google', googleLogin);

router.post('/logout', usermiddleware, logout);
router.get('/profile', getprofile);
router.delete('/profile/delete', usermiddleware, DeleteUserData);
router.post('/updatepassword', usermiddleware, updatepassword);
router.post('/password/forgot/reset', resetPasswordWithOtp);
router.post('/signup/sms/send', sendSignupSmsOtp);
router.post('/signup/sms/verify', verifySignupSmsOtp);

module.exports=router;
