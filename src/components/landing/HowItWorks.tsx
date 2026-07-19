import { motion } from "framer-motion";
import { Upload, ScanSearch, MousePointerClick, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload & Extract",
    description: "Upload your resume or enter skills manually. Our AI instantly parses your tech stack, domain expertise, and experience level.",
    highlight: "2 minutes setup",
  },
  {
    number: "02",
    icon: ScanSearch,
    title: "Global Skill Matching",
    description: "We scrape thousands of jobs daily from Naukri, Foundit, and company boards, scoring them against your exact profile for the perfect match.",
    highlight: "10+ Job Boards",
  },
  {
    number: "03",
    icon: MousePointerClick,
    title: "Optimize for the ATS",
    description: "Found a job you want? Our AI identifies the exact missing skills from the job description, tells you what to add, and automatically reformats your resume to beat the portal's ATS.",
    highlight: "Top Missing Skills",
  },
  {
    number: "04",
    icon: BarChart3,
    title: "AI Recruiter Emails",
    description: "Stop waiting for replies. Our AI drafts hyper-personalized cold emails referencing the exact skills they are looking for, so you can reach out directly.",
    highlight: "Direct Referrals",
  },
];

const HowItWorks = () => {
  return (
    <section className="relative py-12 px-6 overflow-hidden bg-zinc-950/50">
      {/* Abstract Backgrounds */}
      <div className="absolute right-0 top-1/4 w-[500px] h-[500px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute left-0 bottom-1/4 w-[400px] h-[400px] bg-accent/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          className="text-center mb-24"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <Badge variant="glow" className="mb-6 px-4 py-1.5 border-primary/20 bg-primary/5">
            <span className="text-primary text-xs font-semibold tracking-widest uppercase">Workflow</span>
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-6 tracking-tight text-foreground">
            How <span className="text-gradient-primary">GraphCareers</span> works.
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            From sign-up to your next offer — a smarter, frictionless way to find and land the right job.
          </p>
        </motion.div>

        <div className="relative">
          {/* Central Animated Line for Desktop */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent -translate-x-1/2" />
          
          {/* Left Animated Line for Mobile */}
          <div className="md:hidden absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent" />

          <div className="space-y-12 md:space-y-24 relative">
            {steps.map((step, i) => {
              const isEven = i % 2 === 0;
              return (
                <motion.div
                  key={step.number}
                  className={`relative flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-0 ${
                    isEven ? "md:flex-row-reverse" : ""
                  }`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, delay: i * 0.1 }}
                >
                  {/* Center Node (Desktop) / Left Node (Mobile) */}
                  <div className="absolute left-8 md:left-1/2 -translate-x-1/2 flex items-center justify-center z-20">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-background border-2 border-primary/30 flex items-center justify-center shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)]">
                      <span className="text-primary font-bold text-sm md:text-lg">{step.number}</span>
                    </div>
                  </div>

                  {/* Content Card */}
                  <div className={`w-full md:w-1/2 pl-24 md:pl-0 ${isEven ? "md:pr-16 lg:pr-24 text-left md:text-right" : "md:pl-16 lg:pl-24 text-left"}`}>
                    <div className={`group relative glass-card p-8 rounded-3xl border border-white/5 hover:border-primary/20 transition-all duration-500 hover:shadow-glow overflow-hidden`}>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                      
                      <div className={`flex flex-col ${isEven ? "md:items-end" : "md:items-start"} items-start relative z-10`}>
                        <div className="mb-6 h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                          <step.icon className="h-6 w-6" />
                        </div>
                        <div className="inline-flex items-center gap-2 mb-4">
                          <span className="text-xs px-3 py-1 rounded-full bg-white/5 text-zinc-300 font-medium border border-white/10">
                            {step.highlight}
                          </span>
                        </div>
                        <h3 className="text-2xl font-bold text-zinc-100 mb-3 group-hover:text-primary transition-colors duration-300">
                          {step.title}
                        </h3>
                        <p className="text-zinc-400 text-base leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
