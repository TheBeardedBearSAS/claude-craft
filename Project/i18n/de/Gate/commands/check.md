---
description: "Beliebiges Quality Gate ausführen: Dokument-Gates (PRD, Tech Spec, Backlog, Sprint, Story, Alignment), Code-Gates (commit, merge, release), den Gesamtbericht oder einen Phasen-Checkpoint"
argument-hint: "<prd|spec|backlog|sprint|story|alignment|commit|merge|release|all> [--phase=pre-sprint|pre-impl|post-impl|pre-merge] [target]"
---

# Quality-Gate-Check

Zentraler Einstiegspunkt für alle BMAD-Quality-Gates. Die Dokument-Gates bewerten die Planungsartefakte (PRD, Tech Spec, Backlog, Sprint, Story, Spec-Code-Alignment); die Code-Gates prüfen das Repository vor einem Commit, einem Merge oder einem Release. `all` fasst die Dokument-Gates in einem einzigen Bericht zusammen, und `--phase` führt die Prüfungen aus, die zu einer Phase des Lebenszyklus gehören.

## Verwendung

| Aufruf | Was er tut | Ersetzt |
|--------|------------|---------|
| `/gate:check prd [file]` | PRD-Quality-Gate (Schwelle 80 %) | `/gate:check prd` |
| `/gate:check spec [file]` | Tech-Spec-Quality-Gate (Schwelle 90 %) | `/gate:check spec` |
| `/gate:check backlog [story-id] [--no-gate]` | INVEST-Gate, 6/6 pro Story | `/gate:check backlog` |
| `/gate:check sprint [N] [--verbose]` | Sprint-Ready-Gate (alle Pflichtkriterien) | `/gate:check sprint` |
| `/gate:check story <story-id>` | Definition-of-Done-Gate (100 %) | `/gate:check story` |
| `/gate:check alignment [story-id]` | Spec-Code-Alignment-Gate (Schwelle 85 %) | `/gate:check alignment` |
| `/gate:check commit [--fix] [--staged]` | Pre-Commit-Prüfung der geänderten Dateien | `/gate:check commit` |
| `/gate:check merge [source] [target]` | Pre-Merge-Prüfung eines Branches | `/gate:check merge` |
| `/gate:check release <version> [patch\|minor\|major]` | Release-Checkliste | `/gate:check release` |
| `/gate:check all [--detailed]` | Bericht über alle Dokument-Gates | `/gate:check all` |
| `/gate:check --phase=<phase> [story-or-sprint]` | Checkpoint einer Lebenszyklus-Phase: `pre-sprint`, `pre-impl`, `post-impl`, `pre-merge` | `/gate:check --phase` |

## Argumente

$ARGUMENTS (Format: `<gate> [target] [flags]` oder `--phase=<phase> [target]`)

1. Das erste Positionswort wählt das Gate: `prd`, `spec`, `backlog`, `sprint`, `story`, `alignment`, `commit`, `merge`, `release` oder `all`.
2. Die übrigen Positionswörter sind das `target` des Gates (eine Datei, eine Story-ID, eine Sprint-Nummer, ein Branch oder eine Version, siehe jeweiligen Abschnitt); die anderen Flags sind pro Gate dokumentiert.
3. `--phase=<phase>` ersetzt das Gate-Wort: Der Checkpoint dieser Phase wird ausgeführt (siehe `## --phase`). `pre-sprint` und `post-impl` akzeptieren einen Sprint oder eine Story, `pre-impl` eine Story.
4. Kein Argument: die obige Verwendungstabelle anzeigen und anhalten. Unbekanntes Gate: die gültigen Gates auflisten.

## Gemeinsame Regeln

