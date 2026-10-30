import client from "./client";
import { PREFIX as P } from "../config";

const get = (url, params) => client.get(url, { params }).then((r) => r.data);
const post = (url, body) => client.post(url, body).then((r) => r.data);
const put = (url, body) => client.put(url, body).then((r) => r.data);
const patch = (url, body) => client.patch(url, body).then((r) => r.data);
const del = (url) => client.delete(url).then((r) => r.data);

export const authApi = {
  signUp: (body) => post(`${P.auth}/signup`, body),
  signIn: (body) => post(`${P.auth}/signin`, body),
  adminLogin: (body) => post(`${P.auth}/adminlogin`, body),
};

export const adminApi = {
  createHospital: (body) => post(`${P.admin}/hospitals`, body),
};

export const hospitalApi = {
  createDoctor: (body) => post(`${P.hospital}/doctors`, body),
  createPharmacist: (body) => post(`${P.hospital}/pharmacists`, body),
};

export const patientApi = {
  doctors: () => get(`${P.patient}/doctors`),
  hospitals: () => get(`${P.patient}/hospitals`),
  hospitalDoctors: (id) => get(`${P.patient}/hospitals/${id}/doctors`),
  doctorHospitals: (id) => get(`${P.patient}/doctors/${id}/hospitals`),
  slots: (doctorId, date) => get(`${P.patient}/doctors/${doctorId}/slots/${date}`),
  book: (body) => post(`${P.patient}/appointments`, body),
  appointments: () => get(`${P.patient}/appointments`),
};

export const doctorApi = {
  createSlots: (body) => post(`${P.doctor}/slots`, body),
  slots: () => get(`${P.doctor}/slots`),
  slotsByDate: (date) => get(`${P.doctor}/slots/${date}`),
  cancelSlot: (id) => put(`${P.doctor}/slots/${id}/cancel`),
  appointments: () => get(`${P.doctor}/appointments`),
  createAppointment: (body) => post(`${P.doctor}/appointments`, body),
};

export const pharmacistApi = {
  dashboard: () => get(`${P.pharmacist}/dashboard`),
  medicines: () => get(`${P.pharmacist}/medicines`),
  createMedicine: (body) => post(`${P.pharmacist}/medicines`, body),
  deleteMedicine: (id) => del(`${P.pharmacist}/medicines/${id}`),
  lowStock: () => get(`${P.pharmacist}/medicines/low-stock`),
  topWeek: () => get(`${P.pharmacist}/sales/top-week`),
  adjustStock: (id, body) => patch(`${P.pharmacist}/medicines/${id}/stock`, body),
  recordSale: (id, body) => post(`${P.pharmacist}/medicines/${id}/sales`, body),
};
