#!/usr/bin/env bash
# ==============================================================================
# verify-release.sh — Project SHIFT Release Gatekeeper
# ==============================================================================
# Automatiseret pre-merge verifikation for Zero-Bug Policy.
# Kør dette script FØR du opretter et PR fra development → main.
#
# Brug:
#   bash scripts/verify-release.sh
#   npm run verify-release
#
# Scriptet er idempotent og kan køres gentagne gange uden sideeffekter.
# ==============================================================================

set -euo pipefail

# --- Sikr at PATH inkluderer standard Node.js lokationer ---
# (nødvendigt når scriptet køres fra kontekster uden fuldt shell-miljø)
export PATH="/usr/local/bin:/opt/homebrew/bin:$HOME/.nvm/versions/node/$(ls -1 $HOME/.nvm/versions/node/ 2>/dev/null | tail -1)/bin:$PATH" 2>/dev/null || true

# --- Farver til terminal-output ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# --- Tællere ---
PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

# --- Hjælpefunktioner ---
pass() {
  echo -e "  ${GREEN}✅ PASS${NC}: $1"
  PASS_COUNT=$((PASS_COUNT + 1))
}

fail() {
  echo -e "  ${RED}❌ FEJL${NC}: $1"
  FAIL_COUNT=$((FAIL_COUNT + 1))
}

warn() {
  echo -e "  ${YELLOW}⚠️  ADVARSEL${NC}: $1"
  WARN_COUNT=$((WARN_COUNT + 1))
}

info() {
  echo -e "  ${BLUE}ℹ️  INFO${NC}: $1"
}

separator() {
  echo ""
  echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BOLD}  $1${NC}"
  echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
}

# --- Detektér projekt-rod ---
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${PROJECT_ROOT}"

# ==============================================================================
# HEADER
# ==============================================================================
echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║  🚀 Project SHIFT — Release Gatekeeper               ║${NC}"
echo -e "${BOLD}║  Zero-Bug Policy Verifikation                        ║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  Tidspunkt: $(date '+%Y-%m-%d %H:%M:%S %Z')"
echo -e "  Projekt:   ${PROJECT_ROOT}"
echo ""

# ==============================================================================
# 1. BRANCH-TJEK
# ==============================================================================
separator "1. Branch-verifikation"

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "UNKNOWN")
info "Nuværende branch: ${BOLD}${CURRENT_BRANCH}${NC}"

if [ "${CURRENT_BRANCH}" = "development" ]; then
  pass "Du er på 'development'-branchen"
elif [ "${CURRENT_BRANCH}" = "main" ]; then
  fail "Du er på 'main'-branchen. Skift til 'development' før du kører release-verifikation"
else
  warn "Du er på '${CURRENT_BRANCH}' — forventet 'development'. Sørg for at merge til development først"
fi

# Tjek for ucommittede ændringer
if git diff --quiet && git diff --cached --quiet; then
  pass "Ingen ucommittede ændringer"
else
  warn "Der er ucommittede ændringer i working directory"
fi

# ==============================================================================
# 2. BUILD-VERIFIKATION
# ==============================================================================
separator "2. Build-verifikation (npm run build)"

# Tjek at node_modules eksisterer
if [ ! -d "node_modules" ]; then
  fail "node_modules mangler. Kør 'npm install' først"
else
  info "Kører 'npm run build' — dette kan tage et øjeblik..."
  
  BUILD_LOG=$(mktemp "${PROJECT_ROOT}/scripts/.build-log-XXXXXX" 2>/dev/null || mktemp)
  
  if npm run build > "${BUILD_LOG}" 2>&1; then
    pass "Build gennemført uden fejl"
  else
    fail "Build fejlede! Se log: ${BUILD_LOG}"
    echo ""
    echo -e "  ${RED}Sidste 15 linjer fra build-log:${NC}"
    tail -15 "${BUILD_LOG}" | sed 's/^/    /'
    echo ""
  fi
  
  # Oprydning af build-log ved succes
  if [ ${FAIL_COUNT} -eq 0 ] || [ ! -f "${BUILD_LOG}" ]; then
    rm -f "${BUILD_LOG}" 2>/dev/null || true
  fi
fi

# ==============================================================================
# 3. VERSIONS-KONSISTENS
# ==============================================================================
separator "3. Versions-konsistens"

# Hent version fra package.json (bruger node som er mere portabelt end jq)
PKG_VERSION=$(node -e "console.log(require('./package.json').version)" 2>/dev/null || echo "FEJL")
info "package.json version: ${BOLD}${PKG_VERSION}${NC}"

# Tjek CHANGELOG.md for seneste version
if [ -f "CHANGELOG.md" ]; then
  # macOS-kompatibel: bruger sed i stedet for grep -P (Perl regex)
  CHANGELOG_VERSION=$(sed -n 's/^## \[\([0-9]*\.[0-9]*\.[0-9]*\)\].*/\1/p' CHANGELOG.md | head -1)
  CHANGELOG_VERSION=${CHANGELOG_VERSION:-IKKE FUNDET}
  info "CHANGELOG.md seneste version: ${BOLD}${CHANGELOG_VERSION}${NC}"
  
  if [ "${PKG_VERSION}" = "${CHANGELOG_VERSION}" ]; then
    pass "package.json og CHANGELOG.md versioner matcher (${PKG_VERSION})"
  else
    fail "Versionsmismatch: package.json=${PKG_VERSION}, CHANGELOG.md=${CHANGELOG_VERSION}"
  fi
