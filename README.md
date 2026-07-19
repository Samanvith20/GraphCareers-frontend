# GraphCareers Frontend 🚀

GraphCareers is a next-generation career-intelligence web application. It empowers users to discover AI-matched jobs tailored to their profiles, track their job applications on a visual Kanban board, explore their potential career progression through interactive graphs, and generate ATS-optimized resumes.

This repository contains the **React + TypeScript frontend** of the application. The backend services (PostgreSQL, Neo4j, Redis, etc.) are managed in a separate repository.

---

## ✨ Key Features

*   **🎯 AI-Matched Job Discovery**: Get personalized job recommendations powered by advanced AI and graph data structures (Neo4j).
*   **📊 Application Tracker**: A sleek, Kanban-style board to track every stage of your job applications.
*   **📈 Career Progression Visualizer**: Explore potential career paths and required skills via interactive `react-d3-tree` graphs.
*   **🤖 AI Career Assistant**: Chat with an AI assistant in real-time (implemented via streaming SSE) for career advice.
*   **📄 Resume Optimization**: Generate and fine-tune ATS-optimized resumes specific to the jobs you want, utilizing a dedicated credit system.
*   **💳 Secure Payments**: Integrated with Razorpay for a seamless credit purchasing experience.

---

## 🛠️ Tech Stack

*   **Core**: React 18, TypeScript 5 (Strict Mode), Vite 5
*   **Routing**: React Router v6 (with lazy-loaded routes)
*   **State Management & Data Fetching**: TanStack React Query v5
*   **Styling**: Tailwind CSS v3, CSS Variables (Dark mode supported)
*   **UI Components**: shadcn/ui (Radix UI primitives)
*   **Animations**: Framer Motion, tailwindcss-animate
*   **Data Visualization**: Recharts, react-d3-tree
*   **Forms & Validation**: React Hook Form, Zod
*   **Authentication**: Google OAuth (`@react-oauth/google`) + HttpOnly Cookie sessions
*   **Testing**: Vitest, @testing-library/react, jsdom

---

## 🚀 Getting Started

### Prerequisites

*   **Node.js**: v18 or newer is recommended.
*   **npm**: Installed by default with Node.js.

### 1. Installation

Clone this repository and install the dependencies:

```bash
git clone <repository-url>
cd frontend
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory (this file is ignored by Git). You will need to define the following variables:

```env
VITE_BACKEND_URL=http://localhost:4000       # Your backend API base URL
VITE_RAZORPAY_KEY_ID=your_razorpay_key       # Razorpay publishable key
VITE_GOOGLE_CLIENT_ID=your_google_client_id  # Google OAuth client ID
VITE_SENTRY_DSN=your_sentry_dsn              # Sentry DSN for error tracking
```
*(Note: Never commit your `.env` file to version control.)*

### 3. Run Development Server

Start the local Vite development server:

```bash
npm run dev
```

The application will be accessible at `http://localhost:8080` (or whichever port Vite assigns).

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the development server with HMR. |
| `npm run build` | Type-checks the codebase and creates a production build. |
| `npm run build:dev` | Creates a build in development mode for debugging. |
| `npm run preview` | Previews the production build locally. |
| `npm run lint` | Runs ESLint to identify code quality issues. |
| `npm test` | Runs the Vitest test suite once. |
| `npm run test:watch` | Runs Vitest in watch mode. |

---

## 🏗️ Project Structure

```
frontend/
├── public/                 # Static assets (favicon, etc.)
└── src/
    ├── assets/             # Images, SVGs, global static files
    ├── components/         # Shared domain UI elements (e.g., modals, layout, forms)
    │   └── ui/             # shadcn/ui primitives (DO NOT edit manually)
    ├── data/               # Static seed data & mocks for development
    ├── hooks/              # Custom React hooks (one per concern, mostly React Query)
    ├── lib/                # Pure utility functions (e.g., API fetch wrappers, `cn`)
    ├── pages/              # Route components (lazy-loaded in App.tsx)
    ├── test/               # Vitest setup & unit tests
    ├── App.tsx             # Root component routing & providers setup
    ├── main.tsx            # Application entry point
    └── index.css           # Global CSS, Tailwind base & design tokens
```

---

## 🤖 AI Agent Guidelines & Architecture Deep Dive

For an in-depth look at our frontend architecture, routing tables, API contracts, coding conventions, and **explicit rules for AI coding agents**, please carefully read the **[`AGENTS.md`](./AGENTS.md)** file. 

The `AGENTS.md` file serves as the **single source of truth** for anyone (human or AI) contributing to the codebase.
