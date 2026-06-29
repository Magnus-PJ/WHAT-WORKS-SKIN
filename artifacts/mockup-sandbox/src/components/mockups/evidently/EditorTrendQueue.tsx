// EditorTrendQueue — reviewer-facing dashboard for the Trend Radar
// pipeline. Lists candidate trends produced by the clustering pass
// (Reddit / PubMed / Google Trends / FDA news → Anthropic clustering)
// and lets Dr. Paul or Dr. Sundeep approve, reject, or snooze each one.
//
// Approving a `trend-watch` candidate writes a fresh `issue-NNN.json`
// into the Astro content collection, signed "Dr. Paul + Dr. Sundeep".
// Approving an `ingredient-draft` candidate writes a stub draft into
// `src/content/ingredients/_drafts/` for the founders to flesh out
// with citations before promotion.
//
// Auth flow mirrors `EditorShelfClicks.tsx`: we exchange the shared
// `EDITOR_TOKEN` for an HttpOnly signed cookie via `POST /editor/sign-in`
// once, then never see the raw token again on the client.

import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ChevronDown, ChevronRight, ExternalLink, RefreshCw } from "lucide-react";
import {
  SiteHeader,
  SiteFooter,
  Container,
  Eyebrow,
  PaperGrain,
  LaidPaper,
  TopVignette,
  TierBadge,
  SERIF,
  SERIF_ED,
  SANS,
  MONO,
} from "./_chrome";
import { T } from "./_theme";
import { invalidateEditorModeCache } from "./_editorMode";

// ─────────────────────────────────────────────────────────────────────
// Wire types — mirror the OpenAPI `TrendCandidateRecord` shape so the
// dashboard can be developed without dragging in `@workspace/api-zod`
// (the mockup-sandbox preview server doesn't depend on the codegen
// package).
// ─────────────────────────────────────────────────────────────────────
type TrendSource = "reddit" | "pubmed" | "google-trends" | "fda-news";
type TrendVerdict = "Holds Up" | "Promising" | "Partly True" | "Misleading" | "Skip";
type TrendTier = "A" | "B" | "C" | "D";
type TrendTemplate = "trend-watch" | "ingredient-draft";
type TrendVelocity = "rising" | "steady" | "fading";
type TrendStatus =
  | "queued"
  | "approved-trendwatch"
  | "approved-draft"
  | "rejected"
  | "snoozed";

type TrendSignalSummary = {
  id: number;
  source: TrendSource;
  sourceUrl: string;
  title: string;
  publishedAt: string | null;
};

type TrendCandidate = {
  id: number;
  createdAt: string;
  updatedAt: string;
  name: string;
  summary: string;
  suggestedVerdict: TrendVerdict;
  suggestedTier: TrendTier;
  suggestedTemplate: TrendTemplate;
  velocity: TrendVelocity;
  sourceCount: number;
  status: TrendStatus;
  publishedSlug: string | null;
  // URL of the GitHub PR opened by the api-server's trend-sync helper.
  // Null when the sync was unconfigured (missing TREND_SYNC_GITHUB_*
  // env vars on the server) or when the most recent sync attempt
  // failed — in both cases the file is still on disk in the
  // api-server's local checkout and a founder can push it by hand.
  pullRequestUrl: string | null;
  // Most recent failure reason from the trend-sync helper. Persisted
  // server-side so this is populated on a fresh page load even after
  // the editor's session has rolled over — paired with
  // `lastSyncAttemptAt` so the card can show "Last sync failed 2h ago:
  // 401 Bad credentials" instead of just "no PR yet". Cleared when a
  // sync eventually succeeds.
  lastSyncError: string | null;
  lastSyncAttemptAt: string | null;
  signals: TrendSignalSummary[];
};

// Per-night LLM clustering telemetry. Mirrors
// `TrendClusterRunSummary` in the OpenAPI spec — kept inline here so
// the mockup-sandbox preview server doesn't need to depend on
// `@workspace/api-zod`'s codegen output.
type TrendClusterRunSummary = {
  finishedAt: string;
  chunksTotal: number;
  chunksFailed: number;
  modelReturnedTotal: number;
  schemaRejectedTotal: number;
  hallucinationDroppedTotal: number;
  candidatesCreatedTotal: number;
  rejectionRate: number;
  note?: string | null;
};

type TrendQueueResponse = {
  status: TrendStatus;
  candidates: TrendCandidate[];
  // Null when no nightly run has been recorded yet (older deployments
  // / freshly-provisioned environments). Optional in the type because
  // older API server builds also won't include the field.
  lastClusterRun?: TrendClusterRunSummary | null;
};

