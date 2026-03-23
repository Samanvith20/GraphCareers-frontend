import AppLayout from "@/components/layout/AppLayout";
import { useCareerProgression } from "@/hooks/useCareerProgression";
import Tree from "react-d3-tree";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState, useCallback } from "react";
import ErrorPage from "./ErrorPage";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Lock, Crown, ArrowRight, TrendingUp, Shuffle } from "lucide-react";
import { getUserAccessFromUser } from "@/lib/planUtils"; // or wherever you export this

// ─── Types ────────────────────────────────────────────────────────────────────

interface CareerRole {
  role: string;
  salary: string | null;
  companies: string[];
  matchedSkills: string[];
  missingSkills: string[];
}

interface ProgressionRole {
  role: string;
  skillsToLearn: string[];
  overlappingSkills: string[];
  companies: string[];
  salary: string | null;
}

interface LateralRole {
  role: string;
  overlapPercent: number;
  overlappingSkills: string[];
  skillsToLearn: string[];
  companies: string[];
  salary: string | null;
}

// ─── Tree builder ─────────────────────────────────────────────────────────────

function buildTree(roles: CareerRole[]) {
  if (!roles.length) return null;
  const [root, ...rest] = roles;
  return {
    name: root.role,
    attributes: { isRoot: "true" },
    children: rest.map((r) => ({
      name: r.role,
      attributes: { isRoot: "false" },
      children: [],
    })),
  };
}

// ─── Custom tree node ─────────────────────────────────────────────────────────

function CustomNode({ nodeDatum, selectedRole, onSelect, isMobile }: any) {
  const isRoot     = nodeDatum.attributes?.isRoot === "true";
  const isSelected = selectedRole === nodeDatum.name;
  const width  = isRoot ? (isMobile ? 180 : 220) : (isMobile ? 150 : 190);
  const height = isMobile ? 90 : isRoot ? 120 : 100;

  return (
    <foreignObject x={-width / 2} y={-height / 2} width={width} height={height}>
      <div
        style={{ pointerEvents: "auto" }}
        onClick={() => onSelect(nodeDatum.name)}
        className={`
          relative h-full w-full cursor-pointer rounded-xl border
          ${isSelected
            ? "border-primary bg-primary/10 ring-2 ring-primary/30"
            : "border-border bg-background/60 hover:border-primary/40"
          }
        `}
      >
        {isSelected && (
          <div className="pointer-events-none absolute inset-0 rounded-xl bg-glow-primary" />
        )}
        <div className="relative flex h-full flex-col justify-center px-4 text-center">
          {isRoot && (
            <span className="mx-auto mb-3 w-fit rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-primary">
              Best Match
            </span>
          )}
          <p className={`text-sm font-semibold leading-snug ${isSelected ? "text-primary" : "text-foreground"}`}>
            {nodeDatum.name}
          </p>
        </div>
      </div>
    </foreignObject>
  );
}

// ─── Locked skill teaser ──────────────────────────────────────────────────────

