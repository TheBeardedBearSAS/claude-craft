#!/bin/bash
set -euo pipefail

# =============================================================================
# PDF Generator for Training Documents
# Uses Docker + pandoc/extra + eisvogel template
#
# Usage:
#   ./generate-pdf.sh                # Generate PDFs for all formations
#   ./generate-pdf.sh claude-craft   # Generate only claude-craft PDFs
#   ./generate-pdf.sh claude-code    # Generate only claude-code PDFs
# =============================================================================

TRAINING_DIR="$(cd "$(dirname "$0")" && pwd)"
PANDOC_DIR="$TRAINING_DIR/.pandoc"
ASSETS_DIR="$TRAINING_DIR/assets"
DOCKER_IMAGE="pandoc/extra:latest"

# Target formation (optional argument)
TARGET="${1:-all}"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== Training PDF Generator ===${NC}"
echo -e "  Target: ${YELLOW}${TARGET}${NC}"
echo ""

# Validate target
if [[ "$TARGET" != "all" && "$TARGET" != "claude-craft" && "$TARGET" != "claude-code" ]]; then
  echo -e "${RED}Error: Invalid target '$TARGET'. Use: all, claude-craft, or claude-code${NC}"
  exit 1
fi

# =============================================================================
# [0/N] Compile TikZ Backgrounds
# =============================================================================
echo -e "${YELLOW}[0] TikZ Backgrounds${NC}"

compile_background() {
  local tex_file="$1"
  local base_name
  base_name="$(basename "$tex_file" .tex)"
  local pdf_file="$ASSETS_DIR/$base_name.pdf"

  # Cache: only recompile when .tex is newer than .pdf
  if [ -f "$pdf_file" ] && [ "$pdf_file" -nt "$tex_file" ]; then
    echo -e "  $base_name.pdf ${GREEN}(cached)${NC}"
    return 0
  fi

  echo -n "  Compiling $base_name.pdf... "
  if docker run --rm -v "$ASSETS_DIR:/work" --entrypoint sh "$DOCKER_IMAGE" -c \
    "cd /work && xelatex -interaction=nonstopmode $base_name.tex >/dev/null 2>&1 && rm -f $base_name.aux $base_name.log"; then
    echo -e "${GREEN}OK${NC}"
  else
    echo -e "${RED}FAIL${NC}"
    docker run --rm -v "$ASSETS_DIR:/work" --entrypoint sh "$DOCKER_IMAGE" -c \
      "cd /work && rm -f $base_name.aux $base_name.log" 2>/dev/null || true
    return 1
  fi
}

compile_background "$ASSETS_DIR/bg-gold.tex"
compile_background "$ASSETS_DIR/bg-blue.tex"

# Download eisvogel template if missing
if [ ! -f "$PANDOC_DIR/eisvogel.latex" ]; then
  mkdir -p "$PANDOC_DIR"
  echo -e "${YELLOW}Downloading eisvogel template...${NC}"
  docker run --rm -v "$PANDOC_DIR:/out" --entrypoint sh "$DOCKER_IMAGE" -c \
    "wget -q -O /tmp/eisvogel.tar.gz https://github.com/Wandmalfarbe/pandoc-latex-template/releases/latest/download/Eisvogel.tar.gz \
    && tar xzf /tmp/eisvogel.tar.gz --strip-components=1 -C /tmp \
    && cp /tmp/eisvogel.latex /out/"
  echo -e "${GREEN}Template downloaded.${NC}"
fi

# =============================================================================
# PDF generation function
# =============================================================================
SUCCESS=0
FAIL=0

generate_pdf() {
  local formation="$1"
  local input="$2"
  local output="$3"
  local metadata="$4"
  local formation_dir="$TRAINING_DIR/$formation"
  local pdf_dir="$formation_dir/pdf"

  mkdir -p "$pdf_dir"

  if [ ! -f "$formation_dir/$input" ]; then
    echo -e "${RED}SKIP: $formation/$input not found${NC}"
    return 1
  fi

  echo -n "  Generating $formation/pdf/$output... "
  if docker run --rm -v "$TRAINING_DIR:/data" "$DOCKER_IMAGE" \
    --from=markdown \
    --to=pdf \
    --template=/data/.pandoc/eisvogel.latex \
    --pdf-engine=xelatex \
    --metadata-file="/data/$formation/metadata/$metadata" \
    -o "/data/$formation/pdf/$output" \
    "/data/$formation/$input"; then
    echo -e "${GREEN}OK${NC}"
  else
    echo -e "${RED}FAIL${NC}"
    return 1
  fi
}

run() {
  if generate_pdf "$@"; then
    SUCCESS=$((SUCCESS + 1))
  else
    FAIL=$((FAIL + 1))
  fi
}

