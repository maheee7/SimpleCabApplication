import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './route/auth.route';
import cabRoutes from './route/cab.route';
import employeeRoutes from './route/employee.route';
import driverRoutes from './route/driver.route';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173', // Vite default port
    credentials: true
}));

// Auth routes (no prefix - base path)
app.use('/api/v1/auth', authRoutes);

// Other routes
app.use('/api/v1', cabRoutes);
app.use('/api/v1/employees', employeeRoutes);
app.use('/api/v1/drivers', driverRoutes);

const PORT = 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

