import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Loader2, ArrowLeft, Download, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout";
import { CopilotPanel } from "@/components/workspace/CopilotPanel";
import { ResumePreview } from "@/components/workspace/InteractiveResumePreview";
import { InsightsPanel } from "@/components/workspace/InsightsPanel";
import { usePlatformOptimizeStatus } from "@/hooks/usePlatformOptimize";
import { useCopilotChat } from "@/hooks/useCopilotChat";
import { useResumeEdit } from "@/hooks/useWorkspaceApi";
import { toast } from "sonner";

export default function ResumeCopilotWorkspace() {
  const { platform } = useParams<{ platform: string }>();
  const navigate = useNavigate();
  
  // The existing hook that retrieves the generated data
  const { data: statusData, isLoading: isStatusLoading } = usePlatformOptimizeStatus(platform || null, false);
  
  // Assume the backend returns a versionId upon optimization. If not, we fall back to a mock or platform string
  const versionId = statusData?.versionId || platform || "default-version";
  
  const { messages, streaming, activityStatus, sendMessage } = useCopilotChat(versionId);
  const editMut = useResumeEdit(versionId);

  // Initial Copilot Context Setup
  useEffect(() => {
    if (statusData?.status === "completed" && messages.length === 0) {
      const imp = statusData.atsScores?.improvement || 0;
      sendMessage(`SYSTEM_INIT: Optimization completed for ${platform}. ATS improved by ${imp}. Keywords added: ${statusData.keywords?.added?.length}. Ready to assist user.`);
    }
  }, [statusData, platform, messages.length, sendMessage]);

  if (isStatusLoading || statusData?.status === "processing" || statusData?.status === "pending") {
    // If it's somehow still processing and the user landed here, redirect back to Platform Selection
    // But normally we only route here WHEN completed.
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!statusData || statusData.status !== "completed") {
    return (
      <AppLayout>
        <div className="flex flex-col h-full items-center justify-center text-center">
          <h2 className="text-xl font-bold mb-2">No Optimization Data Found</h2>
          <p className="text-muted-foreground mb-4">Please run an optimization first.</p>
          <Button onClick={() => navigate("/platform-optimize")}>Go back</Button>
        </div>
      </AppLayout>
    );
  }

  const handleDownloadPdf = async () => {
    if (!platform) return;
    toast.info("Generating PDF document...");
    try {
      const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
      const response = await fetch(`${BASE_URL}/api/resume-intelligence/${platform}/download/pdf`, {
        credentials: "include",
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Optimized_Resume_${platform}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("PDF Downloaded successfully!");
        return;
      }
    } catch (e) {
      // Fallback to print
    }
    // Fallback to browser print dialog for immediate PDF saving
    window.print();
  };

  const resumeSource = editMut.data?.version?.snapshot || statusData.optimizedResume || statusData.optimizedJson;

  return (
    <div className="flex flex-col h-screen bg-[#060911] text-foreground font-sans overflow-hidden relative">
      {/* Background ambient lighting orbs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[400px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      
      {/* Top Toolbar */}
      <header className="h-16 border-b border-white/10 bg-[#0B0F19]/80 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 z-20 shadow-lg shadow-black/40 print:hidden">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/platform-optimize")} className="gap-2 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-xl">
            <ArrowLeft className="h-4 w-4" /> Back to Platforms
          </Button>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 capitalize">{platform} Resume Agent Ready</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" className="gap-2 h-9 text-xs bg-emerald-500 text-black font-bold hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] rounded-xl" onClick={handleDownloadPdf}>
            <Download className="h-4 w-4" /> Export PDF
          </Button>
        </div>
      </header>

      {/* Main Workspace - 2 Columns */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT PANEL: 38% - AI Copilot Agent */}
        <div className="w-[38%] min-w-[360px] max-w-[480px] h-full z-10 shadow-2xl border-r border-white/10">
          <CopilotPanel
            messages={messages.filter(m => !m.content.startsWith("SYSTEM_INIT"))}
            streaming={streaming}
            activityStatus={activityStatus}
            onSendMessage={sendMessage}
            onActionClick={sendMessage}
          />
        </div>

        {/* RIGHT PANEL: 62% - Workspace & Document Preview */}
        <div className="flex-1 h-full overflow-y-auto bg-[#080C14]/90 relative scrollbar-thin scrollbar-thumb-white/10">
          <div className="p-6 md:p-10 space-y-12 max-w-[950px] mx-auto">
            
            {/* Top: Resume Preview Document */}
            <div className="shadow-[0_20px_60px_rgba(0,0,0,0.6)] rounded-2xl overflow-hidden border border-white/10">
              <ResumePreview
                snapshot={resumeSource}
                onEdit={(actionType, payload) => editMut.mutate({ actionType, actionPayload: payload })}
                isProcessing={editMut.isPending}
              />
            </div>

            {/* Bottom: Insights & Skill Roadmap Dashboard */}
            <div className="max-w-[850px] mx-auto border-t border-border/50 pt-10 pb-16">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-foreground tracking-tight">AI Resume Intelligence & Strategic Market Roadmap</h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Real-time market insights, required skill gap roadmaps, and 1-click optimization suggestions tailored specifically for <span className="font-semibold text-primary capitalize">{platform}</span>.
                  </p>
                </div>
              </div>
              
              <InsightsPanel
                atsScores={statusData.atsScores || { before: 0, after: 0, improvement: 0 }}
                keywords={statusData.keywords || { matched: [], added: [], missing: [] }}
                skillRecommendations={statusData.skillRecommendations || []}
                platformInsights={statusData.platformInsights || { topSkills: [] }}
                recommendations={statusData.recommendations || []}
                onApplyAction={(actionType, payload) => editMut.mutate({ actionType, actionPayload: payload })}
                onCopilotRequest={sendMessage}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
