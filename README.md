# Smart Collaboration System - Frontend

A high-fidelity, premium Next.js dashboard built as the user-interface for the Smart Project & Task Collaboration System. It features role-based modular layouts, modern animations, real-time feedback toast systems, interactive graphs, and advanced task search, sorting, and filtering options.

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

## 📂 Folder Structure

```
frontend/
├── public/                 # Static assets and brand icons
├── src/
│   ├── app/                # Next.js App Router folders
│   │   ├── (auth)/         # Auth-related pages (Login, Register)
│   │   ├── (dashboard)/    # Role-based dashboards (Admin, Manager, Member)
│   │   │   ├── admin/
│   │   │   ├── manager/
│   │   │   ├── member/
│   │   │   └── _components/ # Shared layout components (e.g., Sidebars)
│   │   ├── dashboard/      # Centralized router-redirect controller
│   │   ├── globals.css     # Global styles and Tailwind imports
│   │   ├── layout.tsx      # Root app wrapper
│   │   └── page.tsx        # Home/Root redirect logic
│   │
│   ├── components/         # Shareable UI components (e.g., Modals, Dialogs)
│   │   ├── share/
│   │   └── ui/
│   │
│   └── lib/                # App services & configuration
│       ├── features/       # Redux slices (Auth slice)
│       ├── services/       # Split RTK Query services (authApi, projectApi, taskApi, dashboardApi)
│       ├── store.ts        # Redux store provider configuration
│       └── utils.ts        # CSS merging helper utilities
│
├── .env.local              # Local environment configuration variables
└── tailwind.config.ts      # Tailwind configuration and dark mode classes
```

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
