// ---------------------------------------------------------------
// Central place for API settings. If your server.js mounts the
// route files under different prefixes, change them here only.
// ---------------------------------------------------------------
export const API_BASE = import.meta.env.VITE_API_URL || "/api";

export const PREFIX = {
  auth: "/auth",
  admin: "/admin",
  hospital: "/hospital",
  doctor: "/doctor",
  patient: "/patient",
  pharmacist: "/pharmacist",
};

export const APP_TITLE = "BIT Student Health Center";
export const APP_SUBTITLE =
  "Patient Appointment Scheduling and Medication Stock Control System";
