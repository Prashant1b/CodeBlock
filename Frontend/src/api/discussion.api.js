import { http } from './https';

export const discussionApi = {
  list: () => http.get('/discussion/alldiscussion'),
  getById: (id) => http.get(`/discussion/${id}`),
  create: (payload) => http.post('/discussion/creatediscussion', payload),
  update: (id, payload) => http.put(`/discussion/updatediscussion/${id}`, payload),
  remove: (id) => http.delete(`/discussion/deletedicussion/${id}`),
  toggleLike: (id) => http.patch(`/discussion/${id}/like`),
  addComment: (id, text) => http.post(`/discussion/${id}/comment`, { text }),
  deleteComment: (id, commentId) =>
    http.delete(`/discussion/${id}/comment/${commentId}`),
};
