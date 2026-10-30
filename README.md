# BIT Student Health Center
**Patient Appointment Scheduling and Medication Stock Control System** - Frontend
Next.js 14 (App Router) + Tailwind CSS + react-icons + react-hot-toast. White and blue theme.

## Run it
```bash
npm install
npm run dev        # http://localhost:3000
```
Your backend must be running first (default `http://localhost:5000`).

## Connect to your backend
Edit `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```
The frontend expects the route files mounted like this in your Express `server.js`:
```js
app.use("/api/auth", authRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/pharmacist", pharmacistRoutes);
app.use("/api/hospital", hospitalRoutes);
app.use("/api/admin", adminRoutes);
```
If your mount paths differ, change them in `lib/api.js` (the only file that talks to the server).

CORS must be enabled on the backend: `npm i cors` then `app.use(require("cors")({ origin: "http://localhost:3000" }))`.

## Pages
| Role | Pages |
|------|-------|
| Public | `/` landing, `/login` (5 account types), `/register` (patients) |
| Patient | `/patient` book (hospital > doctor > date > slot), `/patient/appointments` |
| Doctor | `/doctor` create/cancel slots, `/doctor/appointments` list + book for a patient |
| Pharmacist | `/pharmacist` dashboard, `/pharmacist/medicines` add / sell / adjust / delete |
| Hospital | `/hospital` add doctors and pharmacists |
| Admin | `/admin` register hospitals |

Each role is protected: wrong role or expired token redirects to login with a toast.

## If something does not match your controllers
The controllers were not included in the upload, so request bodies were inferred from routes and models.
All of them live in `lib/api.js`: `book`, `bookForPatient`, `createSlot`, `adjustStock`, `recordSale`.
Tweak the body there if a controller expects different field names. Response shapes are read leniently
(array, or `{ doctors: [] }`, `{ slots: [] }`, etc.), and login reads `token` plus `user`/`role` from the response or the JWT.
