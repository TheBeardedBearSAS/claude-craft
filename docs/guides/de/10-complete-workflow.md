# Vollständiger Workflow-Leitfaden: Von der Idee bis zur Produktion

Ein umfassender Schritt-für-Schritt-Leitfaden zur Entwicklung einer vollständigen Anwendung mit Claude Craft, von der ersten Idee bis zum Produktions-Deployment.

---

## Überblick

Dieser Leitfaden führt Sie durch den vollständigen Entwicklungslebenszyklus:

1. **Ideenfindung** – Produktvision definieren
2. **Anforderungen** – Dokumentieren, was gebaut werden soll
3. **Architektur** – Technische Lösung entwerfen
4. **Planung** – Umsetzbare Sprints erstellen
5. **Entwicklung** – Mit TDD implementieren
6. **Qualität** – Validieren und testen
7. **Deployment** – In die Produktion deployen

**Voraussetzungen:**
- Claude Craft v8.8.2 in Ihrem Projekt installiert
- Claude Code v2.1.159 (empfohlen) oder v2.1.97+ (Minimum, CVE-2025-59536 gepatcht)
- Grundlegendes Verständnis Ihres gewählten Technologie-Stacks

---

## Phase 1: Ideenfindung (5–10 Minuten)

### Session einrichten

Konfigurieren Sie vor dem Einstieg Ihre Session für optimale Performance:

```bash
# Denkanstrengung für die Planung anpassen (hoch für komplexe Aufgaben)
/effort high

# Optional: Token-Optimierung einrichten
/common:setup-rtk
```

### Mit BMAD starten

```bash
# BMAD in Ihrem Projekt initialisieren
/bmad:init

# Oder einen Workflow starten
/workflow:init
```

### Die Vision definieren

Mit dem Product-Manager-Agenten arbeiten:

```
@pm I want to build an e-commerce platform for selling artisanal products.
Key features:
- Product catalog with categories
- Shopping cart and checkout
- User authentication
- Order management
```

Der PM hilft Ihnen dabei:
- Das zu lösende Problem zu klären
- Zielnutzer zu identifizieren
- Erfolgskennzahlen zu definieren

### Erstes Visionsdokument erstellen

```
@pm Create a vision document for this project
```

Ausgabe: `docs/vision.md`

---

## Phase 2: Anforderungen (15–30 Minuten)

### Anforderungen analysieren

Mit dem Business Analyst arbeiten:

```
@ba Analyze requirements for the e-commerce platform based on the vision
```

Der BA wird:
- Features in User Stories aufschlüsseln
- Abhängigkeiten identifizieren
- Eine User-Story-Map erstellen

### PRD erstellen

```
@pm Create a Product Requirements Document
```

### PRD validieren

```
/gate:validate-prd docs/prd.md
```

Stellen Sie sicher, dass Sie das PRD-Gate (≥80 %) bestehen:
- [ ] Problem-Statement definiert
- [ ] Zielnutzer identifiziert
- [ ] Ziele klar formuliert
- [ ] Erfolgskennzahlen definiert
- [ ] Scope-Grenzen festgelegt

---

## Phase 3: Architektur (20–45 Minuten)

### Architektur entwerfen

Mit dem Architekten arbeiten:

```
@architect Design the system architecture for the e-commerce platform
Consider:
- Symfony backend with API Platform
- PostgreSQL database
- Redis caching
- Docker deployment
```

Der Architekt wird erstellen:
- Systemarchitekturdiagramm
- Komponentendesign
- Datenmodell
- API-Verträge

### Technische Spezifikation erstellen

```
@architect Create technical specification from the PRD
```

Ausgabe: `docs/tech-spec.md`

### Entscheidungen dokumentieren

Für wichtige Entscheidungen:

```
@architect Create an ADR for choosing JWT over session-based auth
```

Ausgabe: `docs/adr/001-jwt-authentication.md`

### Tech-Spec validieren

```
/gate:validate-techspec docs/tech-spec.md
```

Stellen Sie sicher, dass Sie das Tech-Spec-Gate (≥90 %) bestehen:
- [ ] Architektur dokumentiert
- [ ] API-Verträge definiert
- [ ] Sicherheit berücksichtigt
- [ ] Performance-Anforderungen festgelegt
- [ ] Teststrategie definiert
- [ ] Deployment-Plan erstellt

---

## Phase 4: Planung (15–30 Minuten)

### Backlog erstellen

Mit dem Product Owner arbeiten:

