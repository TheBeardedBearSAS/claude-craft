#!/usr/bin/env bash
# sync-docs.sh — Copy and transform docs/*.md into website/ for VitePress
# Source of truth: docs/ directory. This script is idempotent.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEBSITE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PROJECT_ROOT="$(cd "$WEBSITE_DIR/.." && pwd)"
DOCS_DIR="$PROJECT_ROOT/docs"

# --- Helpers ---

# Add frontmatter to a file if not already present
add_frontmatter() {
  local file="$1"
  local title="$2"
  local desc="${3:-}"

  if head -1 "$file" | grep -q '^---$'; then
    return  # already has frontmatter
  fi

  local tmp
  tmp=$(mktemp)
  {
    echo "---"
    echo "title: \"$title\""
    [ -n "$desc" ] && echo "description: \"$desc\""
    echo "---"
    echo ""
    cat "$file"
  } > "$tmp"
  mv "$tmp" "$file"
}

# Copy a doc file, deriving title from first H1 or filename
copy_doc() {
  local src="$1"
  local dest="$2"
  local title="${3:-}"
  local desc="${4:-}"

  mkdir -p "$(dirname "$dest")"
  cp "$src" "$dest"

  # Derive title from first H1 if not provided
  if [ -z "$title" ]; then
    title=$(grep -m1 '^# ' "$src" | sed 's/^# //' || basename "$src" .md)
  fi

  add_frontmatter "$dest" "$title" "$desc"
}

