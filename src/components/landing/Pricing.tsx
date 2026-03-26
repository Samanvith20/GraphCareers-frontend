import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useRazorpayPayment } from "@/hooks/useRazorpay";

const plans = [
{
name: "Starter",
price: "Free",
period: "",
description: "Start exploring your career with powerful AI tools — no payment needed.",
features: [
"🎁 Get 10 free credits to try everything",
"Unlimited job matches",
"Basic career roadmap",
"Unlimited job tracking",
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

],
note: "Cancel anytime • No hidden charges",
cta: "Upgrade to Pro",
popular: true,
},
];


const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const Pricing = () => {
  const { startPayment, loading } = useRazorpayPayment();
  return (
    <section className="relative py-10 px-6 section-glow">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Badge variant="glow" className="mb-4 px-4 py-1.5">
            Simple Pricing
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Start free.{" "}
            <span className="text-gradient-primary">Upgrade when you're ready.</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Most users discover better job matches within 7 days.
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {plans.map((plan) => (
            <motion.div key={plan.name} variants={cardVariants}>
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
                    <span className="text-4xl font-extrabold text-foreground">{plan.price}</span>
                    {plan.period && (
                      <span className="text-muted-foreground text-sm">{plan.period}</span>
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

        {/* Why Upgrade strip */}
        <motion.div
          className="mt-16 glass-card rounded-2xl p-6 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p className="text-sm font-semibold text-foreground mb-3 text-center">Why upgrade?</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            <p className="text-xs text-muted-foreground">🎯 Jobs you actually qualify for</p>
            <p className="text-xs text-muted-foreground">📈 Know what skills to learn next</p>
            <p className="text-xs text-muted-foreground">⏱ Save 10+ hrs/week searching</p>
            <p className="text-xs text-muted-foreground">🤖 Personalized career guidance</p>
          </div>
        </motion.div>

        {/* Link to full pricing */}
        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <Link
            to="/pricing"
            className="text-sm text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1"
          >
            Compare plans in detail
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;