```
@po Create user stories from the technical specification
Prioritize using MoSCoW method
```

Der PO erstellt Stories wie:
```
EPIC-001: User Authentication
├── US-001: User registration
├── US-002: User login
├── US-003: Password reset
└── US-004: Social login

EPIC-002: Product Catalog
├── US-005: Browse products
├── US-006: Product search
├── US-007: Category filtering
└── US-008: Product details
```

### Backlog validieren

```
/gate:validate-backlog
```

Jede Story muss INVEST bestehen:
- **I**ndependent (Unabhängig)
- **N**egotiable (Verhandelbar)
- **V**aluable (Wertvoll)
- **E**stimable (Schätzbar)
- **S**mall (Klein)
- **T**estable (Testbar)

### Ersten Sprint planen

Mit dem Scrum Master arbeiten:

```
@sm Plan sprint 1 with the highest priority stories
Include:
- US-001: User registration
- US-002: User login
- US-005: Browse products
```

### Sprint validieren

```
/gate:validate-sprint
```

---

## Phase 5: Entwicklung (variabel)

### Sprint-Entwicklung starten

```
/sprint:dev 1
```

Oder Story für Story vorgehen:

### 5.1 Nächste Story holen

```
/sprint:next-story --claim
```

Beispiel: US-001 (Benutzerregistrierung)

### 5.2 In Bearbeitung übertragen

```
/sprint:transition US-001 in-progress
```

### 5.3 TDD Red-Phase (fehlschlagende Tests schreiben)

Mit dem Developer-Agenten arbeiten:

```
@dev Start TDD for US-001 (User Registration)
Begin with 🔴 Red phase - write failing tests
```

Zuerst Tests erstellen:
```php
// tests/Feature/UserRegistrationTest.php
class UserRegistrationTest extends TestCase
{
    public function test_user_can_register_with_valid_data(): void
    {
        $response = $this->post('/api/register', [
            'email' => 'test@example.com',
            'password' => 'SecurePass123!',
            'name' => 'Test User'
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', ['email' => 'test@example.com']);
    }
}
```

### 5.4 TDD Green-Phase (Implementieren)

```
@dev Now implement 🟢 Green phase - make tests pass
```

Code generieren:
```
/symfony:generate-crud User
```

### 5.5 TDD Refactor-Phase

```
@dev 🔵 Refactor - clean up the implementation
```

### 5.6 Code Review

```
@symfony-reviewer Review the user registration implementation
```

### 5.7 Story-DoD validieren

```
/gate:validate-story US-001
```

### 5.8 Zum Review übertragen

```
/sprint:transition US-001 review
```

### 5.9 QA-Validierung

```
@qa Validate acceptance criteria for US-001
```

### 5.10 Story abschließen

```
/sprint:transition US-001 done
```

### 5.11 Wiederholen

Mit der nächsten Story fortfahren, bis der Sprint abgeschlossen ist.

---

## Phase 6: Qualität (fortlaufend)

### Kontextverwaltung

Verwalten Sie während der Entwicklung Ihr Kontextfenster effizient:

```bash
# Optimierungsvorschläge für den Kontext prüfen
/context

# Für einfache Aufgaben auf niedrigeren Aufwand wechseln
/effort low

# Kontext zwischen nicht zusammenhängenden Aufgaben löschen
/clear

# Wichtige Erkenntnisse sitzungsübergreifend speichern
/memory "Key architectural decision: using CQRS for order module"
```

### Kontinuierliche Qualitätsprüfungen

Regelmäßig während der Entwicklung ausführen:

```bash
# Wiederkehrende Qualitätsüberwachung einrichten
/loop 5m /common:pre-commit-check

# Architekturprüfung
/symfony:check-architecture

# Codequalität
/symfony:check-code-quality

# Sicherheits-Audit
/symfony:check-security

# Testabdeckung
/symfony:check-testing
```

### Vollständiges Audit vor dem Release

```
/team:audit --sequential
```

### Pre-Commit-Validierung

Immer vor dem Commit:

```
/common:pre-commit-check
```

### Sprint-Review

Am Ende des Sprints:

```
@sm Run sprint review for sprint 1
```

### Retrospektive

```
@sm Run sprint retrospective
```

---

## Phase 7: Deployment (30–60 Minuten)

### Docker-Konfiguration vorbereiten

```
@docker-architect Design Docker architecture for production
```

### Docker-Dateien erstellen

```
/docker:compose-setup symfony postgresql redis
```

