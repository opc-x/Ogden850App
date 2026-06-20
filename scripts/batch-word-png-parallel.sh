#!/usr/bin/env bash
# Split word-PNG generation queue into N parallel batches for multi-agent runs.
#
# Usage:
#   ./scripts/batch-word-png-parallel.sh [workers] [category] [limit_per_worker]
#
# Examples:
#   ./scripts/batch-word-png-parallel.sh 4 picturables 30
#   ./scripts/batch-word-png-parallel.sh 5 generals 25
#
# Each worker prints: slug + full GenerateImage prompt.
# After generation, install per batch:
#   ./scripts/install-word-pngs.sh slug1 slug2 ...
# Then sync manifest:
#   npm run sync:word-png-manifest
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORKERS="${1:-4}"
CATEGORY="${2:-all}"
LIMIT="${3:-30}"
TOTAL=$((WORKERS * LIMIT))
QUEUE_FILE="$(mktemp)"
npx tsx "$ROOT/scripts/list-word-png-queue.ts" "$TOTAL" "$CATEGORY" >"$QUEUE_FILE"

SLUGS=()
while IFS=$'\t' read -r slug _rest; do
  [[ -z "$slug" || "$slug" == \#* ]] && continue
  SLUGS+=("$slug")
done <"$QUEUE_FILE"
rm -f "$QUEUE_FILE"

COUNT=${#SLUGS[@]}
if [[ $COUNT -eq 0 ]]; then
  echo "Queue empty for category=$CATEGORY"
  exit 0
fi

echo "# Parallel word-PNG batches — $COUNT slugs, $WORKERS workers, category=$CATEGORY"
echo "# Run each batch in a separate Cursor agent session with GenerateImage."
echo ""

WORKER_SIZE=$(( (COUNT + WORKERS - 1) / WORKERS ))

for ((w=0; w<WORKERS; w++)); do
  start=$((w * WORKER_SIZE))
  [[ $start -ge $COUNT ]] && break
  end=$((start + WORKER_SIZE))
  [[ $end -gt $COUNT ]] && end=$COUNT
  batch_slugs=("${SLUGS[@]:$start:$((end - start))}")

  echo "════════════════════════════════════════"
  echo "WORKER $((w + 1)) / $WORKERS  (${#batch_slugs[@]} words)"
  echo "════════════════════════════════════════"
  echo "# Install after generation:"
  echo "./scripts/install-word-pngs.sh ${batch_slugs[*]}"
  echo ""

  for slug in "${batch_slugs[@]}"; do
    prompt="$(npx tsx -e "
import { ALL_WORD_PNG_PROMPTS, WORD_ILLUSTRATION_STYLE } from './scripts/word-png-prompts.ts';
const p = ALL_WORD_PNG_PROMPTS['$slug'];
if (!p) { process.exit(1); }
console.log(WORD_ILLUSTRATION_STYLE + ', square 1:1 composition, centered subject, ' + p);
" 2>/dev/null || echo "NO PROMPT")"
    echo "── $slug"
    echo "GenerateImage: $prompt"
    echo ""
  done
  echo ""
done

echo "# After all workers finish:"
echo "npm run sync:word-png-manifest"
echo "./scripts/normalize-word-pngs.sh   # safety pass on entire library"
