#!/usr/bin/env bash
# Nightly Trend Radar runner.
#
# Single entry point for Replit's Scheduled Deployment so the cron-style
# Run command is just one line. We chain ingest -> cluster with a hard
# stop on ingest failure (no point clustering against a half-loaded
# signals table) and surface every failure to stdout/stderr so the
# Deployments log pane captures it.
#
# Exit codes:
#   0  - both stages completed (individual sources/chunks may still have
#        soft-failed; see per-stage logs for the breakdown)
#   1  - ingest stage crashed before finishing (cluster stage skipped)
#   2  - cluster stage crashed
#
# Run command for the Replit Scheduled Deployment:
#   pnpm --filter @workspace/api-server run trend-radar:nightly
# Recommended schedule: 0 3 * * *  (03:00 UTC daily)

set -u
set -o pipefail

START_EPOCH="$(date -u +%s)"
START_ISO="$(date -u +%FT%TZ)"

echo "[trend-radar:nightly] start ${START_ISO}"

echo "[trend-radar:nightly] step 1/2: ingest"
pnpm --filter @workspace/api-server run trend-radar:ingest
INGEST_STATUS=$?
if [ "${INGEST_STATUS}" -ne 0 ]; then
  echo "[trend-radar:nightly] FAILED at ingest stage (exit ${INGEST_STATUS}); skipping cluster" >&2
  exit 1
fi

echo "[trend-radar:nightly] step 2/2: cluster"
pnpm --filter @workspace/api-server run trend-radar:cluster
CLUSTER_STATUS=$?
if [ "${CLUSTER_STATUS}" -ne 0 ]; then
  echo "[trend-radar:nightly] FAILED at cluster stage (exit ${CLUSTER_STATUS})" >&2
  exit 2
fi

END_EPOCH="$(date -u +%s)"
ELAPSED=$((END_EPOCH - START_EPOCH))
echo "[trend-radar:nightly] done in ${ELAPSED}s"
