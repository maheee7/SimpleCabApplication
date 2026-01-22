"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cab_controller_1 = require("../controller/cab.controller");
const cab_service_1 = require("../service/cab.service");
const cab_repository_1 = require("../repository/cab.repository");
const router = express_1.default.Router();
// Instantiate controller with dependencies
const cabRepository = new cab_repository_1.CabRepository();
const cabService = new cab_service_1.CabService(cabRepository);
const cabController = new cab_controller_1.CabController(cabService);
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
exports.default = router;
