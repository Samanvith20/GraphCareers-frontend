export interface CareerRole {
  title: string;
  level: string;
  readiness: number;
  skillsNeeded: number;
  matchedSkills: string[];
  learnThese: string[];
  market: {
    totalJobs: number;
    avgSalary: string;
    topCompanies: string[];
  };
}

export interface CareerProgressionData {
  userProfile: {
    experience: string;
    skillsCount: number;
    targetLevel: string;
  };
  bestMatches: string[];
  currentRole: string;
  vertical: CareerRole[];
  horizontal: CareerRole[];
}

export const careerProgressionData: CareerProgressionData = {
  userProfile: {
    experience: "16 years",
    skillsCount: 36,
    targetLevel: "Senior or Lead",
  },
  bestMatches: ["Senior Full Stack Engineer", "Backend Architect", "Platform Engineer"],
  currentRole: "Senior Full Stack Engineer",
  vertical: [
    {
      title: "Staff Engineer",
      level: "Staff",
      readiness: 78,
      skillsNeeded: 5,
      matchedSkills: ["node.js", "react.js", "typescript", "aws", "docker"],
      learnThese: ["system design", "architecture patterns", "team mentoring", "stakeholder management", "cost optimization"],
      market: {
        totalJobs: 142,
        avgSalary: "₹45K - ₹85K",
        topCompanies: ["Google", "Microsoft", "Amazon", "Flipkart"],
      },
    },
    {
      title: "Principal Engineer",
      level: "Principal",
      readiness: 52,
      skillsNeeded: 9,
      matchedSkills: ["node.js", "react.js", "typescript"],
      learnThese: ["org-wide architecture", "tech strategy", "cross-team leadership", "RFC authoring", "performance budgets", "incident management", "vendor evaluation", "roadmap planning", "executive communication"],
      market: {
        totalJobs: 38,
        avgSalary: "₹80K - ₹150K",
        topCompanies: ["Google", "Meta", "Uber", "Stripe"],
      },
    },
    {
      title: "Engineering Manager",
      level: "Manager",
      readiness: 45,
      skillsNeeded: 8,
      matchedSkills: ["node.js", "typescript"],
      learnThese: ["people management", "hiring processes", "performance reviews", "sprint planning", "OKR setting", "budget management", "conflict resolution", "1:1 frameworks"],
      market: {
        totalJobs: 210,
        avgSalary: "₹50K - ₹100K",
        topCompanies: ["Amazon", "Swiggy", "Razorpay", "PhonePe"],
      },
    },
  ],
  horizontal: [
    {
      title: "DevOps / SRE Engineer",
      level: "Senior",
      readiness: 65,
      skillsNeeded: 6,
      matchedSkills: ["docker", "aws", "terraform", "linux", "github actions", "shell scripting"],
      learnThese: ["kubernetes", "prometheus", "grafana", "helm charts", "chaos engineering", "SLO/SLA management"],
      market: {
        totalJobs: 320,
        avgSalary: "₹35K - ₹70K",
        topCompanies: ["IBM", "Infosys", "TCS", "Wipro"],
      },
    },
    {
      title: "Data Engineer",
      level: "Mid-Senior",
      readiness: 40,
      skillsNeeded: 10,
      matchedSkills: ["python", "postgresql", "redis", "aws"],
      learnThese: ["apache spark", "airflow", "kafka", "data modeling", "ETL pipelines", "dbt", "snowflake", "data governance", "delta lake", "great expectations"],
      market: {
        totalJobs: 480,
        avgSalary: "₹30K - ₹65K",
        topCompanies: ["Flipkart", "Swiggy", "Walmart", "Deutsche Bank"],
      },
    },
    {
      title: "AI/ML Engineer",
      level: "Mid",
      readiness: 35,
      skillsNeeded: 12,
      matchedSkills: ["python", "openai", "anthropic", "rag pipelines"],
      learnThese: ["pytorch", "tensorflow", "model fine-tuning", "mlops", "feature stores", "experiment tracking", "hugging face", "langchain", "model deployment", "A/B testing", "statistics", "linear algebra"],
      market: {
        totalJobs: 560,
        avgSalary: "₹40K - ₹90K",
        topCompanies: ["Google", "Microsoft", "OpenAI", "Anthropic"],
      },
    },
  ],
};

// Variant with empty vertical
export const careerDataNoVertical: CareerProgressionData = {
  ...careerProgressionData,
  vertical: [],
};

// Variant with both empty
export const careerDataEmpty: CareerProgressionData = {
  ...careerProgressionData,
  vertical: [],
  horizontal: [],
};
