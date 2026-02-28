import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
    question: "How accurate are the salary ranges and career projections?",
    answer:
      "Our data is sourced directly from live job postings and updated continuously. Salary ranges reflect what companies are actually offering right now, not outdated survey data. Career projections are based on real transition patterns we observe in the market.",
  },
  {
    question: "Can I track applications from other platforms?",
    answer:
      "Yes. Our centralized job tracker lets you manually add any application regardless of where you applied. We also auto-detect applications made through our platform and add them to your tracker automatically.",
  },
  {
    question: "What makes the AI assistant different from ChatGPT?",
    answer:
      "Our AI uses Retrieval-Augmented Generation (RAG) grounded in real, live job market data. Instead of generic career advice, it gives you answers backed by current salary figures, actual job openings, and real skill-demand trends specific to your target roles.",
  },
  
];

const FAQ = () => {
  return (
    <section className="relative py-10 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Frequently asked <span className="text-gradient-primary">questions</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Everything you need to know about GraphCareers.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-border">
                <AccordionTrigger className="text-left text-base hover:no-underline hover:text-primary transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
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
