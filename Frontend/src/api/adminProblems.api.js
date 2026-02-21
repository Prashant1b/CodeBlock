import { http } from "./https";

export const adminProblemsApi = {
  lists: ({ page = 1, limit = 10 }) =>
    http.get(`/leetcode/showproblem?page=${page}&limit=${limit}`),

  getById: (id) => http.get(`/leetcode/showproblem/${id}`),

  create: (payload) => http.post(`/leetcode/createproblem`, payload),

  update: (id, payload) => http.put(`/leetcode/updateproblem/${id}`, payload),

  remove: (id) => http.delete(`/leetcode/removeproblem/${id}`),
   list: () => http.get("/leetcode/users"),
  updateRole: (id, role) => http.patch(`/leetcode/users/${id}/role`, { role }),
};