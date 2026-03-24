import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicRoute } from "./components/publicRoute";

// 🔥 Lazy loaded pages (code splitting)
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const JobTrackerPage = lazy(() => import("./pages/JobTrackerpage"));
const JobsPage = lazy(() => import("./pages/JobsPage"));
const LoginPage = lazy(() => import("./pages/loginpage"));
const SignupPage = lazy(() => import("./pages/signuppage"));
const ForgotPasswordPage = lazy(() => import("./pages/forgotPasswordpage"));
const CareerProgressionPage = lazy(() =>
  import("./pages/CareerProgression")
);
const ChatPage = lazy(() => import("./pages/ChatPage"));
const ResetPasswordPage = lazy(() =>
  import("./pages/Resetpassword")
);
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Contact = lazy(() => import("./pages/Contact"));
const PricingPage = lazy(() => import("./pages/Pricingpage"));

// 🔥 Optimized React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 mins (no refetch)
      cacheTime: 1000 * 60 * 10, // cache persists
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// 🔥 Better loading UI (UX + perceived performance)
const PageLoader = () => (
  <div className="flex items-center justify-center h-screen">
    <p className="text-gray-500 animate-pulse text-sm">
      Loading...
    </p>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster position="top-right" richColors />

      <BrowserRouter>
        {/* 🔥 Suspense enables lazy loading */}
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />

            <Route
              path="/jobs"
              element={
                <ProtectedRoute>
                  <JobsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/tracker"
              element={
                <ProtectedRoute>
                  <JobTrackerPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/career"
              element={
                <ProtectedRoute>
                  <CareerProgressionPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />

            <Route path="/pricing" element={<PricingPage />} />

            <Route
              path="/reset-password"
              element={
                <PublicRoute>
                  <ResetPasswordPage />
                </PublicRoute>
              }
            />

            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <SignupPage />
                </PublicRoute>
              }
            />

            <Route
              path="/forgot"
              element={
                <PublicRoute>
                  <ForgotPasswordPage />
                </PublicRoute>
              }
            />

            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/contact" element={<Contact />} />

            {/* Catch all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;