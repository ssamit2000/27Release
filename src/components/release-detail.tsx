"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ProgressBar, ReleaseView, StatusBadge } from "@/components/release-ui";
import { RELEASE_STEPS } from "@/lib/steps";
import { getReleaseStatus } from "@/lib/release-status";

type Props = { id: string };

export function ReleaseDetail({ id }: Props) {
  const router = useRouter();
  const [release, setRelease] = useState<ReleaseView | null>(null);
  const [steps, setSteps] = useState<string[]>([]);
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState("");
  const cancelRef = useRef<HTMLButtonElement>(null);
  const deleteTriggerRef = useRef<HTMLButtonElement>(null);
  const dirty = !!release && (info !== release.additionalInfo || steps.length !== release.completedSteps.length || steps.some((step) => !release.completedSteps.includes(step)));

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch(`/api/releases/${id}`);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message ?? "Unable to load release.");
      setRelease(payload.release); setSteps(payload.release.completedSteps); setInfo(payload.release.additionalInfo); setSaved(false);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load release."); }
    finally { setLoading(false); }
  }, [id]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  useEffect(() => {
    if (!deleteOpen) return;
    const trigger = deleteTriggerRef.current;
    cancelRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDeleteOpen(false);
      if (event.key === "Tab") {
        const buttons = document.querySelectorAll<HTMLButtonElement>(".dialog button:not(:disabled)");
        const first = buttons[0]; const last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); trigger?.focus(); };
  }, [deleteOpen]);

  async function save() {
    setSaving(true); setSaved(false); setActionError("");
    try {
      const response = await fetch(`/api/releases/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ completedSteps: steps, additionalInfo: info }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message ?? "Unable to save changes.");
      setRelease(payload.release); setSteps(payload.release.completedSteps); setInfo(payload.release.additionalInfo); setSaved(true);
    } catch (cause) { setActionError(cause instanceof Error ? cause.message : "Unable to save changes."); }
    finally { setSaving(false); }
  }

  async function remove() {
    setDeleting(true); setActionError("");
    try {
      const response = await fetch(`/api/releases/${id}`, { method: "DELETE" });
      if (!response.ok) { const payload = await response.json(); throw new Error(payload.error?.message ?? "Unable to delete release."); }
      router.push("/"); router.refresh();
    } catch (cause) { setActionError(cause instanceof Error ? cause.message : "Unable to delete release."); setDeleteOpen(false); }
    finally { setDeleting(false); }
  }

  if (loading) return <AppShell current="Releases"><main className="main-content"><div className="skeleton" /><div style={{ height: 12 }} /><div className="skeleton" /></main></AppShell>;
  if (error || !release) return <AppShell current="Releases"><main className="main-content"><div className="error-panel"><h2>Unable to load release</h2><p>{error || "Release not found."}</p><div className="top-actions" style={{ justifyContent: "center" }}><button className="button" onClick={() => void load()}>Try Again</button><Link className="button button-quiet" href="/">Back to releases</Link></div></div></main></AppShell>;

  const status = getReleaseStatus(steps);
  return <AppShell current="Releases"><main className="main-content">
    <div className="page-heading"><div><Link className="subtitle" href="/">← Releases</Link><h1 style={{ marginTop: 12 }}>{release.name}</h1><div className="detail-meta"><span>TARGET {new Date(`${release.date.slice(0, 10)}T00:00:00`).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</span><StatusBadge status={status} /></div></div></div>
    {actionError && <div className="error-banner" role="alert">{actionError}</div>}
    <section className="detail-progress" aria-label="Release progress"><div className="detail-progress-top"><span>CHECKLIST PROGRESS</span><span>{steps.length} / {RELEASE_STEPS.length} COMPLETE</span></div><ProgressBar completedSteps={steps} /></section>
    <div className="detail-grid"><section className="detail-panel"><div className="panel-heading">RELEASE CHECKLIST</div><div className="checklist">{RELEASE_STEPS.map((step) => <label className={`check-row ${steps.includes(step) ? "done" : ""}`} key={step}><input type="checkbox" checked={steps.includes(step)} onChange={(event) => { setSteps((current) => event.target.checked ? [...current, step] : current.filter((item) => item !== step)); setSaved(false); }} /><span>{step}</span></label>)}</div></section>
      <section className="detail-panel"><div className="panel-heading">ADDITIONAL INFORMATION</div><div className="info-body"><label className="field" htmlFor="release-info"><span className="field-hint">Release context and rollout notes</span><textarea id="release-info" className="textarea" value={info} maxLength={2000} onChange={(event) => { setInfo(event.target.value); setSaved(false); }} placeholder="No additional information" /></label><div className="save-bar"><span className={`save-state ${dirty ? "dirty" : saved ? "saved" : ""}`} aria-live="polite">{saving ? "Saving…" : dirty ? "Unsaved changes" : saved ? "Saved" : "Up to date"}</span><button className="button button-primary" disabled={!dirty || saving} onClick={() => void save()}>{saving ? "Saving…" : "Save Changes"}</button></div></div></section></div>
    <section className="danger-zone"><h2>Delete release</h2><p>Remove this release and its checklist permanently.</p><button ref={deleteTriggerRef} className="button button-danger" onClick={() => setDeleteOpen(true)}>Delete Release</button></section>
    {deleteOpen && <div className="dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setDeleteOpen(false); }}><section className="dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-title" aria-describedby="delete-description"><h2 id="delete-title">Delete release?</h2><p id="delete-description">This action cannot be undone. <strong>{release.name}</strong> and its checklist will be permanently removed.</p><div className="dialog-actions"><button ref={cancelRef} className="button" onClick={() => setDeleteOpen(false)}>Cancel</button><button className="button button-danger" disabled={deleting} onClick={() => void remove()}>{deleting ? "Deleting…" : "Delete Release"}</button></div></section></div>}
  </main></AppShell>;
}
