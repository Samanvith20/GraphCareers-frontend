import AppLayout from "@/components/layout/AppLayout";
import { useCareerProgression } from "@/hooks/useCareerProgression";
import Tree from "react-d3-tree";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState, useCallback } from "react";
import ErrorPage from "./ErrorPage";

/* ───────────────── Types ───────────────── */
interface CareerRole {
  role: string;
  salary: string;
  companies: string[];
  matchedSkills: string[];
  missingSkills: string[];
}

/* ───────────────── Tree Builder ───────────────── */
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

/* ───────────────── Custom Node ───────────────── */
function CustomNode({
  nodeDatum,
  selectedRole,
  onSelect,
}: any) {
  const isRoot = nodeDatum.attributes?.isRoot === "true";
  const isSelected = selectedRole === nodeDatum.name;

  const width = isRoot ? 220 : 190;
  const height = isRoot ? 120 : 100;

  return (
    <foreignObject
      x={-width / 2}
      y={-height / 2}
      width={width}
      height={height}
    >

      <div
      style={{ pointerEvents: "auto" }}
  onClick={() => onSelect(nodeDatum.name)}
  className={`
    relative h-full w-full cursor-pointer rounded-xl
    border border-white
    ${
      isSelected
        ? "border-primary bg-primary/10 ring-2 ring-primary/30"
        : "border-border bg-background/60 hover:border-primary/40"
    }
  `}
>
  {/* Glow layer (only for selected) */}
  {isSelected && (
    <div className="pointer-events-none absolute inset-0 rounded-xl bg-glow-primary" />
  )}

  <div className="relative flex h-full flex-col justify-center px-4 text-center">
    {isRoot && (
      <span className="mx-auto mb-3 w-fit rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-primary">
        Best Match
      </span>
    )}

    <p
      className={`text-sm font-semibold leading-snug ${
        isSelected ? "text-primary" : "text-foreground"
      }`}
    >
      {nodeDatum.name}
    </p>
  </div>
</div>
    </foreignObject>
  );
}

/* ───────────────── Detail Panel ───────────────── */
function DetailPanel({ role }: { role: CareerRole }) {
  return (
    <motion.div
      key={role.role}
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="
        relative h-full overflow-y-auto rounded-2xl
        border border-border bg-background/60 p-6
      "
    >
      <div className="absolute right-0 top-0 h-48 w-48  pointer-events-none" />

      <h2 className="text-lg font-bold">{role.role}</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {role.salary} · {role.companies.length} companies hiring
      </p>

      {/* Skills */}
      <div className="mt-6 grid  gap-6">
        <div>
          <p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-emerald-400">
            ✓ Skills You Have
          </p>
          <div className="flex flex-wrap gap-2">
            {role.matchedSkills.length ? (
              role.matchedSkills.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-emerald-500/30 px-3 py-1 text-xs capitalize text-emerald-400"
                >
                  {s}
                </span>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">
                None yet
              </span>
            )}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-amber-400">
            ↑ Skills to Learn
          </p>
          <div className="flex flex-wrap gap-2">
            {role.missingSkills.length ? (
              role.missingSkills.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-amber-500/30 px-3 py-1 text-xs capitalize text-amber-400"
                >
                  {s}
                </span>
              ))
            ) : (
              <span className="text-xs text-emerald-400">
                Fully qualified
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Companies */}
      {role.companies.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 text-xs font-extrabold uppercase tracking-wide">
            Companies Hiring
          </p>
          <div className="flex flex-wrap gap-2">
            {role.companies.map((c) => (
              <span
                key={c}
                className="rounded-full border border-border px-3 py-1 text-xs"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

/* ───────────────── Main Page ───────────────── */
const CareerProgressionPage = () => {
  const { data, isLoading, isError } = useCareerProgression();
  const careerPath: CareerRole[] = data?.careerPath ?? [];

  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [translate, setTranslate] = useState({ x: 0, y: 70 });

  const treeData = careerPath.length ? buildTree(careerPath) : null;

  useEffect(() => {
    if (careerPath.length && !selectedRole) {
      setSelectedRole(careerPath[0].role);
    }
  }, [careerPath]);

  useEffect(() => {
    if (containerRef.current) {
      const w = containerRef.current.getBoundingClientRect().width;
      setTranslate({ x: w / 2, y: 110 });
    }
  }, [treeData]);

  const handleSelect = useCallback((name: string) => {
    setSelectedRole(name);
  }, []);

  const selected = careerPath.find((r) => r.role === selectedRole) ?? null;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">
              Analysing your career path…
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (isError) {
    return (
      <AppLayout>
        <ErrorPage />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-full px-6 py-3">
        {/* Header */}
        <div
  className="mb-6 inline-block"
  title=" This feature is in beta and will improve with more data."
>
  <div className="flex items-center gap-2">
    <h1 className="text-2xl font-bold">
      Career Progression
    </h1>

    {/* BETA tag */}
    <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[14px] font-semibold uppercase tracking-wide text-primary">
      Beta
    </span>
  </div>

  <p className="text-sm ">
    Click any role in the tree to explore details
  </p>
</div>

        {/* Layout */}
      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <div
            ref={containerRef}
            className="min-h-[420px] rounded-2xl border border-border bg-background"
          >
            {treeData && (
              <Tree
                data={treeData}
                orientation="vertical"
                translate={translate}
                zoomable={false}
                collapsible={false}
            
              nodeSize={{ x: 260, y: 260 }}
            separation={{ siblings: 1.2, nonSiblings: 1.5 }}
               
                renderCustomNodeElement={(props) => (
                  <CustomNode
                    {...props}
                    selectedRole={selectedRole}
                    onSelect={handleSelect}
                  />
                )}
              />
            )}
          </div>

          {/* Detail */}
          <AnimatePresence mode="wait">
            {selected ? (
              <DetailPanel role={selected} />
            ) : (
              <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
                Select a role to explore
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AppLayout>
  );
};

export default CareerProgressionPage;