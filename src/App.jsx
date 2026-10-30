import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";

import PatientHome from "./pages/patient/PatientHome";
import BookAppointment from "./pages/patient/BookAppointment";
import MyAppointments from "./pages/patient/MyAppointments";

import DoctorHome from "./pages/doctor/DoctorHome";
import Slots from "./pages/doctor/Slots";
import DoctorAppointments from "./pages/doctor/DoctorAppointments";

import PharmacistHome from "./pages/pharmacist/PharmacistHome";
import Medicines from "./pages/pharmacist/Medicines";

import HospitalStaff from "./pages/hospital/HospitalStaff";
import AdminHospitals from "./pages/admin/AdminHospitals";

export const homeFor = (role) => `/${role || "login"}`;

const RoleRoute = ({ role, children }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={homeFor(user.role)} replace />;
  return children;
};

export default function App() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={homeFor(user.role)} replace /> : <Login />}
      />

      <Route element={<Layout />}>
        <Route path="/patient" element={<RoleRoute role="patient"><PatientHome /></RoleRoute>} />
        <Route path="/patient/book" element={<RoleRoute role="patient"><BookAppointment /></RoleRoute>} />
        <Route path="/patient/appointments" element={<RoleRoute role="patient"><MyAppointments /></RoleRoute>} />

        <Route path="/doctor" element={<RoleRoute role="doctor"><DoctorHome /></RoleRoute>} />
        <Route path="/doctor/slots" element={<RoleRoute role="doctor"><Slots /></RoleRoute>} />
        <Route path="/doctor/appointments" element={<RoleRoute role="doctor"><DoctorAppointments /></RoleRoute>} />

        <Route path="/pharmacist" element={<RoleRoute role="pharmacist"><PharmacistHome /></RoleRoute>} />
        <Route path="/pharmacist/medicines" element={<RoleRoute role="pharmacist"><Medicines /></RoleRoute>} />

        <Route path="/hospital" element={<RoleRoute role="hospital"><HospitalStaff /></RoleRoute>} />
        <Route path="/admin" element={<RoleRoute role="admin"><AdminHospitals /></RoleRoute>} />
      </Route>

      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? homeFor(user.role) : "/login"} replace />}
      />
    </Routes>
  );
}
