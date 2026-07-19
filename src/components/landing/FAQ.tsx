import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

const faqs = [
  {
    question: "How does GraphCareers find jobs that match my skills?",
    answer:
      "We use a graph database to map relationships between skills, roles, and companies. When you input your skills, our engine traverses these connections to surface jobs that match — not just by keywords, but by the actual skill-to-role relationships found across thousands of real job listings.",
  },
  {
    question: "Where does the job data come from?",
    answer:
      "We scrape and aggregate listings from major job platforms, company career pages, and niche industry boards in real-time. This gives you the widest coverage without needing to check dozens of sites yourself.",
  },
  {
    question: "How do you optimize my resume for the ATS?",
    answer:
      "First, our engine checks the specific job you matched with and identifies the exact top skills your resume is missing. We then tell you what skills to add to get a higher match. Finally, we automatically reformat your resume to bypass the specific ATS filters of the platform (like Naukri or Foundit) you are applying on, maximizing your chances of being seen.",
  },
  {
    question: "Can I track applications from other platforms?",
    answer:
      "Yes. Our centralized job tracker lets you manually add any application regardless of where you applied. We also auto-detect applications made through our platform and add them to your tracker automatically.",
  },
  {
    question: "How does the AI Recruiter Referral feature work?",
    answer:
      "When you find a job you want, our AI analyzes the specific job description and your unique profile. It then drafts a highly personalized, professional cold email that you can send directly to the hiring manager or recruiter, highlighting exactly why you are the perfect fit.",
  },
];

const FAQ = () => {
  return (
    <section className="relative py-9 px-6 bg-zinc-950/30">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <Badge variant="glow" className="mb-6 px-4 py-1.5 border-primary/20 bg-primary/5">
            <span className="text-primary text-xs font-semibold tracking-widest uppercase">Support</span>
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-6 tracking-tight text-foreground">
            Frequently asked <span className="text-gradient-primary">questions.</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to know about how GraphCareers works and how it can accelerate your job search.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="glass-card rounded-3xl p-6 sm:p-10 border border-white/10"
        >
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, i) => (
              <AccordionItem 
                key={i} 
                value={`item-${i}`} 
                className="border border-white/5 bg-white/[0.02] rounded-2xl px-6 data-[state=open]:bg-white/5 transition-colors"
              >
                <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline hover:text-primary py-6 [&[data-state=open]]:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-zinc-400 text-base leading-relaxed pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;
