# CampusAI – Your Smart Campus Companion

CampusAI is an intelligent, full-stack campus assistant platform designed to enhance student productivity, provide access to mental wellness, manage schedules, and even chat with an AI counselor – all in one place.

Built with modern web technologies and powered by OpenAI, CampusAI makes it easy for students to track attendance, book appointments, access resources, register for events, and get AI-guided support.

---

## Features

### 1. **Personal Dashboard**
- Daily greeting and upcoming class view
- Smart attendance insights
- Class schedule for the week

### 2. **Attendance Tracker**
- Mark today’s attendance
- View attendance percentage over time

### 3. **Event Registration**
- Browse upcoming campus events
- Register with one click
- Personalized event recommendations

### 4. **Counseling Appointments**
- View available counselors and time slots
- Book 1-on-1 sessions instantly

### 5. **Study Resources**
- Filter notes, PDFs, guides by category or search
- Download materials uploaded by faculty

### 6. **AI-Powered Chat**
- Chat with an OpenAI-backed assistant
- Get answers to campus questions
- Available 24/7 to support students

---

## Tech Stack

### Frontend
- React + TypeScript (Vite)
- Tailwind CSS + shadcn/ui
- Wouter (router), React Query (API handling)
- Framer Motion (animations)

### Backend
- Node.js + Express (TypeScript)
- Passport.js (authentication)
- Drizzle ORM + Neon PostgreSQL
- OpenAI GPT-4o API integration

### Other Tools
- Zod (data validation)
- dotenv, session-based auth
- Vite Dev Server (hot reload)

---

## Folder Structure

- /client → React frontend
- /server → Express backend + routes + OpenAI logic
- /shared → DB schema and Zod validation
- .env → Secrets for DB, OpenAI, sessions
- vite.config.ts / drizzle.config.ts → tooling config


---

## Setup Instructions

```bash
npm install
npm run dev
```