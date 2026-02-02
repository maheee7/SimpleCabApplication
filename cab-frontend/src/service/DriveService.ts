import { clientservice } from "../client/client";

interface TripDetails {
  trip_id: number;
  employeeName: string;
  employeeNumber: string;
  cabNumber: string;
  vehicleType: string;
  time_slot: string;
  date: string | null;
}

// Check driver availability status
export async function getDriverAvailability(
  driverId: number
): Promise<{ available: boolean; driverId: number }> {
  try {
    const response = await clientservice(
      "GET",
      `/drivers/check-availability/${driverId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error checking driver availability:", error);
    throw error;
  }
}

// Fetch trip details for a driver
export async function fetchTripDetails(driverId: number): Promise<TripDetails[]> {
  try {
    const response = await clientservice("GET", `/drivers/trip/${driverId}`);
    const data = response.data;
    return Array.isArray(data) ? data : data.tripDetails;
  } catch (error) {
    console.error("Error fetching trip details:", error);
    throw error;
  }
}

// Mark driver availability
export async function markDriverAvailability(
  driverId: number,
  date: string,
  isAvailable: boolean
) {
  try {
    const response = await clientservice("POST", "/drivers/availability", {
      driverId,
      date,
      isAvailable,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating availability:", error);
    throw error;
  }
}

// Complete a trip
export async function completeTrip(driverId: number, tripId: number) {
  try {
    const response = await clientservice("POST", "/drivers/complete-trip", {
      driverId,
      trip_id: tripId,
    });
    return response.data;
  } catch (error) {
    console.error("Error completing trip:", error);
    throw error;
  }
}
