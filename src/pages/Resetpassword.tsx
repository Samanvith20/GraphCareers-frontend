import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, ArrowLeft, CheckCircle, EyeOff, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error("Invalid or missing reset token");
    }
  }, [token]);

  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        toast.error(data?.error || "Reset link is invalid or has expired");
        return;
      }

      setSuccess(true);
      toast.success("Password reset successfully!");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      toast.error("Network error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-grid opacity-10" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xl font-bold tracking-tight mb-2"
          >
            <span className="text-primary">Graph</span>Careers
          </Link>
          <p className="text-muted-foreground text-sm">Set a new password</p>
        </div>

        <Card className="glass-card shadow-2xl border-border/20">
          <CardContent className="pt-6 space-y-5">
            {success ? (
              <div className="text-center py-6 space-y-4">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">
                  Password updated
                </h3>
                <p className="text-sm text-muted-foreground">
                  Your password has been reset successfully. Redirecting to
                  login…
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    New Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type={passwordVisible ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 h-11 bg-muted/50 border-border"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                    >
                      {passwordVisible ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type={confirmPasswordVisible ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 h-11 bg-muted/50 border-border"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      onClick={() =>
                        setConfirmPasswordVisible(!confirmPasswordVisible)
                      }
                    >
                      {confirmPasswordVisible ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  className="w-full"
                  disabled={loading || !token}
                >
                  {loading ? "Updating password..." : "Reset Password"}
                </Button>
              </form>
            )}

            <p className="text-center text-sm text-muted-foreground">
              <Link
                to="/login"
                className="text-primary hover:underline font-medium inline-flex items-center gap-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to login
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
