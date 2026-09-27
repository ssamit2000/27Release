import Link from "next/link";

export function AppShell({ children, current = "Dashboard", action }: { children: React.ReactNode; current?: string; action?: React.ReactNode }) {
  return <div className="app-shell">
    <aside className="sidebar" aria-label="Primary navigation">
      <Link className="brand" href="/"><span className="brand-mark" aria-hidden="true">R/</span>ReleaseOps</Link>
      <div className="nav-label">Workspace</div>
      <nav>
        <Link className={`nav-link ${current === "Dashboard" ? "active" : ""}`} href="/"><span className="nav-symbol" aria-hidden="true">▦</span>Dashboard</Link>
        <Link className={`nav-link ${current === "Releases" ? "active" : ""}`} href="/#releases"><span className="nav-symbol" aria-hidden="true">≡</span>Releases</Link>
      </nav>
      <div className="side-bottom">RELEASE OPERATIONS / MVP</div>
    </aside>
    <div className="main">
      <header className="topbar"><div className="breadcrumb">Workspace <span aria-hidden="true">/</span> {current}</div><div className="top-actions">{action}</div></header>
      {children}
    </div>
  </div>;
}