// Threshold above which the queue UI flashes a warning banner. Kept
// in sync with the `TrendClusterRunSummary` description in the
// OpenAPI spec.
const REJECTION_RATE_WARN_THRESHOLD = 0.5;

const QUEUE_ENDPOINT = "/api/editor/trend-queue";
const SIGN_IN_ENDPOINT = "/api/editor/sign-in";

const STATUS_CHIPS: Array<{ id: TrendStatus; label: string }> = [
  { id: "queued", label: "Awaiting review" },
  { id: "approved-trendwatch", label: "Published — Trend Watch" },
  { id: "approved-draft", label: "Published — Drafts" },
  { id: "snoozed", label: "Snoozed" },
  { id: "rejected", label: "Rejected" },
];

const VERDICT_OPTIONS: TrendVerdict[] = [
  "Holds Up",
  "Promising",
  "Partly True",
  "Misleading",
  "Skip",
];
const TIER_OPTIONS: TrendTier[] = ["A", "B", "C", "D"];
const TEMPLATE_OPTIONS: TrendTemplate[] = ["trend-watch", "ingredient-draft"];

const SOURCE_TINT: Record<TrendSource, { fg: string; bg: string; label: string }> = {
  reddit: { fg: "#9f1239", bg: "#fbe8ec", label: "Reddit" },
  pubmed: { fg: "#0b5852", bg: "#e6f4f2", label: "PubMed" },
  "google-trends": { fg: "#b45309", bg: "#fdf2e3", label: "Google Trends" },
  "fda-news": { fg: "#475569", bg: "#eef1f4", label: "FDA news" },
};

const VELOCITY_LABEL: Record<TrendVelocity, string> = {
  rising: "↑ Rising",
  steady: "→ Steady",
  fading: "↓ Fading",
};

// ─────────────────────────────────────────────────────────────────────
// Auth-aware fetch. Same pattern as `EditorShelfClicks`: any 401 on
// the queue endpoint flips the dashboard back to the sign-in form.
// ─────────────────────────────────────────────────────────────────────
class EditorAuthRequiredError extends Error {
  constructor() {
    super("Editor auth required");
    this.name = "EditorAuthRequiredError";
  }
}

async function fetchQueue(status: TrendStatus): Promise<TrendQueueResponse> {
  const res = await fetch(`${QUEUE_ENDPOINT}?status=${status}`, {
    method: "GET",
    headers: { accept: "application/json" },
    credentials: "include",
  });
  if (res.status === 401) throw new EditorAuthRequiredError();
  if (!res.ok) {
    throw new Error(`Failed to load queue: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as TrendQueueResponse;
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

type ApproveBody = {
  template: TrendTemplate;
  name: string;
  summary: string;
  verdict: TrendVerdict;
  tier: TrendTier;
  bottom?: string;
};

type ApproveResponse = {
  publishedSlug: string;
  publishedPath: string;
  syncStatus: "synced" | "skipped" | "failed";
  pullRequestUrl?: string;
  syncReason?: string;
};

async function approveCandidate(
  id: number,
  body: ApproveBody,
): Promise<ApproveResponse> {
  const res = await fetch(`${QUEUE_ENDPOINT}/${id}/approve`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (res.status === 401) throw new EditorAuthRequiredError();
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Approve failed: ${res.status} ${text}`);
  }
  return await res.json();
}

async function rejectCandidate(id: number): Promise<void> {
  const res = await fetch(`${QUEUE_ENDPOINT}/${id}/reject`, {
    method: "POST",
    credentials: "include",
  });
  if (res.status === 401) throw new EditorAuthRequiredError();
  if (!res.ok) throw new Error(`Reject failed: ${res.status}`);
}

async function snoozeCandidate(id: number): Promise<void> {
  const res = await fetch(`${QUEUE_ENDPOINT}/${id}/snooze`, {
    method: "POST",
    credentials: "include",
  });
  if (res.status === 401) throw new EditorAuthRequiredError();
  if (!res.ok) throw new Error(`Snooze failed: ${res.status}`);
}

type RetrySyncResponse = {
  publishedSlug: string;
  publishedPath: string;
  syncStatus: "synced" | "skipped" | "failed";
  pullRequestUrl?: string;
  syncReason?: string;
};

