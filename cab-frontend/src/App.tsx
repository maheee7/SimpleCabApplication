import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/auth/login";
import Signup from "./components/auth/signup";
import ResetPassword from "./components/auth/reset-password";
import EmployeeBookingPage from "./components/employee/EmployeePage";
import AdminPage from "./components/admin/CabAdmin";
import ManageUsers from "./components/admin/ManageUsers";
import DriverPage from "./components/driver/Driver";
import { isAuthenticated, getStoredUser } from "./service/AuthService";

// Protected Route Component with Role-Based Access Control
interface ProtectedRouteProps {
  element: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ element, allowedRoles }: ProtectedRouteProps) => {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const user = getStoredUser();
    if (!user || !allowedRoles.includes(user.role)) {
      // User doesn't have the required role, redirect to login
      return <Navigate to="/" replace />;
    }
  }

  return element;
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/employee" element={<ProtectedRoute element={<EmployeeBookingPage />} allowedRoles={['EMPLOYEE', 'ADMIN']} />} />
        <Route path="/admin" element={<ProtectedRoute element={<AdminPage />} allowedRoles={['ADMIN']} />} />
        <Route path="/manage-users" element={<ProtectedRoute element={<ManageUsers />} allowedRoles={['ADMIN']} />} />
        <Route path="/driver" element={<ProtectedRoute element={<DriverPage />} allowedRoles={['DRIVER', 'ADMIN']} />} />
      </Routes>
    </Router>
  );
};

export default App;
