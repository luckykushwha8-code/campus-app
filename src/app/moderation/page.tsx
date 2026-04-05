"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatRelative } from "date-fns";
import { ShieldAlert, RefreshCw, EyeOff, ShieldCheck, Undo2 } from "lucide-react";
import { useAppSession } from "@/hooks/use-app-session";

type ModerationReportItem = {
  id: string;
  targetType: "post" | "comment";
  targetId: string;
  status: "open" | "reviewed" | "dismissed";
  reason: string;
  createdAt: string;
  updatedAt: string;
  reporter: { id: string; name: string; email: string } | null;
  owner: { id: string; name: string; email: string } | null;
  target: {
    id: string;
    content: string;
    moderationStatus: "active" | "reported" | "removed";
    reportCount: number;
    createdAt: string;
  } | null;
};

export default function ModerationPage() {
  const { token, user, isAuthenticated } = useAppSession();
  const [reports, setReports] = useState<ModerationReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [busyAction, setBusyAction] = useState("");

  const loadReports = useCallback(async () => {
    if (!token || !isAuthenticated) {
      setReports([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setStatus("");
    try {
      const response = await fetch("/api/moderation/reports", {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setStatus(data.error || "Unable to load reports.");
        setReports([]);
        return;
      }

      setReports(data.reports || []);
    } catch {
      setStatus("Unable to load reports.");
    } finally {
      setIsLoading(false);
    }
  }, [token, isAuthenticated]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const openReports = useMemo(() => reports.filter((item) => item.status === "open"), [reports]);

  async function takeAction(reportId: string, action: "dismiss" | "remove" | "restore") {
    if (!token) {
      return;
    }

    setBusyAction(`${reportId}:${action}`);
    setStatus("");
    try {
      const response = await fetch("/api/moderation/reports", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reportId, action }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setStatus(data.error || "Unable to update this report.");
        return;
      }

      await loadReports();
    } catch {
      setStatus("Unable to update this report.");
    } finally {
      setBusyAction("");
    }
  }

  if (!isAuthenticated) {
    return <CenteredState title="Sign in required" message="You need an authenticated admin account to review moderation reports." />;
  }

  if (user?.role !== "admin") {
    return <CenteredState title="Admin access only" message="This review screen is only available to admin accounts." />;
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="mx-auto max-w-screen-xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-[var(--border-color)] bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--accent)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              <ShieldAlert className="h-3.5 w-3.5" />
              Moderation queue
            </div>
            <h1 className="text-title font-semibold text-[var(--text-primary)]">Review reported content</h1>
            <p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)]">
              Review open reports, remove abusive content, or restore items that were reported by mistake.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-3 text-sm text-[var(--text-secondary)]">
              <span className="font-semibold text-[var(--text-primary)]">{openReports.length}</span> open reports
            </div>
            <button className="button-outline gap-2" onClick={loadReports} type="button">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        {status ? (
          <div className="mb-4 rounded-2xl border border-[var(--border-color)] bg-white px-4 py-3 text-sm text-[var(--text-secondary)]">
            {status}
          </div>
        ) : null}

        {isLoading ? (
          <CenteredState title="Loading moderation queue" message="Pulling the latest reports and content state." />
        ) : reports.length ? (
          <div className="space-y-4">
            {reports.map((report) => {
              const isBusy = busyAction.startsWith(`${report.id}:`);
              const isRemoved = report.target?.moderationStatus === "removed";
              return (
                <div key={report.id} className="rounded-3xl border border-[var(--border-color)] bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
                  <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">
                        <span>{report.targetType}</span>
                        <span>•</span>
                        <span>{report.status}</span>
                        <span>•</span>
                        <span>{formatRelative(new Date(report.createdAt), new Date())}</span>
                      </div>
                      <h2 className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
                        {report.targetType === "post" ? "Reported post" : "Reported comment"}
                      </h2>
                      <p className="mt-2 text-sm text-[var(--text-secondary)]">
                        <span className="font-medium text-[var(--text-primary)]">Reason:</span> {report.reason}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <ActionButton
                        disabled={isBusy || report.status !== "open"}
                        icon={<ShieldCheck className="h-4 w-4" />}
                        label="Dismiss"
                        onClick={() => takeAction(report.id, "dismiss")}
                      />
                      <ActionButton
                        disabled={isBusy || report.status !== "open"}
                        icon={<EyeOff className="h-4 w-4" />}
                        label={isRemoved ? "Already removed" : "Remove content"}
                        onClick={() => takeAction(report.id, "remove")}
                      />
                      <ActionButton
                        disabled={isBusy || !report.target || report.target.moderationStatus === "active"}
                        icon={<Undo2 className="h-4 w-4" />}
                        label="Restore"
                        onClick={() => takeAction(report.id, "restore")}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
                    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">Content snapshot</p>
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[var(--text-primary)]">
                        {report.target?.content?.trim() || "This content is no longer available."}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <MetaCard label="Target state" value={report.target?.moderationStatus || "missing"} />
                      <MetaCard label="Open report count" value={String(report.target?.reportCount || 0)} />
                      <MetaCard
                        label="Reporter"
                        value={report.reporter ? `${report.reporter.name} (${report.reporter.email})` : "Unknown"}
                      />
                      <MetaCard
                        label="Content owner"
                        value={report.owner ? `${report.owner.name} (${report.owner.email})` : "Unknown"}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <CenteredState title="No reports right now" message="The moderation queue is clear. New reports will show up here automatically." />
        )}
      </div>
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  icon,
  disabled,
}: {
  label: string;
  onClick: () => void;
  icon: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      className="inline-flex items-center gap-2 rounded-full border border-[var(--border-color)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition hover:bg-[var(--bg-secondary)] disabled:cursor-not-allowed disabled:opacity-50"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {icon}
      {label}
    </button>
  );
}

function MetaCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">{label}</p>
      <p className="mt-2 text-sm text-[var(--text-primary)]">{value}</p>
    </div>
  );
}

function CenteredState({ title, message }: { title: string; message: string }) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="mx-auto flex max-w-screen-md items-center justify-center px-4 py-16">
        <div className="w-full rounded-3xl border border-dashed border-[var(--border-color)] bg-white px-6 py-12 text-center">
          <p className="text-lg font-semibold text-[var(--text-primary)]">{title}</p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">{message}</p>
        </div>
      </div>
    </div>
  );
}