- **Standardpfade**: PRD `project-management/prd.md`, Tech Spec `project-management/tech-spec.md`, Stories `project-management/backlog/`, Sprints `project-management/sprints/sprint-{N}-{slug}/`, Constitution `project-management/constitution.md` (optional). Die Schwellenwerte der Gates werden in `.bmad/gates/*.yaml` konfiguriert (`prd-gate`, `techspec-gate`, `backlog-gate`, `sprint-ready-gate`, `story-gate`).
- **Single Source of Truth für den Status**: `.bmad/sprint-status.yaml` enthält den Status der Stories und Tasks (`backlog -> ready-for-dev -> in-progress -> review -> done`, jeder -> `blocked`). Die Gates lesen den Status daraus und niemals aus den Markdown-Dateien, die nur den Inhalt enthalten. Schema: `.claude/templates/project/sprint-status.md`.
- **Bewertung**: gewichtete Kriterien; ein bestandenes Kriterium addiert sein Gewicht zum Score (Endscore = Summe der bestandenen Gewichte). Alle „Pflicht"-Kriterien müssen bestanden sein, damit das Gate bestanden ist. Symbole: ✅ bestanden, ⚠️ teilweise, ❌ fehlend oder nicht bestanden, ⏳ übersprungen oder nicht geprüft.
- **Bericht**: Jedes Kriterium mit dem Gefundenen oder Fehlenden auflisten, den Score im Verhältnis zur Schwelle, das Urteil (`GATE PASSED` / `GATE FAILED (need X%, got Y%)`), dann nummerierte „Required Actions" mit einem konkreten Beispiel pro Fehler und dem Befehl für die erneute Ausführung (`/gate:check <gate>`).
- **Docker**: Die Code-Gates führen die Projektwerkzeuge über Docker aus (`docker compose exec <service> ...` oder `docker run --rm ...`), niemals in der lokalen Umgebung.

## prd

Validiert ein PRD (Argument: `[prd-file]`, Standard `project-management/prd.md`). Schwelle: **80 %**.

| Kriterium | Gewicht | Pflicht | Beschreibung |
|-----------|---------|---------|--------------|
| Problem Statement | 15 % | Ja | Klare Formulierung des Problems |
| Target Users | 15 % | Ja | Definierte Zielgruppe/Personas |
| Goals/Objectives | 15 % | Ja | Messbare Ziele |
| Success Metrics | 15 % | Ja | KPIs und Messgrößen |
| Scope/Boundaries | 10 % | Ja | Was im/außerhalb des Umfangs liegt |
| User Stories Overview | 10 % | Ja | Übergeordnete Feature-Liste |
| Assumptions | 10 % | Nein | Dokumentierte Annahmen |
| Risks | 10 % | Nein | Risikoidentifikation (mit Gegenmaßnahmen) |

**Ablauf**: Die Datei suchen und laden (Fehler, falls sie fehlt); für jedes Kriterium prüfen, ob der Abschnitt mit relevanten Schlüsselwörtern und einer Mindestlänge existiert; die Gewichte der bestandenen Kriterien addieren; Bericht erstellen.

```
PRD Quality Gate Validation
File: project-management/prd.md   Threshold: 80%
✅ Problem Statement (15%)   Found: clear problem definition in "Overview"
❌ Goals/Objectives (15%)    Missing: no measurable goals found
⚠️ Risks (10%)               Partial: risks listed but no mitigations
Score: 90/100 (90%)
✅ PRD GATE PASSED — Next: /project:generate-tech-spec
```

