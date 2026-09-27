import Link from "next/link";
import { getReleaseProgress, getReleaseStatus, ReleaseStatus } from "@/lib/release-status";

export function StatusBadge({ status }: { status: ReleaseStatus }) {
  return <span className={`status status-${status.toLowerCase()}`}>{status}</span>;
}

export function ProgressBar({ completedSteps }: { completedSteps: readonly string[] }) {
  const progress = getReleaseProgress(completedSteps);
  return <div className="progress-line" aria-label={`${progress.completed} of ${progress.total} checklist steps completed`}>
    <div className="progress-track" role="progressbar" aria-valuenow={progress.completed} aria-valuemin={0} aria-valuemax={progress.total} aria-label="Release checklist progress"><div className="progress-fill" style={{ width: `${progress.percentage}%` }} /></div>
    <span className="progress-count">{progress.completed} / {progress.total}</span>
  </div>;
}

export type ReleaseView = { id: string; name: string; date: string; additionalInfo: string; completedSteps: string[]; createdAt: string; updatedAt: string };

export function ReleaseCard({ release }: { release: ReleaseView }) {
  const status = getReleaseStatus(release.completedSteps);
  return <Link className="release-row" href={`/releases/${release.id}`}>
    <div className="release-titleline"><span className="release-name">{release.name}</span><StatusBadge status={status} /></div>
    <div className="release-date">Target {new Date(`${release.date.slice(0, 10)}T00:00:00`).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</div>
    {release.additionalInfo && <div className="release-desc">{release.additionalInfo}</div>}
    <ProgressBar completedSteps={release.completedSteps} />
    <div className="row-foot"><span>Updated {new Date(release.updatedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</span><span aria-hidden="true">Open release →</span></div>
  </Link>;
}
