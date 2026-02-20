import { motion } from "framer-motion";
import {
  Network,
  TrendingUp,
  LayoutDashboard,
  MessageSquare,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const features = [
  {
    icon: Network,
    title: "Skill-Based Job Matching",
    description:
      "Our graph database maps the relationships between your skills and thousands of scraped job listings — surfacing roles you'd never find through keyword search alone.",
  },
  {
    icon: TrendingUp,
    title: "Career Path Visualization",
    description:
      "See real market data on salary ranges, growth trajectories, and which companies are actively hiring. Plan your next move based on evidence, not anecdotes.",
  },
  {
    icon: LayoutDashboard,
    title: "Centralized Job Tracker",
    description:
      "Track every application in one place. Monitor statuses, deadlines, and follow-ups without switching between tabs or spreadsheets.",
  },
  {
    icon: MessageSquare,
    title: "AI Career Assistant",
    description:
      "An RAG-powered chat interface trained on real job market data. Ask about career transitions, skill gaps, or interview prep and get grounded, personalized answers.",
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
    <section className="relative py-28 px-6">
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
