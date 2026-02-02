import { clientservice } from "../client/client";
import { Driver, RideRequest, Employee } from "../components/interface";

export interface EmployeeResponse {
  employee: Employee[];
  totalcount: number;
}

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
    return response.data;
  } catch (error) {
    console.error("Error assigning driver:", error);
    throw error;
  }
}

// Fetch all employees with search and pagination
export async function fetchEmployees(search?: string, page: number = 1, limit: number = 10): Promise<EmployeeResponse> {
  try {
    const response = await clientservice("GET", `/employees?search=${search || ''}&page=${page}&limit=${limit}`);
    console.log(response, "response of fetch employees")
    return response.data;
  } catch (error) {
    console.error("Error fetching employees:", error);
    throw error;
  }
}

// Create a new employee
export async function createEmployee(employee: Omit<Employee, 'id'>) {
  try {
    const response = await clientservice("POST", "/employees", employee);
    return response.data;
  } catch (error) {
    console.error("Error creating employee:", error);
    throw error;
  }
}
// Update an existing employee
export async function updateEmployee(id: number, employee: Employee) {
  try {
    const response = await clientservice("PUT", `/employees/${id}`, employee);
    return response.data;
  } catch (error) {
    console.error("Error updating employee:", error);
    throw error;
  }
}

// Delete an employee
export async function deleteEmployee(id: number) {
  try {
    const response = await clientservice("DELETE", `/employees/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting employee:", error);
    throw error;
  }
}
