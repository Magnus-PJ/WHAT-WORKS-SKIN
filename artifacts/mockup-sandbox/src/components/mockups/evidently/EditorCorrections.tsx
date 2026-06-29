// EditorCorrections — editor-only inbox for reader-submitted
// corrections. Closes the loop on the public `POST /api/corrections`
// form (the "Submit a correction" CTA in the site footer + the page
// at `/corrections`): editors see fresh submissions newest-first,
// triage them through `new → triaged → applied | dismissed`, and
// jot an internal note ("dup of #41", "asked the reader for a
// screenshot") without ever touching the database directly.
//
// Auth + visual chrome mirror `EditorTrendQueue` so editors only
// learn one sign-in flow and one card layout across the desk.

import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ExternalLink, RefreshCw } from "lucide-react";
import {
  SiteHeader,
  SiteFooter,
  Container,
  Eyebrow,
  PaperGrain,
  LaidPaper,
  TopVignette,
  SERIF,
  SERIF_ED,
  SANS,
  MONO,
} from "./_chrome";
import { T } from "./_theme";
import { invalidateEditorModeCache } from "./_editorMode";

// ─────────────────────────────────────────────────────────────────────
// Wire types — mirror the OpenAPI `CorrectionRecord` shape so this
// file can be developed without dragging `@workspace/api-zod` into
// the mockup-sandbox preview server.
// ─────────────────────────────────────────────────────────────────────
type CorrectionStatus = "new" | "triaged" | "applied" | "dismissed";
type StatusFilter = CorrectionStatus | "all";

type CorrectionRecord = {
  id: number;
  createdAt: string;
  updatedAt: string;
  pageUrl: string;
  description: string;
  evidenceUrl: string | null;
  submitterEmail: string | null;
  userAgent: string | null;
  status: CorrectionStatus;
  internalNote: string | null;
};

type CorrectionsList = {
  status: StatusFilter;
  corrections: CorrectionRecord[];
};

const ENDPOINT = "/api/editor/corrections";
const SIGN_IN_ENDPOINT = "/api/editor/sign-in";

const STATUS_CHIPS: Array<{ id: StatusFilter; label: string }> = [
  { id: "new", label: "New" },
  { id: "triaged", label: "Triaged" },
  { id: "applied", label: "Applied" },
  { id: "dismissed", label: "Dismissed" },
  { id: "all", label: "All" },
];

const STATUS_OPTIONS: CorrectionStatus[] = [
  "new",
  "triaged",
  "applied",
  "dismissed",
];

const STATUS_TINT: Record<
  CorrectionStatus,
  { fg: string; bg: string; label: string }
> = {
  new: { fg: T.accent, bg: T.accentSoft, label: "New" },
  triaged: { fg: T.warning, bg: T.warningSoft, label: "Triaged" },
  applied: { fg: T.ok, bg: T.okSoft, label: "Applied" },
  dismissed: { fg: T.muted, bg: T.paper2, label: "Dismissed" },
};

// ─────────────────────────────────────────────────────────────────────
// Auth-aware fetch.
// ─────────────────────────────────────────────────────────────────────
class EditorAuthRequiredError extends Error {
  constructor() {
    super("Editor auth required");
    this.name = "EditorAuthRequiredError";
  }
}

