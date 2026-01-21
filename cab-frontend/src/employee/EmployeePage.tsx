import { useState, useEffect } from "react";
import { checkBookingStatus, bookRide, cancelRide } from "../service/EmployeeService";
import "./EmployeePage.css";

interface CabDetails {
  cabNumber: string;
  driverName: string;
  driverContact: string;
}

const EmployeeBookingPage: React.FC = () => {
  const locations = ["Guindy", "Vadapalani", "Kundrathur"];
  const timeSlots = ["10:00 AM", "10:30 AM", "11:00 AM", "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM", "9:00 PM"];

  const [employeeId, setEmployeeId] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [filteredTimeSlots, setFilteredTimeSlots] = useState<string[]>([]);
  const [bookingStatus, setBookingStatus] = useState<string | null>(null);
  const [cabDetails, setCabDetails] = useState<CabDetails | null>(null);

  useEffect(() => {
    if (!employeeId) return;

    const fetchBookingStatus = async () => {
      try {
        const response = await checkBookingStatus(Number(employeeId));
        console.log(response);

        if (response) {
          const { empStatus, cab } = response;
          console.log(empStatus, cab);

          setBookingStatus(empStatus);
          if (empStatus === "Allocated") {
            setCabDetails(cab);
          }
        } else {
          console.log("inside here");
          setBookingStatus(null); // No active booking
        }
      } catch (error) {
        console.error("Error fetching booking status:", error);
      }
    };

    fetchBookingStatus();
    const interval = setInterval(fetchBookingStatus, 1000000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [employeeId]);

  useEffect(() => {
    if (!selectedDate) return;
  
    const now = new Date();
    const selectedBookingDate = new Date(selectedDate);
  
    console.log("Current Time:", now.toString());
    console.log("Selected Booking Date:", selectedBookingDate.toString());
  
    if (selectedBookingDate.toDateString() !== now.toDateString()) {
      now.setHours(0, 0, 0, 0);
      console.log("Updated Now (Set to Midnight):", now.toString());
    }
  
    const filteredSlots = timeSlots.filter((slot) => {
      const match = slot.match(/\d+/g) || [];
      let [hour, minute] = match.map(Number);
  
      console.log("Original Slot:", slot);
      console.log("Extracted Hour & Minute:", hour, minute);
  
      if (slot.includes("PM") && hour !== 12) hour += 12;
      if (slot.includes("AM") && hour === 12) hour = 0;
  
      console.log("Converted 24-hour Time:", hour, minute);
  
      const slotTime = new Date(selectedBookingDate);
      slotTime.setHours(hour, minute, 0);
  
      console.log("Slot Time:", slotTime.toString());
  
      const timeDifference = slotTime.getTime() - now.getTime();
      console.log("Time Difference (ms):", timeDifference);
      console.log("Time Difference (minutes):", timeDifference / (60 * 1000));
  
      return timeDifference > 30 * 60 * 1000;
    });
  
    console.log("Filtered Time Slots:", filteredSlots);
  
    setFilteredTimeSlots(filteredSlots);
  }, [selectedDate, timeSlots]); // Added `timeSlots` as a dependency in case it changes
  
  const handleBooking = async () => {
    if (!employeeId || !selectedLocation || !selectedTimeSlot || !selectedDate) {
      alert("Please fill in all the fields before booking.");
      return;
    }

    try {
      await bookRide(
        Number(employeeId),
        1 + locations.indexOf(selectedLocation),
        selectedLocation,
        selectedDate,
        selectedTimeSlot.slice(0, 5)
      );

      setBookingStatus("Pending");
      alert("Ride booked successfully! Waiting for cab assignment.");
    } catch (error) {
      console.error("Error booking ride:", error);
      alert("Failed to book ride. Please try again.");
    }
  };

  const handleCancelBooking = async () => {
    try {
      await cancelRide(employeeId);
      setBookingStatus(null);
      setCabDetails(null);
      alert("Your booking has been canceled.");
    } catch (error) {
      console.error("Error canceling ride:", error);
      alert("Failed to cancel the ride.");
    }
  };
  
  return (
    <div className="container">
      <h1 className="heading">Employee Ride Booking</h1>

      <label className="label">Enter Employee ID:</label>
      <input type="text" className="input" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} />

      {bookingStatus === "Pending" && <p className="info-message">Your request is pending. Please wait for cab assignment.</p>}

      {bookingStatus === "Allocated" && cabDetails && (
        <div className="cab-details">
          <h2>Cab Details</h2>
          <p><strong>Cab Number:</strong> {cabDetails.cabNumber}</p>
          <p><strong>Driver Name:</strong> {cabDetails.driverName}</p>
          <p><strong>Contact:</strong> {cabDetails.driverContact}</p>
          <p className="info-message">You have been assigned a cab. Please wait for your ride.</p>
          <button onClick={handleCancelBooking} className="cancel-button">Cancel Ride</button>
        </div>
      )}

      {(bookingStatus === "Success" || bookingStatus === null) && (
        <>
          <label className="label">Select Location:</label>
          <select className="select" value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)}>
            <option value="">Select Location</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>

          <label className="label">Select Date:</label>
          <input type="date" className="input" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} 
           min={new Date().toISOString().split("T")[0]}/>

          <label className="label">Select Time Slot:</label>
          <select className="select" value={selectedTimeSlot} onChange={(e) => setSelectedTimeSlot(e.target.value)}>
            <option value="">Select Time Slot</option>
            {filteredTimeSlots.map((slot) => (
              <option key={slot} value={slot}>{slot}</option>
            ))}
          </select>

          <button onClick={handleBooking} className="book-button">Book Ride</button>
        </>
      )}

      {bookingStatus && bookingStatus !== "Success" && (
        <p className="info-message">You cannot book a new ride until the current one is completed.</p>
      )}
    </div>
  );
};

export default EmployeeBookingPage;
