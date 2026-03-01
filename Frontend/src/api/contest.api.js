import { http } from './https';

export const contestApi = {
  list: () => http.get('/contest'),
  getById: (id) => http.get(`/contest/${id}`),
  create: (payload) => http.post('/contest', payload),
  update: (id, payload) => http.put(`/contest/${id}`, payload),
  setActive: (id, isActive) => http.patch(`/contest/${id}/active`, { isActive }),
  enter: (id) => http.post(`/contest/${id}/enter`),
  exit: (id) => http.post(`/contest/${id}/exit`),
  me: (id) => http.get(`/contest/${id}/me`),
  reportViolation: (id) => http.post(`/contest/${id}/violation`),
  participants: (id) => http.get(`/contest/${id}/participants`),
  updateParticipantViolations: (contestId, userId, violations = 0) =>
    http.patch(`/contest/${contestId}/participants/${userId}/violations`, {
      violations,
    }),
  submitProblem: (contestId, problemId, payload) =>
    http.post(`/contest/${contestId}/submit/${problemId}`, payload),
  leaderboard: (id) => http.get(`/contest/${id}/leaderboard`),
  mySubmissions: (id) => http.get(`/contest/${id}/mysubmissions`),
};
