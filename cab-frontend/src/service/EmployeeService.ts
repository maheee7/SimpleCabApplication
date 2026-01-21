import { clientservice } from "../client/client";

// Check booking status for an employee
export async function checkBookingStatus(employeeId: number) {
  try {
    const response = await clientservice("GET", `/check-booking?employeeId=${employeeId}`);
    return response;
  } catch (error) {
    console.error("Error checking booking status:", error);
    throw error;
  }
}

// Book a ride for an employee
export async function bookRide(
  employeeId: number,
  routeId: number,
  location: string,
  date: string,
  timeSlot: string
) {
  try {
    const response = await clientservice("POST", "/book-ride", {
      employeeId,
      routeId,
      location,
      date,
      timeSlot,
    });
    return response;
  } catch (error) {
    console.error("Error booking ride:", error);
    throw error;
  }
}

// Cancel a ride for an employee
export async function cancelRide(employeeId: string) {
  try {
    const response = await clientservice("POST", "/employee/cancel-ride", {
      employeeId,
    });
    return response;
  } catch (error) {
    console.error("Error canceling ride:", error);
    throw error;
  }
}
