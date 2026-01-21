import axios from "axios";
import { BackendBaseURL } from "../constant";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // Add authorization header if accessToken exists
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      defaultHeaders.Authorization = `Bearer ${accessToken}`;
    }

    // Merge custom headers with defaults
    const mergedHeaders = { ...defaultHeaders, ...headers };

    const requestConfig = {
      method: method,
      baseURL: `${BackendBaseURL}${url}`,
      data: data,
      headers: mergedHeaders,
    };

    const response = await axios(requestConfig);
    return response.data;
  } catch (error) {
    console.error("Error in clientservice:", error);
    throw error;
  }
}
