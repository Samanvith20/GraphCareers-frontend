import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { apiPost } from "@/lib/api";
import { toast } from "sonner";
import { motion } from "framer-motion";
import GoogleSignInButton from "@/components/Googlelogin";
import { AuthCarousel } from "@/components/auth/AuthCarousel";
const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      toast.error("Please enter your email or username");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await apiPost("/auth/login", {
        email: username,
        password,
      });

      toast.success("Logged in successfully");
      navigate("/profile");
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex overflow-hidden bg-background">
      {/* Left Form Side */}
      <div className="w-full lg:w-1/2 h-full overflow-y-auto relative custom-scrollbar">
        <div className="min-h-full flex flex-col justify-center items-center p-8 sm:p-12 lg:p-24 py-16">
          <Link to="/" className="absolute top-6 left-6 sm:top-8 sm:left-8 text-lg font-bold tracking-tight text-foreground z-10">
            <span className="text-primary">Graph</span>Careers
          </Link>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-sm space-y-8"
          >
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome back</h1>
            <p className="text-muted-foreground">Sign in to continue to your career dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email or Username</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                  <Mail className="h-4 w-4" />
                </div>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="name@example.com"
                  className={cn("pl-10 h-11 bg-muted/50 border-border")}
                  aria-label="username"
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Password</label>
                <Link to="/forgot" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                  <Lock className="h-4 w-4" />
                </div>
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className={cn("pl-10 pr-10 h-11 bg-muted/50 border-border")}
                  aria-label="password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="hero" className="w-full h-11 text-base shadow-glow group" disabled={loading}>
              {loading ? "Signing in..." : (
                <>
                  Sign in <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </form>
            
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <GoogleSignInButton />

          <p className="text-center text-sm text-muted-foreground ">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline font-medium">
              Create one
            </Link>
          </p>
        </motion.div>
        </div>
      </div>

      {/* Right Marketing Side (Hidden on Mobile) */}
      <AuthCarousel />
    </div>
  );
};

export default LoginPage;