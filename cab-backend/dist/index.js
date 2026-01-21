"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cab_route_1 = __importDefault(require("./route/cab.route"));
const employee_route_1 = __importDefault(require("./route/employee.route"));
const driver_route_1 = __importDefault(require("./route/driver.route"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// Routes
app.use('/api/v1', cab_route_1.default);
app.use('/api/v1/employees', employee_route_1.default);
app.use('/api/v1/drivers', driver_route_1.default);
const PORT = 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
