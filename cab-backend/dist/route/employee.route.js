"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/route/employee.route.ts
const express_1 = __importDefault(require("express"));
const employee_controller_1 = require("../controller/employee.controller");
const router = express_1.default.Router();
router.post('/', employee_controller_1.createEmployee);
router.get('/', employee_controller_1.getEmployees);
router.put('/:id', employee_controller_1.updateEmployee);
exports.default = router;
