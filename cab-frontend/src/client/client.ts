import axios from "axios";
import { BackendBaseURL } from "../constant";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function clientservice(method: string, url: string, data?: any) {
  try {
    const requestConfig = {
      method: method,
      baseURL: `${BackendBaseURL}${url}`,
      data: data,
    };

    const response = await axios(requestConfig);
    return response.data;
  } catch (error) {
    console.error("Error in clientservice:", error);
    return error;
  }
}