// Re-runs the GitHub PR sync for a candidate that already has a
// `publishedSlug` but no `pullRequestUrl` (sync failed on the original
// approve). The endpoint never re-writes the local file — it just
// retries the GitHub round-trip — so multiple retries are safe.
async function retrySyncCandidate(id: number): Promise<RetrySyncResponse> {
  const res = await fetch(`${QUEUE_ENDPOINT}/${id}/sync-retry`, {
    method: "POST",
    headers: { accept: "application/json" },
    credentials: "include",
  });
  if (res.status === 401) throw new EditorAuthRequiredError();
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Retry sync failed: ${res.status} ${text}`);
  }
  return (await res.json()) as RetrySyncResponse;
}

// ─────────────────────────────────────────────────────────────────────
// Sub-components.
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

const SourceBadge: React.FC<{ source: TrendSource }> = ({ source }) => {
  const tint = SOURCE_TINT[source];
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
// Approve form. Lives inline under each queued candidate so the
// founders can edit the LLM-suggested name/summary/verdict/tier
// before publishing without ever switching screens.
// ─────────────────────────────────────────────────────────────────────
const ApproveForm: React.FC<{
  candidate: TrendCandidate;
  onApproved: (result: ApproveResponse) => void;
  onAuthLost: () => void;
}> = ({ candidate, onApproved, onAuthLost }) => {
  const [template, setTemplate] = useState<TrendTemplate>(candidate.suggestedTemplate);
  const [name, setName] = useState(candidate.name);
  const [summary, setSummary] = useState(candidate.summary);
  const [verdict, setVerdict] = useState<TrendVerdict>(candidate.suggestedVerdict);
  const [tier, setTier] = useState<TrendTier>(candidate.suggestedTier);
  const [bottom, setBottom] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    // Guard against rapid double-submit (Enter-key races, accidental
    // double-clicks). React's `disabled` flips on the next render
    // tick so a fast operator can fire two requests before the button
    // visually disables — this short-circuit makes the second one a
    // no-op without burning an Anthropic-priced API call.
    if (submitting) return;
    setSubmitting(true);
    setErr(null);
    try {
      const r = await approveCandidate(candidate.id, {
        template,
        name: name.trim(),
        summary: summary.trim(),
        verdict,
        tier,
        bottom: bottom.trim() || undefined,
      });
      onApproved(r);
    } catch (e2) {
      if (e2 instanceof EditorAuthRequiredError) {
        onAuthLost();
        return;
      }
      setErr(e2 instanceof Error ? e2.message : String(e2));
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    fontFamily: SANS,
    fontSize: 13,
    color: T.ink,
    background: T.paper,
    border: `1px solid ${T.rule}`,
    padding: "8px 10px",
    width: "100%",
  };
  const labelStyle: React.CSSProperties = {
    fontFamily: MONO,
    fontSize: 10,
    letterSpacing: "0.18em",
    color: T.mutedSoft,
    textTransform: "uppercase",
    display: "block",
    marginBottom: 6,
  };

  return (
    <form
      onSubmit={submit}
      className="mt-5 p-5"
      style={{
        background: T.paper2,
        border: `1px dashed ${T.rule}`,
      }}
    >
      <Eyebrow color={T.accent}>Approve & publish</Eyebrow>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label style={labelStyle} htmlFor={`tpl-${candidate.id}`}>
            Template
          </label>
          <select
            id={`tpl-${candidate.id}`}
            value={template}
            onChange={(e) => setTemplate(e.target.value as TrendTemplate)}
            style={inputStyle}
          >
            {TEMPLATE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t === "trend-watch"
                  ? "Trend Watch issue (signed verdict)"
                  : "Ingredient draft (founders finish later)"}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle} htmlFor={`name-${candidate.id}`}>
            Trend name
          </label>
          <input
            id={`name-${candidate.id}`}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>
      <div className="mt-4">
        <label style={labelStyle} htmlFor={`sum-${candidate.id}`}>
          Summary / verdict body
        </label>
        <textarea
          id={`sum-${candidate.id}`}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={5}
          style={{ ...inputStyle, fontFamily: SERIF_ED, fontStyle: "italic", fontSize: 14 }}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div>
          <label style={labelStyle} htmlFor={`verd-${candidate.id}`}>
            Verdict
          </label>
          <select
            id={`verd-${candidate.id}`}
            value={verdict}
            onChange={(e) => setVerdict(e.target.value as TrendVerdict)}
            style={inputStyle}
          >
            {VERDICT_OPTIONS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle} htmlFor={`tier-${candidate.id}`}>
            Tier
          </label>
          <select
            id={`tier-${candidate.id}`}
            value={tier}
            onChange={(e) => setTier(e.target.value as TrendTier)}
            style={inputStyle}
          >
            {TIER_OPTIONS.map((t) => (
              <option key={t} value={t}>
                Tier {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle} htmlFor={`bot-${candidate.id}`}>
            Bottom line (optional)
          </label>
          <input
            id={`bot-${candidate.id}`}
            type="text"
            value={bottom}
            onChange={(e) => setBottom(e.target.value)}
            placeholder="One-line callout"
            style={inputStyle}
          />
        </div>
      </div>
      {err && (
        <div
          className="mt-4 p-3"
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
      <div className="mt-5 flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          style={{
            fontFamily: SANS,
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.02em",
            color: T.paper,
            background: T.accent,
            border: `1px solid ${T.accentDeep}`,
            padding: "10px 18px",
            cursor: submitting ? "not-allowed" : "pointer",
            opacity: submitting ? 0.6 : 1,
          }}
        >
          {submitting ? "Publishing…" : "Approve & publish"}
        </button>
        <span
          style={{
            fontFamily: SERIF_ED,
            fontStyle: "italic",
            fontSize: 12.5,
            color: T.muted,
          }}
        >
          Signed&nbsp;<em>Dr. Paul + Dr. Sundeep</em>. Writes a JSON entry to the
          Astro content folder for the next site build.
        </span>
      </div>
    </form>
  );
};

// ─────────────────────────────────────────────────────────────────────
// Candidate card.
// ─────────────────────────────────────────────────────────────────────
const CandidateCard: React.FC<{
  candidate: TrendCandidate;
  now: number;
  onChanged: () => void;
  onAuthLost: () => void;
}> = ({ candidate, now, onChanged, onAuthLost }) => {
  const [showSources, setShowSources] = useState(false);
  const [showApprove, setShowApprove] = useState(false);
  const [busy, setBusy] = useState<"reject" | "snooze" | null>(null);
  const [actionErr, setActionErr] = useState<string | null>(null);
  // After a successful approve, we hold onto the publish + sync result
  // so the card can render a confirmation block (path, sync status, PR
  // link) without waiting for the upstream queue refetch to land.
  const [publishedNotice, setPublishedNotice] = useState<{
    path: string;
    syncStatus: "synced" | "skipped" | "failed";
    pullRequestUrl?: string;
    syncReason?: string;
  } | null>(null);
  // Sync-retry UI state. The button is rendered inline next to the
  // "Published as …" line on already-approved cards whose first sync
  // didn't open a PR. We keep `retryNotice` separate from
  // `publishedNotice` so the retry result can render below the card
  // even when there was no fresh approve in this session (i.e. the
  // candidate row arrived from the server already in the
  // `approved-*` + `pullRequestUrl: null` state).
  const [retrying, setRetrying] = useState(false);
  const [retryErr, setRetryErr] = useState<string | null>(null);
  const [retryNotice, setRetryNotice] = useState<RetrySyncResponse | null>(
    null,
  );

  const handleReject = async (): Promise<void> => {
    setBusy("reject");
    setActionErr(null);
    try {
      await rejectCandidate(candidate.id);
      onChanged();
    } catch (e) {
      if (e instanceof EditorAuthRequiredError) onAuthLost();
      else setActionErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  };

  const handleSnooze = async (): Promise<void> => {
    setBusy("snooze");
    setActionErr(null);
    try {
      await snoozeCandidate(candidate.id);
      onChanged();
    } catch (e) {
      if (e instanceof EditorAuthRequiredError) onAuthLost();
      else setActionErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  };

  const handleRetrySync = async (): Promise<void> => {
    if (retrying) return;
    setRetrying(true);
    setRetryErr(null);
    try {
      const r = await retrySyncCandidate(candidate.id);
      setRetryNotice(r);
      // If a PR was opened, refetch the queue so the row's
      // `pullRequestUrl` updates and the Retry button disappears on
      // the next paint. We don't refetch on skipped/failed because
      // nothing on the row changed and the operator may want to
      // immediately retry again.
      if (r.syncStatus === "synced") setTimeout(onChanged, 600);
    } catch (e) {
      if (e instanceof EditorAuthRequiredError) onAuthLost();
      else setRetryErr(e instanceof Error ? e.message : String(e));
    } finally {
      setRetrying(false);
    }
  };

  const isQueued = candidate.status === "queued";
  // The retry affordance is only meaningful for cards that completed
  // their local publish (slug recorded, status flipped to one of the
  // approved-* values) but never got a PR url. The server enforces
  // the same precondition (rejecting non-approved rows with 409), so
  // this is a UX hide, not a security check — but we keep the status
  // guard here too so unusual data states (e.g. a row whose status
  // got rolled back manually) don't render a button that would just
  // 409 on click.
  const isApproved =
    candidate.status === "approved-trendwatch" ||
    candidate.status === "approved-draft";
  const canRetrySync =
    isApproved && !!candidate.publishedSlug && !candidate.pullRequestUrl;

  return (
    <article
      className="p-6 mb-6"
      style={{ background: T.paper, border: `1px solid ${T.rule}` }}
    >
      <header className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <TierBadge tier={candidate.suggestedTier} size="md" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span
              style={{
                fontFamily: MONO,
                fontSize: 10,
                letterSpacing: "0.18em",
                color: T.accent,
                textTransform: "uppercase",
              }}
            >
              {candidate.suggestedVerdict} · {VELOCITY_LABEL[candidate.velocity]}
            </span>
            <span
              style={{
                fontFamily: SANS,
                fontSize: 9.5,
                fontWeight: 700,
                letterSpacing: "0.16em",
                color: T.ink,
                background: T.paper,
                border: `1px solid ${T.ink}`,
                padding: "2px 7px",
                borderRadius: 2,
                textTransform: "uppercase",
              }}
              title="Template suggested by the LLM clustering pass"
            >
              {candidate.suggestedTemplate === "trend-watch"
                ? "Tpl · Trend Watch"
                : "Tpl · Ingredient Draft"}
            </span>
            <span
              style={{
                fontFamily: MONO,
                fontSize: 10,
                letterSpacing: "0.16em",
                color: T.mutedSoft,
              }}
            >
              {candidate.sourceCount} signal{candidate.sourceCount === 1 ? "" : "s"} · clustered{" "}
              {formatRelative(candidate.createdAt, now)}
            </span>
          </div>
          <h3
            className="mt-2"
            style={{
              fontFamily: SERIF,
              fontSize: 26,
              lineHeight: 1.15,
              letterSpacing: "-0.015em",
              color: T.ink,
            }}
          >
            {candidate.name}
          </h3>
          <p
            className="mt-3"
            style={{
              fontFamily: SERIF_ED,
              fontStyle: "italic",
              fontSize: 15.5,
              lineHeight: 1.55,
              color: T.inkSoft,
            }}
          >
            {candidate.summary}
          </p>
          {candidate.publishedSlug && (
            <p
              className="mt-3 inline-flex items-center gap-2 flex-wrap"
              style={{
                fontFamily: MONO,
                fontSize: 11,
                letterSpacing: "0.12em",
                color: T.accent,
              }}
            >
              <span>
                Published as <strong>{candidate.publishedSlug}</strong>
              </span>
              {candidate.pullRequestUrl && (
                <>
                  <span aria-hidden>·</span>
                  <a
                    href={candidate.pullRequestUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    style={{ color: "inherit", textDecoration: "underline" }}
                  >
                    sync PR
                  </a>
                </>
              )}
              {canRetrySync && (
                <>
                  <span aria-hidden>·</span>
                  <button
                    type="button"
                    onClick={handleRetrySync}
                    disabled={retrying}
                    title="Re-run the GitHub sync against the file already on disk. No new content is written."
                    style={{
                      fontFamily: MONO,
                      fontSize: 10.5,
                      fontWeight: 700,
                      letterSpacing: "0.14em",
                      color: T.danger,
                      background: T.dangerSoft,
                      border: `1px solid ${T.danger}55`,
                      padding: "2px 8px",
                      borderRadius: 2,
                      textTransform: "uppercase",
                      cursor: retrying ? "not-allowed" : "pointer",
                      opacity: retrying ? 0.6 : 1,
                    }}
                  >
                    {retrying ? "Retrying…" : "Retry sync"}
                  </button>
                </>
              )}
            </p>
          )}
          {/*
            Persisted "last sync failed" hint.

            Renders only when there's no PR URL on the row (a row with
            a PR is by definition successfully synced) AND we have a
            stored failure reason. We deliberately suppress this block
            once the operator has triggered an in-session retry — the
            `retryNotice` block below shows the *latest* attempt's
            outcome, and stacking both would double up on the same
            information.

            Without this hint, an editor returning to the dashboard the
            morning after a failed approve sees only "no PR yet" and
            has no signal as to whether the token expired, GitHub was
            down, or the file already exists upstream. The relative
            timestamp lets them tell "five minutes ago, just keep
            retrying" apart from "three days ago, this is stuck".
          */}
          {!candidate.pullRequestUrl &&
            candidate.lastSyncError &&
            !retryNotice && (
              <p
                className="mt-3 p-3"
                style={{
                  background: T.dangerSoft,
                  color: T.danger,
                  border: `1px solid ${T.danger}55`,
                  fontFamily: SANS,
                  fontSize: 12.5,
                  lineHeight: 1.5,
                }}
              >
                <strong>Last sync failed</strong>
                {candidate.lastSyncAttemptAt
                  ? ` ${formatRelative(candidate.lastSyncAttemptAt, now)}`
                  : ""}
                : {candidate.lastSyncError}.
              </p>
            )}
          {retryErr && (
            <p
              className="mt-2"
              style={{
                fontFamily: SANS,
                fontSize: 12.5,
                color: T.danger,
              }}
            >
              {retryErr}
            </p>
          )}
          {retryNotice && (
            <div
              className="mt-3 p-3"
              style={{
                background:
                  retryNotice.syncStatus === "failed"
                    ? T.dangerSoft
                    : T.okSoft,
                color:
                  retryNotice.syncStatus === "failed" ? T.danger : T.ok,
                border: `1px solid ${retryNotice.syncStatus === "failed" ? T.danger : T.ok}55`,
                fontFamily: SANS,
                fontSize: 13,
              }}
            >
              {retryNotice.syncStatus === "synced" &&
                retryNotice.pullRequestUrl && (
                  <div>
                    Sync PR opened —{" "}
                    <a
                      href={retryNotice.pullRequestUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      style={{ color: "inherit", textDecoration: "underline" }}
                    >
                      view on GitHub
                    </a>
                    . Merge it to ship to whatworksskin.com.
                  </div>
                )}
              {retryNotice.syncStatus === "skipped" && (
                <div>
                  GitHub sync is not configured on this server
                  {retryNotice.syncReason ? ` (${retryNotice.syncReason})` : ""}
                  . Push the file by hand to publish.
                </div>
              )}
              {retryNotice.syncStatus === "failed" && (
                <div>
                  Retry still failed
                  {retryNotice.syncReason
                    ? `: ${retryNotice.syncReason}`
                    : ""}
                  . The file is in the api-server's local checkout — try
                  again in a moment or push it by hand.
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <button
        type="button"
        className="mt-4 inline-flex items-center gap-1"
        onClick={() => setShowSources((v) => !v)}
        style={{
          fontFamily: SANS,
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: "0.04em",
          color: T.muted,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: 0,
        }}
      >
        {showSources ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        {showSources ? "Hide" : "Show"} {candidate.signals.length} source
        {candidate.signals.length === 1 ? "" : "s"}
      </button>
      {showSources && (
        <ul className="mt-3 space-y-2">
          {candidate.signals.map((s) => (
            <li
              key={s.id}
              className="flex items-start gap-3 px-3 py-2"
              style={{
                background: T.paper2,
                border: `1px solid ${T.ruleSoft}`,
              }}
            >
              <SourceBadge source={s.source} />
              <a
                href={s.sourceUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="flex-1 inline-flex items-center gap-1"
                style={{
                  fontFamily: SANS,
                  fontSize: 13,
                  color: T.ink,
                  textDecoration: "none",
                }}
              >
                <span className="line-clamp-2">{s.title}</span>
                <ExternalLink size={12} />
              </a>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 10.5,
                  color: T.mutedSoft,
                  whiteSpace: "nowrap",
                }}
              >
                {s.publishedAt ? formatRelative(s.publishedAt, now) : "—"}
              </span>
            </li>
          ))}
        </ul>
      )}

      {isQueued && !showApprove && !publishedNotice && (
        <div className="mt-5 flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => setShowApprove(true)}
            style={{
              fontFamily: SANS,
              fontSize: 13,
              fontWeight: 600,
              color: T.paper,
              background: T.accent,
              border: `1px solid ${T.accentDeep}`,
              padding: "8px 16px",
              cursor: "pointer",
            }}
          >
            Approve…
          </button>
          <button
            type="button"
            onClick={handleSnooze}
            disabled={busy !== null}
            style={{
              fontFamily: SANS,
              fontSize: 13,
              fontWeight: 600,
              color: T.inkSoft,
              background: T.paper,
              border: `1px solid ${T.rule}`,
              padding: "8px 16px",
              cursor: busy ? "not-allowed" : "pointer",
            }}
          >
            {busy === "snooze" ? "Snoozing…" : "Snooze 30 days"}
          </button>
          <button
            type="button"
            onClick={handleReject}
            disabled={busy !== null}
            style={{
              fontFamily: SANS,
              fontSize: 13,
              fontWeight: 600,
              color: T.danger,
              background: T.paper,
              border: `1px solid ${T.danger}55`,
              padding: "8px 16px",
              cursor: busy ? "not-allowed" : "pointer",
            }}
          >
            {busy === "reject" ? "Rejecting…" : "Reject"}
          </button>
          {actionErr && (
            <span
              style={{
                fontFamily: SANS,
                fontSize: 12.5,
                color: T.danger,
              }}
            >
              {actionErr}
            </span>
          )}
        </div>
      )}

      {publishedNotice && (
        <div
          className="mt-5 p-4"
          style={{
            // Sync failure is editorially significant (the file is on
            // disk but it didn't make it to the source repo), so we
            // tint the whole notice in the danger palette to flag it
            // to the founder. Skipped + synced both share the OK tint.
            background:
              publishedNotice.syncStatus === "failed" ? T.dangerSoft : T.okSoft,
            color:
              publishedNotice.syncStatus === "failed" ? T.danger : T.ok,
            border: `1px solid ${publishedNotice.syncStatus === "failed" ? T.danger : T.ok}55`,
            fontFamily: SANS,
            fontSize: 13,
          }}
        >
          <div>
            Published to <strong>{publishedNotice.path}</strong>. The next
            Astro build will include it.
          </div>
          {publishedNotice.syncStatus === "synced" &&
            publishedNotice.pullRequestUrl && (
              <div style={{ marginTop: 6 }}>
                Sync PR opened —{" "}
                <a
                  href={publishedNotice.pullRequestUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  style={{ color: "inherit", textDecoration: "underline" }}
                >
                  view on GitHub
                </a>
                . Merge it to ship to whatworksskin.com.
              </div>
            )}
          {publishedNotice.syncStatus === "skipped" && (
            <div style={{ marginTop: 6, opacity: 0.85 }}>
              GitHub sync is not configured on this server — push the file
              by hand to publish.
            </div>
          )}
          {publishedNotice.syncStatus === "failed" && (
            <div style={{ marginTop: 6 }}>
              GitHub sync failed
              {publishedNotice.syncReason
                ? `: ${publishedNotice.syncReason}`
                : ""}
              . The file is in the api-server's local checkout — push it
              by hand to publish.
            </div>
          )}
        </div>
      )}

      {showApprove && isQueued && !publishedNotice && (
        <ApproveForm
          candidate={candidate}
          onApproved={(r) => {
            setPublishedNotice({
              path: r.publishedPath,
              syncStatus: r.syncStatus,
              pullRequestUrl: r.pullRequestUrl,
              syncReason: r.syncReason,
            });
            setShowApprove(false);
            // Trigger a queue refetch so the card disappears from the
            // queued list on the next paint.
            setTimeout(onChanged, 800);
          }}
          onAuthLost={onAuthLost}
        />
      )}
    </article>
  );
};

// ─────────────────────────────────────────────────────────────────────
// Cluster-run badge.
//
// Renders a thin two-line strip above the candidate list summarising
// the most recent nightly clustering pass. Editors look at this when
// the queue is unexpectedly quiet — it lets them see whether the
// model returned few clusters tonight, or returned plenty and we
// threw most of them away (schema rejects + hallucinated ids).
//
// Above the warning threshold the strip flips to a red callout so a
// model-behaviour drift (e.g. starts emitting a renamed template) is
// hard to miss on the morning queue scan.
// ─────────────────────────────────────────────────────────────────────
function describeClusterRun(run: TrendClusterRunSummary, now: number): string {
  const finished = formatRelative(run.finishedAt, now);
  if (run.note === "no_signals") {
    return `Last cluster run ${finished}: no new signals to cluster.`;
  }
  const dropped = run.schemaRejectedTotal + run.hallucinationDroppedTotal;
  const pct = Math.round(run.rejectionRate * 100);
  const failedNote =
    run.chunksFailed > 0
      ? ` ${run.chunksFailed}/${run.chunksTotal} chunk${run.chunksFailed === 1 ? "" : "s"} errored.`
      : "";
  return (
    `Last cluster run ${finished}: model returned ${run.modelReturnedTotal} cluster` +
    `${run.modelReturnedTotal === 1 ? "" : "s"}, ` +
    `${dropped} dropped (${pct}%) — ${run.schemaRejectedTotal} by schema, ` +
    `${run.hallucinationDroppedTotal} hallucinated. ` +
    `${run.candidatesCreatedTotal} new candidate${run.candidatesCreatedTotal === 1 ? "" : "s"}.` +
    failedNote
  );
}

const ClusterRunBadge: React.FC<{
  run: TrendClusterRunSummary;
  now: number;
}> = ({ run, now }) => {
  // Triggers only when the model actually returned something tonight —
  // a 0/0 night isn't a "high rejection rate", it's a "nothing to do"
  // night, and the description string already says so.
  const overThreshold =
    run.modelReturnedTotal > 0 &&
    run.rejectionRate > REJECTION_RATE_WARN_THRESHOLD;
  const palette = overThreshold
    ? {
        bg: T.dangerSoft,
        border: `${T.danger}55`,
        ink: T.danger,
        eyebrow: T.danger,
      }
    : {
        bg: T.paper2,
        border: T.rule,
        ink: T.muted,
        eyebrow: T.accent,
      };
  const description = describeClusterRun(run, now);
  return (
    <div
      className="mt-6 p-4"
      style={{
        background: palette.bg,
        border: `1px solid ${palette.border}`,
      }}
    >
      <div
        style={{
          fontFamily: MONO,
          fontSize: 10,
          letterSpacing: "0.18em",
          color: palette.eyebrow,
          textTransform: "uppercase",
        }}
      >
        {overThreshold ? "Cluster run · high rejection rate" : "Cluster run telemetry"}
      </div>
      <p
        className="mt-2"
        style={{
          fontFamily: SERIF_ED,
          fontStyle: overThreshold ? "normal" : "italic",
          fontSize: 14,
          lineHeight: 1.5,
          color: palette.ink,
        }}
      >
        {description}
      </p>
      {overThreshold && (
        <p
          className="mt-2"
          style={{
            fontFamily: SANS,
            fontSize: 12,
            color: palette.ink,
          }}
        >
          More than half of the model&rsquo;s clusters were dropped before
          they reached the queue — worth checking the cluster script log
          for a renamed template or a prompt drift before approving
          tonight&rsquo;s candidates.
        </p>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────
// Sign-in gate. Same shape as `EditorShelfClicks` so editors only ever
// learn one auth flow.
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
            Sign in to the Trend Radar queue
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
const EditorTrendQueue: React.FC = () => {
  const [authNeeded, setAuthNeeded] = useState(false);
  const [status, setStatus] = useState<TrendStatus>("queued");
  const [data, setData] = useState<TrendQueueResponse | null>(null);
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
    fetchQueue(status)
      .then((r) => {
        if (!cancelled) {
          setData(r);
          setAuthNeeded(false);
        }
      })
      .catch((e) => {
        if (cancelled) return;
        if (e instanceof EditorAuthRequiredError) {
          setAuthNeeded(true);
        } else {
          setErr(e instanceof Error ? e.message : String(e));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [status, refreshTick]);

  const counts = useMemo(() => {
    const total = data?.candidates.length ?? 0;
    const sources = new Set<TrendSource>();
    let signals = 0;
    for (const c of data?.candidates ?? []) {
      signals += c.sourceCount;
      for (const s of c.signals) sources.add(s.source);
    }
    return { total, signals, sources: sources.size };
  }, [data]);

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
            Trend Radar
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
            Reviewer queue
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
            Candidate trends clustered from Reddit, PubMed, Google Trends, and
            FDA news. Approving a Trend Watch candidate publishes a signed
            verdict to the next site build; approving an ingredient draft files
            a stub for the founders to finish.
          </p>

          <div className="mt-8 flex items-center gap-2 flex-wrap">
            {STATUS_CHIPS.map((c) => (
              <Chip key={c.id} active={status === c.id} onClick={() => setStatus(c.id)}>
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
              Loading queue…
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
              {data.lastClusterRun && (
                <ClusterRunBadge run={data.lastClusterRun} now={now} />
              )}
              <div
                className="mt-6"
                style={{
                  fontFamily: MONO,
                  fontSize: 11,
                  letterSpacing: "0.14em",
                  color: T.mutedSoft,
                  textTransform: "uppercase",
                }}
              >
                {counts.total} candidate{counts.total === 1 ? "" : "s"} ·{" "}
                {counts.signals} signal{counts.signals === 1 ? "" : "s"} ·{" "}
                {counts.sources} source{counts.sources === 1 ? "" : "s"}
              </div>
              {data.candidates.length === 0 && (
                <p
                  className="mt-10"
                  style={{
                    fontFamily: SERIF_ED,
                    fontStyle: "italic",
                    fontSize: 16,
                    color: T.muted,
                  }}
                >
                  Nothing in this bucket right now. Run the ingest + cluster
                  scripts to seed new candidates.
                </p>
              )}
              <div className="mt-6">
                {data.candidates.map((c) => (
                  <CandidateCard
                    key={c.id}
                    candidate={c}
                    now={now}
                    onChanged={() => setRefreshTick((t) => t + 1)}
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

export default EditorTrendQueue;
