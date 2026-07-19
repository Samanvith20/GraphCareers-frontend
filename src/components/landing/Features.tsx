import { motion } from "framer-motion";
import {
  Target,
  LayoutDashboard,
  FileCheck,
  Send,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Target,
    title: "Global Job Matching",
    description: "Upload your resume and our engine instantly matches you to live jobs across top portals, showing exact match percentages and skill gaps. Stop scrolling through irrelevant listings.",
    gradient: "from-accent/20 via-accent/5 to-transparent",
    className: "md:col-span-2",
  },
  {
    icon: LayoutDashboard,
    title: "Centralized Job Tracker",
    description: "Track every application in a sleek Kanban board — saved, applied, interviewing, or ignored. No more messy spreadsheets.",
    gradient: "from-primary/10 via-primary/5 to-transparent",
    className: "md:col-span-1",
  },
  {
    icon: FileCheck,
    title: "Top Skills & ATS Optimization",
    description: "We analyze your matched jobs, identify the exact skills you are missing, and tell you what to add. Then, we reformat your resume to pass the specific ATS filters of platforms like Naukri or Foundit.",
    gradient: "from-primary/15 via-primary/5 to-transparent",
    className: "md:col-span-1",
  },
  {
    icon: Send,
    title: "AI Recruiter Referrals",
    description: "Found a job you love? Don't just apply. Our AI drafts highly personalized cold emails to recruiters and hiring managers based on your profile and the specific job description.",
    gradient: "from-accent/15 via-primary/5 to-transparent",
    className: "md:col-span-2",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
};

const Features = () => {
  return (
    <section className="relative py-4 px-6 overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <Badge variant="glow" className="mb-6 px-4 py-1.5 border-primary/20 bg-primary/5">
            <span className="text-primary text-xs font-semibold tracking-widest uppercase">Platform Capabilities</span>
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-6 tracking-tight text-foreground">
            Everything you need to{" "}
            <span className="text-gradient-primary">land your next role.</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            A complete ecosystem designed to optimize every stage of your career transition — from job discovery to offer negotiation.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              className={`group relative ${feature.className}`}
            >
              <div className="relative h-full bg-zinc-950/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 lg:p-8 overflow-hidden transition-all duration-500 hover:border-primary/30">
                {/* Hover gradient sweep */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                
                {/* Subtle static gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />

                <div className="relative z-10 flex flex-col h-full">
                  <div className="mb-5 inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-white/5 border border-white/10 text-primary shadow-lg group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-500">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-zinc-100 tracking-tight group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-zinc-400 text-base leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
