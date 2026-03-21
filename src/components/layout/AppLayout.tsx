import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, LayoutDashboard, Briefcase, User, Home, Menu, X, TrendingUp, MessageSquare, ChartNoAxesColumnDecreasing } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { useAuth } from "@/hooks/useAuth";

const navItems = [
 { label: "Jobs", href: "/jobs", icon: Zap },
  { label: "Tracker", href: "/tracker", icon: LayoutDashboard },
  { label: "Career", href: "/career", icon: TrendingUp },
  { label: "Chat", href: "/chat", icon: MessageSquare },
  { label: "Pricing", href: "/pricing", icon: User },
];

const AppLayout = ({ children }) => {
    const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const{data,isLoading}=useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
          <p className="text-sm text-muted-foreground">
            Checking your session…
          </p>
        </div>
      </div>
    );
  }

 const initials =
  data?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "U";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top nav */}
      <motion.header
        className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Logo */}
         <Link to="/" className="text-lg font-bold tracking-tight text-foreground">
          <span className="text-primary">Graph</span>Careers
        </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-1">
            {navItems.map(({ label, href, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  to={href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <Link to="/" className="hidden sm:flex">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground">
                <Home className="h-3.5 w-3.5" />
                Landing
              </Button>
            </Link>
            <Link to="/profile">
              <Avatar className="h-8 w-8 border border-border cursor-pointer hover:border-primary/50 transition-colors">
                <AvatarFallback className="text-xs font-bold bg-primary/20 text-primary">{initials}</AvatarFallback>
              </Avatar>
            </Link>
            {/* Mobile hamburger */}
            <button
              className="sm:hidden p-1.5 rounded-md text-muted-foreground hover:text-foreground"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="sm:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl px-4 pb-4 pt-2 space-y-1"
          >
            {navItems.map(({ label, href, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  to={href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </motion.div>
        )}
      </motion.header>

      {/* Page content */}
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default AppLayout;
