interface PollingDeadlineInput {
  createdAt?: string | null;
  fallbackStartedAt: number;
  now: number;
  timeoutMs: number;
}

export function resumeAgentPollingTimeRemaining({
  createdAt,
  fallbackStartedAt,
  now,
  timeoutMs,
}: PollingDeadlineInput) {
  const serverStartedAt = createdAt ? Date.parse(createdAt) : NaN;
  const startedAt = Number.isFinite(serverStartedAt) ? serverStartedAt : fallbackStartedAt;
  return Math.max(0, timeoutMs - Math.max(0, now - startedAt));
}
