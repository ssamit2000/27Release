"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";

export function CreateReleaseForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [info, setInfo] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [requestError, setRequestError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setErrors({}); setRequestError("");
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = "Release name is required.";
    else if (name.trim().length > 80) nextErrors.name = "Use 80 characters or fewer.";
    if (!date) nextErrors.date = "Release date is required.";
    if (info.length > 2000) nextErrors.additionalInfo = "Use 2,000 characters or fewer.";
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return; }
    setSaving(true);
    try {
      const response = await fetch("/api/releases", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, date, additionalInfo: info }) });
      const payload = await response.json();
      if (!response.ok) {
        if (payload.error?.details) {
          const fieldErrors: Record<string, string> = {};
          for (const [field, messages] of Object.entries(payload.error.details as Record<string, string[]>)) fieldErrors[field] = messages[0] ?? "Invalid value.";
          setErrors(fieldErrors);
        }
        throw new Error(payload.error?.message ?? "Unable to create release.");
      }
      router.push(`/releases/${payload.release.id}`);
    } catch (error) { setRequestError(error instanceof Error ? error.message : "Unable to create release."); }
    finally { setSaving(false); }
  }

  return <AppShell current="Releases"><main className="main-content form-layout">
    <div className="page-heading"><div><h1>New release</h1><div className="subtitle">Set the release target and start with a clean checklist.</div></div></div>
    {requestError && <div className="error-banner" role="alert">{requestError}</div>}
    <form className="form-panel" onSubmit={submit} noValidate>
      <div className="field"><label htmlFor="release-name">Release name</label><input id="release-name" className="input" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. v2.8.0" maxLength={80} aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined} />{errors.name && <span className="field-error" id="name-error">{errors.name}</span>}</div>
      <div className="field"><label htmlFor="release-date">Release date</label><input id="release-date" className="input" type="date" value={date} onChange={(event) => setDate(event.target.value)} aria-invalid={!!errors.date} aria-describedby={errors.date ? "date-error" : undefined} />{errors.date && <span className="field-error" id="date-error">{errors.date}</span>}</div>
      <div className="field"><label htmlFor="additional-info">Additional information <span className="field-hint">Optional</span></label><textarea id="additional-info" className="textarea" value={info} onChange={(event) => setInfo(event.target.value)} placeholder="Context, rollout notes, or a deployment window" maxLength={2000} aria-invalid={!!errors.additionalInfo} aria-describedby={errors.additionalInfo ? "info-error" : undefined} />{errors.additionalInfo && <span className="field-error" id="info-error">{errors.additionalInfo}</span>}</div>
      <div className="form-footer"><Link className="button button-quiet" href="/">Cancel</Link><button className="button button-primary" type="submit" disabled={saving}>{saving ? "Creating…" : "Create Release"}</button></div>
    </form>
  </main></AppShell>;
}