### CI/CD-Pipeline erstellen

```
/docker:cicd-pipeline github-actions
```

### Sicherheitsprüfung

```
/docker:security-scan
```

### Pre-Release-Checkliste

```
/common:release-checklist
```

### Deployen

```bash
# Bauen und testen
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# Migrationen ausführen
docker compose exec app php bin/console doctrine:migrations:migrate

# Gesundheit überprüfen
curl https://your-app.com/health
```

---

## Ralph für die Automatisierung verwenden

Für automatisierte Entwicklungszyklen Ralph Wiggum verwenden:

```bash
# Ein Feature automatisch implementieren
/common:ralph-run "Implement user registration with TDD"

# Mit vollständigen DoD-Prüfungen
/common:ralph-run --full "Add password reset feature"
```

Ralph iteriert, bis:
- Alle Tests bestehen
- Lint besteht
- DoD-Validatoren bestehen

---

## Vollständige Befehlssequenz

Hier ist eine komprimierte Sequenz für ein typisches Feature:

```bash
# 0. Session einrichten
/effort high                    # Komplexe Planung
/common:setup-rtk               # Token-Optimierung (nur beim ersten Mal)

# 1. Initialisieren
/bmad:init

# 2. Definieren (PM)
@pm Create PRD for the feature
/gate:validate-prd docs/prd.md

# 3. Entwerfen (Architekt)
@architect Create technical specification
/gate:validate-techspec docs/tech-spec.md

# 4. Planen (PO + SM)
@po Create user stories
@sm Plan sprint 1
/gate:validate-sprint

# 5. Entwickeln (Dev)
/sprint:next-story --claim
@dev Implement with TDD
/gate:validate-story US-001
/sprint:transition US-001 done

# 6. Überprüfen (QA)
@qa Validate acceptance criteria
/team:audit --sequential

# 7. Deployen
/docker:cicd-pipeline github-actions
/common:release-checklist
```

---

## Tipps für den Erfolg

### 0. Ihr Kontextfenster verwalten

Das Kontextfenster ist Ihre wichtigste Ressource:
- `/effort low` für einfache Aufgaben, `/effort high` für komplexe
- `/context` regelmäßig verwenden, um Optimierungsvorschläge zu prüfen
- `/clear` zwischen nicht zusammenhängenden Aufgaben ausführen
- `/memory` verwenden, um wichtige Entscheidungen sitzungsübergreifend zu speichern
- `/loop` für wiederkehrende Prüfungen statt manueller Ausführungen einrichten

### 1. Quality-Gates nicht überspringen

Jedes Gate deckt andere Probleme auf:
- PRD-Gate → Verhindert das Bauen der falschen Sache
- Tech-Spec-Gate → Verhindert Architekturprobleme
- Backlog-Gate → Stellt sicher, dass Stories implementierbar sind
- Story-DoD → Sichert Codequalität

### 2. Agenten kollaborativ nutzen

Agenten sich gegenseitig übergeben lassen:
```
@bmad-master Route this to the appropriate agent
```

### 3. TDD ist nicht verhandelbar

Immer dem Schema folgen: 🔴 Red → 🟢 Green → 🔵 Refactor.

### 4. Entscheidungen dokumentieren

ADRs für wichtige Entscheidungen verwenden:
```
@architect Create ADR for choosing X over Y
```

### 5. Regelmäßige Reviews

- Täglich: `/common:daily-standup`
- Sprint-Ende: `@sm Run sprint review`
- Kontinuierlich: `@{tech}-reviewer Review this code`

---

## Fehlerbehebung

### Quality-Gate schlägt fehl

```
/gate:report
```

Prüfen, welche Kriterien fehlen.

### Story blockiert

```
/sprint:transition US-001 blocked --reason="Waiting for API"
```

### Rollback erforderlich

Bei Verwendung von Ralph mit Git-Checkpointing:
```bash
git log --oneline --grep="[ralph]"
git reset --hard HEAD~3
```

---

## Nächste Schritte

- [BMAD-Praxisleitfaden](../BMAD-PRACTICAL-GUIDE.md) – Tiefes Eintauchen in BMAD
- [Ralph-Wiggum-Leitfaden](../RALPH-GUIDE.md) – Automatisierte Entwicklung
- [Befehls-Referenz](../COMMANDS.md) – Alle verfügbaren Befehle
- [Agenten-Referenz](../AGENTS.md) – Alle verfügbaren Agenten