# Translated <meta description> per guide file, per non-English locale (SEO — guides
# previously had no description at all and fell back to the English root/locale
# default; see docs/internal/SEO_AUDIT_TRACKING_20260715.md, Vague 3, item 3).
# English guides are untouched (title-only, derived from the H1) — out of scope here.
guide_meta_description() {
  local locale="$1" base="$2"
  case "${locale}:${base}" in
    fr:01-getting-started) echo "Premiers pas avec Claude Craft : installation, configuration initiale et lancement de votre premier projet avec Claude Code." ;;
    fr:02-project-creation) echo "Créez un nouveau projet avec Claude Craft : structure, technologies supportées et bonnes pratiques dès le démarrage." ;;
    fr:03-feature-development) echo "Développez une nouvelle fonctionnalité avec Claude Craft : workflow TDD, agents spécialisés et commandes dédiées." ;;
    fr:04-bug-fixing) echo "Corrigez un bug efficacement avec Claude Craft : méthodologie de débogage, tests de non-régression et outils dédiés." ;;
    fr:05-tools-reference) echo "Référence complète des outils Claude Craft : commandes, agents et skills disponibles pour votre workflow quotidien." ;;
    fr:06-troubleshooting) echo "Dépannage Claude Craft : solutions aux problèmes courants d'installation, de configuration et d'utilisation." ;;
    fr:07-backlog-management) echo "Gérez votre backlog avec Claude Craft : priorisation des tâches, sprints et suivi de la progression du projet." ;;
    fr:08-setup-new-project) echo "Configurez Claude Craft sur un nouveau projet : installation, choix des technologies et premiers réglages." ;;
    fr:09-setup-existing-project) echo "Intégrez Claude Craft à un projet existant : migration progressive, configuration et bonnes pratiques d'adoption." ;;
    fr:10-complete-workflow) echo "Le workflow complet Claude Craft de bout en bout : planification, conception, implémentation et revue de sprint." ;;

    es:01-getting-started) echo "Primeros pasos con Claude Craft: instalación, configuración inicial y puesta en marcha de tu primer proyecto con Claude Code." ;;
    es:02-project-creation) echo "Crea un nuevo proyecto con Claude Craft: estructura, tecnologías compatibles y buenas prácticas desde el inicio." ;;
    es:03-feature-development) echo "Desarrolla una nueva funcionalidad con Claude Craft: flujo TDD, agentes especializados y comandos dedicados." ;;
    es:04-bug-fixing) echo "Corrige errores de forma eficaz con Claude Craft: metodología de depuración, pruebas de regresión y herramientas dedicadas." ;;
    es:05-tools-reference) echo "Referencia completa de herramientas de Claude Craft: comandos, agentes y skills disponibles para tu flujo de trabajo diario." ;;
    es:06-troubleshooting) echo "Solución de problemas de Claude Craft: respuestas a incidencias comunes de instalación, configuración y uso." ;;
    es:07-backlog-management) echo "Gestiona tu backlog con Claude Craft: priorización de tareas, sprints y seguimiento del progreso del proyecto." ;;
    es:08-setup-new-project) echo "Configura Claude Craft en un proyecto nuevo: instalación, elección de tecnologías y primeros ajustes." ;;
    es:09-setup-existing-project) echo "Integra Claude Craft en un proyecto existente: migración progresiva, configuración y buenas prácticas de adopción." ;;
    es:10-complete-workflow) echo "El flujo de trabajo completo de Claude Craft de principio a fin: planificación, diseño, implementación y revisión del sprint." ;;

    de:01-getting-started) echo "Erste Schritte mit Claude Craft: Installation, Erstkonfiguration und Start Ihres ersten Projekts mit Claude Code." ;;
    de:02-project-creation) echo "Erstellen Sie ein neues Projekt mit Claude Craft: Struktur, unterstützte Technologien und Best Practices von Anfang an." ;;
    de:03-feature-development) echo "Entwickeln Sie ein neues Feature mit Claude Craft: TDD-Workflow, spezialisierte Agenten und passende Befehle." ;;
    de:04-bug-fixing) echo "Beheben Sie Bugs effizient mit Claude Craft: Debugging-Methodik, Regressionstests und passende Tools." ;;
    de:05-tools-reference) echo "Vollständige Tools-Referenz für Claude Craft: verfügbare Befehle, Agenten und Skills für Ihren täglichen Workflow." ;;
    de:06-troubleshooting) echo "Fehlerbehebung für Claude Craft: Lösungen für häufige Probleme bei Installation, Konfiguration und Nutzung." ;;
    de:07-backlog-management) echo "Verwalten Sie Ihr Backlog mit Claude Craft: Aufgabenpriorisierung, Sprints und Fortschrittsverfolgung." ;;
    de:08-setup-new-project) echo "Richten Sie Claude Craft in einem neuen Projekt ein: Installation, Technologieauswahl und erste Einstellungen." ;;
    de:09-setup-existing-project) echo "Integrieren Sie Claude Craft in ein bestehendes Projekt: schrittweise Migration, Konfiguration und Best Practices." ;;
    de:10-complete-workflow) echo "Der komplette Claude-Craft-Workflow von Anfang bis Ende: Planung, Design, Umsetzung und Sprint-Review." ;;

    pt:01-getting-started) echo "Primeiros passos com o Claude Craft: instalação, configuração inicial e início do seu primeiro projeto com Claude Code." ;;
    pt:02-project-creation) echo "Crie um novo projeto com o Claude Craft: estrutura, tecnologias suportadas e boas práticas desde o início." ;;
    pt:03-feature-development) echo "Desenvolva uma nova funcionalidade com o Claude Craft: fluxo TDD, agentes especializados e comandos dedicados." ;;
    pt:04-bug-fixing) echo "Corrija bugs com eficiência usando o Claude Craft: metodologia de depuração, testes de regressão e ferramentas dedicadas." ;;
    pt:05-tools-reference) echo "Referência completa das ferramentas do Claude Craft: comandos, agentes e skills disponíveis para o seu fluxo de trabalho diário." ;;
    pt:06-troubleshooting) echo "Solução de problemas do Claude Craft: respostas para problemas comuns de instalação, configuração e uso." ;;
    pt:07-backlog-management) echo "Gerencie seu backlog com o Claude Craft: priorização de tarefas, sprints e acompanhamento do progresso do projeto." ;;
    pt:08-setup-new-project) echo "Configure o Claude Craft em um novo projeto: instalação, escolha de tecnologias e primeiros ajustes." ;;
    pt:09-setup-existing-project) echo "Integre o Claude Craft a um projeto existente: migração progressiva, configuração e boas práticas de adoção." ;;
    pt:10-complete-workflow) echo "O fluxo de trabalho completo do Claude Craft de ponta a ponta: planejamento, design, implementação e revisão do sprint." ;;

    *) echo "" ;;
  esac
}

