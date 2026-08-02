import { motion } from "framer-motion";
import { Zap, TrendingUp, BarChart3, AlertCircle, Sparkles, Target, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AtsScores, KeywordData, SkillRecommendation, PlatformInsights, Recommendation } from "@/types/workspace";

export function InsightsPanel({
  atsScores,
  keywords,
  skillRecommendations,
  platformInsights,
  recommendations,
  onApplyAction,
  onCopilotRequest,
}: {
  atsScores: AtsScores;
  keywords: KeywordData;
  skillRecommendations: SkillRecommendation[];
  platformInsights: PlatformInsights;
  recommendations: Recommendation[];
  onApplyAction: (actionType: string, payload: any) => void;
  onCopilotRequest: (msg: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-8">
      {/* 1. ATS Score Card */}
      <div className="bg-card/40 backdrop-blur-md rounded-2xl p-5 border border-border/50">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
          <BarChart3 className="h-4 w-4" /> ATS Impact
        </h3>
        <div className="flex items-center justify-between">
          <div className="text-center">
            <div className="text-2xl font-bold text-muted-foreground">{atsScores.before}</div>
            <div className="text-[10px] text-muted-foreground uppercase">Before</div>
          </div>
          <div className="flex-1 px-4">
            <div className="flex items-center gap-2 justify-center mb-1">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span className="text-xs font-bold text-emerald-500">+{atsScores.improvement} points</span>
            </div>
            <div className="h-1.5 w-full bg-border/50 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-emerald-500 rounded-full" 
                initial={{ width: `${atsScores.before}%` }} 
                animate={{ width: `${atsScores.after}%` }} 
              />
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-400">{atsScores.after}</div>
            <div className="text-[10px] text-emerald-500/70 uppercase font-bold">After</div>
          </div>
        </div>
      </div>

      {/* 2. Keywords Card */}
      <div className="bg-card/40 backdrop-blur-md rounded-2xl p-5 border border-border/50">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
          <Target className="h-4 w-4" /> Keyword Analysis
        </h3>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {keywords.matched?.map((kw, i) => (
              <span key={i} className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {kw}
              </span>
            ))}
            {keywords.added?.map((kw, i) => (
              <span key={i} className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {kw} <span className="opacity-60 text-[8px] ml-1">Added</span>
              </span>
            ))}
          </div>
          {keywords.missing?.length > 0 && (
            <div className="pt-3 border-t border-border/50">
              <p className="text-[10px] font-semibold text-red-400 mb-2 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> Missing (Click to ask AI)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {keywords.missing.map((kw, i) => (
                  <button 
                    key={i} 
                    onClick={() => onCopilotRequest(`Help me naturally include ${kw} in my resume.`)}
                    className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors cursor-pointer"
                  >
                    {kw}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Suggested Skills Card */}
      {skillRecommendations?.length > 0 && (
        <div className="bg-card/40 backdrop-blur-md rounded-2xl p-5 border border-border/50 xl:col-span-2">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
            <Zap className="h-4 w-4" /> Strategic Market Skills
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {skillRecommendations.map((rec, i) => (
              <div key={i} className="p-3 rounded-xl border border-border/40 bg-background/40">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-sm">{rec.skill}</span>
                  <span className={cn(
                    "text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-sm",
                    rec.importance.toLowerCase() === "critical" ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400"
                  )}>{rec.demandPct}% Demand</span>
                </div>
                <p className="text-[10px] text-muted-foreground line-clamp-2">{rec.learnMessage}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. AI Recommendations Card */}
      {recommendations?.length > 0 && (
        <div className="bg-card/40 backdrop-blur-md rounded-2xl p-5 border border-border/50 xl:col-span-2">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> AI Structural Improvements & Recommendations
          </h3>
          <div className="space-y-2.5">
            {recommendations.map((rec: any, i: number) => {
              const title = typeof rec === "string" ? rec : rec.title || rec.description || JSON.stringify(rec);
              const desc = typeof rec === "object" ? rec.description : null;
              const gain = typeof rec === "object" ? rec.estimatedAtsGain || rec.atsGain : 5;

              return (
                <div key={i} className="flex items-center justify-between p-3.5 rounded-xl border border-border/40 bg-background/50 hover:border-primary/40 transition-colors group">
                  <div className="flex-1 pr-4">
                    <h4 className="text-xs font-semibold text-foreground/90 leading-relaxed">{title}</h4>
                    {desc && <p className="text-[11px] text-muted-foreground mt-0.5">{desc}</p>}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      +{gain} ATS Points
                    </span>
                    {typeof rec === "object" && rec.actionType && (
                      <Button 
                        size="sm"
                        className="h-7 text-[10px] gap-1 bg-primary/90 text-primary-foreground hover:bg-primary"
                        onClick={() => onApplyAction(rec.actionType, rec.actionPayload)}
                      >
                        Apply <ArrowRight className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Platform Insights (Charts) */}
      {platformInsights?.topSkills?.length > 0 && (
        <div className="bg-card/40 backdrop-blur-md rounded-2xl p-5 border border-border/50 xl:col-span-2">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
            Platform Insights
          </h3>
          <div className="space-y-3 max-w-md">
            {platformInsights.topSkills.map((trend, i) => (
              <div key={i}>
                <div className="flex justify-between text-[10px] font-medium mb-1">
                  <span className="text-foreground/80">{trend.skill}</span>
                  <span className="text-muted-foreground">{trend.pct}%</span>
                </div>
                <div className="h-1.5 bg-border/50 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-primary/60" 
                    initial={{ width: 0 }} 
                    animate={{ width: `${trend.pct}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
