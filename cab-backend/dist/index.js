"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_route_1 = __importDefault(require("./route/auth.route"));
const cab_route_1 = __importDefault(require("./route/cab.route"));
const employee_route_1 = __importDefault(require("./route/employee.route"));
const driver_route_1 = __importDefault(require("./route/driver.route"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173', // Vite default port
    credentials: true
}));
// Auth routes (no prefix - base path)
app.use('/api/v1/auth', auth_route_1.default);
// Other routes
app.use('/api/v1', cab_route_1.default);
app.use('/api/v1/employees', employee_route_1.default);
app.use('/api/v1/drivers', driver_route_1.default);
const PORT = 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
