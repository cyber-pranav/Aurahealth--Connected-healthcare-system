# 🏥 Aura Health Systems

> An AI-enhanced, intelligent healthcare coordination ecosystem replacing scattered WhatsApp channels and physical reports with a unified, proactive platform for Patients, Doctors, and Caregivers.

![Aura Health Systems](https://img.shields.io/badge/Aura-Health%20Systems-006b5e?style=for-the-badge&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)

---

## 🎯 Problem Statement

Current healthcare models (especially for chronic care or post-op recovery) suffer from:
1. **Fragmented Communication** — Patients text doctors on WhatsApp, mixing critical health data with casual chats.
2. **Scattered History** — Medical records, past prescriptions, and lab reports are physically scattered.
3. **No Proactive Tracking** — Doctors have no idea if a patient is actually taking their prescribed medication.
4. **Poor Care Continuity** — Caregivers (family members or nurses) are left out of the medical loop.

## ✨ Our Solution: The Aura Ecosystem

Aura Health Systems solves this by creating a highly structured, data-driven environment with role-based specialized dashboards.

### 🌟 Key Features
- **Video Consultations (WebRTC):** Seamless, 1-click encrypted peer-to-peer video calls between doctors and patients.
- **Smart Health Timeline:** A chronological, unified view of a patient’s entire health journey (prescriptions, diagnoses, events).
- **AI Analytics Dashboard:** 7-day adherence charting, dynamic medication metrics, and AI health warnings generated from pattern detection.
- **Actionable Care Plans:** Structured post-visit instructions with built-in checklist tracking.
- **Role-Based Workspaces:**
  - **Patients:** Track meds, join video calls, view timelines.
  - **Doctors:** Access patient population analytics, schedule video appointments, create care plans.
  - **Caregivers:** Linked to patients to monitor medication adherence and intervene when metrics decline.
- **Context-Aware Notifications:** "Smart Scanned" priority alerts (e.g., High Priority: Pending Medications).

---

### live link

https://aurahealth-connected-healthcare-sys.vercel.app/

### Prerequisites
- Node.js 18+
- npm or yarn

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/cyber-pranav/Aurahealth--Connected-healthcare-system.git
cd Aurahealth--Connected-healthcare-system

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Seeding the Clean Database
*Important: Do this before starting the backend server.*
```bash
cd backend
node seed.js
```
*(This ensures a pristine, fully-populated database with dummy doctors, patients, and caregivers).*

### 3. Run the Application

```bash
# In Terminal 1 (Backend)
cd backend
node server.js

# In Terminal 2 (Frontend)
cd frontend
npm run dev
```

Open `http://localhost:5173` in your web browser.

---

## 👥 Demo Logins

Use these accounts to test the different role-based views. **Password for all accounts is:** `Demo@1234`

| Role | Name | Email |
|------|------|-------|
| **Patient** | Arjun Kapoor | `arjun@test.com` |
| **Patient** | Meera Reddy | `meera@test.com` |
| **Doctor** | Dr. Priya Sharma | `priya@aurahealth.com` |
| **Caregiver** | Kavita (Wife of Arjun) | `kavita@test.com` |

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, TailwindCSS (Arbitrary Values & Custom Design System) |
| **Backend** | Node.js, Express.js |
| **Real-time** | Socket.io (Chat & WebRTC signaling) |
| **Video Calls** | WebRTC APIs (P2P Mesh) |
| **Database** | Custom JSON-File Mocking Engine (`fs` buffering) |
| **Auth** | JWT, bcryptjs |

---

## 📁 System Architecture Walkthrough

- **`frontend/src/pages/VideoConsultationRoom.jsx`**: Handles WebRTC RTCPeerConnection, ICE candidate exchange via Socket.io, and dual-video rendering.
- **`frontend/src/pages/AnalyticsDashboard.jsx`**: Generates circular SVG gauges and responsive adherence bar charts based on fetched health telemetry.
- **`backend/controllers/analyticsController.js`**: Analyzes the raw medication logs to synthesize AI warnings (e.g., detecting declining adherence trends over 3 days).
- **`backend/seed.js`**: Automatically rebuilds complex relational structures into `db.json` asynchronously.

## 📄 License

MIT License — Built with ❤️ to revolutionize patient care coordination.
