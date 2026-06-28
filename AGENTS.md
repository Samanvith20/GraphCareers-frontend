# GraphCareers — Frontend AGENTS.md

> **Single source of truth for AI coding agents.** Read this file completely before touching any code.

---

## 1. Project Overview

**GraphCareers** is a career-intelligence web application. It helps users:
- Discover AI-matched jobs tailored to their profile
- Track job applications through a Kanban-style board
- Visualize career progression paths
- Chat with an AI career assistant (streaming)
- Generate and optimize ATS-optimized resumes per job

This repository is the **React + TypeScript frontend only**. It is decoupled from the backend, which is a separate service not in this repo.

---

## 2. Architecture

### System Diagram

```
Browser (React SPA)
  │
  ├── React Router v6 (lazy-loaded pages)
  ├── TanStack React Query (server-state cache)
  ├── Framer Motion (animations)
  │
  └── HTTP / SSE ──► Backend API (VITE_BACKEND_URL)
                          │
                          ├── PostgreSQL  (users, applications, payments)
                          ├── Neo4j       (job graph, career paths, skill graph)
                          ├── Redis       (session cache, job match cache, rate limiting)
                          └── Docker      (containerised services)
```

### Frontend Layer Responsibilities

| Layer | Responsibility |
|---|---|
| `src/pages/` | Route components (one per page, lazy loaded) |
| `src/components/` | Shared/business UI (dialogs, guards, modals) |
| `src/components/ui/` | shadcn/ui primitives — DO NOT hand-edit |
| `src/hooks/` | All API calls + React Query wrappers |
| `src/lib/` | Pure utilities (`cn`, `apiPost`, `logout`, `normalizeSkill`) |
| `src/data/` | Static seed / sample data for dev |
| `src/test/` | Vitest + @testing-library setup |

### Backend Infrastructure (inferred from API contracts)

| Technology | Role |
|---|---|
| **PostgreSQL** | Users, job applications, payment records, credits |
| **Neo4j** | Job graph (nodes: Job, Skill, Company), career progression paths, skill relationships |
| **Redis** | Session store (HttpOnly cookie), matched-job cache (24 h TTL), rate limiting |
| **Docker** | Containerised backend services |

> The frontend does not connect to any of these directly. Everything goes through `VITE_BACKEND_URL`.

---

## 3. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | React | 18.3 |
| Language | TypeScript | 5 (strict) |
| Build | Vite (SWC plugin) | 5 |
| Routing | React Router | v6 |
| Server state | TanStack React Query | v5 |
| UI components | shadcn/ui (Radix UI primitives) | latest |
| Styling | Tailwind CSS v3 + CSS variables | 3.4 |
| CSS animations | tailwindcss-animate (keyframes: `float`, `pulse-glow`) | 1.0 |
| JS animations | Framer Motion | 12 |
| Charts | Recharts, react-d3-tree | — |
| Forms | React Hook Form + Zod | — |
| Auth | Cookie-based + Google OAuth (`@react-oauth/google`) | — |
| Payments | Razorpay (`useRazorpay` hook) | — |
| Notifications | Sonner toasts | 1.7 |
| Testing | Vitest + jsdom + @testing-library/react | — |
| Linting | ESLint 9 (flat config, react-hooks, react-refresh) | 9 |

---

## 4. Repository Structure

