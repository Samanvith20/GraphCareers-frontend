import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { JobPreferencesPanel } from "@/components/jobs/JobPreferencesPanel";

const mocks = vi.hoisted(() => ({ save: vi.fn(), preferences: { desiredRoles: null, locations: null, workModes: null, employmentTypes: null } }));
vi.mock("@/hooks/useJobPreferences", () => {
  const data = { preferences: mocks.preferences };
  return {
  useJobPreferences: () => ({ data, save: { mutateAsync: mocks.save, isPending: false }, isLoading: false }),
  useJobRoles: () => ({ data: { roles: ["backend developer", "frontend developer"] } }),
  };
});
const renderPanel = () => render(<MemoryRouter><JobPreferencesPanel feed={{ mode: "explore", title: "Explore recent jobs", description: "Recent listings", hasSkills: false, experienceKnown: false, unanswered: ["desiredRoles"], warnings: ["Experience is unknown"] }} /></MemoryRouter>);

describe("optional job preferences", () => {
  beforeEach(() => { mocks.save.mockReset(); mocks.save.mockResolvedValue({}); });
  it("allows browsing without opening or submitting a form", () => {
    renderPanel();
    expect(screen.queryByRole("button", { name: "Save preferences" })).not.toBeInTheDocument();
    expect(screen.getByText("Experience is unknown")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/profile");
    expect(mocks.save).not.toHaveBeenCalled();
  });
  it("skips without saving or changing the master resume", () => {
    renderPanel();
    fireEvent.click(screen.getByRole("button", { name: "Edit job preferences" }));
    fireEvent.click(screen.getByRole("button", { name: "Skip for now" }));
    expect(mocks.save).not.toHaveBeenCalled();
  });
  it("saves only a selected role; other choices remain unanswered", async () => {
    renderPanel();
    fireEvent.click(screen.getByRole("button", { name: "Edit job preferences" }));
    fireEvent.change(screen.getByLabelText("Desired role"), { target: { value: "backend developer" } });
    fireEvent.click(screen.getByRole("button", { name: "Save preferences" }));
    await waitFor(() => expect(mocks.save).toHaveBeenCalledWith({ desiredRoles: ["backend developer"] }));
  });
  it("stores Any location distinctly from Not answered", async () => {
    renderPanel();
    fireEvent.click(screen.getByRole("button", { name: "Edit job preferences" }));
    fireEvent.change(screen.getByLabelText("Location preference"), { target: { value: "any" } });
    fireEvent.click(screen.getByRole("button", { name: "Save preferences" }));
    await waitFor(() => expect(mocks.save).toHaveBeenCalledWith({ locations: [] }));
  });
  it("rejects a specific location without a city", async () => {
    renderPanel();
    fireEvent.click(screen.getByRole("button", { name: "Edit job preferences" }));
    fireEvent.change(screen.getByLabelText("Location preference"), { target: { value: "specific" } });
    fireEvent.click(screen.getByRole("button", { name: "Save preferences" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Enter a city");
    expect(mocks.save).not.toHaveBeenCalled();
  });
});
