import { motion } from "framer-motion";
import { Check, X, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Footer from "@/components/landing/Footer";
import { Link } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { useRazorpayPayment } from "@/hooks/useRazorpay";

const plans = [
{
name: "Starter",
price: "Free",
period: "",
description: "Start exploring your career with powerful AI tools — no payment needed.",
features: [
"🎁 Get 10 free credits to try everything",
"Top 10 job matches/day",
"Basic career roadmap",
"Track up to 50 applications",
"AI career coach (pay per use with credits)",
"Resume analysis (pay per use with credits)",
],
note: "No credit card required",
cta: "Start Free",
popular: false,
},
{
name: "Pro",
price: "₹99",
period: "/month",
description: "Get faster results, deeper insights, and land better opportunities.",
highlight: "🚀 Most Popular • Less than ₹4/day",
features: [
"💎 Get 100 credits every month",
"Unlimited job matches",
"Full career roadmap + salary insights",
"Unlimited job tracking",
"AI career coach (pay per use with credits)",
"Resume analysis & improvements (pay per use)",
"Deep skill gap insights",
"Priority job ranking (get noticed faster)",
],
note: "Cancel anytime • No hidden charges",
cta: "Upgrade to Pro",
popular: true,
},
];


const comparisonRows = [
["Credits", "🎁 10 free credits", "💎 100 credits/month"],
["Job Matches", "10/day", "Unlimited"],
["AI Career Coach", "Uses credits", "Uses credits"],
["Resume Analysis", "Uses credits", "Uses credits"],
["Career Roadmap", "Basic", "Full + Salary Data"],
["Skill Gap Insights", "Limited", "Advanced"],
["Job Tracking", "Up to 50", "Unlimited"],
["Priority Job Ranking", "—", "✔"],
];

const faqs = [
 {
  q: "Do I need to renew my plan every month?",
  a: "Yes, the Pro plan does not auto-renew. You’ll need to manually renew your subscription each month to continue using Pro features.",
},
  {
  q: "Will this guarantee me a job?",
  a: "No platform can guarantee a job, but GraphCareers helps you focus on the right opportunities, identify your skill gaps, and improve your chances of getting hired faster with personalized insights and guidance.",
},
  {
    q: "Is ₹99/month worth it?",
    a: "If you're serious about your career, absolutely. Pro users save 10+ hours per week on job searching and get matched to roles they actually qualify for.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit/debit cards and UPI payments. All transactions are processed securely.",
  },

  // 🔥 NEW (very important)
  {
    q: "I completed payment but my plan was not updated. What should I do?",
    a: "In rare cases, payment confirmation may take a few seconds. Please refresh your dashboard or wait for a moment. If your plan is still not updated, contact our support team with your payment details and we'll resolve it quickly.",
  },

  {
    q: "Where can I check my current plan and remaining credits?",
    a: "You can view your current plan and available credits anytime from your profile. We keep it updated in real-time so you always know your usage.",
  },
  {
  q: "Do unused credits roll over to next month?",
  a: "No, credits reset every month based on your plan to ensure fair usage and consistent service quality.",
}
];

const PricingPage = () => {
  const { startPayment, loading } = useRazorpayPayment();
  return (
     <AppLayout>
    <div className="min-h-screen bg-background">
      {/* <Navbar /> */}

      {/* Hero */}
      <section className="relative pt-10 pb-20 px-6 section-glow">
        <div className="absolute inset-0 bg-dot-grid opacity-30" />
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="glow" className="mb-5 px-4 py-3.5 gap-2">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Pricing
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold mb-5 leading-tight">
              Invest{" "}
              <span className="text-gradient-primary">₹99/month</span>.{" "}
              Get hired faster.
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Upgrade to unlock full career intelligence and better job outcomes.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Plans */}
      <section className="px-6 pb-20">
        <motion.div
          className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.15 } } }}
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
            >
              <Card
                className={`relative p-8 h-full flex flex-col glass-card card-hover ${
                  plan.popular ? "border-primary/40 shadow-glow" : ""
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                )}

                <CardHeader className="p-0 mb-6">
                  <CardTitle className="text-xl mb-2 text-foreground">{plan.name}</CardTitle>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-5xl font-extrabold text-foreground">{plan.price}</span>
                    {plan.period && (
                      <span className="text-muted-foreground text-base">{plan.period}</span>
                    )}
                  </div>
                  {plan.highlight && (
                    <p className="text-xs text-primary font-medium mb-2">{plan.highlight}</p>
                  )}
                  <CardDescription className="text-sm text-muted-foreground">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-0 flex-1">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="p-0 mt-8">
                  <Button
                    variant={plan.popular ? "hero" : "heroOutline"}
                    size="lg"
                    className="w-full group"
                    onClick={() => {
                      if (plan.name === "Pro") {
                        startPayment();
                      } else {
                        window.location.href = "/signup";
                      }
                    }}
                    disabled={loading}
                  >
                    {loading ? "Processing..." : plan.cta}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Comparison Table */}
      <section className="px-6 pb-24">
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-center mb-10 text-foreground">
            Compare <span className="text-gradient-primary">plans</span>
          </h2>
          <div className="glass-card rounded-2xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50">
                  <TableHead className="text-foreground font-semibold">Feature</TableHead>
                  <TableHead className="text-center text-foreground font-semibold">Free</TableHead>
                  <TableHead className="text-center text-primary font-semibold">Pro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparisonRows.map((row, idx) => (
                  <TableRow key={idx} className="border-border/30">
                    <TableCell className="text-sm text-foreground font-medium">
                      {row[0]}
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {typeof row[1] === "boolean" ? (
                        row[1] ? (
                          <Check className="h-4 w-4 text-primary mx-auto" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                        )
                      ) : (
                        row[1]
                      )}
                    </TableCell>
                    <TableCell className="text-center text-sm text-foreground">
                      {typeof row[2] === "boolean" ? (
                        row[2] ? (
                          <Check className="h-4 w-4 text-primary mx-auto" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                        )
                      ) : (
                        row[2]
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </motion.div>
      </section>

      {/* FAQ */}
      <section className="px-6 pb-28">
        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-center mb-10 text-foreground">
            Frequently asked <span className="text-gradient-primary">questions</span>
          </h2>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, idx) => (
              <AccordionItem
                key={idx}
                value={`faq-${idx}`}
                className="glass-card rounded-xl border-border/40 px-5"
              >
                <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline py-4">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </section>

      <Footer />
    </div>
    </AppLayout>
  );
};

export default PricingPage;
