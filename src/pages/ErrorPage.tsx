import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const ErrorPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-grid opacity-10" />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-6 relative z-10 max-w-md"
      >
        <div className="h-20 w-20 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto">
          <AlertTriangle className="h-10 w-10 text-destructive" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            An unexpected error occurred while processing your request. Please try again or contact support if the issue persists.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-3.5 w-3.5" />
            Go Back
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => window.location.reload()}>
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </Button>
          <Button variant="hero" size="sm" className="gap-2" onClick={() => navigate("/")}>
            <Home className="h-3.5 w-3.5" />
            Home
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default ErrorPage;
