export interface CareerRole {
  rank: number;
  role: string;
  matchedSkills: string[];
  missingSkills: string[];
  companies: string[];
  salary: string;
}

export interface CareerPathData {
  careerPath: CareerRole[];
}

export const careerPathData: CareerPathData = {
  careerPath: [
    {
      rank: 1,
      role: "Data Engineer",
      matchedSkills: ["python", "aws", "pipelines"],
      missingSkills: ["data", "engineering", "snowflake", "sql", "warehousing", "modeling", "oracle", "etl"],
      companies: [
        "Stefanini", "IBM", "Virtusa", "Iris Software", "Social Hr Pune",
        "Snappy Hires", "Fidelity International", "Mississippi Consultants Pune",
        "Bounteous x Accolite", "Equiniti India"
      ],
      salary: "₹6L - ₹9L"
    },
    {
      rank: 2,
      role: "Software Engineer / Developer",
      matchedSkills: ["python", "css", "javascript"],
      missingSkills: ["sap", "database", "ai", "oracle", "automation", "java", "life", "cycle"],
      companies: [
        "IBM", "Snappyhire", "Snappy Hires", "Suzva Software Technologies",
        "Teal And Terra", "VAK Consulting LLC", "Antier Solutions",
        "Khoj Information Technology Pvt Ltd", "Mufin Technologies", "Spectrum Talent Management"
      ],
      salary: "₹6L - ₹9L"
    },
    {
      rank: 3,
      role: "Software Developers",
      matchedSkills: ["css", "rest"],
      missingSkills: ["sap", "application", "database", "business", "processes", "hana", "language", "natural"],
      companies: [
        "IBM", "Volkswagen Group Technology Solution", "Sonyo Management Consultants",
        "Accenture", "Globallogic", "Sadup Soft", "Cargill", "IT SCIENT",
        "Capgemini", "Tekskills"
      ],
      salary: "₹4L - ₹7L"
    }
  ]
};
