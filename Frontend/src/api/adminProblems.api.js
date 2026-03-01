import { http } from "./https";

export const adminProblemsApi = {
  list: ({ page = 1, limit = 10 } = {}) =>
    http.get(`/leetcode/admin/problems?page=${page}&limit=${limit}`),

  // Backward compatibility for any older calls
  lists: ({ page = 1, limit = 10 } = {}) =>
    http.get(`/leetcode/admin/problems?page=${page}&limit=${limit}`),

  getById: (id) => http.get(`/leetcode/showproblem/${id}`),
  create: (payload) => http.post(`/leetcode/createproblem`, payload),
  update: (id, payload) => http.put(`/leetcode/updateproblem/${id}`, payload),
  remove: (id) => http.delete(`/leetcode/removeproblem/${id}`),
  setVisibility: (id, isVisible) =>
    http.patch(`/leetcode/problemvisibility/${id}`, { isVisible }),
};
