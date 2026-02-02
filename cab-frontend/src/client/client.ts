import axios from "axios";
import { BackendBaseURL } from "../constant";

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.map(cb => cb(token));
  refreshSubscribers = [];
}

export async function clientservice(
  method: string,
  url: string,
  data?: any,
  headers?: any
) {
  try {
    const defaultHeaders: any = {
      "Content-Type": "application/json",
    };

    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      defaultHeaders.Authorization = `Bearer ${accessToken}`;
    }

    const mergedHeaders = { ...defaultHeaders, ...headers };

    const requestConfig: any = {
      method: method,
      baseURL: `${BackendBaseURL}${url}`,
      data: data,
      headers: mergedHeaders,
      withCredentials: true // Important for cookies
    };

    const response = await axios(requestConfig);
    const result = response.data;

    if (result.status === "error") {
      const errorMsg = result.errors?.message || "An error occurred";
      throw new Error(errorMsg);
    }

    return result;
  } catch (error: any) {
    const originalRequest = error.config;

    // Handle 401 and attempt refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(resolve => {
          subscribeTokenRefresh((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(axios(originalRequest).then(res => res.data));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(`${BackendBaseURL}/auth/refresh-token`, {}, { withCredentials: true });
        const newToken = refreshResponse.data.data.accessToken;
        localStorage.setItem("accessToken", newToken);

        isRefreshing = false;
        onRefreshed(newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        const retryRes = await axios(originalRequest);
        return retryRes.data;
      } catch (refreshError) {
        isRefreshing = false;
        // Logout user on refresh failure
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
        throw refreshError;
      }
    }

    if (error.response?.data?.status === "error") {
      const apiError = error.response.data.errors;
      throw new Error(apiError?.message || "An error occurred");
    }
    throw error;
  }
}
