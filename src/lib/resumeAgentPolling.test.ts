import { describe, expect, it } from "vitest";
import { resumeAgentPollingTimeRemaining } from "@/lib/resumeAgentPolling";

describe("resumeAgentPollingTimeRemaining", () => {
  it("uses the durable server creation time when it is available", () => {
    expect(resumeAgentPollingTimeRemaining({
      createdAt: "2026-09-03T10:00:00.000Z",
      fallbackStartedAt: Date.parse("2026-09-03T10:01:00.000Z"),
      now: Date.parse("2026-09-03T10:01:30.000Z"),
      timeoutMs: 120_000,
    })).toBe(30_000);
  });

  it("never returns a negative timeout", () => {
    expect(resumeAgentPollingTimeRemaining({
      createdAt: "2026-09-03T10:00:00.000Z",
      fallbackStartedAt: 0,
      now: Date.parse("2026-09-03T10:05:00.000Z"),
      timeoutMs: 120_000,
    })).toBe(0);
  });
});
