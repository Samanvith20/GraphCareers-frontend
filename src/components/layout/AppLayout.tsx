import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  LayoutDashboard,
  Briefcase,
  User,
  Menu,
  X,
  TrendingUp,
  MessageSquare,
  ChartNoAxesColumnDecreasing,
  Bell,
  Search,
  Users,
  Coins,
  Sparkles,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { logoutUser } from "@/lib/logout";
import { useGetReferrals } from "@/hooks/useReferrals";
import { useQueryClient } from "@tanstack/react-query";

// ─── Nav structure ────────────────────────────────────────────────────────────

const mainNavItems = [
  { label: "Jobs",          href: "/jobs",              icon: Briefcase },
  { label: "Resume Agent",  href: "/platform-optimize", icon: ChartNoAxesColumnDecreasing },
  { label: "Referrals",     href: "/referrals",         icon: Users },
  { label: "Tracker",       href: "/tracker",           icon: LayoutDashboard },
  // { label: "Career",        href: "/career",            icon: TrendingUp },
  { label: "Chat",          href: "/chat",              icon: MessageSquare },
];

const toolNavItems = [
  { label: "Profile", href: "/profile", icon: User },
];

// Auto-collapse sidebar on these routes
const AUTO_COLLAPSE_ROUTES = ["/chat"];

// ─── Sidebar NavItem ──────────────────────────────────────────────────────────

interface NavItemProps {
  label: string;
  href: string;
  icon: React.ElementType;
  active: boolean;
  collapsed: boolean;
  onClick?: () => void;
}

const SidebarNavItem = ({ label, href, icon: Icon, active, collapsed, onClick }: NavItemProps) => (
  <Link
    to={href}
    onClick={onClick}
    title={collapsed ? label : undefined}
    className={cn(
      "group flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150",
      collapsed ? "justify-center px-2" : "",
      active
        ? "nav-active text-white bg-white/[0.08]"
        : "text-[#9ca3af] hover:text-white hover:bg-white/[0.04]"
    )}
  >
    <Icon className={cn(
      "shrink-0 transition-colors",
      collapsed ? "h-5 w-5" : "h-4 w-4",
      active ? "text-white" : "text-[#6b7280] group-hover:text-white"
    )} />
    {!collapsed && <span className="truncate">{label}</span>}
    {!collapsed && active && (
      <motion.div
        layoutId="sidebar-active-dot"
        className="ml-auto h-1.5 w-1.5 rounded-full bg-white"
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      />
    )}
  </Link>
);

// ─── Sidebar ──────────────────────────────────────────────────────────────────

interface SidebarProps {
  pathname: string;
  initials: string;
  userName: string;
  credits: number;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onClose?: () => void;
  onLogout: () => void;
}

