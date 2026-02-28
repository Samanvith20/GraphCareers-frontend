import { motion } from "framer-motion";
import {
  Network,
  TrendingUp,
  LayoutDashboard,
  MessageSquare,
  Search,
  Target,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const features = [
  {
    icon: Search,
    title: "Multi-Platform Job Scraping",
    description:
      "We automatically scan Naukri, Foundit, LinkedIn, and more — aggregating thousands of fresh listings daily so you never miss a relevant opening.",
    gradient: "from-primary/20 to-primary/5",
  },
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
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const Features = () => {
  return (
    <section className="relative py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Everything you need to <span className="text-gradient-primary">land the right role</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Four integrated tools working together so you can focus on what matters — your career.
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={cardVariants}>
              <Card className="p-8 card-hover h-full">
                <CardHeader className="p-0 mb-3">
                  <div className="mb-5 inline-flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 text-primary">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
