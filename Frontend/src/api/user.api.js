import { http } from "./https";

export const userApi = {
  profile: () => http.get("/user/profile"),
  deleteAccount: () => http.delete("/user/profile/delete"),
  solvedProblems: () => http.get("/leetcode/problemsolved/user"),
  totalProblems: () => http.get("/leetcode/showproblem?limit=1"),
  updatePassword: (data) =>
  http.post("/user/updatepassword", data),
};
