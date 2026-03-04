import axios from "axios"
export const http = axios.create({
    baseURL: "https://codeblock-backend.onrender.com",
  withCredentials: true,
});