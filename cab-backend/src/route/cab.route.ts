import express from "express";
import {
  getPendingRequests,
  cancelRide,
  updateDriverAvailability,
  getAvailableDrivers,
  assignDriver,
  getCabDetails,
  checkEmployeeBooking,
  bookRide,
  completeRide,
} from "../controller/cab.controller";

const router = express.Router();

// ✅ No need for an extra wrapper function
router.get("/admin/pending-requests", getPendingRequests);
router.post("/employee/cancel-ride", cancelRide);
router.post("/driver/update-drivers", updateDriverAvailability);
router.get("/admin/available-driver", getAvailableDrivers);
router.post("/admin/assign-driver", assignDriver);
router.get("/cab-details", getCabDetails);
router.get("/check-booking", checkEmployeeBooking);

// Book a ride for an employee
router.post("/book-ride", bookRide);

// Mark ride as completed by driver
router.put("/driver/complete-ride/:requestId", completeRide);



export default router;