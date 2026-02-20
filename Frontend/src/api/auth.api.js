import { http } from "./https";

export const authApi = {
  login: (payload) => http.post("/user/login", payload),
  signup: (payload) => http.post("/user/register", payload),
  logout: () => http.post("/user/logout"),
  resetPassword: (password) =>
    http.post(`/user/reset-password`, { password }),
  
};