# Rewrite internal links: (SOMETHING.md) -> (/en/path)
rewrite_links_in_dir() {
  local dir="$1"  # en, fr, etc.
  local base_dir="$2"  # full path to locale dir

  find "$base_dir" -name '*.md' -type f -print0 | while IFS= read -r -d '' file; do
    sed -i \
      -e "s|(\(\.\./\)*QUICKSTART\.md)|(/$dir/getting-started/quickstart)|g" \
      -e "s|(\(\.\./\)*QUICKSTART)|(/$dir/getting-started/quickstart)|g" \
      -e "s|(\(\.\./\)*PREREQUISITES\.md)|(/$dir/getting-started/prerequisites)|g" \
      -e "s|(\(\.\./\)*PREREQUISITES)|(/$dir/getting-started/prerequisites)|g" \
      -e "s|(\(\.\./\)*INSTALLATION\.md)|(/$dir/getting-started/installation)|g" \
      -e "s|(\(\.\./\)*INSTALLATION)|(/$dir/getting-started/installation)|g" \
      -e "s|(\(\.\./\)*CONFIGURATION\.md)|(/$dir/getting-started/configuration)|g" \
      -e "s|(\(\.\./\)*CONFIGURATION)|(/$dir/getting-started/configuration)|g" \
      -e "s|(\(\.\./\)*CLI-REFERENCE\.md)|(/$dir/reference/cli)|g" \
      -e "s|(\(\.\./\)*CLI-REFERENCE)|(/$dir/reference/cli)|g" \
      -e "s|(\(\.\./\)*COMMANDS-FULL-REFERENCE\.md)|(/$dir/reference/commands-full)|g" \
      -e "s|(\(\.\./\)*COMMANDS-FULL-REFERENCE)|(/$dir/reference/commands-full)|g" \
      -e "s|(\(\.\./\)*COMMANDS\.md)|(/$dir/reference/commands)|g" \
      -e "s|(\(\.\./\)*COMMANDS)|(/$dir/reference/commands)|g" \
      -e "s|(\(\.\./\)*AGENTS-FULL-REFERENCE\.md)|(/$dir/reference/agents-full)|g" \
      -e "s|(\(\.\./\)*AGENTS-FULL-REFERENCE)|(/$dir/reference/agents-full)|g" \
      -e "s|(\(\.\./\)*AGENTS\.md)|(/$dir/reference/agents)|g" \
      -e "s|(\(\.\./\)*AGENTS)|(/$dir/reference/agents)|g" \
      -e "s|(\(\.\./\)*SKILLS\.md)|(/$dir/reference/skills)|g" \
      -e "s|(\(\.\./\)*SKILLS)|(/$dir/reference/skills)|g" \
      -e "s|(\(\.\./\)*TECHNOLOGIES\.md)|(/$dir/reference/technologies)|g" \
      -e "s|(\(\.\./\)*TECHNOLOGIES)|(/$dir/reference/technologies)|g" \
      -e "s|(\(\.\./\)*MAKEFILE-REFERENCE\.md)|(/$dir/reference/makefile)|g" \
      -e "s|(\(\.\./\)*MAKEFILE-REFERENCE)|(/$dir/reference/makefile)|g" \
      -e "s|(\(\.\./\)*SCRIPTS-REFERENCE\.md)|(/$dir/reference/scripts)|g" \
      -e "s|(\(\.\./\)*SCRIPTS-REFERENCE)|(/$dir/reference/scripts)|g" \
      -e "s|(\(\.\./\)*HOOKS\.md)|(/$dir/reference/hooks)|g" \
      -e "s|(\(\.\./\)*HOOKS)|(/$dir/reference/hooks)|g" \
      -e "s|(\(\.\./\)*MCP\.md)|(/$dir/reference/mcp)|g" \
      -e "s|(\(\.\./\)*MCP)|(/$dir/reference/mcp)|g" \
      -e "s|(\(\.\./\)*ARCHITECTURE\.md)|(/$dir/architecture)|g" \
      -e "s|(\(\.\./\)*ARCHITECTURE)|(/$dir/architecture)|g" \
      -e "s|(\(\.\./\)*FAQ\.md)|(/$dir/faq)|g" \
      -e "s|(\(\.\./\)*FAQ)|(/$dir/faq)|g" \
      -e "s|(\(\.\./\)*TROUBLESHOOTING\.md)|(/$dir/troubleshooting)|g" \
      -e "s|(\(\.\./\)*TROUBLESHOOTING)|(/$dir/troubleshooting)|g" \
      -e "s|(\(\.\./\)*MIGRATION\.md)|(/$dir/migration/)|g" \
      -e "s|(\(\.\./\)*MIGRATION-v4\.md)|(/$dir/migration/v4)|g" \
      -e "s|(\(\.\./\)*MIGRATION-v6\.md)|(/$dir/migration/v6)|g" \
      -e "s|(\(\.\./\)*MIGRATION-v7\.md)|(/$dir/migration/v7)|g" \
      -e "s|(\(\.\./\)*BMAD-PRACTICAL-GUIDE\.md)|(/en/frameworks/bmad-guide)|g" \
      -e "s|(\(\.\./\)*BMAD-PRACTICAL-GUIDE)|(/en/frameworks/bmad-guide)|g" \
      -e "s|(\(\.\./\)*RALPH-GUIDE\.md)|(/en/frameworks/ralph-guide)|g" \
      -e "s|(\(\.\./\)*RALPH-GUIDE)|(/en/frameworks/ralph-guide)|g" \
      -e "s|(\(\.\./\)*AGENT-TEAMS-GUIDE\.md)|(/en/frameworks/agent-teams)|g" \
      -e "s|(\(\.\./\)*AGENT-TEAMS-GUIDE)|(/en/frameworks/agent-teams)|g" \
      -e "s|(\(\.\./\)*CONTRIBUTING\.md)|(/en/contributing)|g" \
      -e "s|(\(\.\./\)*CONTRIBUTING)|(/en/contributing)|g" \
      -e "s|(\(\.\./\)*CHANGELOG\.md)|(/en/changelog)|g" \
      -e "s|(\(\.\./\)*CHANGELOG)|(/en/changelog)|g" \
      -e "s|(/docs/QUICKSTART)|(/$dir/getting-started/quickstart)|g" \
      -e "s|(/docs/PREREQUISITES)|(/$dir/getting-started/prerequisites)|g" \
      -e "s|(/docs/INSTALLATION)|(/$dir/getting-started/installation)|g" \
      -e "s|(/docs/CONFIGURATION)|(/$dir/getting-started/configuration)|g" \
      -e "s|(/docs/CLI-REFERENCE)|(/$dir/reference/cli)|g" \
      -e "s|(/docs/COMMANDS)|(/$dir/reference/commands)|g" \
      -e "s|(/docs/AGENTS)|(/$dir/reference/agents)|g" \
      -e "s|(/docs/SKILLS)|(/$dir/reference/skills)|g" \
      -e "s|(/docs/HOOKS)|(/$dir/reference/hooks)|g" \
      -e "s|(/docs/MCP)|(/$dir/reference/mcp)|g" \
      -e "s|(/docs/FAQ)|(/$dir/faq)|g" \
      -e "s|(/docs/TROUBLESHOOTING)|(/$dir/troubleshooting)|g" \
      "$file"
  done
}