```
frontend/
├── src/
│   ├── App.tsx                      # Root: QueryClientProvider → TooltipProvider → BrowserRouter → Routes
│   ├── main.tsx                     # Entry point (mounts <App />)
│   ├── index.css                    # Tailwind base + CSS variable design tokens (dark mode)
│   │
│   ├── pages/                       # One file per route. Default export. Lazily imported in App.tsx.
│   │   ├── Index.tsx                # Landing page (public)
│   │   ├── JobsPage.tsx             # Job discovery + ATS score/optimize modals (protected)
│   │   ├── JobTrackerpage.tsx       # Kanban application tracker (protected)
│   │   ├── CareerProgression.tsx    # react-d3-tree career graph (protected)
│   │   ├── ChatPage.tsx             # Streaming AI chat (SSE / ReadableStream) (protected)
│   │   ├── ProfilePage.tsx          # Profile editor + resume upload + polling (protected)
│   │   ├── Pricingpage.tsx          # Razorpay-triggered pricing (public)
│   │   ├── loginpage.tsx            # Login (public-only)
│   │   ├── signuppage.tsx           # Signup (public-only)
│   │   ├── forgotPasswordpage.tsx   # Forgot password (public-only)
│   │   ├── Resetpassword.tsx        # Reset password (public-only)
│   │   ├── Privacy.tsx              # Privacy policy (public)
│   │   ├── Terms.tsx                # Terms of service (public)
│   │   ├── Contact.tsx              # Contact page (public)
│   │   ├── ErrorPage.tsx            # Generic error display
│   │   └── NotFound.tsx             # 404 catch-all
│   │
│   ├── components/
│   │   ├── landing/                 # Public marketing components
│   │   │   ├── Hero.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── Features.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   ├── FAQ.tsx
│   │   │   ├── CTA.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Pricing.tsx
│   │   ├── layout/
│   │   │   └── AppLayout.tsx        # Authenticated shell: sticky header + mobile hamburger nav
│   │   ├── resume/                  # ATS resume feature components
│   │   │   ├── ResumeScoreModal.tsx # Quick score popup (gauge + missing keywords + Fix CTA)
│   │   │   └── ResumeOptimizeModal.tsx # Full 3-step optimization drawer (900px wide)
│   │   ├── ui/                      # shadcn/ui primitives — DO NOT manually edit
│   │   ├── ProtectedRoute.tsx       # Redirects unauthenticated to /login
│   │   ├── publicRoute.tsx          # Redirects authenticated away from auth pages
│   │   ├── Googlelogin.tsx          # Google OAuth button
│   │   ├── EditJobDialog.tsx        # Dialog for editing a tracked job
│   │   ├── NavLink.tsx              # Styled router link
│   │   └── chat.tsx                 # Chat message list UI
│   │
│   ├── hooks/                       # One hook per concern
│   │   ├── useAuth.tsx              # GET /api/auth/me → session check (retry:false, staleTime:5m)
│   │   ├── useProfile.tsx           # GET /api/user → profile + resume + skills (staleTime:30m, optional polling)
│   │   ├── useUpdateProfile.tsx     # PATCH /api/user → profile mutation + cache invalidation
│   │   ├── useUploadResume.tsx      # POST /api/user/resume-upload (FormData) + cache invalidation
│   │   ├── useMatchedJobs.tsx       # GET /api/jobs → matched jobs (staleTime:24h)
│   │   ├── useUserjobapplications.tsx # GET /api/job-applications → user's tracker list
│   │   ├── useUpdateJobStatus.tsx   # POST /api/job-applications → upsert status + invalidate
│   │   ├── useCareerProgression.tsx # Career graph data
│   │   ├── useChat.tsx              # POST /api/ai/chat → ReadableStream SSE parser
│   │   ├── useGoogleLogin.tsx       # Google OAuth credential → backend verify
│   │   ├── useRazorpay.tsx          # POST /api/payments/create-order → Razorpay checkout → POST /api/payments/verify
│   │   ├── use-mobile.tsx           # Responsive breakpoint hook
│   │   └── use-toast.tsx            # Toast notification hook (Sonner wrapper)
│   │
│   ├── data/
│   │   ├── careerData.tsx           # Static career graph seed data
│   │   └── sampleData.js            # Sample jobs/profile for dev testing
│   │
│   ├── lib/
│   │   ├── utils.ts                 # cn() (clsx + tailwind-merge), normalizeSkill()
│   │   ├── api.ts                   # apiPost<T>(path, body) — typed fetch helper (credentials:include)
│   │   └── logout.ts                # logoutUser() — POST /api/auth/logout
│   │
│   ├── assets/                      # Static images, SVGs
│   └── test/
│       ├── setup.ts                 # Vitest + @testing-library/jest-dom setup
│       └── example.test.ts          # Vitest example
│
├── public/                          # Static public assets (favicon, etc.)
├── .env                             # Environment variables (gitignored — see §6)
├── components.json                  # shadcn/ui CLI config
├── tailwind.config.ts               # Design tokens (fonts, colors, radii, keyframes)
├── vite.config.ts                   # Vite: port 8080, @ alias → src/
├── vitest.config.ts                 # Vitest: jsdom, globals, setupFiles, @ alias
├── tsconfig.json                    # Project references
├── tsconfig.app.json                # App TS config (strict: true)
├── tsconfig.node.json               # Node TS config (Vite / Vitest tooling)
├── eslint.config.js                 # ESLint flat config (react-hooks, react-refresh)
├── postcss.config.js                # PostCSS with autoprefixer
└── vercel.json                      # Vercel SPA fallback config
```

