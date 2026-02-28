import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { apiPost } from "@/lib/api";
import { toast } from "sonner"; 


const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const valid = username.trim().length > 0 && password.length >= 6;

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
      email: username, // or username, depending on backend
      password,
    });

     toast.success("Logged in successfully");
    navigate("/profile");
  } catch (err) {
    toast.error(err.message || "Login failed");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="p-6 pt-8 text-center">
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Sign in to continue to GraphCareers</p>
        </CardHeader>

        <CardContent className="p-6 pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm font-medium text-muted-foreground">Username</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                <Mail className="h-4 w-4" />
              </div>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Email or username"
                className={cn("pl-10")}
                aria-label="username"
                autoComplete="username"
              />
            </div>

            <label className="block text-sm font-medium text-muted-foreground">Password</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                <Lock className="h-4 w-4" />
              </div>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className={cn("pl-10 pr-10")}
                aria-label="password"
                autoComplete="current-password"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="flex items-center justify-end">
              {/* <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-input bg-background"
                  aria-label="Remember me"
                />
                <span className="text-sm text-muted-foreground">Remember me</span>
              </label> */}

              <Link to="/forgot" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={ loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground mt-4">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline">
              Create one
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;