echo "=== Syncing docs to VitePress ==="

# --- English docs (main) ---
echo "  Syncing English docs..."

copy_doc "$DOCS_DIR/QUICKSTART.md"              "$WEBSITE_DIR/en/getting-started/quickstart.md" "Quick Start" "Get started with Claude Craft in 5 minutes"
copy_doc "$DOCS_DIR/PREREQUISITES.md"            "$WEBSITE_DIR/en/getting-started/prerequisites.md" "Prerequisites" "Required dependencies for Claude Craft"
copy_doc "$DOCS_DIR/INSTALLATION.md"             "$WEBSITE_DIR/en/getting-started/installation.md" "Installation" "Install Claude Craft in your project"
copy_doc "$DOCS_DIR/CONFIGURATION.md"            "$WEBSITE_DIR/en/getting-started/configuration.md" "Configuration" "Configure Claude Craft for your project"

copy_doc "$DOCS_DIR/CLI-REFERENCE.md"            "$WEBSITE_DIR/en/reference/cli.md" "CLI Reference" "Full CLI documentation"
copy_doc "$DOCS_DIR/COMMANDS.md"                 "$WEBSITE_DIR/en/reference/commands.md" "Commands" "All slash commands"
# Split the dense Commands reference (126 headings / 426 rows) into a light index page +
# one small page per namespace, so every screen stays Lighthouse-100. en-only (this page
# is not translated). Idempotent and locale-agnostic.
node "$SCRIPT_DIR/split-commands.mjs" "$WEBSITE_DIR/en/reference/commands.md" "/en/reference/commands"
copy_doc "$DOCS_DIR/COMMANDS-FULL-REFERENCE.md"  "$WEBSITE_DIR/en/reference/commands-full.md" "Commands (Full Reference)" "Complete command documentation"
copy_doc "$DOCS_DIR/AGENTS.md"                   "$WEBSITE_DIR/en/reference/agents.md" "Agents" "All AI agents"
copy_doc "$DOCS_DIR/AGENTS-FULL-REFERENCE.md"    "$WEBSITE_DIR/en/reference/agents-full.md" "Agents (Full Reference)" "Complete agent documentation"
copy_doc "$DOCS_DIR/SKILLS.md"                   "$WEBSITE_DIR/en/reference/skills.md" "Skills" "Best practices skills"
copy_doc "$DOCS_DIR/TECHNOLOGIES.md"             "$WEBSITE_DIR/en/reference/technologies.md" "Technologies" "Supported technology stacks"
copy_doc "$DOCS_DIR/MAKEFILE-REFERENCE.md"       "$WEBSITE_DIR/en/reference/makefile.md" "Makefile Reference" "Makefile targets and usage"
copy_doc "$DOCS_DIR/SCRIPTS-REFERENCE.md"        "$WEBSITE_DIR/en/reference/scripts.md" "Scripts Reference" "Shell scripts documentation"
copy_doc "$DOCS_DIR/HOOKS.md"                    "$WEBSITE_DIR/en/reference/hooks.md" "Hooks" "Claude Code hooks"
copy_doc "$DOCS_DIR/MCP.md"                      "$WEBSITE_DIR/en/reference/mcp.md" "MCP" "Model Context Protocol"