---

## 5. Routes

| Path | Component | Access | Notes |
|---|---|---|---|
| `/` | `Index` | Public | Landing page |
| `/jobs` | `JobsPage` | 🔒 Protected | Job cards + ATS score/optimize modals |
| `/tracker` | `JobTrackerPage` | 🔒 Protected | Kanban + edit dialog |
| `/career` | `CareerProgressionPage` | 🔒 Protected | react-d3-tree graph |
| `/chat` | `ChatPage` | 🔒 Protected | Streaming SSE chat |
| `/profile` | `ProfilePage` | 🔒 Protected | Profile editor + resume upload |
| `/pricing` | `PricingPage` | Public | Razorpay payment trigger |
| `/login` | `LoginPage` | Public-only | Redirects authed users away |
| `/signup` | `SignupPage` | Public-only | Redirects authed users away |
| `/forgot` | `ForgotPasswordPage` | Public-only | |
| `/reset-password` | `ResetPasswordPage` | Public-only | |
| `/privacy` | `Privacy` | Public | |
| `/terms` | `Terms` | Public | |
| `/contact` | `Contact` | Public | |
| `*` | `NotFound` | Public | 404 catch-all |

**`ProtectedRoute`** — calls `useAuth`, shows a spinner while loading, redirects to `/login` on error.  
**`PublicRoute`** — redirects authenticated users to `/jobs` (or the guarded target).  
All pages use `React.lazy()` + `Suspense` for code splitting.

---

## 6. Environment Variables

Create `.env` at the repo root (gitignored). All vars must be prefixed `VITE_`.

```env
VITE_BACKEND_URL=http://localhost:4000       # Backend API base URL — NEVER hard-code localhost:4000 in code
VITE_RAZORPAY_KEY_ID=rzp_test_...           # Razorpay publishable key
VITE_GOOGLE_CLIENT_ID=...apps.googleusercontent.com  # Google OAuth client ID
VITE_SENTRY_DSN=https://...                 # Sentry DSN for production error tracking
```

---

## 7. Development Commands

```bash
npm install           # Install dependencies
npm run dev           # Start dev server → http://localhost:8080
npm run build         # Type-check + production build
npm run build:dev     # Build in development mode
npm run preview       # Preview production build locally
npm run lint          # ESLint
npm test              # Vitest (single run)
npm run test:watch    # Vitest (watch mode)
```

---

## 8. Coding Conventions

### 8.1 TypeScript

- **Strict mode** is on (`tsconfig.app.json`). All new code must be fully typed.
- Use the `@/` alias for all imports from `src/` (e.g., `@/components/ui/button`).
- Never use `any`. Use proper types or `unknown` with narrowing.
- Define local interfaces above the component/function that uses them.

### 8.2 Components

- Pages → `src/pages/`, one file per route, **default export**, lazily imported in `App.tsx`.
- Feature-domain components (dialogs, modals, route guards) → `src/components/`.
- Reusable domain sub-components (e.g., resume modals) → `src/components/<domain>/`.
- `src/components/ui/` — shadcn/ui primitives. **Do not hand-edit**; use the shadcn CLI.
- Wrap all authenticated pages in `<AppLayout>` for the sticky header/nav shell.

