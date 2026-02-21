import axios from "axios";
import { http } from "./https";

export const runCodeApi = (id, payload) => http.post(`/problem/runcode/${id}`, payload);
export const submitCodeApi = (id, payload) => http.post(`/problem/submit/${id}`, payload);
export const submissionApi = {
  listByProblem: (pid) => http.get(`/leetcode/submittedproblem/${pid}`),
};