import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useJobPreferences, useJobRoles, type JobFeedContext } from "@/hooks/useJobPreferences";

const schema = z.object({
  role: z.string().max(120),
  locationChoice: z.enum(["unknown", "any", "specific"]),
  location: z.string().trim().max(120),
  workMode: z.enum(["unknown", "any", "remote", "hybrid", "onsite"]),
  employmentType: z.enum(["unknown", "any", "full-time", "part-time", "contract", "internship"]),
}).refine(value => value.locationChoice !== "specific" || value.location.length > 0, {
  path: ["location"], message: "Enter a city or choose Any location / Not answered.",
});
type Form = z.infer<typeof schema>;
const selectClass = "w-full rounded-md border border-input bg-background p-2 text-sm text-foreground";
const fromChoice = (value: string) => value === "unknown" ? null : value === "any" ? [] : [value];

export function JobPreferencesPanel({ feed }: { feed?: JobFeedContext }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const preferences = useJobPreferences();
  const roles = useJobRoles(debouncedSearch, open);
  const form = useForm<Form>({ resolver: zodResolver(schema), defaultValues: {
    role: "unknown", locationChoice: "unknown", location: "", workMode: "unknown", employmentType: "unknown",
  } });
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);
  useEffect(() => {
    const p = preferences.data?.preferences;
    if (!p) return;
    form.reset({
      role: p.desiredRoles == null ? "unknown" : p.desiredRoles[0] || "any",
      locationChoice: p.locations == null ? "unknown" : p.locations.length ? "specific" : "any",
      location: p.locations?.[0] || "",
      workMode: (p.workModes == null ? "unknown" : p.workModes[0] || "any") as Form["workMode"],
      employmentType: (p.employmentTypes == null ? "unknown" : p.employmentTypes[0] || "any") as Form["employmentType"],
    });
  }, [preferences.data, form]);
  const selectedRole = form.watch("role");
  const roleOptions = Array.from(new Set([...(roles.data?.roles || []), ...(!["unknown", "any"].includes(selectedRole) ? [selectedRole] : [])]));

  return <section className="rounded-xl border border-border bg-card p-4 space-y-3">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="font-semibold text-foreground">Make these jobs more relevant</h2>
        <p className="text-sm text-muted-foreground">Preferences are optional. Start with a role, or browse now.</p>
      </div>
      <Button variant="outline" onClick={() => setOpen(!open)}>{open ? "Skip for now" : "Edit job preferences"}</Button>
    </div>
    {feed?.warnings.map(warning => <p key={warning} className="text-xs text-muted-foreground">{warning}</p>)}
    {!feed?.hasSkills && <Link className="text-sm text-primary underline" to="/profile">Add skills or upload a resume to see skill coverage</Link>}
    {open && preferences.isLoading && <p role="status">Loading preferences…</p>}
    {open && preferences.isError && <div role="alert"><p>Unable to load preferences. You can still browse jobs.</p><Button variant="outline" onClick={() => preferences.refetch()}>Retry</Button></div>}
    {open && preferences.data && <form className="space-y-4" onSubmit={form.handleSubmit(async values => {
      // Only save edited fields; preserve other preferences and multi-select values.
      const dirty = form.formState.dirtyFields;
      const patch = {
        ...(dirty.role ? { desiredRoles: fromChoice(values.role) } : {}),
        ...(dirty.locationChoice || dirty.location ? { locations: values.locationChoice === "unknown" ? null : values.locationChoice === "any" ? [] : [values.location] } : {}),
        ...(dirty.workMode ? { workModes: fromChoice(values.workMode) } : {}),
        ...(dirty.employmentType ? { employmentTypes: fromChoice(values.employmentType) } : {}),
      };
      if (!Object.keys(patch).length) { setOpen(false); return; }
      try { await preferences.save.mutateAsync(patch); setOpen(false); } catch { /* Hook displays the error; preserve form for retry. */ }
    })}>
      <label className="block space-y-2 text-sm">Search available roles
        <Input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search roles in recent listings" />
      </label>
      <label className="block space-y-2 text-sm">Desired role
        <select className={selectClass} {...form.register("role")}>
          <option value="unknown">Not answered</option><option value="any">Any role</option>
          {roleOptions.map(role => <option key={role} value={role}>{role}</option>)}
        </select>
      </label>
      {roles.isLoading && <p role="status" className="text-sm">Loading available roles…</p>}
      {roles.isError && <p role="alert" className="text-sm">{roles.error.message}</p>}
      <details className="space-y-3"><summary className="cursor-pointer text-sm text-primary">Optional: location and work preferences</summary>
        <p className="text-xs text-muted-foreground">Specific choices filter listings. Not answered leaves them unrestricted; Any records that you are open to all.</p>
        <label className="block text-sm">Location preference
          <select className={selectClass} {...form.register("locationChoice")}><option value="unknown">Not answered</option><option value="any">Any location</option><option value="specific">Only this city / area</option></select>
        </label>
        {form.watch("locationChoice") === "specific" && <label className="block text-sm">City / area<Input {...form.register("location")} placeholder="Hyderabad" /></label>}
        {form.formState.errors.location && <p role="alert" className="text-sm text-destructive">{form.formState.errors.location.message}</p>}
        <label className="block text-sm">Work arrangement<select className={selectClass} {...form.register("workMode")}><option value="unknown">Not answered</option><option value="any">Any work mode</option><option value="remote">Remote only</option><option value="hybrid">Hybrid only</option><option value="onsite">Office only</option></select></label>
        <label className="block text-sm">Employment type<select className={selectClass} {...form.register("employmentType")}><option value="unknown">Not answered</option><option value="any">Any employment type</option><option value="full-time">Full-time</option><option value="part-time">Part-time</option><option value="contract">Contract</option><option value="internship">Internship</option></select></label>
      </details>
      {preferences.save.isError && <p role="alert" className="text-sm text-destructive">{preferences.save.error.message}</p>}
      <Button disabled={preferences.save.isPending} type="submit">{preferences.save.isPending ? "Saving…" : "Save preferences"}</Button>
    </form>}
  </section>;
}
