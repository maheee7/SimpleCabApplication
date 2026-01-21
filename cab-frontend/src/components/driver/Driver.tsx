import { useState, useEffect } from "react";
import { fetchTripDetails, markDriverAvailability, completeTrip, getDriverAvailability } from "../../service/DriveService";
import "./driver.css";

interface TripDetails {
  trip_id: number;
  employeeName: string;
  employeeNumber: string;
  cabNumber: string;
  vehicleType: string;
  time_slot: string;
  date: string | null;
}

const DriverPage: React.FC = () => {
  const [driverId, setDriverId] = useState<number | null>(null);
  const [tripDetails, setTripDetails] = useState<TripDetails[]>([]);
  const [selectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [confirmTripId, setConfirmTripId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMarkingAvailable, setIsMarkingAvailable] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);


  // Check driver availability first when driverId changes
  useEffect(() => {
    if (!driverId) {
      setIsAvailable(false);
      setTripDetails([]);
      return;
    }

    const checkAvailability = async () => {
      setIsLoading(true);
      try {
        const availabilityStatus = await getDriverAvailability(driverId);
        console.log("Driver availability status:", availabilityStatus);
        
        if (availabilityStatus.available) {
          // Driver is available, don't fetch trips
          setIsAvailable(true);
          setTripDetails([]);
        } else {
          // Driver is not available, fetch trips
          setIsAvailable(false);
          await fetchTrips(driverId);
        }
      } catch (error) {
        console.error("Error checking driver availability:", error);
        setIsAvailable(false);
        // Try to fetch trips as fallback
        await fetchTrips(driverId);
      } finally {
        setIsLoading(false);
      }
    };

    checkAvailability();
  }, [driverId]);

   const fetchTrips = async (driverId: number) => {
      setIsLoading(true);
      try {
        const trips = await fetchTripDetails(driverId);
        console.log("Trip Details:", trips);
        setTripDetails(trips);
      } catch (error) {
        console.error("Error fetching trip details:", error);
        setTripDetails([]);
      } finally {
        setIsLoading(false);
      }
    };
  

  

  const handleTripCompletionRequest = (trip_id: number) => {
    setConfirmTripId(trip_id);
  };

const completeTripDetials = async () => {
  if (!driverId) return;

  try {
    await completeTrip(driverId, confirmTripId!);

    const updatedTrips = tripDetails.filter((trip) => trip.trip_id !== confirmTripId);
    setTripDetails(updatedTrips);
    setConfirmTripId(null);

    // If all trips are completed, mark driver as available
    if (updatedTrips.length === 0) {
      console.log("All trips completed, marking driver as available");
      alert("All trips completed! You are now available for new rides.");
    }

  } catch (error) {
    console.error("Error completing trip:", error);
  }
};

const handleMakeAvailable = async () => {
  if (!driverId) return;

  setIsMarkingAvailable(true);
  try {
    await markDriverAvailability(driverId, selectedDate, true);
    setIsAvailable(true); // Mark driver as available
    alert("You are now available for new rides!");
    // No need to refresh trips since driver is available
  } catch (error) {
    console.error("Error marking driver as available:", error);
    alert("Failed to mark you as available. Please try again.");
  } finally {
    setIsMarkingAvailable(false);
  }
};
  
  // Debugging log to check values
  console.log("Trip Details Length:", tripDetails.length);

  return (
    <div className="container">
      <h2>Driver Dashboard</h2>

      <div className="input-section">
        <label htmlFor="driverId">Enter Driver ID:</label>
        <input
          type="number"
          id="driverId"
          placeholder="Enter Driver ID"
          value={driverId ?? ""}
          onChange={(e) => setDriverId(Number(e.target.value) || null)}
        />
      </div>

      {isLoading && <p className="loading-message">Loading ride details...</p>}

      {!isLoading && isAvailable && driverId && (
        <div className="no-rides-container">
          <p className="available-status">✓ You are marked as available for new rides</p>
        </div>
      )}

      {!isLoading && !isAvailable && tripDetails.length === 0 && driverId && (
        <div className="no-rides-container">
          <p className="no-rides-message">Currently no rides are assigned to you.</p>
          <button 
            className="make-available-btn" 
            onClick={handleMakeAvailable}
            disabled={isMarkingAvailable}
          >
            {isMarkingAvailable ? "Marking Available..." : "Make Me Available"}
          </button>
        </div>
      )}

      {tripDetails.length > 0 && (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Employee Name</th>
                <th>Phone</th>
                <th>Cab Number</th>
                <th>Vehicle Type</th>
                <th>Time</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {tripDetails.map((trip, index) => (
                <tr key={index}>
                  <td>{trip.employeeName}</td>
                  <td>{trip.employeeNumber}</td>
                  <td>{trip.cabNumber}</td>
                  <td>{trip.vehicleType}</td>
                  <td>{trip.time_slot}</td>
                  <td>{trip.date}</td>
                  <td>
                    <button className="complete-btn" onClick={() => handleTripCompletionRequest(trip.trip_id)}>
                      Complete Trip
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirmTripId !== null && (
        <div className="confirmation-popup">
          <p>Are you sure you want to mark this trip as completed?</p>
          <div className="popup-buttons">
            <button className="confirm-btn" onClick={completeTripDetials}>Yes</button>
            <button className="cancel-btn" onClick={() => setConfirmTripId(null)}>No</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverPage;
