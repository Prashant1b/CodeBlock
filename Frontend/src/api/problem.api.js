import axios from "axios";
import { http } from "./https";

export const getProblems = (page = 1, limit = 10) =>
  http.get(`/leetcode/showproblem?page=${page}&limit=${limit}`);

export const getSolvedProblems = () =>
  http.get("/leetcode/problemsolved/user");
export const fetchProblemById = (id) => http.get(`/leetcode/showproblem/${id}`);