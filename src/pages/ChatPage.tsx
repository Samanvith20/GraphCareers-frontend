import { motion } from "framer-motion";
import { MessageSquare, Bot, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AppLayout from "@/components/layout/AppLayout";

const ChatPage = () => {
  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-8"
        >
          <div className="relative inline-flex">
            <div className="h-24 w-24 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
              <Bot className="h-12 w-12 text-primary" />
            </div>
            <div className="absolute -top-2 -right-2">
              <Badge variant="glow" className="gap-1 text-xs px-2 py-0.5">
                <Sparkles className="h-3 w-3" />
                Soon
              </Badge>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-foreground">RAG Chat</h1>
            <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
              Chat with an AI assistant that understands your resume, skills, and job preferences to give you personalized career advice.
            </p>
          </div>

          <Card className="max-w-sm mx-auto border-border/50">
            <CardContent className="pt-5 pb-5 space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm text-muted-foreground">Planned features:</p>
                  <ul className="text-xs text-muted-foreground space-y-1 text-left">
                    <li className="flex items-center gap-1.5">• Resume-aware career advice</li>
                    <li className="flex items-center gap-1.5">• Job match explanations</li>
                    <li className="flex items-center gap-1.5">• Interview prep suggestions</li>
                    <li className="flex items-center gap-1.5">• Skill gap analysis</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground">
            We're building something special. Stay tuned!
          </p>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default ChatPage;
