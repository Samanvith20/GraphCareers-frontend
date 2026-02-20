import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Connect your skills",
    description:
      "Tell us what you know. Our graph engine instantly maps your skill set against the live job market.",
  },
  {
    number: "02",
    title: "Explore opportunities",
    description:
      "Browse matched roles with salary data, company info, and career growth projections — all in one view.",
  },
  {
    number: "03",
    title: "Track & apply",
    description:
      "Apply with confidence and track every application from a single, organized dashboard.",
  },
  {
    number: "04",
    title: "Get AI guidance",
    description:
      "Chat with our AI assistant for personalized advice on skill gaps, interview prep, and next steps.",
  },
];

const HowItWorks = () => {
  return (
    <section className="relative py-28 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            How it <span className="text-gradient-primary">works</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            From sign-up to your next role — in four simple steps.
          </p>
        </motion.div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[27px] top-0 bottom-0 w-px bg-border hidden md:block" />

          <div className="space-y-12">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                className="flex gap-8 items-start"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="relative z-10 flex-shrink-0 h-14 w-14 rounded-full border border-border bg-card flex items-center justify-center">
                  <span className="text-sm font-mono font-medium text-primary">
                    {step.number}
                  </span>
                </div>
                <div className="pt-2">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed max-w-lg">
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