const Sidebar = ({ pathname, initials, userName, credits, collapsed, onToggleCollapse, onClose, onLogout }: SidebarProps) => (
  <aside
    className={cn(
      "h-full flex flex-col bg-[#09090B] border-r border-white/[0.06] shrink-0 transition-all duration-300",
      collapsed ? "w-[64px]" : "w-[280px]"
    )}
  >
    {/* Logo + collapse toggle */}
    <div className={cn("flex items-center border-b border-white/[0.05]", collapsed ? "justify-center px-2 py-4" : "px-5 pt-6 pb-4 justify-between")}>
      {!collapsed && (
        <Link to="/jobs" onClick={onClose} className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-[#00D084]/10 border border-[#00D084]/20 flex items-center justify-center glow-sm shrink-0">
            <Zap className="h-4 w-4 text-[#00D084]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-bold text-white tracking-tight">GraphCareers</span>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">AI</span>
          </div>
        </Link>
      )}

      <button
        onClick={onToggleCollapse}
        className={cn(
          "p-1.5 rounded-lg text-[#6b7280] hover:text-white hover:bg-white/[0.05] transition-colors",
        )}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed
          ? <PanelLeftOpen className="h-4 w-4" />
          : <PanelLeftClose className="h-4 w-4" />
        }
      </button>
    </div>

    {/* Search — only when expanded */}
    {/* {!collapsed && (
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-[#6b7280] cursor-pointer hover:border-white/10 hover:bg-white/[0.06] transition-all">
          <Search className="h-3.5 w-3.5 shrink-0" />
          <span className="flex-1 text-[13px]">Search…</span>
          <kbd className="text-[10px] bg-white/[0.06] px-1.5 py-0.5 rounded font-mono text-[#6b7280]">⌘K</kbd>
        </div>
      </div>
    )} */}

    {/* Nav */}
    <div className={cn("flex-1 overflow-y-auto space-y-0.5 pb-2", collapsed ? "px-2 pt-3" : "px-3")}>
      {/* Main nav label */}
      {!collapsed && (
        <div className="mb-1 px-2 py-1">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[#4b5563]">Workspace</span>
        </div>
      )}
      {mainNavItems.map((item) => (
        <SidebarNavItem
          key={item.href}
          {...item}
          active={pathname === item.href}
          collapsed={collapsed}
          onClick={onClose}
        />
      ))}

      <div className={cn("border-t border-white/[0.05]", collapsed ? "my-2" : "my-3")} />

      {/* Tools label */}
      {!collapsed && (
        <div className="mb-1 px-2 py-1">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[#4b5563]">Account</span>
        </div>
      )}
      {toolNavItems.map((item) => (
        <SidebarNavItem
          key={item.href}
          {...item}
          active={pathname === item.href}
          collapsed={collapsed}
          onClick={onClose}
        />
      ))}
    </div>

    {/* Bottom user card */}
    <div className={cn("border-t border-white/[0.05]", collapsed ? "p-2" : "p-3")}>
      <div className={cn(
        "flex items-center rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer group",
        collapsed ? "justify-center p-2" : "gap-3 px-3 py-2.5"
      )}>
        <Avatar className="h-8 w-8 shrink-0 ring-1 ring-white/10">
          <AvatarFallback className="text-xs font-bold bg-white/10 text-white">{initials}</AvatarFallback>
        </Avatar>
        {!collapsed && (
          <>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <p className="text-sm font-medium text-white truncate">{userName || "User"}</p>
            </div>
            <button
              onClick={onLogout}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-[#6b7280] hover:text-white"
              title="Logout"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  </aside>
);

// ─── TopBar ───────────────────────────────────────────────────────────────────

interface TopBarProps {
  pageTitle: string;
  initials: string;
  credits: number;
  contactCredits: number;
  onMobileMenuOpen: () => void;
}

const TopBar = ({ pageTitle, initials, credits, contactCredits, onMobileMenuOpen }: TopBarProps) => (
  <header className="h-16 shrink-0 border-b border-white/[0.06] bg-[#09090B]/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-30">
    {/* Left */}
    <div className="flex items-center gap-3">
      <button
        className="lg:hidden p-1.5 rounded-lg text-[#6b7280] hover:text-white hover:bg-white/[0.04] transition-colors"
        onClick={onMobileMenuOpen}
      >
        <Menu className="h-5 w-5" />
      </button>
      <span className="text-white font-semibold text-[15px]">{pageTitle}</span>
    </div>

    {/* Right */}
    <div className="flex items-center gap-2">
      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/[0.08] border border-blue-500/15 text-blue-400 text-xs font-medium shadow-sm">
        <Users className="h-3.5 w-3.5" />
        {contactCredits} Referral credits
      </div>

      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/[0.08] border border-indigo-500/15 text-indigo-400 text-xs font-medium shadow-sm">
        <Sparkles className="h-3.5 w-3.5" />
        {credits} AI credits
      </div>

      <Link to="/profile">
        <Avatar className="h-8 w-8 cursor-pointer ring-1 ring-white/10 hover:ring-white/30 transition-all">
          <AvatarFallback className="text-xs font-bold bg-white/10 text-white">{initials}</AvatarFallback>
        </Avatar>
      </Link>
    </div>
  </header>
);

// ─── Route → page title ───────────────────────────────────────────────────────

const pageTitles: Record<string, string> = {
  "/jobs":              "Jobs For You",
  "/platform-optimize": "AI Resume Agent",
  "/referrals":         "Referrals",
  "/tracker":           "Job Tracker",
  "/career":            "Career Roadmap",
  "/chat":              "AI Career Coach",
  "/profile":           "Profile",
};

// ─── AppLayout ────────────────────────────────────────────────────────────────

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [collapsed,   setCollapsed]   = useState(false);
  const { pathname }  = useLocation();
  const navigate      = useNavigate();
  const { data: auth, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  const { data: dashboardData } = useGetReferrals();

  // Auto-collapse sidebar when navigating to chat or other specified routes
  useEffect(() => {
    if (AUTO_COLLAPSE_ROUTES.includes(pathname)) {
      setCollapsed(true);
    }
  }, [pathname]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090B]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-[#00D084]/10 border border-[#00D084]/20 flex items-center justify-center animate-pulse">
            <Sparkles className="h-4 w-4 text-[#00D084]" />
          </div>
          <p className="text-sm text-[#6b7280]">Loading workspace…</p>
        </div>
      </div>
    );
  }

  const initials =
    auth?.user?.name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "U";

  const userName  = auth?.user?.name ?? "";
  const credits   = profile?.credits ?? 0;
  const contactCredits = dashboardData?.credits?.remaining ?? 0;
  const pageTitle = pageTitles[pathname] ?? "Dashboard";
  const sidebarWidth = collapsed ? 64 : 280;

  const handleLogout = async () => {
    try {
      await logoutUser();
      await queryClient.cancelQueries();
      queryClient.clear();
      navigate("/login");
    } catch {
      toast.error("Failed to logout. Try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] flex">
      {/* ── Desktop Sidebar ── */}
      <motion.div
        animate={{ width: sidebarWidth }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 overflow-hidden"
        style={{ width: sidebarWidth }}
      >
        <Sidebar
          pathname={pathname}
          initials={initials}
          userName={userName}
          credits={credits}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
          onLogout={handleLogout}
        />
      </motion.div>

      {/* ── Mobile Sidebar overlay ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-[280px] lg:hidden flex flex-col"
            >
              <Sidebar
                pathname={pathname}
                initials={initials}
                userName={userName}
                credits={credits}
                collapsed={false}
                onToggleCollapse={() => setMobileOpen(false)}
                onClose={() => setMobileOpen(false)}
                onLogout={handleLogout}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Main area ── */}
      {/* Dynamic style: margin only at lg+ so mobile content is full-width */}
      <style>{`
        @media (min-width: 1024px) {
          [data-main-content] {
            margin-left: ${sidebarWidth}px;
            transition: margin-left 250ms cubic-bezier(0.4, 0, 0.2, 1);
          }
        }
      `}</style>
      <div
        data-main-content
        className="flex flex-col min-w-0 flex-1"
      >
        <TopBar
          pageTitle={pageTitle}
          initials={initials}
          credits={credits}
          contactCredits={contactCredits}
          onMobileMenuOpen={() => setMobileOpen(true)}
        />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