function LockedSkills({ label }: { label: string }) {
  return (
    <div className="relative mt-2">
      {/* Blurred fake pills */}
      <div className="flex flex-wrap gap-2 select-none pointer-events-none">
        {["skill one", "skill two", "skill three", "skill four"].map((s, i) => (
          <span
            key={i}
            className="rounded-full border border-amber-500/30 px-3 py-1 text-xs text-amber-400 blur-sm"
          >
            {s}
          </span>
        ))}
      </div>
      {/* Lock overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Link to="/pricing" className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-background px-3 py-1 text-xs font-medium text-primary hover:bg-primary/5 transition-colors">
          <Lock className="h-3 w-3" />
          Upgrade to see {label}
        </Link>
      </div>
    </div>
  );
}

// ─── Detail panel ─────────────────────────────────────────────────────────────

function DetailPanel({ role, isPro }: { role: CareerRole; isPro: boolean }) {
  return (
    <motion.div
      key={role.role}
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="relative h-full overflow-y-auto rounded-2xl border border-border bg-background/60 p-6"
    >
      <h2 className="text-lg font-bold">{role.role}</h2>

      {/* Salary — pro only */}
      <p className="mt-1 text-sm text-muted-foreground">
        {isPro && role.salary
          ? `${role.salary} · `
          : ""}
        {role.companies.length} companies hiring
      </p>

      <div className="mt-6 grid gap-6">
        {/* Skills you have — always visible */}
        <div>
          <p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-emerald-400">
            Skills you have
          </p>
          <div className="flex flex-wrap gap-2">
            {role.matchedSkills.length ? (
              role.matchedSkills.map((s) => (
                <span key={s} className="rounded-full border border-emerald-500/30 px-3 py-1 text-xs capitalize text-emerald-400">
                  {s}
                </span>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">None yet</span>
            )}
          </div>
        </div>

        {/* Skills to learn — gated */}
        <div>
          <p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-amber-400">
            Skills to learn
          </p>
          {isPro ? (
            <div className="flex flex-wrap gap-2">
              {role.missingSkills.length ? (
                role.missingSkills.map((s) => (
                  <span key={s} className="rounded-full border border-amber-500/30 px-3 py-1 text-xs capitalize text-amber-400">
                    {s}
                  </span>
                ))
              ) : (
                <span className="text-xs text-emerald-400">Fully qualified</span>
              )}
            </div>
          ) : (
            <LockedSkills label="skills to learn" />
          )}
        </div>
      </div>

      {/* Companies — always show first 3–4, pro shows all */}
      {role.companies.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 text-xs font-extrabold uppercase tracking-wide">
            Companies hiring
          </p>
          <div className="flex flex-wrap gap-2">
            {(isPro ? role.companies : role.companies.slice(0, 3)).map((c) => (
              <span key={c} className="rounded-full border border-border px-3 py-1 text-xs">
                {c}
              </span>
            ))}
            {!isPro && role.companies.length > 3 && (
              <Link to="/pricing">
                <span className="rounded-full border border-primary/30 px-3 py-1 text-xs text-primary cursor-pointer hover:bg-primary/5 transition-colors">
                  +{role.companies.length - 3} more
                </span>
              </Link>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─── Progression card (pro only) ─────────────────────────────────────────────

function ProgressionCard({ progression }: { progression: ProgressionRole }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-2xl border border-primary/20 bg-primary/5 p-5"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
          <TrendingUp className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Next step up</p>
          <p className="text-sm font-bold text-foreground">{progression.role}</p>
        </div>
        {progression.salary && (
          <span className="ml-auto text-xs text-muted-foreground">{progression.salary}</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-400 mb-1.5">
            You already know
          </p>
          <div className="flex flex-wrap gap-1.5">
            {progression.overlappingSkills.slice(0, 4).map((s) => (
              <span key={s} className="rounded-full border border-emerald-500/30 px-2 py-0.5 text-[11px] capitalize text-emerald-400">
                {s}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-400 mb-1.5">
            Learn next
          </p>
          <div className="flex flex-wrap gap-1.5">
            {progression.skillsToLearn.slice(0, 4).map((s) => (
              <span key={s} className="rounded-full border border-amber-500/30 px-2 py-0.5 text-[11px] capitalize text-amber-400">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Lateral switches (pro only) ─────────────────────────────────────────────

function LateralSwitchCards({ lateralSwitches }: { lateralSwitches: LateralRole[] }) {
  if (!lateralSwitches.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="h-7 w-7 rounded-lg bg-accent/10 flex items-center justify-center">
          <Shuffle className="h-4 w-4 text-accent" />
        </div>
        <p className="text-sm font-semibold text-foreground">Pivot opportunities</p>
        <span className="text-xs text-muted-foreground">roles you can switch into with your current skills</span>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        {lateralSwitches.map((r) => (
          <div key={r.role} className="rounded-xl border border-border bg-background/60 p-4">
            <div className="flex items-start justify-between gap-2 mb-3">
              <p className="text-sm font-semibold text-foreground leading-snug">{r.role}</p>
              <span className="shrink-0 rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent">
                {r.overlapPercent}% overlap
              </span>
            </div>

            <div className="space-y-2">
              <div>
                <p className="text-[10px] text-muted-foreground mb-1">Skills that transfer</p>
                <div className="flex flex-wrap gap-1">
                  {r.overlappingSkills.slice(0, 3).map((s) => (
                    <span key={s} className="rounded-full border border-emerald-500/30 px-2 py-0.5 text-[10px] capitalize text-emerald-400">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground mb-1">Learn to switch</p>
                <div className="flex flex-wrap gap-1">
                  {r.skillsToLearn.slice(0, 3).map((s) => (
                    <span key={s} className="rounded-full border border-amber-500/30 px-2 py-0.5 text-[10px] capitalize text-amber-400">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {r.salary && (
              <p className="mt-3 text-xs text-muted-foreground">{r.salary}</p>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Free upgrade nudge (shown below tree for free users) ────────────────────

function ProNudge() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-xl border border-primary/25 bg-primary/5 p-4 flex items-center justify-between gap-4"
    >
      <div className="flex items-center gap-3">
        <Crown className="h-5 w-5 text-primary shrink-0" />
        <div>
          <p className="text-sm font-semibold text-foreground">Unlock your full career roadmap</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            See salary data, demand-ranked skills to learn, next promotion path, and pivot opportunities
          </p>
        </div>
      </div>
      <Link to="/pricing" className="shrink-0">
        <Button variant="hero" size="sm" className="gap-1.5 whitespace-nowrap">
          Upgrade ₹99/mo <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </Link>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const CareerProgressionPage = () => {
  const { data, isLoading, isError } = useCareerProgression();

  const careerPath: CareerRole[]       = data?.careerPath      ?? [];
  const progression: ProgressionRole | null = data?.progression ?? null;
  const lateralSwitches: LateralRole[] = data?.lateralSwitches ?? [];
  const isPro: boolean                 = data?.isPro           ?? false;

  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const containerRef                    = useRef<HTMLDivElement>(null);
  const [translate, setTranslate]       = useState({ x: 0, y: 70 });
  const [isMobile, setIsMobile]         = useState(false);
  const [showBanner, setShowBanner]     = useState(
    !sessionStorage.getItem("career-desktop-banner"),
  );

  const dismiss = () => {
    sessionStorage.setItem("career-desktop-banner", "true");
    setShowBanner(false);
  };

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (careerPath.length && !selectedRole) setSelectedRole(careerPath[0].role);
  }, [careerPath]);

  useEffect(() => {
    if (containerRef.current) {
      const w = containerRef.current.getBoundingClientRect().width;
      setTranslate({ x: w / 2, y: 110 });
    }
  }, [careerPath]);

  const handleSelect = useCallback((name: string) => setSelectedRole(name), []);
  const selected = careerPath.find((r) => r.role === selectedRole) ?? null;
  const treeData = careerPath.length ? buildTree(careerPath) : null;

  // ── States ──────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Analysing your career path…</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (data?.message === "Add your skills to see career progression") {
    return (
      <AppLayout>
        <div className="flex min-h-[70vh] items-center justify-center px-4">
          <div className="w-full max-w-lg rounded-2xl border border-border p-6 text-center">
            <h2 className="text-lg font-semibold">Add your skills to unlock career progression</h2>
            <p className="mt-2 text-sm">We use your skills to map suitable roles and show how your career can grow.</p>
            <Link to="/profile"><Button variant="hero" size="sm" className="mt-3">Update Profile</Button></Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!careerPath.length) {
    return (
      <AppLayout>
        <div className="flex min-h-[70vh] items-center justify-center px-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-background/60 p-6 text-center">
            <h2 className="text-lg font-semibold">We couldn't generate a career path yet</h2>
            <p className="mt-2 text-sm">Try adding more specific skills, or remove unrelated ones.</p>
            <Link to="/profile"><Button variant="hero" size="sm" className="mt-3">Update Profile</Button></Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (isError) return <AppLayout><ErrorPage /></AppLayout>;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <AppLayout>
      <div className="mx-auto max-w-full px-6 py-3 space-y-6">

        {/* Header */}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Career Progression</h1>
            <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[13px] font-semibold uppercase tracking-wide text-primary">
              Beta
            </span>
            {isPro && (
              <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2 py-0.5 text-[12px] font-semibold text-yellow-400 flex items-center gap-1">
                <Crown className="h-3 w-3" /> Pro
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Click any role in the tree to explore details
          </p>
        </div>

        {/* Mobile banner */}
        {isMobile && showBanner && (
          <div className="flex items-start justify-between gap-4 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-md bg-amber-500/10 p-1.5 text-amber-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><circle cx="12" cy="16" r="1" />
                </svg>
              </div>
              <div className="text-sm">
                <p className="font-medium text-amber-400">Best viewed on desktop</p>
                <p className="text-muted-foreground">The career progression tree works better on larger screens.</p>
              </div>
            </div>
            <button onClick={dismiss} className="text-xs text-muted-foreground hover:text-foreground transition">
              Dismiss
            </button>
          </div>
        )}

        {/* Tree + detail panel */}
        <div className="grid gap-4 lg:grid-cols-[1fr_420px]">
          <div ref={containerRef} className="min-h-[420px] overflow-x-auto rounded-2xl border border-border bg-background">
            {treeData && (
              <Tree
                data={treeData}
                orientation="vertical"
                translate={translate}
                zoomable={false}
                collapsible={false}
                nodeSize={isMobile ? { x: 200, y: 180 } : { x: 260, y: 260 }}
                separation={{ siblings: 1.2, nonSiblings: 1.5 }}
                renderCustomNodeElement={(props) => (
                  <CustomNode
                    {...props}
                    selectedRole={selectedRole}
                    onSelect={handleSelect}
                    isMobile={isMobile}
                  />
                )}
              />
            )}
          </div>

          <AnimatePresence mode="wait">
            {selected ? (
              <DetailPanel key={selected.role} role={selected} isPro={isPro} />
            ) : (
              <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
                Select a role to explore
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Pro-only sections ────────────────────────────────────────── */}
        {isPro ? (
          <>
            {progression && <ProgressionCard progression={progression} />}
            {/* {lateralSwitches.length > 0 && <LateralSwitchCards lateralSwitches={lateralSwitches} />} */}
          </>
        ) : (
          <ProNudge />
        )}

      </div>
    </AppLayout>
  );
};

export default CareerProgressionPage;