### 8.3 Hooks

- **One hook per concern** in `src/hooks/`.
- All API calls go through custom hooks — never call `fetch` directly in a component.
- Use `useQuery` for reads, `useMutation` for writes.
- Use `apiPost<T>(path, body)` from `src/lib/api.ts` where possible (handles `credentials: "include"`, JSON headers, error normalisation).
- The `useAuth` hook is the **single source of truth** for session state. Never duplicate auth logic.
- The `useChat` hook uses the Fetch Streaming API (`ReadableStream`) to handle SSE-style token streaming.

### 8.4 Styling

- Use **Tailwind CSS utility classes** for all layout, spacing, and colour.
- Design tokens (colors, radii, fonts) are defined as CSS custom properties in `src/index.css` and consumed via `tailwind.config.ts`.
- Conditional class names: use `cn()` from `src/lib/utils.ts`.
- Dark mode is **class-based** (`darkMode: ["class"]`). Never hard-code light-mode-only colours.
- Animations: **Framer Motion** for page/component transitions; **`tailwindcss-animate`** for CSS-only micro-animations.
- Fonts: `Inter` (sans), `JetBrains Mono` (mono).

### 8.5 State Management

- **No global state library.** State lives in:
  - React Query cache → server / async data
  - Local `useState` / `useReducer` → UI state
- React Query defaults: `staleTime: 5min`, `refetchOnWindowFocus: false`, `retry: 1`.

### 8.6 Forms

- **React Hook Form + Zod** for all user-input forms.
- Define the Zod schema first, then wire with `@hookform/resolvers/zod`.

### 8.7 Logging

- Use `console.error` for errors caught in catch blocks (SSE errors, fetch failures).
- Use `console.warn` for expected but notable conditions (e.g., cache miss).
- Do **not** leave `console.log` calls in committed code — comment them out or remove them (existing commented-out logs are acceptable).
- Production errors are tracked via **Sentry** (`VITE_SENTRY_DSN`).

### 8.8 Error Handling

- API hook errors surface via React Query's `isError` state.
- Show user-facing errors via **Sonner** toasts (`import { toast } from "sonner"`).
- Modals that fail to load data should call `onClose()` and show a toast (see `ResumeScoreModal` pattern).

### 8.9 Testing

- Test files: `src/**/*.{test,spec}.{ts,tsx}` — picked up automatically by Vitest.
- Test environment: `jsdom`. Setup file: `src/test/setup.ts`.
- Use `@testing-library/react` for component tests.
- Mock `fetch` and `import.meta.env.VITE_BACKEND_URL` in tests.

---

## 9. Existing API Contracts (inferred from frontend hooks)

| Method | Endpoint | Hook | Purpose |
|---|---|---|---|
| GET | `/api/auth/me` | `useAuth` | Session check |
| GET | `/api/user` | `useProfile` | Full profile + resume status |
| PATCH | `/api/user` | `useUpdateProfile` | Update profile fields |
| POST | `/api/user/resume-upload` | `useUploadResume` | Upload resume (FormData) |
| GET | `/api/jobs` | `useMatchedJobs` | AI-matched jobs (Neo4j graph query) |
| GET | `/api/job-applications` | `useUserjobapplications` | User's tracked applications |
| POST | `/api/job-applications` | `useUpsertJobStatus` | Upsert application status |
| POST | `/api/resume/analyze/:jobSourceId` | `ResumeScoreModal`, `ResumeOptimizeModal` | ATS score analysis |
| POST | `/api/resume/optimize/:jobSourceId` | `ResumeOptimizeModal` | AI resume optimization (costs 1 credit) |
| POST | `/api/ai/chat` | `useChat` | Streaming AI chat (ReadableStream) |
| POST | `/api/payments/create-order` | `useRazorpay` | Create Razorpay order |
| POST | `/api/payments/verify` | `useRazorpay` | Verify payment |
| POST | `/api/auth/logout` | `logoutUser()` in `src/lib/logout.ts` | Logout |

### AI Chat Stream Protocol

