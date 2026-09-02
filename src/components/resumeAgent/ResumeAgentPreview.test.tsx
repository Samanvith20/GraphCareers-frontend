import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ResumeAgentPreview } from "./ResumeAgentPreview";

describe("ResumeAgentPreview", () => {
  it("renders the parsed master shape as a protected generated version", () => {
    render(
      <ResumeAgentPreview
        versionNumber={3}
        snapshot={{
          contact: { name: "Asha Rao", email: "asha@example.com" },
          summary: "Backend engineer focused on reliable distributed systems.",
          experience: [{ company: "Graph Labs", role: "Engineer", description: ["Built reliable APIs."] }],
          projects: [{ name: "Job Graph", techStack: ["Node.js", "PostgreSQL"], description: ["Created a job ingestion pipeline."] }],
          skills: { Backend: ["Node.js"], Database: ["PostgreSQL"] },
          education: [{ institution: "Example University", degree: "B.Tech" }],
          certifications: ["Cloud Fundamentals"],
        }}
      />,
    );

    expect(screen.getByText("Asha Rao")).toBeInTheDocument();
    expect(screen.getByText("Built reliable APIs.")).toBeInTheDocument();
    expect(screen.getByText(/Version 3 · master protected/)).toBeInTheDocument();
    expect(screen.getByText("Cloud Fundamentals")).toBeInTheDocument();
  });
});
