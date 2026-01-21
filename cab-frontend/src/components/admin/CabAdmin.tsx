import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { logout } from "../../service/AuthService";
import { Driver, RideRequest } from "../interface";
import { fetchPendingRequests, fetchAvailableDrivers, assignDriver } from "../../service/AdminService";
import './cab.css';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout failed', err);
    } finally {
      navigate('/');
    }
  };
  const [requests, setRequests] = useState<RideRequest[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedRequests, setSelectedRequests] = useState<number[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<number | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<number | null>(null);
  const [locationFilter, setLocationFilter] = useState("");
  const [timeSlotFilter, setTimeSlotFilter] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [requestsData, driversData] = await Promise.all([
          fetchPendingRequests(),
          fetchAvailableDrivers(),
        ]);
        setRequests(requestsData);
        setDrivers(driversData);
      } catch (error) {
        console.error("Error loading data:", error);
        alert("Failed to load data");
      }
    };
    loadData();
  }, []);

  const handleAssignDriver = async () => {
    console.log(selectedDriver, selectedVehicle, selectedRequests);

    if (!selectedDriver || !selectedVehicle || selectedRequests.length === 0) {
      alert("Please select at least one request, a driver, and a vehicle.");
      return;
    }

    try {
      await assignDriver(selectedRequests, selectedDriver, selectedVehicle);

      setRequests((prev) => prev.filter((req) => !selectedRequests.includes(req.id)));
      setSelectedRequests([]);
      setSelectedDriver(null);
      setSelectedVehicle(null);
      alert("Driver assigned successfully!");
    } catch (error) {
      console.error("Error assigning driver:", error);
      alert("Failed to assign driver. Please try again.");
    }
  };

  return (
    <div className="admin-container">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h1 className="dashboard-title">Admin Dashboard</h1>
        <button onClick={handleLogout} style={{padding: '6px 10px', cursor: 'pointer'}}>Logout</button>
      </div>

      {/* Grid Layout for Side-by-Side Display */}
      <div className="grid-container">
        
        {/* Left Side - Pending Requests */}
        <div className="section">
          <h2>Pending Ride Requests</h2>
          <input
            type="text"
            placeholder="Filter by Location"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="filter-input"
          />
          <input
            type="text"
            placeholder="Filter by Time Slot"
            value={timeSlotFilter}
            onChange={(e) => setTimeSlotFilter(e.target.value)}
            className="filter-input"
          />

          <div className="scrollable-box">
            <table className="requests-table">
              <thead>
                <tr>
                  <th>Select</th>
                  <th>Employee Name</th>
                  <th>Route</th>
                  <th>Time Slot</th>
                  <th>date</th>
                </tr>
              </thead>
              <tbody>
                {requests
                  .filter(
                    (req) =>
                      req.route_name.includes(locationFilter) &&
                      req.time_slot.includes(timeSlotFilter)
                  )
                  .map((req) => (
                    <tr key={req.id}>
                      <td>
                        <input
                          type="checkbox"
                          value={req.id}
                          onChange={(e) => {    
                            const isChecked = e.target.checked;
                            setSelectedRequests((prev) =>
                              isChecked ? [...prev, req.id] : prev.filter((id) => id !== req.id)
                            );
                          }}
                        />
                      </td>
                      <td>{req.employee_name}</td>
                      <td>{req.route_name}</td>
                      <td>{req.time_slot}</td>
                      <td>{req.date.slice(0,10  )}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side - Available Drivers */}
        <div className="section">
          <h2>Available Drivers</h2>
          <div className="scrollable-box">
            <table className="drivers-table">
              <thead>
                <tr>
                  <th>Select</th>
                  <th>Driver Name</th>
                  <th>Vehicle number</th>
                  <th>vehicle type</th>
                  <th>Available Date</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((driver) => (
                  <tr key={driver.driver_id}>
                    <td>
                      <input
                        type="checkbox"
                        value={driver.driver_id}
                        onChange={() => {
                          setSelectedDriver(driver.driver_id);
                          setSelectedVehicle(driver.id);
                        }}
                      />
                    </td>
                    <td>{driver.driver_name}</td>
                    <td>{driver.vehicle_number}</td>
                    <td>{driver.type}</td>
                    <td>{driver.available_date.slice(0,10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Assign Button */}
      <button onClick={handleAssignDriver} className="assign-button">
        Assign Driver
      </button>
    </div>
  );
};

export default AdminPage;
