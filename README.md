# Smart Collaboration System - Frontend Client

A high-fidelity, premium Next.js dashboard client built for the **Smart Project & Task Collaboration System**. This application features modular role-based views (Admin, Project Manager, Team Member), dynamic task status pipelines, interactive charts, real-time alert toast alerts, and a fully polished light/dark mode engine.

---

## 🌐 Live Deployed Links

*   **Frontend Client:** [https://smart-collaborate-frontend.vercel.app](https://smart-collaborate-frontend.vercel.app)
*   **Backend API Server:** [https://smart-collaborate-server.vercel.app](https://smart-collaborate-server.vercel.app)

---

## 🔑 Demo Sandbox Credentials

For rapid assessment and testing of different user roles, use the **Quick Sandbox Login** buttons on the login screen or enter these credentials:
*   **Admin User:** `admin@smart.com` / `demo123Password` (Full CRUD operations across projects, tasks, member setup, activity feeds, and workloads)
*   **Project Manager:** `pm@smart.com` / `demo123Password` (Manage projects, assign and manage tasks, view workloads)
*   **Team Member:** `member@smart.com` / `demo123Password` (Personalized dashboard, update assigned tasks, chat comments, and uploads)

---

## 🚀 Implemented Features Checklist

### 1. Robust Authentication & RBAC
*   **Email & Password Authentication:** Handled via Redux state credentials.
*   **One-Click Demo Switcher:** Allows direct sign-in for testing.
*   **Role-Based Security:**
    *   *Admin* has unrestricted read/write/delete capabilities.
    *   *Project Manager* can manage assigned projects, invite members, and allocate tasks.
    *   *Team Members* are locked into their tasks and can only modify status for assigned work.

### 2. Task Management & Conflict Warnings
*   **Task CRUD:** Modals for creating and editing tasks with dynamic Priority and Due Date.
*   **Workload Collision Alerts:** Throws a non-blocking toast warning (`Warning: [User] is overloaded`) when a team member is assigned more than 3 active `IN_PROGRESS` tasks.
*   **Strict Validations:**
    *   Prevent duplicate task titles within the same project.
    *   Prevent assigning task due dates beyond the parent project's deadline.
    *   Prevent reassigning completed tasks.
    *   Prevent setting past dates as due dates.

### 3. Analytics & Productivity Insights
*   **Recharts Integration:** Visualizes task status distribution using interactive charts.
*   **Workspace KPI Summary:** Real-time counters showing Total Projects, Total Tasks, Completed Tasks, Pending Tasks, and Overdue Tasks.
*   **Progress Tracking:** Percentage-based progress bars for active projects.
*   **Upcoming Deadlines & Logs:** Instant listing of tasks due within 48 hours and a live activity feed.

### 4. Advanced Search, Sort, and Filter
*   **Live Search:** Search projects, tasks, and members instantly by typing names/titles.
*   **Multi-Criteria Filters:** Filter by Priority, Status, and Assignee.
*   **Multiple Sort Modes:** Sort tasks by due date, priority, creation date, and updated date.
*   **Clean Pagination:** Desktop-optimized page controllers aligned neatly at the bottom-right of tables.

### 5. Extra Productivity Features
*   **Task Comments & Mock Attachments:** Add comments and upload files (simulated progress indicators) inside task details drawers.
*   **Real-time Alerts:** A notification bell displaying counts of unread alerts with immediate read-marking.
*   **Dual Mode Engine:** Responsive, beautiful Dark/Light theme toggle.


## 🛠️ Tech Stack & Key Libraries

*   **Core Framework:** Next.js 15+ (App Router)
*   **State Management:** Redux Toolkit
*   **Data Fetching:** RTK Query (auto-caching and query hooks)
*   **UI Icons:** Lucide React
*   **Visualization:** Recharts
*   **Toasts:** Sonner
*   **Styling:** Tailwind CSS

---

## ⚙️ Local Setup Instructions

### Prerequisites
*   Node.js (v18 or higher)
*   npm or yarn

### 1. Install Dependencies
Run the install command inside the `frontend` folder:
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file inside the `frontend` root directory:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
```

### 3. Run Development Server
Start the Next.js development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) inside your web browser.
