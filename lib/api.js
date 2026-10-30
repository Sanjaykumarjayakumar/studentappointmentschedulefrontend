// ---------------------------------------------------------------------------
// API layer. Every backend call in the app goes through this one file, so if a
// controller expects a slightly different request body, change it here only.
// ---------------------------------------------------------------------------

export const SESSION_KEY = "bit_session";

const BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message, status = 0, data = null) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

const getToken = () => {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null")?.token || null;
  } catch {
    return null;
  }
};

export async function request(path, { method = "GET", body } = {}) {
  const token = getToken();
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Cannot reach the server. Check that the backend is running and CORS is enabled.");
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* empty body */
  }

  if (!res.ok) {
    if (res.status === 401 && token && typeof window !== "undefined") {
      window.dispatchEvent(new Event("bit:unauthorized"));
    }
    throw new ApiError(data?.message || data?.error || `Request failed (${res.status})`, res.status, data);
  }
  return data;
}

// Pull an array out of a response that may be an array or { key: [...] }.
export const toList = (data, ...keys) => {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];
  for (const key of [...keys, "data", "items", "results"]) {
    if (Array.isArray(data[key])) return data[key];
  }
  return [];
};

// ---- Auth -----------------------------------------------------------------
export const authApi = {
  signUp: (body) => request("/auth/signup", { method: "POST", body }),
  signIn: (body) => request("/auth/signin", { method: "POST", body }),
  firebaseSignIn: (idToken) => request("/auth/firebase", { method: "POST", body: { idToken } }),
  adminLogin: (body) => request("/auth/adminlogin", { method: "POST", body }),
};

// ---- Patient --------------------------------------------------------------
export const patientApi = {
  doctors: () => request("/patient/doctors"),
  doctor: (doctorId) => request(`/patient/doctors/${doctorId}`),
  hospitals: () => request("/patient/hospitals"),
  hospitalDoctors: (hospitalId) => request(`/patient/hospitals/${hospitalId}/doctors`),
  doctorHospitals: (doctorId) => request(`/patient/doctors/${doctorId}/hospitals`),
  slots: (doctorId, date) => request(`/patient/doctors/${doctorId}/slots/${date}`),
  book: ({ slotId, doctorId, date }) =>
    request("/patient/appointments", {
      method: "POST",
      body: { slotId, slot: slotId, doctorId, date },
    }),
  appointments: () => request("/patient/appointments"),
  bills: () => request("/patient/bills"),
};

// ---- Doctor ---------------------------------------------------------------
export const doctorApi = {
  searchPatients: (query) => request(`/doctor/patients?q=${encodeURIComponent(query)}`),
  createSlot: (body) => request("/doctor/slots", { method: "POST", body }),
  slots: () => request("/doctor/slots"),
  slotsByDate: (date) => request(`/doctor/slots/${date}`),
  cancelSlot: (slotId) => request(`/doctor/slots/${slotId}/cancel`, { method: "PUT" }),
  appointments: () => request("/doctor/appointments"),
  bookForPatient: ({ slotId, date, patientId }) => {
    return request("/doctor/appointments", {
      method: "POST",
      body: {
        slotId,
        slot: slotId,
        date,
        patientId,
      },
    });
  },
};

// ---- Pharmacist -----------------------------------------------------------
export const pharmacistApi = {
  dashboard: () => request("/pharmacist/dashboard"),
  searchPatients: (query) => request(`/pharmacist/patients/search?q=${encodeURIComponent(query)}`),
  createBill: (body) => request("/pharmacist/bills", { method: "POST", body }),
  medicines: () => request("/pharmacist/medicines"),
  createMedicine: (body) => request("/pharmacist/medicines", { method: "POST", body }),
  updateMedicine: (id, body) => request(`/pharmacist/medicines/${id}`, { method: "PATCH", body }),
  updateMedicinePrice: (id, price) => request(`/pharmacist/medicines/${id}/price`, { method: "PATCH", body: { price } }),
  deleteMedicine: (id) => request(`/pharmacist/medicines/${id}`, { method: "DELETE" }),
  lowStock: () => request("/pharmacist/medicines/low-stock"),
  topWeek: () => request("/pharmacist/sales/top-week"),
  // mode: "add" (restock) or "remove" (adjustment)
  adjustStock: (id, { mode, quantity, note }) =>
    request(`/pharmacist/medicines/${id}/stock`, {
      method: "PATCH",
      body: {
        type: mode === "add" ? "restock" : "adjustment",
        quantity,
        note,
        change: mode === "add" ? quantity : -quantity,
      },
    }),
  recordSale: (id, { quantity, note }) =>
    request(`/pharmacist/medicines/${id}/sales`, { method: "POST", body: { quantity, note } }),
};

// ---- Hospital (hospital account) -------------------------------------------
export const hospitalApi = {
  createDoctor: (body) => request("/hospital/doctors", { method: "POST", body }),
  createPharmacist: (body) => request("/hospital/pharmacists", { method: "POST", body }),
};

// ---- Admin ----------------------------------------------------------------
export const adminApi = {
  createHospital: (body) => request("/admin/hospitals", { method: "POST", body }),
};