Bei einem Fehlschlag pro Lücke ein Beispiel vorschlagen (z. B. Ziel „Reduce checkout time by 30%", KPI „Conversion rate > 5%", Risiko „API rate limits; Mitigation: caching"). Das Gate wird auch vor `/project:generate-tech-spec` und beim BMAD-Workflow-Übergang geprüft.

## spec

Validiert eine Tech Spec (Argument: `[techspec-file]`, Standard `project-management/tech-spec.md`). Schwelle: **90 %**.

| Kriterium | Gewicht | Pflicht | Beschreibung |
|-----------|---------|---------|--------------|
| Architecture Overview | 12 % | Ja | Beschreibung des Systemdesigns |
| Architecture Diagram | 10 % | Ja | Visuelle Darstellung (mermaid, PNG, SVG) |
| Components | 12 % | Ja | Definition der Module/Services |
| Data Model | 10 % | Ja | Datenbank-/Entitätsdesign |
| API Contracts | 10 % | Ja | Endpunkt-Spezifikationen mit Schemas |
| Security | 12 % | Ja | Authentifizierungs- und Sicherheitsmaßnahmen |
| Performance | 8 % | Nein | Performance-Anforderungen |
| Error Handling | 8 % | Nein | Fehlerstrategie |
| Testing Strategy | 10 % | Ja | Testansatz |
| Deployment | 8 % | Nein | CI/CD und Release |

**Ablauf**: Die Datei suchen und laden; Abschnitte und Schlüsselwörter prüfen, sicherstellen, dass Diagramme vorhanden sind und die technische Tiefe ausreicht; Score berechnen; Bericht erstellen.

```
Tech Spec Quality Gate Validation
File: project-management/tech-spec.md   Threshold: 90%
❌ Architecture Diagram (10%)  Missing: no diagram found (mermaid, PNG, SVG)
⚠️ API Contracts (10%)         Partial: endpoints listed but no schemas
Score: 68/100 (68%)
❌ TECH SPEC GATE FAILED (need 90%, got 68%)
```

Die Required Actions liefern pro Lücke eine Vorlage: ein mermaid-Diagrammgerüst, die Sicherheitsstrategie (Authentifizierungsmethode, Autorisierungsmodell, Verschlüsselung), Request-/Response-Schemas mit Fehlerformaten und Versionierung, CI/CD-Stufen mit Promotion und Rollback. Für wesentliche Entscheidungen ein ADR vorschlagen: `/common:architecture-decision "JWT vs Session-based authentication"`. Bei Bestehen: nächster Schritt `/project:generate-backlog`, dann `/gate:check backlog`.

## backlog

Validiert Stories anhand von INVEST (Argumente: `[story-id] [--no-gate]`). Standard: alle Stories. `--no-gate` führt nur die einfache INVEST-Prüfung aus (keine Schwellenwerte, kein Pass/Fail-Urteil), nützlich während des Refinements. Schwelle: **6/6 für jede Story**.

| Buchstabe | Kriterium | Prüfung |
|-----------|-----------|---------|
| **I** | Independent | `blocked_by` ist leer |
| **N** | Negotiable | Hat eine Beschreibung angemessener Länge, nicht überspezifiziert (Anzahl Tasks) |
| **V** | Valuable | Hat Akzeptanzkriterien und eine Nutzenaussage |
| **E** | Estimable | Story Points > 0 |
| **S** | Small | Story Points ≤ 8 |
| **T** | Testable | Anzahl Akzeptanzkriterien > 0 (Gherkin) |

**Ablauf**: `.bmad/sprint-status.yaml` lesen und die angeforderte Story oder alle Stories laden; die 6 Kriterien pro Story auswerten (0-6); Bericht pro Story und aggregiert erstellen (bestanden 6/6, Warnungen 4-5/6, fehlgeschlagen < 4/6). Ein nicht auswertbares Kriterium (z. B. S ohne Punkte) wird mit `?` angezeigt.

```
✅ US-001: User login          Score: 6/6 ✅
⚠️ US-002: User registration   [E] ✗ Estimable - No story points   Score: 4/6 ⚠️
❌ US-003: Rewrite of auth     [I] ✗ blocked by US-001, US-002  [S] ✗ 13 > 8 points   Score: 3/6 ❌
Summary: validated 8 | passing 6 | warnings 1 | failing 1
❌ BACKLOG GATE FAILED
```

Häufige Probleme beheben: Story zu groß (S) → `/project:backlog edit story US-003`, um den Umfang zu verkleinern, und `/project:backlog add story` für den Rest; fehlende Punkte (E) → `/project:backlog edit story US-002 --points 3`; fehlende Akzeptanzkriterien (V, T) → `/project:backlog edit story US-002 "Given... When... Then..."`. Bei Bestehen: weiter mit `/gate:check sprint`.

## sprint

Validiert die Sprint-Bereitschaft (Argumente: `[N] [--verbose]`). `N` ist die Sprint-Nummer und akzeptiert `1`, `001` oder `sprint-001`; Standard: `metadata.sprint_id` aus `.bmad/sprint-status.yaml`, andernfalls der neueste Ordner `project-management/sprints/sprint-*/`. `--verbose` zeigt die detaillierte Aufschlüsselung der Stories. Schwelle: **alle Pflichtkriterien**.

| Kriterium | Gewicht | Pflicht | Beschreibung |
|-----------|---------|---------|--------------|
| Sprint Metadata | 20 % | Ja | ID, Name, Daten definiert |
| Sprint Goal | 15 % | Ja | Klare Zielformulierung (mind. 10 Zeichen) |
| Stories Ready | 25 % | Ja | Mindestens 1 Story in `ready-for-dev` (empfohlen: 3) |
| Stories Estimated | 20 % | Ja | Alle Stories haben Punkte |
| Capacity Check | 10 % | Nein | Ready-Punkte ≤ `metadata.capacity_points` + 20 % (übersprungen, falls nicht definiert) |
| Dependencies Resolved | 10 % | Nein | Keine blockierte Story im Ready-Status |

**Ablauf**
1. Den Sprint-Status laden, in dieser Reihenfolge:
   1. `.bmad/sprint-status.yaml`, falls vorhanden und dessen `metadata.sprint_id` zum Sprint `N` passt: Metadaten extrahieren und die Stories nach Status zählen.
   2. Andernfalls Markdown-Fallback aus `project-management/sprints/sprint-{N}-*/` (von `/workflow:start` geschrieben): Metadaten, Ziel und Kapazität aus `sprint-goal.md` (Start, Ende, Kapazität, Ziel); Stories aus der Tabelle der ausgewählten US in `sprint-goal.md` und den Dateien `project-management/backlog/user-stories/US-*.md` (Punkte, Status), wobei eine geplante, noch nicht begonnene Story als `ready-for-dev` zählt; blockierende Abhängigkeiten aus `sprint-dependencies.md`.
   3. Nichts gefunden: Abbruch mit „No sprint {N}: run `/workflow:start {N}`".
2. Die Metadatenfelder `sprint_id`, `name`, `start_date`, `end_date`, `goal` validieren.
3. Die Stories validieren (ready, geschätzt, keine blockiert) sowie die optionale Kapazität.
4. Bericht erstellen, beginnend mit der verwendeten Quelle: `Source: .bmad/sprint-status.yaml` oder `Source: markdown (project-management/sprints/sprint-{N}-*/)`.

Im Fallback-Modus wird das Gate weiterhin ausgewertet, aber der Bericht fügt eine nicht blockierende Warnung hinzu: Die `/sprint:*`-Befehle benötigen `.bmad/sprint-status.yaml`; `/workflow:start {N}` ausführen oder `/project:migrate`, um `.bmad/sprint-status.yaml` aus einem bestehenden Backlog zu erstellen.

```
Sprint Ready Gate Validation
Sprint: sprint-3 - User Management   Period: 2026-01-29 → 2026-02-12 (14 days)
✅ Sprint Metadata (20%)  ✅ Sprint Goal (15%)  ✅ Stories Ready (25%): 5 stories, 21 points
✅ Stories Estimated (20%)  ✅ Capacity Check (10%): 21/25 = 84%  ✅ Dependencies Resolved (10%)
Score: 100/100 — ✅ SPRINT READY GATE PASSED
Commands: /workflow:start (start the sprint), /sprint:next-story (pick the first story)
```

Bei einem Fehlschlag zeigen die Required Actions den `metadata`-Block, der zu `.bmad/sprint-status.yaml` hinzuzufügen ist:

```yaml
metadata:
  sprint_id: "sprint-3"
  name: "User Management"
  start_date: "2026-01-29"
  end_date: "2026-02-12"
  goal: "Implement core user management features"
  capacity_points: 25  # Optional: team capacity
```

danach die fehlenden Schätzungen (`/project:backlog edit story US-010 --points 5`) und die blockierten Ready-Stories (aus dem Sprint entfernen, die Abhängigkeit auflösen oder neu ordnen).

## story

Validiert eine Story gegen die Definition of Done (Argument: `<story-id>`, erforderlich, z. B. `US-005`). Schwelle: **100 % (alle Pflichtkriterien)**.

| Kriterium | Gewicht | Pflicht | Prüfung |
|-----------|---------|---------|---------|
| Tasks Complete | 20 % | Ja | `tasks.completed == tasks.total` |
| Tests Passing | 20 % | Ja | `tdd_phase in ['green', 'refactor', 'done']` |
| AC Validated | 20 % | Ja | `acceptance_criteria.validated == acceptance_criteria.total` |
| Code Reviewed | 15 % | Ja | `status == 'review'` oder `review.approved == true` (PR genehmigt) |
| No Blockers | 10 % | Ja | `blocked_reason == null` |
| Documentation | 10 % | Nein | Doku bei Bedarf aktualisiert |
| Security Review | 5 % | Nein | Sicherheitsauswirkungen geprüft |

**Ablauf**: `.bmad/sprint-status.yaml` lesen, die Story anhand der ID finden und ihre Felder laden; jedes Kriterium prüfen; Tasks und AC mit ihrem Zustand auflisten; Bericht erstellen.

```
Story DoD Gate: US-005 — Email verification   Status: in-progress
❌ Tasks Complete (20%)   2/4 done   ✓ TASK-021 ✓ TASK-022 □ TASK-023 (in-progress) □ TASK-024 (pending)
❌ Tests Passing (20%)    TDD Phase: red
⚠️ Acceptance Criteria    1/3 validated
❌ Code Reviewed (15%)    No PR created yet
Score: 25/100 — ❌ STORY DoD GATE FAILED. Resume work: /sprint:dev US-005
```

Bei Bestehen kann die Story mit `/sprint:transition US-005 done` auf `done` gesetzt werden. Das Gate wird außerdem vom Stop-Hook (`quality-gate.sh`) und vor `/sprint:transition <id> done` geprüft.

| TDD-Phase | Bedeutung | Nächster Schritt |
|-----------|-----------|------------------|
| red | Tests schlagen fehl | Code implementieren |
| green | Tests bestehen | Refactoring |
| refactor | Aufräumen | Abschließen oder nächster Task |
| done | Zyklus abgeschlossen | In Review überführen |

## alignment

Validiert, dass die Implementierung mit den Spezifikationen übereinstimmt, d. h. kein Spec-Drift vorliegt (Argument: `[story-id]`, Standard: alle Stories des aktuellen Sprints). Schwelle: **85 %**.

| Kriterium | Gewicht | Pflicht | Beschreibung |
|-----------|---------|---------|--------------|
| Requirement coverage | 20 % | Ja | Alle FR-xxx des PRD sind durch Stories abgedeckt |
| Story-code mapping | 20 % | Ja | Alle Stories haben entsprechende Code-Referenzen |
| AC-test mapping | 20 % | Ja | Alle Akzeptanzkriterien haben Tests |
| Tech spec adherence | 15 % | Ja | Die Implementierung folgt dem Design der Tech Spec |
| Constitution compliance | 15 % | Ja | Der Code respektiert die Projekt-Constitution |
| Scope drift detection | 10 % | Nein | Keine nicht referenzierten Code-Änderungen |

**Ablauf**
1. Das PRD (FR-xxx-IDs), die Stories (`Implements:`-Referenzen), die Tech Spec und, falls vorhanden, `project-management/constitution.md` laden.
2. Vorwärts verfolgen (Spec → Code): Für jedes FR-xxx die implementierenden Stories finden, für jede Story die mit `// Story: US-xxx` markierten Code-Dateien, für jedes AC den passenden Test.
3. Rückwärts verfolgen (Code → Spec): Prüfen, dass jede Story-Referenz im Backlog existiert und zum richtigen Sprint gehört; Code-Änderungen ohne Story-Referenz markieren (Scope Drift).
4. Die Constitution validieren: technische Einschränkungen, Designprinzipien, NFR-Ziele.
5. Score berechnen und Bericht erstellen.

```
SPEC-CODE ALIGNMENT GATE ❌   Story: US-012 | Score: 65%
✅ Requirement coverage   3/3 FR-xxx covered
❌ Story-code mapping     2 files missing references
❌ AC-test mapping        AC-2 has no test
⚠️ Scope drift            3 unreferenced files
Actions: 1. Add // Story: US-012 to ProfileService.ts  2. Write test for AC-2  → Fix issues before merging
```

Siehe auch: `/project:trace` (Traceability-Matrix), `/project:trace --gaps` (Anforderungsabdeckung).

## commit

Prüft den Code vor einem Commit (Flags: `--fix` behebt die behebbaren Probleme, `--staged` prüft nur gestagte Dateien).

1. **Geänderte Dateien ermitteln**: `git diff --cached --name-only` (gestaged) und `git diff --name-only` (ungestaged).
2. **Technologie erkennen** anhand der Endung: `.php` → php-cs-fixer, phpstan; `.dart` → dart format, dart analyze; `.py` → ruff, mypy; `.ts/.tsx/.js/.jsx` → eslint, prettier (+ `tsc --noEmit`).
3. **Prüfungen in Docker ausführen**: PHP (`docker compose exec php vendor/bin/php-cs-fixer fix --dry-run --diff`, `vendor/bin/phpstan analyse`, `lint:twig`, `lint:container`), Dart (`dart format --set-exit-if-changed`, `dart analyze`, `flutter test --coverage`), Python (`ruff check`, `ruff format --check`, `mypy`), JS/TS (`npx eslint`, `npx prettier --check`, `npx tsc --noEmit`).
4. **Globale Prüfungen**: Secret-Muster (Zuweisungen von `password|secret|api_key|token`, `sk_live_`, `pk_live_`, `ghp_`, `gho_`, `AKIA`), verbotene gestagte Dateien (`.env`, `.pem`, `.key`, `.p12`), Quelldateien größer als 1 MB.
5. **Bericht**: erfolgreiche Prüfungen, Probleme (`file:line`, Tool, Meldung), Übersichtstabelle (Formatierung, Linting, Typen, Secrets), erforderliche Aktionen und `Commit authorized: ✅ YES / ❌ NO`.
6. **`--fix`**: die Fixer statt der Dry-Run-Prüfungen ausführen (`php-cs-fixer fix`, `dart format`, `ruff check --fix` + `ruff format`, `eslint --fix` + `prettier --write`).

| Blockierend (Commit verboten) | Nicht blockierend (Warnung) |
|-------------------------------|-----------------------------|
| Syntaxfehler, PHPStan-/mypy-/tsc-Fehler, erkannte Secrets, `.env`-Dateien, private Schlüssel/Zertifikate | Formatierungsprobleme, ESLint-Warnungen, gesunkene Testabdeckung, hinzugefügte TODO/FIXME |

Zur Automatisierung aus einem Pre-Commit-Hook aufrufen: `claude-code "/gate:check commit --staged"`.

## merge

Prüft einen Branch vor dem Merge (Argumente: `[source] [target]`; source Standard: aktueller Branch, target Standard: `main` oder `master`). Beispiel: `/gate:check merge feature/auth main`.

1. **Diff analysieren**: zu mergende Commits (`git log target..source --oneline`), geänderte Dateien (`--stat`), hinzugefügte/entfernte Zeilen (`--shortstat`).
2. **Qualitätsprüfungen** (in Docker): die komplette Test-Suite mit Coverage (phpunit, `flutter test --coverage`, `pytest --cov`, `npm run test -- --coverage`); vollständige statische Analyse (`phpstan analyse -l max`, `dart analyze --fatal-infos`, `mypy --strict .`, `tsc --noEmit`); Abhängigkeits-Audit (`composer audit`, `pip-audit`, `npm audit`, `dart pub outdated`).
3. **Spezifische Prüfungen**: DB-Migrationen (`doctrine:migrations:diff`, `doctrine:schema:validate`, Umkehrbarkeit), API-Breaking-Changes (Diff von `openapi.yaml` / `docs/api/`), Konfigurationsänderungen (`config/`, `.env.example`, `docker-compose*.yml`).
4. **Commit-Analyse**: Jede Nachricht folgt Conventional Commits `type(scope): description`, andernfalls warnen.
5. **Coverage**: vorher/nachher vergleichen; die Abdeckung darf nicht sinken.
6. **Spec-Prüfungen**: den `pre-merge`-Checkpoint ausführen (siehe `## --phase`).
7. **Bericht**: Statistiken, Testtabelle (Suite, bestanden, fehlgeschlagen, übersprungen, Coverage-Delta), Tabelle der statischen Analyse, Sicherheit (Audit, Secrets, sensible Dateien), Migrationen, Aufmerksamkeitspunkte nach HIGH/MEDIUM/LOW/INFO eingestuft, abschließende Checkliste (genehmigtes Code-Review und Staging-Tests sind manuelle Punkte) und `Merge authorized: ✅ YES / ❌ NO`.

| Blockierend (Merge verboten) | Nicht blockierend (Warnung) |
|------------------------------|-----------------------------|
| Fehlschlagende Tests, Coverage-Rückgang > 2 %, Fehler der statischen Analyse, kritische/hohe Schwachstellen, Secrets im Code, nicht umkehrbare Migrationen | Warnungen der statischen Analyse, hinzugefügte TODO/FIXME, niedrige/mittlere Schwachstellen, Coverage-Rückgang < 2 % |

## release

Führt das Team durch ein Release (Argumente: `<version> [patch|minor|major]`, z. B. `1.2.0 minor` oder `2.0.0-beta.1`). Beispiel: `/gate:check release 1.2.0 minor`.

1. **Pre-Release-Validierung**: richtiger Branch (`main`/`master` oder `release/*`), keine uncommitteten Änderungen, alle Tests bestehen; `CHANGELOG.md` aktuell (Änderungen seit dem letzten Tag mit `git log $(git describe --tags --abbrev=0)..HEAD --pretty=format:"- %s"`); Versionsdateien aktualisiert (`composer.json`, `pyproject.toml`/`__version__.py`, `package.json`, `pubspec.yaml`, `Info.plist`, `build.gradle`).
2. **Umfassende Tests**: Unit, Integration, E2E, Performance, Security.
3. **Dokumentation**: README, generierte API-Doku, Migrationsleitfaden bei Breaking Changes.
4. **Die interaktive Checkliste generieren** `RELEASE CHECKLIST - v{VERSION}` (Typ, Datum, Branch) mit den folgenden Abschnitten, jeder Punkt eine `- [ ]`-Checkbox:
   - **Pre-Release**: Codequalität (Tests bestehen, Coverage ≥ 80 %, keine Fehler der statischen Analyse, alle PRs reviewt, keine blockierenden TODO/FIXME), Sicherheit (keine kritischen CVEs, keine Secrets, OWASP-Tests, gültige SSL-Zertifikate), Dokumentation (CHANGELOG, README, API-Doku, Migrationsleitfaden, Release Notes), Versionierung (Version erhöht, Tags vorbereitet, Release-Branches).
   - **Build & Package**: Backend (Produktions-Build, Assets, Migrationen, Umgebungsvariablen dokumentiert), Frontend (Bundle optimiert, CDN, Service Worker, Sourcemaps nicht ausgeliefert), Mobile falls zutreffend (iOS-/Android-Builds signiert, Store-Screenshots und -Metadaten).
   - **Staging-Validierung**: Deployment, Migrationen, Smoke-Tests, Regressionstests, Performance, Monitoring, Rollback getestet.
   - **Produktions-Deployment**: Pre-Deploy (Wartungsmodus, Datenbank-Backup, Kommunikation an den Support, Deployment-Fenster), Deploy (Start, Migrationen, Health Checks), Post-Deploy (Smoke-Tests, Monitoring, Performance, Git-Tag gepusht, GitHub/GitLab-Release).
   - **Kommunikation**: Release Notes, Support, Kunden, öffentliche Dokumentation, Ankündigung.
   - **Rollback-Plan**: Problem identifizieren (Logs, Alerts), Entscheidungsschwelle (z. B. > 5 % 5xx über 5 Min.) und Entscheider, Rollback-Befehl, DB-Rollback (Migrations down), Kommunikation (Team, Incident, Post-Mortem).
   - **Abschlussvalidierung**: alle Kästchen abgehakt, validiert von, Datum/Uhrzeit des Releases, Notizen.

Nützliche Befehle: `git tag -a v{VERSION} -m "Release v{VERSION}"` + `git push origin v{VERSION}`; `gh release create v{VERSION} --title "v{VERSION}" --notes-file RELEASE_NOTES.md`; `git-cliff --unreleased --tag v{VERSION} > CHANGELOG.md`.

| SemVer-Typ | Wann | Beispiel |
|------------|------|----------|
| MAJOR | Breaking Changes | 1.0.0 → 2.0.0 |
| MINOR | Neues Feature | 1.0.0 → 1.1.0 |
| PATCH | Bugfix | 1.0.0 → 1.0.1 |

## all

Aggregierter Bericht der Dokument-Gates (Argument: `[--detailed]`, das die Validierungsdetails jedes Gates einbezieht).

1. **Die anwendbaren Gates ermitteln**: PRD-Gate, falls `project-management/prd.md` existiert, Tech-Spec-Gate, falls `project-management/tech-spec.md` existiert, Backlog-Gate, falls Stories in `.bmad/sprint-status.yaml` existieren, Sprint-Ready-Gate, falls die Sprint-Metadaten existieren, Story-Gates für jede Story im Status `in-progress` / `review`.
2. **Jedes anwendbare Gate ausführen** (`prd`, `spec`, `backlog`, `sprint`, dann `story` pro Story) und die Scores sammeln.
3. **Zusammenfassen** in der Übersicht und anschließend **priorisierte Aktionen empfehlen**, basierend auf den Fehlschlägen.

```
BMAD Quality Gates Report   Project: claude-craft   Sprint: sprint-3 - User Management
| Gate | Threshold | Score | Status |
| PRD | 80% | 90% | ✅ PASS |
| Tech Spec | 90% | 92% | ✅ PASS |
| Backlog | 6/6 | 5.8/6 avg | ⚠️ WARN |
| Sprint Ready | 100% | 100% | ✅ PASS |
| Story DoD | 100% | varies | 📊 |
Story DoD Status: US-010 in-progress 45% ⏳ | US-012 review 85% ⚠️ | US-013 done 100% ✅
Overall Health: 🟢 Good — 4/5 gates passing, 8/10 stories on track
Recommendations: 1. ⚠️ US-002 missing story points → /project:backlog edit story US-002 --points 3
```

Der Bericht mit `--detailed` ergänzt pro Gate die Datei, die Schwelle, den Score, den Status und jedes Kriterium, die Stories mit Problemen (Backlog), die DoD-Aufschlüsselung jeder Story sowie die Action Items nach Priorität (1 blockierend, 2 sollte behoben werden, 3 wünschenswert). Der Bericht kann bei Bedarf erzeugt, in die Sprint-Retrospektive aufgenommen, für das Projekt-Health-Monitoring genutzt oder für Stakeholder exportiert werden. Die Code-Gates (`commit`, `merge`, `release`) und `alignment` sind nicht enthalten: Sie werden separat ausgeführt.

## --phase

Führt automatisierte Checkpoints an den kritischen Phasen des Lebenszyklus aus, um sicherzustellen, dass die Spezifikationen kohärent, vollständig und mit der Implementierung abgestimmt sind.

**Voraussetzungen**: `project-management/prd.md` mit FR-xxx-IDs, `project-management/backlog/` mit User Stories, `.bmad/sprint-status.yaml` für den Sprint-Kontext; optional `project-management/constitution.md`.

**Der Plan-Modus ist obligatorisch**: Vor der Ausführung den betroffenen Code analysieren, einen Plan vorschlagen und vor jeder Änderung auf die Validierung warten.

| Phase | Wann | Target |
|-------|------|--------|
| `pre-sprint` | Vor dem Start eines Sprints (nach `/workflow:start`) | Sprint |
| `pre-impl` | Vor dem Coden einer Story (nach `/sprint:next-story --claim`) | Story |
| `post-impl` | Nach Abschluss einer Story (vor `/sprint:transition US-xxx review`) | Story |
| `pre-merge` | Vor dem Merge nach main (von `merge` aufgerufen) | Story oder Sprint |

**pre-sprint**: die dem Sprint zugewiesenen Stories laden.

| Prüfung | Pflicht |
|---------|---------|
| Story AC completeness: jede Story hat Gherkin-AC | Ja |
| Story estimation: alle Stories haben Punkte | Ja |
| PRD traceability: `Implements:` verweist auf gültige FR-xxx-IDs | Ja |
| Task decomposition: mindestens 1 Task pro Story | Ja |
| Dependency check: keine zirkulären oder ungelösten `Depends on:` | Ja |
| Constitution alignment: keine Widersprüche | Nein |

**pre-impl**: die Story und ihre Tech-Spec-Abschnitte laden (Referenz `Tech Spec:`).

| Prüfung | Pflicht |
|---------|---------|
| Tech spec coverage: jedes FR-xxx der Story ist abgedeckt | Ja |
| AC testability: jedes AC hat eine GIVEN/WHEN/THEN-Struktur | Ja |
| Dependencies resolved: alle `Depends on`-Stories sind `done` | Ja |
| Task clarity: Tasks haben klare Beschreibungen | Ja |
| NFR alignment: respektiert die NFRs der Constitution | Nein |

**post-impl**: die Story und ihre Tasks laden.

| Prüfung | Pflicht |
|---------|---------|
| Code traceability: Code-Dateien verweisen auf `// Story: US-xxx` (oder `# Story: US-xxx`) | Ja |
| Test coverage: Tests existieren für jedes AC | Ja |
| All tasks done | Ja |
| TDD phase: `refactor` oder `done` | Ja |
| No regressions: die Test-Suite besteht weiterhin | Ja |
| Spec drift: der implementierte Umfang entspricht der Spec (kein Scope Creep) | Nein |

**pre-merge**: alle vorherigen Checkpoints ausführen, dann:

| Prüfung | Pflicht |
|---------|---------|
| AC validation: alle Akzeptanzkriterien validiert | Ja |
| Code review erledigt | Ja |
| Test suite green (vollständige Suite) | Ja |
| Constitution respect | Ja |
| Traceability complete: FR → US → Code → Test, mit `/project:trace` | Ja |
| Documentation aktualisiert | Nein |

```
CHECKPOINT FAILED ❌   Phase: pre-impl   Story: US-012   Score: 60% (3/5 checks passed)
✅ AC testability  3/3   ✅ Dependencies resolved   ✅ Task clarity  4/4
❌ Tech spec coverage  Missing FR-003 mapping   ❌ NFR alignment  Perf target undefined
Actions required: 1. Add FR-003 coverage to tech spec section 3.2  2. Define performance targets
→ Fix issues before proceeding
```

Beispiel: `/gate:check --phase=pre-sprint Sprint-3` → „Score: 83% (5/6 passed) — WARNING: US-015 has no tasks yet". Integration: `/workflow:start` löst `pre-sprint` aus, `/sprint:next-story` schlägt `pre-impl` vor, `/sprint:transition` löst `post-impl` aus, und `merge` löst `pre-merge` aus.

## Verwandte Befehle

- `/project:trace` — Traceability-Matrix und Anforderungsabdeckung (`--gaps`)
- `/project:generate-tech-spec`, `/project:generate-backlog` — erzeugen die Artefakte, die die Gates validieren
- `/workflow:start` — den Sprint starten (enthält den pre-sprint-Checkpoint)
- `/sprint:transition` — eine Story in den nächsten Status überführen
