# Smart Collaboration System - Frontend

A high-fidelity, premium Next.js dashboard built as the user-interface for the Smart Project & Task Collaboration System. It features role-based modular layouts, modern animations, real-time feedback toast systems, interactive graphs, and advanced task search, sorting, and filtering options.

---

## 🌐 Live Deployed Links

*   **Frontend Client:** [https://smart-collaborate-frontend.vercel.app](https://smart-collaborate-frontend.vercel.app)
*   **Backend API Server:** [https://smart-collaborate-server.vercel.app](https://smart-collaborate-server.vercel.app)

---

## 🛠️ Tech Stack & Dependencies

*   **Framework:** Next.js (App Router, Client-side React Hooks)
*   **State Management & Data Fetching:** Redux Toolkit & RTK Query
*   **Icons:** Lucide React
*   **Charts & Visualization:** Recharts
*   **Toasts & Alerts:** Sonner
*   **Animations:** Tailwind CSS transitions, keyframes, and custom utility classes
*   **Styling:** Vanilla Tailwind CSS with customizable Dark/Light mode theme engines

---

## ⚙️ Setup & Installation

### Prerequisites
*   Node.js (v18 or higher)
*   npm or yarn

### 1. Install Dependencies
Navigate into the `frontend` folder and install all necessary packages:
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file inside the `frontend` root directory:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
```

### 3. Run Development Server
Start the frontend hot-reloading development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) inside your web browser.

---

## 🎨 Design Features

*   **Modular Architecture:** Unified layouts for Admin, Project Managers, and Members with dedicated routes.
*   **Vibrant HSL Theme Palette:** Seamless dark and light themes that reflect professional SaaS standards.
*   **Smart Feedback Toasts:** Non-blocking warnings (such as user overload warning trigger) and errors are gracefully displayed to the user using Sonner.
*   **Demo Sandbox Selector:** Allows testers to choose an identity role and sign in with a single click.
 
---
 
## 🌐 Deployment
 
For comprehensive instructions on deploying both the backend and frontend to services like Render and Vercel, please refer to the primary repository's [README.md](../README.md#%F0%9F%8C%90-deployment-instructions).