async function fetchInbox(status: StatusFilter): Promise<CorrectionsList> {
  const res = await fetch(`${ENDPOINT}?status=${status}`, {
    method: "GET",
    headers: { accept: "application/json" },
    credentials: "include",
  });
  if (res.status === 401) throw new EditorAuthRequiredError();
  if (!res.ok) {
    throw new Error(`Failed to load inbox: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as CorrectionsList;
}

async function patchCorrection(
  id: number,
  body: { status?: CorrectionStatus; internalNote?: string | null },
): Promise<CorrectionRecord> {
  const res = await fetch(`${ENDPOINT}/${id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json", accept: "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (res.status === 401) throw new EditorAuthRequiredError();
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Update failed: ${res.status} ${text}`);
  }
  return (await res.json()) as CorrectionRecord;
}

async function signInEditor(token: string): Promise<void> {
  const res = await fetch(SIGN_IN_ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    credentials: "include",
    body: JSON.stringify({ token }),
  });
  if (res.status === 401) {
    throw new Error("That editor token wasn't accepted. Double-check it.");
  }
  if (!res.ok) {
    throw new Error(`Sign-in failed: ${res.status} ${res.statusText}`);
  }
  invalidateEditorModeCache();
}

// ─────────────────────────────────────────────────────────────────────
// Helpers.
// ─────────────────────────────────────────────────────────────────────
function formatRelative(iso: string, now: number): string {
  const t = new Date(iso).getTime();
  const diff = Math.max(0, now - t);
  const min = Math.round(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.round(hr / 24);
  if (d < 14) return `${d}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// SLA clock per the published five-rule policy on `/corrections`:
// typo / clarification gets 24h; substantive (factual / interpretive
// / retraction) gets 7 days. Editors don't classify severity in the
// inbox today, so the badge applies the longer 7-day default and
// flips to a danger tint once the row has spent more than that
// awaiting triage. `applied` and `dismissed` rows clear the badge —
// the work is done.
const SLA_HOURS = 7 * 24;

function slaBadge(row: CorrectionRecord, now: number): {
  label: string;
  tone: "ok" | "warn" | "over";
} | null {
  if (row.status === "applied" || row.status === "dismissed") return null;
  const ageMs = now - new Date(row.createdAt).getTime();
  const ageHrs = ageMs / 3_600_000;
  if (ageHrs >= SLA_HOURS) {
    return {
      label: `SLA breached · ${Math.round(ageHrs / 24)}d open`,
      tone: "over",
    };
  }
  if (ageHrs >= SLA_HOURS * 0.7) {
    return {
      label: `SLA tight · ${Math.round(SLA_HOURS - ageHrs)}h left`,
      tone: "warn",
    };
  }
  return {
    label: `${Math.round(SLA_HOURS - ageHrs)}h within SLA`,
    tone: "ok",
  };
}

const StatusBadge: React.FC<{ status: CorrectionStatus }> = ({ status }) => {
  const tint = STATUS_TINT[status];
  return (
    <span
      style={{
        fontFamily: SANS,
        fontSize: 9.5,
        letterSpacing: "0.16em",
        fontWeight: 700,
        color: tint.fg,
        background: tint.bg,
        border: `1px solid ${tint.fg}55`,
        padding: "2px 7px",
        borderRadius: 2,
        textTransform: "uppercase",
      }}
    >
      {tint.label}
    </span>
  );
};

const Chip: React.FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      fontFamily: SANS,
      fontSize: 12.5,
      fontWeight: active ? 600 : 500,
      letterSpacing: "0.02em",
      color: active ? T.paper : T.inkSoft,
      background: active ? T.ink : T.paper,
      border: `1px solid ${active ? T.ink : T.rule}`,
      padding: "7px 14px",
      borderRadius: 999,
      cursor: "pointer",
    }}
  >
    {children}
  </button>
);

// ─────────────────────────────────────────────────────────────────────
// Correction card.
// ─────────────────────────────────────────────────────────────────────
const CorrectionCard: React.FC<{
  row: CorrectionRecord;
  now: number;
  onUpdated: (next: CorrectionRecord) => void;
  onAuthLost: () => void;
}> = ({ row, now, onUpdated, onAuthLost }) => {
  const [savingStatus, setSavingStatus] = useState(false);
  const [noteDraft, setNoteDraft] = useState(row.internalNote ?? "");
  const [savingNote, setSavingNote] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // If the row's note changes upstream (e.g. we pulled a fresh list
  // and this card is showing the same id), sync the textarea draft so
  // the editor isn't editing stale state.
  useEffect(() => {
    setNoteDraft(row.internalNote ?? "");
  }, [row.id, row.internalNote]);

  const sla = slaBadge(row, now);

  const changeStatus = async (next: CorrectionStatus): Promise<void> => {
    if (next === row.status || savingStatus) return;
    setSavingStatus(true);
    setErr(null);
    try {
      const updated = await patchCorrection(row.id, { status: next });
      onUpdated(updated);
    } catch (e) {
      if (e instanceof EditorAuthRequiredError) {
        onAuthLost();
        return;
      }
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setSavingStatus(false);
    }
  };

  const saveNote = async (): Promise<void> => {
    if (savingNote) return;
    const trimmed = noteDraft.trim();
    // Treat an empty draft as "clear the note" so the only way to
    // record a literal empty string is unreachable — there's no point
    // persisting whitespace. `null` round-trips through the PATCH
    // endpoint as the explicit clear signal.
    const next: string | null = trimmed.length === 0 ? null : trimmed;
    if ((row.internalNote ?? null) === next) return;
    setSavingNote(true);
    setErr(null);
    try {
      const updated = await patchCorrection(row.id, { internalNote: next });
      onUpdated(updated);
    } catch (e) {
      if (e instanceof EditorAuthRequiredError) {
        onAuthLost();
        return;
      }
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setSavingNote(false);
    }
  };

  return (
    <article
      className="p-6 mb-5"
      style={{ background: T.paper, border: `1px solid ${T.rule}` }}
    >
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <StatusBadge status={row.status} />
          <span
            style={{
              fontFamily: MONO,
              fontSize: 10.5,
              letterSpacing: "0.16em",
              color: T.mutedSoft,
            }}
          >
            #{row.id} · submitted {formatRelative(row.createdAt, now)}
            {row.updatedAt !== row.createdAt
              ? ` · last touched ${formatRelative(row.updatedAt, now)}`
              : ""}
          </span>
        </div>
        {sla && (
          <span
            style={{
              fontFamily: SANS,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color:
                sla.tone === "over"
                  ? T.danger
                  : sla.tone === "warn"
                    ? T.warning
                    : T.ok,
              background:
                sla.tone === "over"
                  ? T.dangerSoft
                  : sla.tone === "warn"
                    ? T.warningSoft
                    : T.okSoft,
              border: `1px solid ${
                sla.tone === "over"
                  ? T.danger
                  : sla.tone === "warn"
                    ? T.warning
                    : T.ok
              }55`,
              padding: "3px 8px",
              borderRadius: 2,
            }}
          >
            {sla.label}
          </span>
        )}
      </header>

      <a
        href={row.pageUrl}
        target="_blank"
        rel="noreferrer noopener"
        className="inline-flex items-center gap-1 mt-4"
        style={{
          fontFamily: SANS,
          fontSize: 13,
          fontWeight: 600,
          color: T.ink,
          textDecoration: "none",
          wordBreak: "break-all",
        }}
      >
        {row.pageUrl}
        <ExternalLink size={12} />
      </a>

      <p
        className="mt-3"
        style={{
          fontFamily: SERIF_ED,
          fontStyle: "italic",
          fontSize: 15.5,
          lineHeight: 1.55,
          color: T.inkSoft,
          whiteSpace: "pre-wrap",
        }}
      >
        {row.description}
      </p>

      <dl
        className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2"
        style={{ fontFamily: SANS, fontSize: 12.5, color: T.inkSoft }}
      >
        <div>
          <dt
            style={{
              fontFamily: MONO,
              fontSize: 10,
              letterSpacing: "0.18em",
              color: T.mutedSoft,
              textTransform: "uppercase",
            }}
          >
            Evidence
          </dt>
          <dd>
            {row.evidenceUrl ? (
              <a
                href={row.evidenceUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1"
                style={{
                  color: T.accent,
                  textDecoration: "none",
                  wordBreak: "break-all",
                }}
              >
                {row.evidenceUrl}
                <ExternalLink size={11} />
              </a>
            ) : (
              <span style={{ color: T.mutedSoft }}>— none</span>
            )}
          </dd>
        </div>
        <div>
          <dt
            style={{
              fontFamily: MONO,
              fontSize: 10,
              letterSpacing: "0.18em",
              color: T.mutedSoft,
              textTransform: "uppercase",
            }}
          >
            Submitter
          </dt>
          <dd>
            {row.submitterEmail ?? (
              <span style={{ color: T.mutedSoft }}>— anonymous</span>
            )}
          </dd>
        </div>
      </dl>

      <div className="mt-5 flex items-center gap-3 flex-wrap">
        <label
          htmlFor={`status-${row.id}`}
          style={{
            fontFamily: MONO,
            fontSize: 10,
            letterSpacing: "0.18em",
            color: T.mutedSoft,
            textTransform: "uppercase",
          }}
        >
          Status
        </label>
        <select
          id={`status-${row.id}`}
          value={row.status}
          disabled={savingStatus}
          onChange={(e) => changeStatus(e.target.value as CorrectionStatus)}
          style={{
            fontFamily: SANS,
            fontSize: 13,
            color: T.ink,
            background: T.paper,
            border: `1px solid ${T.rule}`,
            padding: "6px 10px",
            cursor: savingStatus ? "wait" : "pointer",
          }}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {STATUS_TINT[s].label}
            </option>
          ))}
        </select>
        {savingStatus && (
          <span
            style={{
              fontFamily: SERIF_ED,
              fontStyle: "italic",
              fontSize: 12.5,
              color: T.muted,
            }}
          >
            Saving…
          </span>
        )}
      </div>

      <div className="mt-4">
        <label
          htmlFor={`note-${row.id}`}
          style={{
            fontFamily: MONO,
            fontSize: 10,
            letterSpacing: "0.18em",
            color: T.mutedSoft,
            textTransform: "uppercase",
            display: "block",
            marginBottom: 6,
          }}
        >
          Internal note
        </label>
        <textarea
          id={`note-${row.id}`}
          value={noteDraft}
          onChange={(e) => setNoteDraft(e.target.value)}
          rows={2}
          placeholder="Triage shorthand — never shown to the reader."
          style={{
            fontFamily: SANS,
            fontSize: 13,
            color: T.ink,
            background: T.paper2,
            border: `1px solid ${T.rule}`,
            padding: "8px 10px",
            width: "100%",
          }}
        />
        <div className="mt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={saveNote}
            disabled={savingNote || (noteDraft.trim() === (row.internalNote ?? ""))}
            style={{
              fontFamily: SANS,
              fontSize: 12.5,
              fontWeight: 600,
              color: T.paper,
              background: T.ink,
              border: `1px solid ${T.ink}`,
              padding: "6px 14px",
              cursor:
                savingNote || (noteDraft.trim() === (row.internalNote ?? ""))
                  ? "not-allowed"
                  : "pointer",
              opacity:
                savingNote || (noteDraft.trim() === (row.internalNote ?? ""))
                  ? 0.5
                  : 1,
            }}
          >
            {savingNote ? "Saving…" : "Save note"}
          </button>
          {row.internalNote && (
            <span
              style={{
                fontFamily: SERIF_ED,
                fontStyle: "italic",
                fontSize: 12,
                color: T.muted,
              }}
            >
              Editor-only.
            </span>
          )}
        </div>
      </div>

      {err && (
        <div
          className="mt-3 p-3"
          style={{
            background: T.dangerSoft,
            color: T.danger,
            border: `1px solid ${T.danger}55`,
            fontFamily: SANS,
            fontSize: 13,
          }}
        >
          {err}
        </div>
      )}
    </article>
  );
};

