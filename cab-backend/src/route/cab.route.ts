import express from "express";
import { CabController } from "../controller/cab.controller";
import { CabService } from "../service/cab.service";
import { CabRepository } from "../repository/cab.repository";

const router = express.Router();

// Instantiate controller with dependencies
const cabRepository = new CabRepository();
const cabService = new CabService(cabRepository);
const cabController = new CabController(cabService);

// Routes with controller method binding
router.get("/admin/pending-requests", (req, res) => cabController.getPendingRequests(req, res));
router.post("/employee/cancel-ride", (req, res) => cabController.cancelRide(req, res));
router.post("/driver/update-drivers", (req, res) => cabController.updateDriverAvailability(req, res));
router.get("/admin/available-driver", (req, res) => cabController.getAvailableDrivers(req, res));
router.post("/admin/assign-driver", (req, res) => cabController.assignDriver(req, res));
router.get("/cab-details", (req, res) => cabController.getCabDetails(req, res));
router.get("/check-booking", (req, res) => cabController.checkEmployeeBooking(req, res));
router.post("/book-ride", (req, res) => cabController.bookRide(req, res));
router.put("/driver/complete-ride/:requestId", (req, res) => cabController.completeRide(req, res));

export default router;