copy_doc "$DOCS_DIR/BMAD-PRACTICAL-GUIDE.md"     "$WEBSITE_DIR/en/frameworks/bmad-guide.md" "BMAD Practical Guide" "BMAD v6 framework guide"
copy_doc "$DOCS_DIR/RALPH-GUIDE.md"              "$WEBSITE_DIR/en/frameworks/ralph-guide.md" "Ralph Wiggum Guide" "Continuous AI loop guide"
copy_doc "$DOCS_DIR/AGENT-TEAMS-GUIDE.md"        "$WEBSITE_DIR/en/frameworks/agent-teams.md" "Agent Teams" "Multi-agent coordination guide"

copy_doc "$DOCS_DIR/ARCHITECTURE.md"             "$WEBSITE_DIR/en/architecture.md" "Architecture" "Project architecture"
copy_doc "$DOCS_DIR/FAQ.md"                      "$WEBSITE_DIR/en/faq.md" "FAQ" "Frequently asked questions"
copy_doc "$DOCS_DIR/TROUBLESHOOTING.md"          "$WEBSITE_DIR/en/troubleshooting.md" "Troubleshooting" "Problem solving guide"

copy_doc "$DOCS_DIR/MIGRATION.md"                "$WEBSITE_DIR/en/migration/index.md" "Migration" "Migration guides"
copy_doc "$DOCS_DIR/MIGRATION-v4.md"             "$WEBSITE_DIR/en/migration/v4.md" "v4 Migration" "Migrate to v4"
copy_doc "$DOCS_DIR/MIGRATION-v6.md"             "$WEBSITE_DIR/en/migration/v6.md" "v6 Migration" "Migrate to v6"
copy_doc "$DOCS_DIR/MIGRATION-v7.md"             "$WEBSITE_DIR/en/migration/v7.md" "v7 Migration" "Migrate to v7"

copy_doc "$PROJECT_ROOT/CHANGELOG.md"            "$WEBSITE_DIR/en/changelog.md" "Changelog" "Release history"
copy_doc "$PROJECT_ROOT/CONTRIBUTING.md"         "$WEBSITE_DIR/en/contributing.md" "Contributing" "How to contribute"
copy_doc "$DOCS_DIR/ABOUT.md"                    "$WEBSITE_DIR/en/about.md" "About" "Claude Craft is maintained by The Bearded CTO and published under the MIT license by The Bearded Bear SAS. Learn who's behind the project and how to reach out."
copy_doc "$DOCS_DIR/COMPARE-SUPERCLAUDE.md"      "$WEBSITE_DIR/en/compare/claude-craft-vs-superclaude.md"

