import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner"; 
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { apiPost } from "@/lib/api";
import GoogleSignInButton from "@/components/Googlelogin";
import { AuthCarousel } from "@/components/auth/AuthCarousel";
const SignupPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const isEmail = (s: string) => /^\S+@\S+\.\S+$/.test(s);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!isEmail(email)) {
      toast.error("Please enter a valid email");
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

    setLoading(true);
    try {
      await apiPost("/auth/signup", {
        name,
        email,
        password,
      });

      toast.success("Account created successfully");
      navigate("/login");
    } catch (err: any) {
      toast.error(err.message || "Signup failed");
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
            <h1 className="text-3xl font-bold tracking-tight mb-2">Create an account</h1>
            <p className="text-muted-foreground">Sign up to start using GraphCareers</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Full name</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                  <User className="h-4 w-4" />
                </div>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className={cn("pl-10 h-11 bg-muted/50 border-border")}
                  aria-label="name"
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                  <Mail className="h-4 w-4" />
                </div>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className={cn("pl-10 h-11 bg-muted/50 border-border")}
                  aria-label="email"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                  <Lock className="h-4 w-4" />
                </div>
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  className={cn("pl-10 pr-10 h-11 bg-muted/50 border-border")}
                  aria-label="password"
                  autoComplete="new-password"
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

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Confirm password</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                  <Lock className="h-4 w-4" />
                </div>
                <Input
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  className={cn("pl-10 pr-10 h-11 bg-muted/50 border-border")}
                  aria-label="confirm-password"
                  autoComplete="new-password"
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

            <div className="pt-2">
              <Button type="submit" variant="hero" className="w-full h-11 text-base shadow-glow group" disabled={loading}>
                {loading ? "Creating account..." : (
                  <>
                    Create account <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </div>
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
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
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

export default SignupPage;
