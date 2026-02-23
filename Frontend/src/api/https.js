import axios from "axios"
export const http = axios.create({
    baseURL: "https://codeblock-0wvh.onrender.com",
  withCredentials: true,
});