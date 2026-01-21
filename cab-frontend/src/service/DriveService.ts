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

// Fetch trip details for a driver
export async function fetchTripDetails(driverId: number): Promise<TripDetails[]> {
  try {
    const response = await clientservice("GET", `/drivers/trip/${driverId}`);
    return Array.isArray(response) ? response : response.tripDetails;
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
    return response;
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
    return response;
  } catch (error) {
    console.error("Error completing trip:", error);
    throw error;
  }
}
