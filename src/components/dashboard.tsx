"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { ReleaseCard, ReleaseView } from "@/components/release-ui";
import { getReleaseStatus } from "@/lib/release-status";

export function Dashboard() {
  const [releases, setReleases] = useState<ReleaseView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/releases");
      if (!response.ok) throw new Error("Unable to load releases.");
      const result: { releases: ReleaseView[] } = await response.json();
      setReleases(result.releases);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load releases."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const planned = releases.filter((release) => getReleaseStatus(release.completedSteps) === "PLANNED").length;
  const completed = releases.filter((release) => getReleaseStatus(release.completedSteps) === "COMPLETED").length;
  const ongoing = releases.filter((release) => getReleaseStatus(release.completedSteps) === "ONGOING").length;
  return <AppShell current="Dashboard" action={<Link className="button button-primary" href="/create"><span aria-hidden="true">+</span> New Release</Link>}>
    <main className="main-content">
      <div className="page-heading"><div><h1>Release dashboard</h1><div className="subtitle">Readiness across planned and active releases.</div></div></div>
      <div className="summary-grid" aria-label="Release summary">
        <Summary label="All releases" value={releases.length} />
        <Summary label="Planned" value={planned} />
        <Summary label="Ongoing" value={ongoing} tone="amber" />
        <Summary label="Completed" value={completed} tone="green" />
      </div>
      <section id="releases" aria-labelledby="releases-title"><div className="section-heading"><span id="releases-title">Releases</span><span>{loading ? "SYNCING" : `${releases.length} TOTAL`}</span></div>
        {loading ? <div className="release-list" aria-label="Loading releases"><div className="skeleton" /><div className="skeleton" /><div className="skeleton" /></div> : error ? <div className="error-panel"><h2>Unable to load releases</h2><p>{error}</p><button type="button" className="button" onClick={() => void load()}>Try Again</button></div> : releases.length === 0 ? <div className="empty"><h2>No releases yet</h2><p>Create your first release checklist to start tracking deployment progress.</p><Link className="button button-primary" href="/create">+ New Release</Link></div> : <div className="release-list">{releases.map((release) => <ReleaseCard key={release.id} release={release} />)}</div>}
      </section>
    </main>
  </AppShell>;
}

function Summary({ label, value, tone }: { label: string; value: number; tone?: "green" | "amber" }) {
  return <div className="summary"><div className="summary-label">{label}</div><div className={`summary-value ${tone ?? ""}`}>{String(value).padStart(2, "0")}</div></div>;
}
