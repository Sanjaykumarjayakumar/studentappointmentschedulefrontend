import { useState } from "react";
import { NavLink, Outlet, Navigate, useNavigate } from "react-router-dom";
import {
  FiActivity, FiCalendar, FiClipboard, FiClock, FiGrid, FiHome, FiLogOut, FiMenu,
  FiPackage, FiPlusCircle, FiUserPlus, FiX,
} from "react-icons/fi";
import { FaHospital } from "react-icons/fa";
import { MdOutlineMedicalServices } from "react-icons/md";
import { useAuth } from "../context/AuthContext";
import { APP_TITLE } from "../config";
import { initials } from "../utils/helpers";
import { notify } from "../utils/helpers";

const NAV = {
  patient: [
    { to: "/patient", label: "Overview", icon: FiGrid, end: true },
    { to: "/patient/book", label: "Book appointment", icon: FiPlusCircle },
    { to: "/patient/appointments", label: "My appointments", icon: FiCalendar },
  ],
  doctor: [
    { to: "/doctor", label: "Overview", icon: FiGrid, end: true },
    { to: "/doctor/slots", label: "My slots", icon: FiClock },
    { to: "/doctor/appointments", label: "Appointments", icon: FiClipboard },
  ],
  pharmacist: [
    { to: "/pharmacist", label: "Stock overview", icon: FiGrid, end: true },
    { to: "/pharmacist/medicines", label: "Medicines", icon: FiPackage },
  ],
  hospital: [{ to: "/hospital", label: "Add staff", icon: FiUserPlus, end: true }],
  admin: [{ to: "/admin", label: "Hospitals", icon: FaHospital, end: true }],
};

export default function Layout() {
  const { user, isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const items = NAV[user.role] || [];
  const handleLogout = () => {
    logout();
    notify.info("You have been signed out.");
    navigate("/login");
  };

  return (
    <div className="shell">
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="brand">
          <span className="brand-mark"><MdOutlineMedicalServices /></span>
          <div>
            <strong>BIT</strong>
            <span>Student Health Center</span>
          </div>
        </div>

        <nav onClick={() => setOpen(false)}>
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className="nav-link">
              <Icon />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-foot">
          <div className="me">
            <span className="avatar">{initials(user.name)}</span>
            <div>
              <strong>{user.name}</strong>
              <span>{user.role}</span>
            </div>
          </div>
          <button className="btn btn-ghost-light" onClick={handleLogout}>
            <FiLogOut /> Sign out
          </button>
        </div>
      </aside>

      {open && <div className="scrim" onClick={() => setOpen(false)} />}

      <div className="main">
        <header className="topbar">
          <button className="icon-btn menu-btn" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
            {open ? <FiX /> : <FiMenu />}
          </button>
          <div className="topbar-title">
            <FiActivity />
            <span>{APP_TITLE}</span>
          </div>
          <NavLink to={`/${user.role}`} className="icon-btn" aria-label="Home">
            <FiHome />
          </NavLink>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
