# Healthcare Management System

This is a comprehensive Healthcare Management System featuring Patient and Staff Portals, allowing users to book appointments, manage active queues, and track medical treatments.

## Prerequisites

Before starting, ensure you have the following installed on your machine:
- **Node.js** (v18.0.0 or higher) and **npm**
- **Python** (v3.10 or higher)

## How to Start the Application

The application consists of two separate parts: the **Frontend** (React + Vite) and the **Backend** (FastAPI + SQLModel). You need to open **two separate terminal windows** to run both servers simultaneously.

### 1. Start the Backend Server
First, initialize and start the API backend. It will automatically generate an SQLite database (`database.db`) and seed some default accounts.

1. Open your terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. **Create and Activate a Virtual Environment (Highly Recommended):**
   - **On macOS/Linux:**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```
   - **On Windows:**
     ```bash
     python -m venv venv
     .\venv\Scripts\activate
     ```
3. Install the Python dependencies:
   ```bash
   pip install "fastapi[standard]" sqlmodel passlib[bcrypt] python-jose[cryptography] python-multipart
   ```
4. Run the backend development server:
   ```bash
   fastapi dev main.py
   ```
   > The backend will now be running at `http://localhost:8000`.

### 2. Start the Frontend Server
While the backend is running, open a **new terminal window** to start the frontend application.

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install the Node modules:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   > The frontend will typically start at `http://localhost:5173`. Open this URL in your browser to view the application!

---

## Default Accounts for Testing

When the backend starts for the first time, it automatically creates several accounts for you to test the different role-based views.

**Staff Accounts:**
- **Nurse:** `admin_nurse@example.com` / `password123`
- **Doctor:** `admin_doctor@example.com` / `password123`

**Patient Accounts:**
- **Patient 1:** `1-2345-67890-12-3` / `password123`
- **Patient 2:** `9-8765-43210-99-9` / `password123`
- **Manual Enrollment:** `123456789` / (Password set during registration)

> You can also try creating a brand new patient by selecting **"Continue as Guest"** on the Book Appointment page and confirming your details. Then, sign in using your Citizen ID to see your brand new profile!
