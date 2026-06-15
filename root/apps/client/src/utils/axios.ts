import axios from "axios";
import { HTTP_URL } from "./urls";

const api = axios.create({
    baseURL:HTTP_URL+"/api/v1",
    timeout:10000
})


api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    config.headers.Authorization = "Bearer "+ token;
    return config;
});


api.interceptors.response.use(
    (response) => response,
    (error) => {
      console.log("Error occurred");
      return Promise.reject(error);
    }
);
  

export default api;