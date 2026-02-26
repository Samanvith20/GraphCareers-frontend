import AppLayout from "@/components/layout/AppLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Briefcase,
  GraduationCap,
  Building2,
  Target,
  DollarSign,
  ChevronRight,
} from "lucide-react";

import { useState, useCallback, useMemo, useEffect } from "react";
import Tree from "react-d3-tree";
import ErrorPage from "./ErrorPage";
import { useCareerProgression } from "@/hooks/useCareerProgression";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


// Build tree data for react-d3-tree: first role is root, rest are children
function buildTreeData(roles) {
  if (!roles.length) return undefined;

  const [root, ...children] = roles;

  return {
    name: root.role,
    attributes: { salary: root.salary },
    children: children.map((r) => ({
      name: r.role,
      attributes: { salary: r.salary },
    })),
  };
}

function renderCustomNode({ nodeDatum, onSelectRole, selectedRole }) {
  const isSelected = selectedRole === nodeDatum.name;

  return (
    <foreignObject x={-80} y={-80} width={160} height={160}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger >
            <div
              onClick={() => onSelectRole(nodeDatum.name)}
              className={`
                w-40 h-40 rounded-xl border
                flex flex-col items-center justify-center text-center
                cursor-pointer select-none
                transition-all
                ${
                  isSelected
                    ? "bg-primary/10 border-primary"
                    : "bg-background border-border"
                }
              `}
              style={{ pointerEvents: "auto" }}
            >
              <p className="text-sm font-semibold text-foreground px-2 leading-snug">
                {nodeDatum.name}
              </p>

              {nodeDatum.attributes?.salary && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {nodeDatum.attributes.salary}
                </p>
              )}
            </div>
          </TooltipTrigger>

          <TooltipContent side="top" className="max-w-[220px] text-xs">
            Suggested role based on your skills and current hiring trends.
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </foreignObject>
  );
}

function RoleDetailPanel({ role }) {
  const matchPercent = Math.round(
    (role.matchedSkills.length / (role.matchedSkills.length + role.missingSkills.length)) * 100
  );

  return (
    <motion.div
      key={role.role}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
<h3 className="text-lg font-semibold">{role.role}</h3>
         
        </div>
        <div className="text-right shrink-0">
          {/* <span className={`text-3xl font-bold ${matchPercent >= 50 ? "text-emerald-400" : "text-amber-400"}`}>
            {matchPercent}%
          </span> */}
          <p className="text-xs text-muted-foreground">skill match</p>
        </div>
      </div>

      {/* Salary & Jobs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card className="border-border/60 bg-secondary/30">
          <CardContent className="p-3 flex items-center gap-2.5">
            <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">{role.salary}</p>
              <p className="text-xs text-muted-foreground">Salary range</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-secondary/30">
          <CardContent className="p-3 flex items-center gap-2.5">
            <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">{role.companies.length}</p>
              <p className="text-xs text-muted-foreground">Hiring companies</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Companies */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Building2 className="h-3 w-3" /> Companies hiring
        </p>
        <div className="flex flex-wrap gap-1.5">
          {role.companies.map((c) => (
            <Badge key={c} variant="secondary" className="text-xs font-normal">
              {c.trim()}
            </Badge>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Target className="h-3 w-3" /> Matched skills ({role.matchedSkills.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {role.matchedSkills.map((s) => (
              <Badge key={s} className="text-xs font-normal bg-primary/15 text-primary border-primary/20">
                {s}
              </Badge>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <GraduationCap className="h-3 w-3" /> Missing skills ({role.missingSkills.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {role.missingSkills.map((s) => (
              <Badge key={s} variant="outline" className="text-xs font-normal border-amber-500/30 text-amber-400/80">
                {s}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const CareerProgressionPage = () => {
  
  const [selectedRoleName, setSelectedRoleName] = useState<string | null>(null);
  const handleSelectRole = useCallback((name: string) => {
    setSelectedRoleName((prev) => (prev === name ? null : name));
  }, []);
  const{data:career,isLoading,isError}=useCareerProgression()
  console.log("data",career)
  const careerPath = career?.careerPath ?? [];
  const treeData = useMemo(
  () => buildTreeData(careerPath),
  [careerPath]
);
useEffect(() => {
  if (careerPath.length > 0 && !selectedRoleName) {
    setSelectedRoleName(careerPath[0].role);
  }
}, [careerPath, selectedRoleName]);
  if (isLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            <p className="text-sm text-muted-foreground">Loading profile…</p>
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
  

 const selectedRole =
  careerPath.find((r) => r.role === selectedRoleName) || null;

  

  return (
    <AppLayout>
      <div className="max-w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header */}
        <motion.div
  initial={{ opacity: 0, y: -10 }}
  animate={{ opacity: 1, y: 0 }}
  className="space-y-1"
>
  <div className="flex items-center gap-2">
    <h1 className="text-2xl font-bold text-foreground">
      Career Progression
    </h1>

    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger >
          <Badge  className="cursor-default">
            Beta
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-[240px] text-xs">
          Career progression is in beta and may improve as we gather more real-world data.
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>

  <p className="text-muted-foreground text-sm">
    Explore career paths based on your skills — click a node to see details.
  </p>
</motion.div>

        {/* Two-column: Tree left, Detail right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ minHeight: 450 }}>
          {/* Left: D3 Tree */}
        <Card className="border-border bg-background w-full max-w-[520px] mx-auto">
            <CardContent className="p-0 aspect-square max-h-[520px] relative mx-auto">
              {careerPath.length > 0 ? (
  <Tree
    data={treeData}
    orientation="vertical"
    translate={{ x: 250, y: 60 }}
    zoomable={false}
    draggable={true}
    collapsible={false}
   nodeSize={{ x: 200, y: 220 }}
          separation={{ siblings: 1.6, nonSiblings: 2 }}
    renderCustomNodeElement={(props) =>
      renderCustomNode({
        ...props,
        onSelectRole: handleSelectRole,
        selectedRole: selectedRoleName,
      })
    }
  />
) : (
  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
    No career paths found for your profile
  </div>
)}
            </CardContent>
          </Card>

          {/* Right: Detail panel */}
          <div className="min-h-[300px]">
            <AnimatePresence mode="wait">
              {selectedRole ? (
                <Card key={selectedRole.role} className="border-border/60 bg-card/90 h-full">
                  <CardContent className="p-5 sm:p-6">
                    <RoleDetailPanel role={selectedRole} />
                  </CardContent>
                </Card>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full min-h-[300px] text-center p-8 border border-dashed border-border/60 rounded-xl"
                >
                  <Target className="h-10 w-10 text-muted-foreground/40 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Click a role node in the tree to view details
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default CareerProgressionPage;
