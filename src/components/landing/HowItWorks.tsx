import { motion } from "framer-motion";
import { Upload, ScanSearch, MousePointerClick, BarChart3 } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Add your skills or upload your resume",
    description:
      "Tell us what you know — add skills manually or upload your resume. We'll extract your tech stack, experience level, and domain expertise automatically.",
    highlight: "Takes less than 2 minutes",
  },
  {
    number: "02",
    icon: ScanSearch,
    title: "We scan & match jobs across platforms",
    description:
      "Our scrapers pull fresh listings from Naukri, Foundit, and company career pages every day. Each job is scored against your skill profile with a match percentage — so you always see the most relevant roles first.",
    highlight: "Covering 10+ job boards",
  },
  {
    number: "03",
    icon: MousePointerClick,
    title: "Browse your best matches & apply directly",
    description:
      "See your top-fit jobs ranked by match score, with skill gaps highlighted. Every listing has a direct apply link — click through to the original posting and apply in seconds. No middlemen.",
    highlight: "One-click apply links",
  },
  {
    number: "04",
    icon: BarChart3,
    title: "Track applications & map your career growth",
    description:
      "Keep every application organized — saved, applied, interviewing, or offered. Plus, our career progression map shows where you can grow next, what skills to learn, salary ranges, and which companies are hiring for those roles.",
    highlight: "Your career dashboard",
  },
];

const HowItWorks = () => {
  return (
    <section className="relative py-12 px-6 section-glow">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-5xl font-bold mb-5 tracking-tight">
            How <span className="text-gradient-primary">GraphCareers</span> works
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            From sign-up to your next offer — a smarter way to find, match, and land the right job.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-8 md:left-[39px] top-0 bottom-0 w-px bg-gradient-to-b from-primary/40 via-primary/20 to-transparent hidden md:block" />

          <div className="space-y-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                className="group relative flex gap-6 md:gap-10 items-start"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
              >
                {/* Number circle */}
                <div className="relative z-10 flex-shrink-0">
                  <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl glass-card flex items-center justify-center group-hover:border-primary/30 transition-all duration-500 group-hover:shadow-glow">
                    <step.icon className="h-7 w-7 md:h-8 md:w-8 text-primary" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 pb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-mono text-primary/60 tracking-wider">STEP {step.number}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                      {step.highlight}
                    </span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed max-w-xl text-base">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
