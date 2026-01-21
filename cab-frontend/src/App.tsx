import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import EmployeeBookingPage from "./employee/EmployeePage";
import AdminPage from "./components/admin/CabAdmin";
import DriverPage from "./components/driver/Driver";


const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<EmployeeBookingPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/driver" element={<DriverPage />} />
      </Routes>
    </Router>
  );
};

export default App;