else
  fail "CHANGELOG.md ikke fundet!"
fi

# Tjek SYSTEM_STATE.md for version
if [ -f "SYSTEM_STATE.md" ]; then
  # macOS-kompatibel: bruger sed i stedet for grep -P
  SYSSTATE_VERSION=$(sed -n 's/.*`v\([0-9]*\.[0-9]*\.[0-9]*\)`.*/\1/p' SYSTEM_STATE.md | head -1)
  SYSSTATE_VERSION=${SYSSTATE_VERSION:-IKKE FUNDET}
  info "SYSTEM_STATE.md version: ${BOLD}v${SYSSTATE_VERSION}${NC}"
  
  if [ "${PKG_VERSION}" = "${SYSSTATE_VERSION}" ]; then
    pass "package.json og SYSTEM_STATE.md versioner matcher"
  else
    warn "SYSTEM_STATE.md version (v${SYSSTATE_VERSION}) matcher ikke package.json (${PKG_VERSION})"
  fi
else
  fail "SYSTEM_STATE.md ikke fundet!"
fi

# ==============================================================================
# 4. DOKUMENTATIONS-TJEK
# ==============================================================================
separator "4. Dokumentations-tjek"

# Tjek at CHANGELOG har en entry for den aktuelle version
if [ -f "CHANGELOG.md" ]; then
  if grep -q "\[${PKG_VERSION}\]" CHANGELOG.md; then
    pass "CHANGELOG.md indeholder entry for version ${PKG_VERSION}"
  else
    fail "CHANGELOG.md mangler entry for version ${PKG_VERSION}"
  fi
fi

# Tjek at SYSTEM_STATE.md er opdateret inden for de sidste 48 timer
if [ -f "SYSTEM_STATE.md" ]; then
  LAST_MODIFIED=$(stat -f "%m" SYSTEM_STATE.md 2>/dev/null || stat -c "%Y" SYSTEM_STATE.md 2>/dev/null || echo "0")
  CURRENT_TIME=$(date +%s)
  TIME_DIFF=$(( CURRENT_TIME - LAST_MODIFIED ))
  HOURS_AGO=$(( TIME_DIFF / 3600 ))
  
  if [ ${TIME_DIFF} -lt 172800 ]; then  # 48 timer
    pass "SYSTEM_STATE.md opdateret for ${HOURS_AGO} timer siden"
  else
    warn "SYSTEM_STATE.md blev sidst ændret for ${HOURS_AGO} timer siden (mere end 48 timer)"
  fi
fi

# Tjek at ARCHITECTURE.md eksisterer
if [ -f "ARCHITECTURE.md" ]; then
  pass "ARCHITECTURE.md eksisterer"
else
  fail "ARCHITECTURE.md ikke fundet!"
fi

# Tjek at PROJECT_GOVERNANCE.md eksisterer
if [ -f "PROJECT_GOVERNANCE.md" ]; then
  pass "PROJECT_GOVERNANCE.md eksisterer"
else
  fail "PROJECT_GOVERNANCE.md ikke fundet!"
fi

# ==============================================================================
# 5. GOVERNANCE-REGLER INTEGRITET
# ==============================================================================
separator "5. Governance-regler integritet"

RULES_DIR=".rules"
if [ -d "${RULES_DIR}" ]; then
  RULE_FILES=$(find "${RULES_DIR}" -name "*.md" -type f | sort)
  RULE_COUNT=$(echo "${RULE_FILES}" | wc -l | tr -d ' ')
  pass "${RULE_COUNT} governance-regler fundet i ${RULES_DIR}/"
  
  for rule_file in ${RULE_FILES}; do
    rule_name=$(basename "${rule_file}")
    info "  └─ ${rule_name}"
  done
else
  fail ".rules/ mappen ikke fundet!"
fi

# ==============================================================================
# RAPPORT
# ==============================================================================
separator "SAMLET RAPPORT"

TOTAL=$((PASS_COUNT + FAIL_COUNT + WARN_COUNT))

echo -e "  ${GREEN}✅ Bestået:   ${PASS_COUNT}${NC}"
echo -e "  ${RED}❌ Fejlet:    ${FAIL_COUNT}${NC}"
echo -e "  ${YELLOW}⚠️  Advarsler: ${WARN_COUNT}${NC}"
echo -e "  ───────────────"
echo -e "  ${BOLD}Total:       ${TOTAL}${NC}"
echo ""

if [ ${FAIL_COUNT} -eq 0 ]; then
  if [ ${WARN_COUNT} -eq 0 ]; then
    echo -e "${GREEN}${BOLD}  ✅ RELEASE GODKENDT — Alle kontroller bestået!${NC}"
    echo -e "  Du kan oprette et PR fra development → main."
  else
    echo -e "${YELLOW}${BOLD}  ⚠️  RELEASE BETINGET GODKENDT — ${WARN_COUNT} advarsel(er) fundet.${NC}"
    echo -e "  Gennemgå advarslerne og vurdér om de skal addresseres før merge."
  fi
  echo ""
  exit 0
else
  echo -e "${RED}${BOLD}  ❌ RELEASE AFVIST — ${FAIL_COUNT} fejl fundet!${NC}"
  echo -e "  Ret fejlene og kør scriptet igen inden du opretter et PR."
  echo ""
  exit 1
fi