The `/api/ai/chat` endpoint streams line-prefixed tokens:

| Prefix | Meaning | Action |
|---|---|---|
| `0:` | Text token | `JSON.parse` the raw value and append to last assistant message |
| `9:` | Tool call start | Show tool status label (e.g., "Fetching your profile…") |
| `a:` | Tool result | Clear tool status |
| `d:` | Stream finished | Clear status, set `streaming = false` |
| `3:` | Server error | Log error, surface via toast |

### Resume Data Shape (from `ResumeOptimizeModal`)

```ts
interface OptimizedResume {
  contact:           { name; email; phone; location; linkedin; github };
  summary:           string;
  experience:        { company; title; startDate; endDate; location; bullets: string[] }[];
  projects:          { name; url; date; bullets: string[] }[];
  skills:            Record<string, string[]>;   // category → skill list
  education:         { institution; degree; field; startDate; endDate; gpa; location }[];
  certifications:    string[];
  optimizationNotes: string[];
}

interface OptimizeResult {
  scoreBefore:       number;   // 0–100
  scoreAfter:        number;
  optimizedResume:   OptimizedResume;
  keywordsAdded:     string[];
  optimizationNotes: string[];
}
```

---

## 10. Architecture Notes

- The backend is a **separate service** (not in this repo). All calls go to `VITE_BACKEND_URL`.
- Auth is **cookie-based** (HttpOnly session cookie). The frontend never stores tokens in `localStorage` or `sessionStorage`.
- Google OAuth: handled client-side via `@react-oauth/google`; the credential is sent to the backend for server-side verification.
- Payments: the backend creates a Razorpay order; the frontend opens Razorpay checkout; the frontend POSTs the response to `/api/payments/verify`.
- AI chat: streaming via Fetch `ReadableStream`. Lines are buffered and parsed character by character.
- Resume upload: `FormData` POST. After upload the profile query is polled (`refetchInterval: 2000`) until `userData.resume.status === "completed"`.
- Credits system: users have a `credits` counter (visible in `ProfilePage` stats). Optimizing a resume costs 1 credit.

---

## 11. Things to Avoid

| Rule |
|---|
| Do **not** commit `.env` — it is gitignored |
| Do **not** hard-code `localhost:4000` — always use `import.meta.env.VITE_BACKEND_URL` |
| Do **not** call `fetch` directly in components — always use a hook |
| Do **not** import from `node_modules` paths — use the `@/` alias |
| Do **not** manually edit `src/components/ui/` — use the shadcn CLI |
| Do **not** add global state libraries (Redux, Zustand, etc.) without discussion |
| Do **not** break lazy loading — new pages must use `React.lazy()` with a default export |
| Do **not** modify unrelated modules when implementing a feature |
| Do **not** leave uncommented `console.log` calls in committed code |
| Do **not** invent backend endpoints — only use or extend documented ones |

---

## 12. Review Checklist

Before opening a PR, verify:

- [ ] All new code is strictly typed (no `any`, no implicit `any`)
- [ ] New API calls are wrapped in a custom hook in `src/hooks/`
- [ ] `fetch` calls use `credentials: "include"` and `VITE_BACKEND_URL`
- [ ] Errors are surfaced via Sonner toast AND caught in React Query `isError`
- [ ] `console.log` calls are removed or commented out
- [ ] New pages are added to `App.tsx` using `React.lazy()` + `Suspense`
- [ ] New pages are wrapped in `<AppLayout>` if they require the nav
- [ ] Tailwind classes use design-token-based colours (not raw hex/rgb)
- [ ] `cn()` is used for conditional class names
- [ ] Dark mode is respected (no light-mode-only hard-coded colours)
- [ ] Form inputs use React Hook Form + Zod schema validation
- [ ] No new global state libraries introduced
- [ ] `src/components/ui/` not manually modified
- [ ] Test file added for any new hook or complex component (`src/**/*.test.tsx`)
- [ ] `.env` is not committed
- [ ] `VITE_BACKEND_URL` used (not `localhost:4000`)
