# Issue Tracker (MERN Stack)

A full-stack Issue Tracker application built using:

* **Frontend**: React (Vite) + TypeScript + Tailwind CSS
* **Backend**: Node.js + Express
* **Database**: MongoDB
* **Authentication**: JWT

---

## Features

* User Registration & Login (JWT Authentication)
* Create, Read, Update, Delete (CRUD) issues
* Per-user issue isolation (each user sees only their issues)
* Status management (Open, In Progress, Resolved, Closed)
* Priority & Severity tagging
* Search & Filter (Status + Priority)
* Pagination for large issue lists
* Export issues to **CSV** and **JSON**
* Toast notifications for user feedback
* Confirmation prompts for critical actions
* Clean UI using Tailwind CSS

---

## Prerequisites

Ensure the following are installed:

* Node.js (v18 or higher recommended)
* npm
* MongoDB (local installation OR MongoDB Atlas)

---

## Setup Instructions

### 1. Extract the ZIP

Unzip the project and open the root folder in your terminal.

---

## Backend Setup

### Step 1: Navigate to server

```
cd server
```

### Step 2: Install dependencies

```
npm install
```

### Step 3: Create `.env` file

Inside the `server` folder, create a file named:

```
.env
```

Add:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
```

Example (local MongoDB):

```
MONGO_URI=mongodb://127.0.0.1:27017/issue-tracker
JWT_SECRET=supersecret123
PORT=5000
```

---

### Step 4: Run backend

```
npm run dev
```

Expected output:

```
Connected to MongoDB
Server is running on port 5000
```

---

## Frontend Setup

### Step 1: Open a new terminal

```
cd client
```

### Step 2: Install dependencies

```
npm install
```

### Step 3: Run frontend

```
npm run dev
```

---

## Access the Application

Open:

```
http://localhost:5173
```

---

## Usage

1. Register a new account
2. Login
3. Create issues
4. Update status (Resolved / Closed)
5. Search and filter issues
6. Navigate using pagination
7. Export issues (CSV / JSON)

---

## API Endpoints

### Authentication

* `POST /api/auth/register`
* `POST /api/auth/login`

### Issues (Protected Routes)

* `GET /api/issues`
* `POST /api/issues`
* `PUT /api/issues/:id`
* `DELETE /api/issues/:id`

---

## Design Decisions

* Each issue is linked to a specific user (data isolation)
* Pagination improves performance for large datasets
* Debounced search improves responsiveness
* Toast notifications enhance user experience

---

## Notes

* Backend runs on: `http://localhost:5000`
* Frontend runs on: `http://localhost:5173`