# English guides
echo "  Syncing English guides..."
for guide in "$DOCS_DIR/guides/en/"*.md; do
  fname=$(basename "$guide")
  copy_doc "$guide" "$WEBSITE_DIR/en/guides/$fname"
done

# Rewrite links in all English files
echo "  Rewriting English links..."
rewrite_links_in_dir "en" "$WEBSITE_DIR/en"

# --- French ---
echo "  Syncing French docs..."
[ -f "$DOCS_DIR/i18n/fr/QUICKSTART.md" ]      && copy_doc "$DOCS_DIR/i18n/fr/QUICKSTART.md"      "$WEBSITE_DIR/fr/getting-started/quickstart.md" "Démarrage Rapide" "Installez Claude Craft et lancez votre premier workflow avec Claude Code en 5 minutes : commandes, agents et bonnes pratiques prêts à l'emploi."
[ -f "$DOCS_DIR/i18n/fr/PREREQUISITES.md" ]    && copy_doc "$DOCS_DIR/i18n/fr/PREREQUISITES.md"    "$WEBSITE_DIR/fr/getting-started/prerequisites.md" "Prérequis" "Découvrez les prérequis et dépendances nécessaires pour installer Claude Craft dans votre projet avant de démarrer."
[ -f "$DOCS_DIR/i18n/fr/CLI-REFERENCE.md" ]    && copy_doc "$DOCS_DIR/i18n/fr/CLI-REFERENCE.md"    "$WEBSITE_DIR/fr/reference/cli.md" "Référence CLI" "Documentation complète de la CLI Claude Craft : commandes, options et exemples d'utilisation pour votre terminal."
[ -f "$DOCS_DIR/i18n/fr/FAQ.md" ]              && copy_doc "$DOCS_DIR/i18n/fr/FAQ.md"              "$WEBSITE_DIR/fr/faq.md" "FAQ" "Réponses aux questions fréquentes sur Claude Craft : installation, configuration, agents, commandes et bonnes pratiques."
[ -f "$DOCS_DIR/i18n/fr/TROUBLESHOOTING.md" ]  && copy_doc "$DOCS_DIR/i18n/fr/TROUBLESHOOTING.md"  "$WEBSITE_DIR/fr/troubleshooting.md" "Dépannage" "Solutions aux problèmes courants rencontrés avec Claude Craft : installation, configuration et utilisation au quotidien."
[ -f "$DOCS_DIR/i18n/fr/ABOUT.md" ]            && copy_doc "$DOCS_DIR/i18n/fr/ABOUT.md"            "$WEBSITE_DIR/fr/about.md" "À propos" "Claude Craft est maintenu par The Bearded CTO et publié sous licence MIT par The Bearded Bear SAS. Découvrez qui est derrière le projet et comment nous contacter."

for guide in "$DOCS_DIR/guides/fr/"*.md; do
  fname=$(basename "$guide")
  desc=$(guide_meta_description "fr" "${fname%.md}")
  copy_doc "$guide" "$WEBSITE_DIR/fr/guides/$fname" "" "$desc"
done

rewrite_links_in_dir "fr" "$WEBSITE_DIR/fr"

# --- Spanish ---
echo "  Syncing Spanish docs..."
[ -f "$DOCS_DIR/i18n/es/QUICKSTART.md" ]      && copy_doc "$DOCS_DIR/i18n/es/QUICKSTART.md"      "$WEBSITE_DIR/es/getting-started/quickstart.md" "Inicio Rápido" "Instala Claude Craft y pon en marcha tu primer flujo de trabajo con Claude Code en 5 minutos: comandos, agentes y buenas prácticas listos para usar."
[ -f "$DOCS_DIR/i18n/es/PREREQUISITES.md" ]    && copy_doc "$DOCS_DIR/i18n/es/PREREQUISITES.md"    "$WEBSITE_DIR/es/getting-started/prerequisites.md" "Requisitos" "Descubre los requisitos y las dependencias necesarias para instalar Claude Craft en tu proyecto antes de empezar."
[ -f "$DOCS_DIR/i18n/es/ABOUT.md" ]            && copy_doc "$DOCS_DIR/i18n/es/ABOUT.md"            "$WEBSITE_DIR/es/about.md" "Acerca de" "Claude Craft está mantenido por The Bearded CTO y publicado bajo licencia MIT por The Bearded Bear SAS. Descubre quién está detrás del proyecto y cómo contactarnos."

