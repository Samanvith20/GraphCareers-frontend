import { motion } from "framer-motion";
import {
  Search,
  Target,
  LayoutDashboard,
  TrendingUp,
  MessageSquare,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const features = [
  
  {
    icon: Target,
    title: "Skill-Based Job Matching",
    description:
      "Upload your resume or add skills manually. Our engine matches you to jobs by analyzing required skills vs. yours, showing match percentages and skill gaps.",
    gradient: "from-accent/20 to-accent/5",
  },
  {
    icon: TrendingUp,
    title: "Career Progression Map",
    description:
      "Visualize your growth paths — see which roles you're ready for, what skills to learn next, salary ranges, and which companies are hiring for those roles.",
    gradient: "from-primary/15 to-accent/10",
  },
  {
    icon: LayoutDashboard,
    title: "Centralized Job Tracker",
    description:
      "Track every application in one place — saved, applied, interviewing, or ignored. No more spreadsheets or switching between browser tabs.",
    gradient: "from-accent/15 to-primary/10",
  },
  {
    icon: MessageSquare,
    title: "AI Career Assistant",
    description:
      "An RAG-powered chat assistant that understands your resume and the job market. Ask about skill gaps, interview prep, salary insights, or which roles to target next.",
    comingSoon: true,
    gradient: "from-primary/10 to-accent/15",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" as const } },
};

const Features = () => {
  return (
    <section className="relative py-16 px-6 section-glow">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Badge variant="glow" className="mb-6 px-4 py-1.5 border-primary/20">
            <span className="text-primary text-xs font-medium tracking-wider uppercase">Features</span>
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-bold mb-5 tracking-tight">
            Everything you need to{" "}
            <span className="text-gradient-primary">land your next role</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            From job discovery and skill matching to career mapping and application tracking — all in one platform.
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2  lg:grid-cols-3 gap-5"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              className="group relative"
            >
            <div className="relative glass-card rounded-xl p-8 h-full card-hover overflow-hidden bg-card/80 backdrop-blur border border-border">
                {/* Hover gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl`} />
                
                {feature.comingSoon && (
                  <Badge variant="outline" className="absolute top-4 right-4 text-[10px] border-accent/30 text-accent z-10">
                    Coming Soon
                  </Badge>
                )}
                
                <div className="relative z-10">
                  <div className="mb-6 inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 text-primary border border-primary/10 group-hover:shadow-glow transition-shadow duration-500">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground text-base leading-relaxed">
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
