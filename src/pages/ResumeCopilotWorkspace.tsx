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

  const handleDownload = (type: "pdf" | "docx") => {
    toast.success(`Downloading ${type.toUpperCase()}...`);
    // Ideally calls the backend download API
  };

  const resumeSource = editMut.data?.version?.snapshot || statusData.optimizedResume || statusData.optimizedJson;

  return (
    <div className="flex flex-col h-screen bg-[#09090B] text-foreground font-sans overflow-hidden">
      
      {/* Top Toolbar */}
      <header className="h-14 border-b border-white/10 bg-card/40 backdrop-blur-md flex items-center justify-between px-4 shrink-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/platform-optimize")} className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div className="h-4 w-px bg-white/20" />
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-semibold capitalize">{platform} Optimization Ready</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 h-8 text-xs border-white/10" onClick={() => handleDownload("docx")}>
            <FileText className="h-3.5 w-3.5" /> DOCX
          </Button>
          <Button size="sm" className="gap-2 h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => handleDownload("pdf")}>
            <Download className="h-3.5 w-3.5" /> PDF
          </Button>
        </div>
      </header>

      {/* Main Workspace - 2 Columns */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT PANEL: 40% - AI Copilot */}
        <div className="w-[40%] min-w-[350px] max-w-[500px] h-full z-10">
          <CopilotPanel
            messages={messages.filter(m => !m.content.startsWith("SYSTEM_INIT"))}
            streaming={streaming}
            activityStatus={activityStatus}
            onSendMessage={sendMessage}
            onActionClick={sendMessage} // Quick actions just send the label as a prompt
          />
        </div>

        {/* RIGHT PANEL: 60% - Workspace */}
        <div className="flex-1 h-full overflow-y-auto bg-background/50 relative">
          {/* Subtle Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />

          <div className="p-6 md:p-10 space-y-12">
            
            {/* Top: Resume Preview */}
            <div>
              <ResumePreview
                snapshot={resumeSource}
                onEdit={(actionType, payload) => editMut.mutate({ actionType, actionPayload: payload })}
                isProcessing={editMut.isPending}
              />
            </div>

            {/* Bottom: Insights Dashboard */}
            <div className="max-w-[850px] mx-auto border-t border-border/50 pt-8 pb-12">
              <h2 className="text-xl font-bold mb-2">Resume Intelligence</h2>
              <p className="text-sm text-muted-foreground">Deep analysis and insights based on the {platform} market.</p>
              
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