# =============================================================================
# Claude-Craft Formation
# =============================================================================
if [[ "$TARGET" == "all" || "$TARGET" == "claude-craft" ]]; then
  echo ""
  echo -e "${GREEN}=== Claude-Craft Formation ===${NC}"

  echo -e "${YELLOW}[1] Documents principaux${NC}"
  run "claude-craft" "PROPOSITION-COMMERCIALE.md"  "proposition-commerciale.pdf"  "proposition-commerciale.yaml"
  run "claude-craft" "PLAN-FORMATION.md"           "plan-formation.pdf"           "plan-formation.yaml"
  run "claude-craft" "GUIDE-FORMATEUR.md"          "guide-formateur.pdf"          "guide-formateur.yaml"
  run "claude-craft" "CAHIER-PARTICIPANT.md"       "cahier-participant.pdf"       "cahier-participant.yaml"

  echo -e "${YELLOW}[2] Cheat Sheets${NC}"
  run "claude-craft" "supports/cheatsheet-claude-code.md"       "cheatsheet-claude-code.pdf"       "cheatsheet-claude-code.yaml"
  run "claude-craft" "supports/cheatsheet-claude-craft.md"      "cheatsheet-claude-craft.pdf"      "cheatsheet-claude-craft.yaml"
  run "claude-craft" "supports/cheatsheet-bmad-ralph.md"        "cheatsheet-bmad-ralph.pdf"        "cheatsheet-bmad-ralph.yaml"
  run "claude-craft" "supports/cheatsheet-symfony-commands.md"  "cheatsheet-symfony-commands.pdf"  "cheatsheet-symfony-commands.yaml"

  echo -e "${YELLOW}[3] Modules Jour 1${NC}"
  run "claude-craft" "modules/jour1/01-introduction-claude-code.md"  "module-01-introduction-claude-code.pdf"  "module-01-introduction-claude-code.yaml"
  run "claude-craft" "modules/jour1/02-framework-claude-craft.md"    "module-02-framework-claude-craft.pdf"    "module-02-framework-claude-craft.yaml"
  run "claude-craft" "modules/jour1/03-workflow-developpement.md"    "module-03-workflow-developpement.pdf"    "module-03-workflow-developpement.yaml"
  run "claude-craft" "modules/jour1/04-nouveau-projet-symfony.md"    "module-04-nouveau-projet-symfony.pdf"    "module-04-nouveau-projet-symfony.yaml"

  echo -e "${YELLOW}[4] Modules Jour 2${NC}"
  run "claude-craft" "modules/jour2/05-projet-existant.md"     "module-05-projet-existant.pdf"     "module-05-projet-existant.yaml"
  run "claude-craft" "modules/jour2/06-qualite-securite.md"    "module-06-qualite-securite.pdf"    "module-06-qualite-securite.yaml"
  run "claude-craft" "modules/jour2/07-agents-specialises.md"  "module-07-agents-specialises.pdf"  "module-07-agents-specialises.yaml"
  run "claude-craft" "modules/jour2/08-outils-avances.md"      "module-08-outils-avances.pdf"     "module-08-outils-avances.yaml"
  run "claude-craft" "modules/jour2/09-atelier-pratique.md"    "module-09-atelier-pratique.pdf"    "module-09-atelier-pratique.yaml"
fi

# =============================================================================
# Claude-Code Formation
# =============================================================================
if [[ "$TARGET" == "all" || "$TARGET" == "claude-code" ]]; then
  echo ""
  echo -e "${GREEN}=== Claude-Code Formation ===${NC}"

  echo -e "${YELLOW}[1] Documents principaux${NC}"
  run "claude-code" "PROPOSITION-COMMERCIALE.md"  "proposition-commerciale.pdf"  "proposition-commerciale.yaml"
  run "claude-code" "PLAN-FORMATION.md"           "plan-formation.pdf"           "plan-formation.yaml"

  echo -e "${YELLOW}[2] Modules Jour 1${NC}"
  run "claude-code" "modules/jour1/01-introduction-claude-code.md"  "module-01-introduction-claude-code.pdf"  "module-01-introduction-claude-code.yaml"
  run "claude-code" "modules/jour1/02-claudemd-configuration.md"    "module-02-claudemd-configuration.pdf"    "module-02-claudemd-configuration.yaml"
  run "claude-code" "modules/jour1/03-patterns-travail.md"          "module-03-patterns-travail.pdf"          "module-03-patterns-travail.yaml"
  run "claude-code" "modules/jour1/04-pratique-guidee.md"           "module-04-pratique-guidee.pdf"           "module-04-pratique-guidee.yaml"

  echo -e "${YELLOW}[3] Modules Jour 2${NC}"
  run "claude-code" "modules/jour2/05-hooks-automatisation.md"        "module-05-hooks-automatisation.pdf"        "module-05-hooks-automatisation.yaml"
  run "claude-code" "modules/jour2/06-mcp-integrations.md"            "module-06-mcp-integrations.pdf"            "module-06-mcp-integrations.yaml"
  run "claude-code" "modules/jour2/07-multi-agent-coordination.md"    "module-07-multi-agent-coordination.pdf"    "module-07-multi-agent-coordination.yaml"
  run "claude-code" "modules/jour2/08-qualite-securite.md"            "module-08-qualite-securite.pdf"            "module-08-qualite-securite.yaml"
  run "claude-code" "modules/jour2/09-bonus-claude-craft.md"          "module-09-bonus-claude-craft.pdf"          "module-09-bonus-claude-craft.yaml"
  run "claude-code" "modules/jour2/10-atelier-final.md"               "module-10-atelier-final.pdf"               "module-10-atelier-final.yaml"
fi

# =============================================================================
# Summary
# =============================================================================
echo ""
echo -e "${GREEN}=== Done! ===${NC}"
echo -e "  ${GREEN}Success: $SUCCESS${NC}"
if [ "$FAIL" -gt 0 ]; then
  echo -e "  ${RED}Failed:  $FAIL${NC}"
fi
