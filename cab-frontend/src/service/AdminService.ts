import { clientservice } from "../client/client";
import { Driver, RideRequest } from "../components/interface";

// Fetch all pending ride requests
export async function fetchPendingRequests(): Promise<RideRequest[]> {
  try {
    const response = await clientservice("GET", "/admin/pending-requests");
    return response.data;
  } catch (error) {
    console.error("Error fetching ride requests:", error);
    throw error;
  }
}

// Fetch all available drivers
export async function fetchAvailableDrivers(): Promise<Driver[]> {
  try {
    const response = await clientservice("GET", "/admin/available-driver");
    return response.data;
  } catch (error) {
    console.error("Error fetching drivers:", error);
    throw error;
  }
}

// Assign driver to ride requests
export async function assignDriver(
  requestIds: number[],
  driverId: number,
  vehicleId: number
) {
  try {
    const response = await clientservice("POST", "/admin/assign-driver", {
      requestIds,
      driverId,
      vehicleId,
    });
    return response;
  } catch (error) {
    console.error("Error assigning driver:", error);
    throw error;
  }
}
