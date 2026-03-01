const User = require('../models/user');
const Otp = require('../models/otp');
const Submission = require('../models/submissionschema');
const bcrypt = require('bcrypt');
const validate = require('../utils/validator');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const axios = require('axios');
const redisClient = require('../config/redis');

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const SMS_OTP_EXPIRY_MS = 5 * 60 * 1000;

const parseSenderFromEnv = () => {
  const rawFrom = String(process.env.SMTP_FROM || '').trim();
  if (!rawFrom) return null;

  const match = rawFrom.match(/^(.+?)\s*<([^>]+)>$/);
  if (match) {
    return {
      name: match[1].trim().replace(/^"|"$/g, ''),
      email: match[2].trim().toLowerCase(),
    };
  }

  return { name: 'CodeBlock', email: rawFrom.toLowerCase() };
};

const cleanEnv = (value) => String(value || '').trim().replace(/^"|"$/g, '');
const normalizePhone = (value) => String(value || '').replace(/[^\d+]/g, '').trim();

const issueAuth = (res, user) => {
  const token = jwt.sign(
    { _id: user._id, emailid: user.emailid, role: user.role },
    process.env.key,
    { expiresIn: '1h' }
  );

  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    maxAge: 60 * 60 * 1000,
  });
};

const getGoogleClient = () => {
  try {
    const { OAuth2Client } = require('google-auth-library');
    if (!process.env.GOOGLE_CLIENT_ID) {
      throw new Error('GOOGLE_CLIENT_ID is missing in env');
    }
    return new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  } catch (error) {
    if (String(error.message || '').includes('GOOGLE_CLIENT_ID')) throw error;
    throw new Error(
      'google-auth-library package is missing. Run: npm install google-auth-library'
    );
  }
};

const getNodemailer = () => {
  try {
    return require('nodemailer');
  } catch {
    throw new Error('nodemailer package is missing. Run: npm install nodemailer');
  }
};

