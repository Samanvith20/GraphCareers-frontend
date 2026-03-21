import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ProfilePage from "./pages/ProfilePage";
import JobTrackerPage from "./pages/JobTrackerpage";
import JobsPage from "./pages/JobsPage";
import LoginPage from "./pages/loginpage";
import SignupPage from "./pages/signuppage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicRoute } from "./components/publicRoute";
import ForgotPasswordPage from "./pages/forgotPasswordpage";
import CareerProgressionPage from "./pages/CareerProgression";
import ChatPage from "./pages/ChatPage";
import ResetPasswordPage from "./pages/Resetpassword";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import PricingPage from "./pages/Pricingpage";
//import { FullPricingPage } from "./components/landing/Pricing";



const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster position="top-right" richColors />

      <BrowserRouter>
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
          <Route
            path="/pricing"
            element={
              
                <PricingPage />
            
            }
          />
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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
           <Route path="/privacy" element={<Privacy />} />
  <Route path="/terms" element={<Terms />} />
  <Route path="/contact" element={<Contact />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