for guide in "$DOCS_DIR/guides/es/"*.md; do
  fname=$(basename "$guide")
  desc=$(guide_meta_description "es" "${fname%.md}")
  copy_doc "$guide" "$WEBSITE_DIR/es/guides/$fname" "" "$desc"
done

rewrite_links_in_dir "es" "$WEBSITE_DIR/es"

# --- German ---
echo "  Syncing German docs..."
[ -f "$DOCS_DIR/i18n/de/QUICKSTART.md" ]      && copy_doc "$DOCS_DIR/i18n/de/QUICKSTART.md"      "$WEBSITE_DIR/de/getting-started/quickstart.md" "Schnellstart" "Installieren Sie Claude Craft und starten Sie Ihren ersten Workflow mit Claude Code in 5 Minuten: einsatzbereite Befehle, Agenten und Best Practices."
[ -f "$DOCS_DIR/i18n/de/PREREQUISITES.md" ]    && copy_doc "$DOCS_DIR/i18n/de/PREREQUISITES.md"    "$WEBSITE_DIR/de/getting-started/prerequisites.md" "Voraussetzungen" "Erfahren Sie, welche Voraussetzungen und Abhängigkeiten für die Installation von Claude Craft in Ihrem Projekt erforderlich sind."
[ -f "$DOCS_DIR/i18n/de/ABOUT.md" ]            && copy_doc "$DOCS_DIR/i18n/de/ABOUT.md"            "$WEBSITE_DIR/de/about.md" "Über uns" "Claude Craft wird von The Bearded CTO gepflegt und unter der MIT-Lizenz von The Bearded Bear SAS veröffentlicht. Erfahren Sie, wer dahintersteckt und wie Sie Kontakt aufnehmen."

for guide in "$DOCS_DIR/guides/de/"*.md; do
  fname=$(basename "$guide")
  desc=$(guide_meta_description "de" "${fname%.md}")
  copy_doc "$guide" "$WEBSITE_DIR/de/guides/$fname" "" "$desc"
done

rewrite_links_in_dir "de" "$WEBSITE_DIR/de"

# --- Portuguese ---
echo "  Syncing Portuguese docs..."
[ -f "$DOCS_DIR/i18n/pt/QUICKSTART.md" ]      && copy_doc "$DOCS_DIR/i18n/pt/QUICKSTART.md"      "$WEBSITE_DIR/pt/getting-started/quickstart.md" "Início Rápido" "Instale o Claude Craft e comece seu primeiro workflow com o Claude Code em 5 minutos: comandos, agentes e boas práticas prontos para usar."
[ -f "$DOCS_DIR/i18n/pt/PREREQUISITES.md" ]    && copy_doc "$DOCS_DIR/i18n/pt/PREREQUISITES.md"    "$WEBSITE_DIR/pt/getting-started/prerequisites.md" "Pré-requisitos" "Conheça os pré-requisitos e as dependências necessárias para instalar o Claude Craft no seu projeto antes de começar."
[ -f "$DOCS_DIR/i18n/pt/ABOUT.md" ]            && copy_doc "$DOCS_DIR/i18n/pt/ABOUT.md"            "$WEBSITE_DIR/pt/about.md" "Sobre" "O Claude Craft é mantido por The Bearded CTO e publicado sob a licença MIT pela The Bearded Bear SAS. Descubra quem está por trás do projeto e como entrar em contato."

for guide in "$DOCS_DIR/guides/pt/"*.md; do
  fname=$(basename "$guide")
  desc=$(guide_meta_description "pt" "${fname%.md}")
  copy_doc "$guide" "$WEBSITE_DIR/pt/guides/$fname" "" "$desc"
done

rewrite_links_in_dir "pt" "$WEBSITE_DIR/pt"

echo "=== Sync complete ==="