// ─────────────────────────────────────────────────────────────────────
// Sign-in gate. Mirrors EditorTrendQueue.
// ─────────────────────────────────────────────────────────────────────
const SignInScreen: React.FC<{ onSignedIn: () => void }> = ({ onSignedIn }) => {
  const [token, setToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setErr(null);
    try {
      await signInEditor(token);
      setToken("");
      onSignedIn();
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : String(e2));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden flex flex-col"
      style={{ background: T.paper, color: T.ink }}
    >
      <PaperGrain />
      <LaidPaper />
      <TopVignette />
      <SiteHeader />
      <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-16">
        <form
          onSubmit={submit}
          className="w-full max-w-md"
          style={{
            background: T.paper,
            border: `1px solid ${T.rule}`,
            padding: "32px 28px",
          }}
        >
          <Eyebrow color={T.accent}>Editor desk</Eyebrow>
          <h2
            className="mt-3"
            style={{
              fontFamily: SERIF,
              fontSize: 28,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              color: T.ink,
            }}
          >
            Sign in to the corrections inbox
          </h2>
          <p
            className="mt-3"
            style={{
              fontFamily: SERIF_ED,
              fontStyle: "italic",
              fontSize: 14,
              color: T.muted,
            }}
          >
            Paste the shared editor token. We&rsquo;ll exchange it for a
            session cookie that lasts 30 days on this device.
          </p>
          <label
            htmlFor="editor-token"
            className="block mt-6"
            style={{
              fontFamily: MONO,
              fontSize: 10,
              letterSpacing: "0.18em",
              color: T.mutedSoft,
              textTransform: "uppercase",
            }}
          >
            Editor token
          </label>
          <input
            id="editor-token"
            type="password"
            autoComplete="off"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="block w-full mt-2"
            style={{
              fontFamily: MONO,
              fontSize: 14,
              color: T.ink,
              background: T.paper,
              border: `1px solid ${T.rule}`,
              padding: "10px 12px",
            }}
          />
          {err && (
            <div
              className="mt-3 p-3"
              style={{
                background: T.dangerSoft,
                color: T.danger,
                fontFamily: SANS,
                fontSize: 13,
              }}
            >
              {err}
            </div>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="mt-5 w-full"
            style={{
              fontFamily: SANS,
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.02em",
              color: T.paper,
              background: T.ink,
              padding: "12px 18px",
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.6 : 1,
            }}
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
      <SiteFooter />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────
// Page shell.
// ─────────────────────────────────────────────────────────────────────
const EditorCorrections: React.FC = () => {
  const [authNeeded, setAuthNeeded] = useState(false);
  const [status, setStatus] = useState<StatusFilter>("new");
  const [data, setData] = useState<CorrectionsList | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErr(null);
    fetchInbox(status)
      .then((r) => {
        if (cancelled) return;
        setData(r);
        setAuthNeeded(false);
      })
      .catch((e) => {
        if (cancelled) return;
        if (e instanceof EditorAuthRequiredError) setAuthNeeded(true);
        else setErr(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [status, refreshTick]);

  // Optimistic in-place update so a status change doesn't make the row
  // disappear while the next refetch is in flight. When the new status
  // no longer matches the filter, the next refetch (we don't trigger
  // it automatically — editors typically chew through a few rows in a
  // row before refreshing) will drop it from the list.
  const handleUpdated = (next: CorrectionRecord): void => {
    setData((prev) =>
      prev
        ? {
            ...prev,
            corrections: prev.corrections.map((c) =>
              c.id === next.id ? next : c,
            ),
          }
        : prev,
    );
  };

  const counts = useMemo(() => {
    const total = data?.corrections.length ?? 0;
    const overdue = (data?.corrections ?? []).filter((c) => {
      const b = slaBadge(c, now);
      return b?.tone === "over";
    }).length;
    return { total, overdue };
  }, [data, now]);

  if (authNeeded) {
    return (
      <SignInScreen
        onSignedIn={() => {
          setAuthNeeded(false);
          setRefreshTick((t) => t + 1);
        }}
      />
    );
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden flex flex-col"
      style={{ background: T.paper, color: T.ink }}
    >
      <PaperGrain />
      <LaidPaper />
      <TopVignette />
      <SiteHeader />
      <main className="relative z-10 flex-1 py-12">
        <Container>
          <div className="flex items-center justify-between gap-4">
            <a
              href="/__mockup/preview/evidently/Editors"
              className="inline-flex items-center gap-1"
              style={{
                fontFamily: MONO,
                fontSize: 11,
                letterSpacing: "0.16em",
                color: T.muted,
                textDecoration: "none",
              }}
            >
              <ArrowLeft size={12} /> EDITOR DESK
            </a>
            <button
              type="button"
              onClick={() => setRefreshTick((t) => t + 1)}
              className="inline-flex items-center gap-1"
              style={{
                fontFamily: SANS,
                fontSize: 12,
                fontWeight: 600,
                color: T.muted,
                background: "transparent",
                border: `1px solid ${T.rule}`,
                padding: "6px 12px",
                cursor: "pointer",
              }}
            >
              <RefreshCw size={12} /> Refresh
            </button>
          </div>
          <Eyebrow color={T.accent} className="mt-6">
            Reader correspondence
          </Eyebrow>
          <h1
            className="mt-2"
            style={{
              fontFamily: SERIF,
              fontSize: 52,
              lineHeight: 1.02,
              letterSpacing: "-0.02em",
              color: T.ink,
            }}
          >
            Corrections inbox
          </h1>
          <p
            className="mt-4 max-w-2xl"
            style={{
              fontFamily: SERIF_ED,
              fontStyle: "italic",
              fontSize: 17,
              lineHeight: 1.5,
              color: T.muted,
            }}
          >
            Reader-flagged errors from the &ldquo;Submit a correction&rdquo;
            form, newest first. Triage each one through{" "}
            <em>new → triaged → applied | dismissed</em> and jot an
            internal note while you do — readers never see the note.
          </p>

          <div className="mt-8 flex items-center gap-2 flex-wrap">
            {STATUS_CHIPS.map((c) => (
              <Chip
                key={c.id}
                active={status === c.id}
                onClick={() => setStatus(c.id)}
              >
                {c.label}
              </Chip>
            ))}
          </div>

          {loading && (
            <p
              className="mt-10"
              style={{
                fontFamily: SERIF_ED,
                fontStyle: "italic",
                fontSize: 16,
                color: T.muted,
              }}
            >
              Loading inbox…
            </p>
          )}
          {err && (
            <div
              className="mt-10 p-4"
              style={{
                background: T.dangerSoft,
                color: T.danger,
                border: `1px solid ${T.danger}55`,
                fontFamily: SANS,
                fontSize: 14,
              }}
            >
              {err}
            </div>
          )}

          {!loading && !err && data && (
            <>
              <div
                className="mt-6"
                style={{
                  fontFamily: MONO,
                  fontSize: 11,
                  letterSpacing: "0.14em",
                  color: counts.overdue > 0 ? T.danger : T.mutedSoft,
                  textTransform: "uppercase",
                }}
              >
                {counts.total} submission{counts.total === 1 ? "" : "s"}
                {counts.overdue > 0
                  ? ` · ${counts.overdue} past SLA`
                  : ""}
              </div>
              {data.corrections.length === 0 && (
                <p
                  className="mt-10"
                  style={{
                    fontFamily: SERIF_ED,
                    fontStyle: "italic",
                    fontSize: 16,
                    color: T.muted,
                  }}
                >
                  Nothing in this bucket right now. Readers haven&rsquo;t
                  flagged anything matching this filter.
                </p>
              )}
              <div className="mt-6">
                {data.corrections.map((c) => (
                  <CorrectionCard
                    key={c.id}
                    row={c}
                    now={now}
                    onUpdated={handleUpdated}
                    onAuthLost={() => setAuthNeeded(true)}
                  />
                ))}
              </div>
            </>
          )}
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
};

export default EditorCorrections;
