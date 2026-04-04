# 🏥 Aura Health Systems

> A centralized healthcare coordination platform that bridges the gap between patients and doctors — enabling seamless communication, unified medical records, smart medication tracking, and real-time collaboration.

![Aura Health Systems](https://img.shields.io/badge/Aura-Health%20Systems-006b5e?style=for-the-badge&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)

---

## 🎯 Problem Statement

Current healthcare systems suffer from:

1. **Fragmented Communication** — Calls, WhatsApp, no structured channel
2. **Scattered Medical Data** — Reports, prescriptions, history not unified
3. **No Continuity of Care** — Doctors lack patient history context
4. **Poor Follow-up Tracking** — Patients forget meds, no monitoring
5. **Lack of Proactive Care** — No reminders, no alerts, no intelligence

## ✨ Solution

Aura Health Systems directly addresses these issues with:

| Feature | Description |
|---------|-------------|
| 🗓️ Smart Scheduling | Book appointments, automated reminders |
| 📋 Unified Records | Medical records, prescriptions, consultation history in one place |
| 💊 Medication Tracker | Daily checklist with adherence scoring |
| 💬 Real-time Chat | Secure Socket.io messaging between patients and doctors |
| 🩺 Consultation Flow | Structured notes, diagnoses, and prescriptions |
| 📊 Proactive Alerts | Non-adherence detection and follow-up reminders |

---

## 🏗️ Architecture

```
┌──────────────────┐     ┌────────────────────┐     ┌─────────────┐
│   React + Vite   │────▶│  Node.js + Express │────▶│   MongoDB   │
│   (Frontend)     │     │    (REST API)       │     │  (Database) │
│   TailwindCSS    │     │   Socket.io         │     │             │
└──────────────────┘     └────────────────────┘     └─────────────┘
        │                         │
        └─── WebSocket ───────────┘
             (Real-time Chat)
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/aura-health-systems.git
cd aura-health-systems

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Configuration

Create `.env` files:

**Backend (`backend/.env`):**
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/healthcare_mvp
JWT_SECRET=your_secret_key_here
```

**Frontend (`frontend/.env`):**
```env
VITE_API_URL=http://localhost:5000
```

### Run

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 📁 Project Structure

```
aura-health-systems/
├── backend/
│   ├── controllers/       # Request handlers
│   │   ├── authController.js
│   │   └── clinicController.js
│   ├── middleware/         # Auth & RBAC middleware
│   ├── models/            # Mongoose schemas
│   │   ├── User.js
│   │   ├── Appointment.js
│   │   ├── MedicalRecord.js
│   │   ├── Prescription.js
│   │   ├── MedicationLog.js
│   │   ├── Message.js
│   │   └── Notification.js
│   ├── routes/            # API route definitions
│   └── server.js          # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/    # Layout, shared UI
│   │   ├── context/       # Auth context provider
│   │   ├── pages/         # All application pages
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── PatientDashboard.jsx
│   │   │   ├── DoctorDashboard.jsx
│   │   │   ├── Appointments.jsx
│   │   │   ├── Consultation.jsx
│   │   │   ├── MedicationTracker.jsx
│   │   │   └── Chat.jsx
│   │   └── services/      # API client
│   └── index.html
│
└── README.md
```

## 🔑 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login & get JWT |
| GET | `/api/auth/me` | ✅ | Get current user |
| GET | `/api/clinic/doctors` | ✅ | List all doctors |
| POST | `/api/clinic/appointments` | ✅ Patient | Book appointment |
| GET | `/api/clinic/appointments` | ✅ | Get appointments |
| POST | `/api/clinic/consultations` | ✅ Doctor | Submit consultation |
| GET | `/api/clinic/medications/schedule` | ✅ Patient | Get med schedule |
| POST | `/api/clinic/medications/log` | ✅ Patient | Log medication dose |

## 🛡️ Security

- **JWT Authentication** with 7-day token expiry
- **Role-Based Access Control** (Patient, Doctor)
- **Password Hashing** with bcryptjs
- **CORS** configured for cross-origin requests

## 👥 User Roles

### Patient
- Book appointments with doctors
- View medication schedule & track adherence
- Real-time chat with healthcare providers
- Access unified medical records

### Doctor
- View patient queue & appointment calendar
- Submit consultations with structured notes
- Prescribe medications with auto-generated schedules
- Chat with patients in real-time

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, TailwindCSS, React Router |
| Backend | Node.js, Express.js, Socket.io |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| Real-time | Socket.io (WebSocket) |
| Design | Material Symbols, Inter Font |

---

## 📄 License

MIT License — Built with ❤️ for better healthcare.
