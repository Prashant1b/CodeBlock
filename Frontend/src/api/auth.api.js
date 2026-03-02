import { http } from './https';

export const authApi = {
  login: (payload) => http.post('/user/login', payload),
  loginWithOtp: (payload) => http.post('/user/login/otp', payload),

  signup: (payload) => http.post('/user/register', payload),
  signupWithOtp: (payload) => http.post('/user/register/otp', payload),

  sendOtp: (payload) => http.post('/user/otp/send', payload),
  verifyOtp: (payload) => http.post('/user/otp/verify', payload),
  resetPasswordWithOtp: (payload) => http.post('/user/password/forgot/reset', payload),

  logout: () => http.post('/user/logout'),
  resetPassword: (password) => http.post('/user/reset-password', { password }),
};