const sendOtpEmail = async (emailid, otp, purpose) => {
  const BREVO_API_KEY = cleanEnv(process.env.BREVO_API_KEY);
  const SMTP_USER = cleanEnv(process.env.EMAIL_USER);
  const SMTP_PASS = cleanEnv(process.env.EMAIL_PASSWORD);
  const SMTP_HOST = cleanEnv(process.env.SMTP_HOST) || 'smtp-relay.brevo.com';
  const SMTP_PORT = Number(cleanEnv(process.env.SMTP_PORT) || 587);
  const senderFromEnv = parseSenderFromEnv();
  const FROM_EMAIL = senderFromEnv?.email || SMTP_USER;
  const FROM_NAME = senderFromEnv?.name || process.env.SMTP_FROM_NAME || 'CodeBlock';

  if (!FROM_EMAIL || (!BREVO_API_KEY && (!SMTP_USER || !SMTP_PASS))) {
    throw new Error(
      'Brevo config missing. Set BREVO_API_KEY or EMAIL_USER + EMAIL_PASSWORD in env'
    );
  }

  const subject = `Your OTP for ${purpose}`;
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5">
      <h2>Your verification code</h2>
      <p>Use this OTP to continue your ${purpose} request.</p>
      <p style="font-size:28px;font-weight:bold;letter-spacing:4px">${otp}</p>
      <p>This OTP is valid for 5 minutes.</p>
      <p>If you didn't request this, ignore this email.</p>
    </div>
  `;

  if (BREVO_API_KEY && BREVO_API_KEY.startsWith('xkeysib-')) {
    await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: { email: FROM_EMAIL, name: FROM_NAME },
        to: [{ email: emailid }],
        subject,
        htmlContent: html,
      },
      {
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );
  } else {
    const nodemailer = getNodemailer();
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    await transporter.sendMail({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: emailid,
      subject,
      html,
    });
  }

  // no-op return to make it explicit this function completes only on success
  return true;
};

const sendOtpSms = async (phoneNumber, otp, purpose) => {
  const ACCOUNT_SID = cleanEnv(process.env.TWILIO_ACCOUNT_SID);
  const AUTH_TOKEN = cleanEnv(process.env.TWILIO_AUTH_TOKEN);
  const FROM_NUMBER = cleanEnv(process.env.TWILIO_FROM_NUMBER);
  const debugMode = cleanEnv(process.env.SMS_DEBUG_MODE) === 'true';

  if (debugMode) {
    console.log(`[SMS_DEBUG_MODE] OTP ${otp} for ${purpose} to ${phoneNumber}`);
    return true;
  }

  if (!ACCOUNT_SID || !AUTH_TOKEN || !FROM_NUMBER) {
    throw new Error('SMS config missing. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER');
  }

  const body = new URLSearchParams({
    To: phoneNumber,
    From: FROM_NUMBER,
    Body: `Your OTP for ${purpose} is ${otp}. Valid for 5 minutes.`,
  });

  await axios.post(
    `https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT_SID}/Messages.json`,
    body.toString(),
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      auth: { username: ACCOUNT_SID, password: AUTH_TOKEN },
      timeout: 15000,
    }
  );

  return true;
};

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

const verifyOtpFromDb = async (emailid, purpose, otp, consume = true) => {
  const email = String(emailid || '').trim().toLowerCase();
  const record = await Otp.findOne({ emailid: email, purpose });

  if (!record) throw new Error('OTP not found. Request OTP again');
  if (record.expiresAt.getTime() < Date.now()) {
    await Otp.deleteOne({ _id: record._id });
    throw new Error('OTP expired. Request a new OTP');
  }

  const matched = await bcrypt.compare(String(otp || ''), record.otpHash);
  if (!matched) {
    record.attempts += 1;
    if (record.attempts >= 5) {
      await Otp.deleteOne({ _id: record._id });
      throw new Error('Too many invalid OTP attempts. Request new OTP');
    }
    await record.save();
    throw new Error('Invalid OTP');
  }

  if (consume) {
    await Otp.deleteOne({ _id: record._id });
  }

  return true;
};

const register = async (req, res) => {
  try {
    validate(req.body);

    const { firstname, emailid, password } = req.body;
    const phoneNumber = normalizePhone(req.body?.phoneNumber);

    const emailexist = await User.exists({ emailid });
    if (emailexist) {
      return res.status(409).json({ message: 'Email already exists. Please login.' });
    }
    if (phoneNumber) {
      const phoneExists = await User.exists({ phoneNumber });
      if (phoneExists) return res.status(409).json({ message: 'Phone number already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstname,
      emailid,
      phoneNumber: phoneNumber || undefined,
      password: hashed,
      role: 'user',
    });

    issueAuth(res, user);

    const safeUser = await User.findById(user._id).select('-password');
    return res.status(201).json({ message: 'Registered', user: safeUser });
  } catch (error) {
    console.log('REGISTER ERROR:', error);
    return res.status(500).json({ message: 'Weak Password' });
  }
};

const registerWithOtp = async (req, res) => {
  try {
    validate(req.body);

    const { firstname, emailid, password, otp } = req.body;
    if (!otp) return res.status(400).json({ message: 'OTP is required' });
    const phoneNumber = normalizePhone(req.body?.phoneNumber);

    const email = String(emailid || '').trim().toLowerCase();
    const emailexist = await User.exists({ emailid: email });
    if (emailexist) {
      return res.status(409).json({ message: 'Email already exists. Please login.' });
    }
    if (phoneNumber) {
      const phoneExists = await User.exists({ phoneNumber });
      if (phoneExists) return res.status(409).json({ message: 'Phone number already exists' });
    }

    await verifyOtpFromDb(email, 'signup', otp, true);

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      firstname,
      emailid: email,
      phoneNumber: phoneNumber || undefined,
      password: hashed,
      role: 'user',
    });

    issueAuth(res, user);

    const safeUser = await User.findById(user._id).select('-password');
    return res.status(201).json({ message: 'Registered with OTP', user: safeUser });
  } catch (error) {
    return res.status(400).json({ message: error.message || 'OTP signup failed' });
  }
};

const adminRegister = async (req, res) => {
  try {
    validate(req.body);
    const { emailid, password } = req.body;
    req.body.password = await bcrypt.hash(password, 10);
    const user = await User.create(req.body);
    const token = jwt.sign(
      { _id: user._id, emailid, role: user.role },
      process.env.key,
      { expiresIn: Math.floor(Date.now() / 1000) + 60 * 60 }
    );
    res.cookie('token', token, { maxAge: 60 * 60 * 1000 });

    res.status(201).send('Admin Register sucessfully');
  } catch (error) {
    res.status(404).send(error.message);
  }
};

const sendOtp = async (req, res) => {
  try {
    const { emailid, purpose = 'login' } = req.body;
    const email = String(emailid || '').trim().toLowerCase();

    if (!email) return res.status(400).json({ message: 'Email is required' });
    if (!['signup', 'login', 'reset'].includes(purpose)) {
      return res.status(400).json({ message: 'Invalid OTP purpose' });
    }

    const existingUser = await User.findOne({ emailid: email }).select('_id');
    if (purpose === 'signup' && existingUser) {
      return res.status(409).json({ message: 'Email already exists. Please login.' });
    }
    if ((purpose === 'login' || purpose === 'reset') && !existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

    await Otp.findOneAndUpdate(
      { emailid: email, purpose },
      {
        emailid: email,
        purpose,
        otpHash,
        expiresAt,
        attempts: 0,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await sendOtpEmail(email, otp, purpose);

    return res.status(200).json({ message: 'OTP sent successfully', expiresInSeconds: 300 });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to send OTP' });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { emailid, otp, purpose = 'login' } = req.body;
    if (!emailid || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    await verifyOtpFromDb(emailid, purpose, otp, false);
    return res.status(200).json({ verified: true, message: 'OTP verified successfully' });
  } catch (error) {
    return res.status(400).json({ verified: false, message: error.message || 'Invalid OTP' });
  }
};

const login = async (req, res) => {
  try {
    const { emailid, password } = req.body;

    if (!emailid || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ emailid });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    issueAuth(res, user);

    const safeUser = await User.findById(user._id).select('-password');
    return res.status(200).json({ message: 'Logged in', user: safeUser });
  } catch (error) {
    console.log('LOGIN ERROR:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const loginWithOtp = async (req, res) => {
  try {
    const { emailid, otp } = req.body;
    const email = String(emailid || '').trim().toLowerCase();

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const user = await User.findOne({ emailid: email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await verifyOtpFromDb(email, 'login', otp, true);

    issueAuth(res, user);

    const safeUser = await User.findById(user._id).select('-password');
    return res.status(200).json({ message: 'Logged in with OTP', user: safeUser });
  } catch (error) {
    return res.status(400).json({ message: error.message || 'OTP login failed' });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required' });
    }

    const client = getGoogleClient();
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const emailid = String(payload?.email || '').toLowerCase();
    const firstname = String(payload?.given_name || payload?.name || 'User');

    if (!emailid) return res.status(400).json({ message: 'Google email missing' });

    let user = await User.findOne({ emailid });
    if (!user) {
      const randomPassword = crypto.randomBytes(24).toString('hex');
      const hashed = await bcrypt.hash(randomPassword, 10);
      user = await User.create({
        firstname,
        emailid,
        password: hashed,
        role: 'user',
      });
    }

    issueAuth(res, user);

    const safeUser = await User.findById(user._id).select('-password');
    return res.status(200).json({ message: 'Logged in with Google', user: safeUser });
  } catch (error) {
    return res.status(400).json({ message: error.message || 'Google login failed' });
  }
};

const logout = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (token) {
      const payload = jwt.decode(token);
      await redisClient.set(`token:${token}`, 'blocked');
      await redisClient.expireAt(`token:${token}`, payload.exp);
    }
    res.clearCookie('token', { httpOnly: true, sameSite: 'lax', secure: false });
    return res.status(200).json({ message: 'Logged out' });
  } catch (err) {
    res.status(503).send('Error ' + err);
  }
};

const getprofile = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) throw new Error('Token is missing');
    const payload = jwt.verify(token, process.env.key);
    const { _id } = payload;
    const user = await User.findById(_id).select('-password');
    if (!user) throw new Error("User doesn't exists");
    return res.status(200).json({ user });
  } catch (error) {
    res.status(400).send('Error ' + error);
  }
};

const DeleteUserData = async (req, res) => {
  try {
    const userid = req.user._id;
    await User.findByIdAndDelete(userid);
    await Submission.deleteMany({ userid });
    res.status(200).send('User Deleted Sucessfully');
  } catch (error) {
    res.status(500).send('Error ' + error.message);
  }
};

const updatepassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).send('Password is required');
    }
    if (password.length < 6) {
      return res.status(400).send('Password must be at least 6 characters');
    }
    if (!req.user) {
      return res.status(401).send('Unauthorized');
    }
    req.user.password = await bcrypt.hash(password, 10);
    await req.user.save();
    const token = req.cookies.token;
    const payload = jwt.decode(token);
    await redisClient.set(`token:${token}`, 'blocked');
    await redisClient.expireAt(`token:${token}`, payload.exp);
    res.cookie('token', null, { expires: new Date(Date.now()) });
    res.status(200).send('Password Update Sucessfully. Login Again');
  } catch (error) {
    res.status(500).send('Error ' + error.message);
  }
};

const sendSignupSmsOtp = async (req, res) => {
  try {
    const phoneNumber = normalizePhone(req.body?.phoneNumber);
    if (!phoneNumber) {
      return res.status(400).json({ message: 'phoneNumber is required' });
    }

    const user = await User.findOne({ phoneNumber }).select('_id');
    if (user) {
      return res.status(409).json({ message: 'Phone number already exists' });
    }

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + SMS_OTP_EXPIRY_MS);

    await Otp.findOneAndUpdate(
      { emailid: phoneNumber, purpose: 'signup_sms' },
      { emailid: phoneNumber, purpose: 'signup_sms', otpHash, expiresAt, attempts: 0 },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await sendOtpSms(phoneNumber, otp, 'signup');
    return res.status(200).json({ message: 'Signup SMS OTP sent', expiresInSeconds: 300 });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to send signup SMS OTP' });
  }
};

const verifySignupSmsOtp = async (req, res) => {
  try {
    const phoneNumber = normalizePhone(req.body?.phoneNumber);
    const otp = String(req.body?.otp || '').trim();
    if (!phoneNumber || !otp) {
      return res.status(400).json({ message: 'phoneNumber and otp are required' });
    }

    await verifyOtpFromDb(phoneNumber, 'signup_sms', otp, false);
    return res.status(200).json({ verified: true, message: 'Signup SMS OTP verified' });
  } catch (error) {
    return res.status(400).json({ verified: false, message: error.message || 'Invalid OTP' });
  }
};

const resetPasswordWithOtp = async (req, res) => {
  try {
    const email = String(req.body?.emailid || '').trim().toLowerCase();
    const otp = String(req.body?.otp || '').trim();
    const newPassword = String(req.body?.newPassword || '');

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'emailid, otp and newPassword are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({ emailid: email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    await verifyOtpFromDb(email, 'reset', otp, true);

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({ message: 'Password reset successful. Please login again.' });
  } catch (error) {
    return res.status(400).json({ message: error.message || 'Reset password failed' });
  }
};

module.exports = {
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
};
