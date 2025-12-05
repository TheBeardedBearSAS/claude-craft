# Symfony Architektur-Audit

## Argumente

$ARGUMENTS : Pfad zum zu auditierenden Symfony-Projekt (optional, Standard: aktuelles Verzeichnis)

## MISSION

Du bist ein erfahrener Software-Architekt, der die Architektur eines Symfony-Projekts nach den Prinzipien von Clean Architecture, DDD und Hexagonaler Architektur auditiert.

### Schritt 1: Projektstruktur analysieren

1. Projektverzeichnis identifizieren
2. Ordnerstruktur in `src/` analysieren
3. Vorhandensein der erwarteten Struktur prüfen

**Regelreferenz**: `.claude/rules/symfony-architecture.md`

### Schritt 2: Clean Architecture überprüfen

#### Schichtstruktur (5 Punkte)

- [ ] **Domain/**: Reine Geschäftslogik (Entities, Value Objects, Domain Services)
- [ ] **Application/**: Use Cases, Application Services, DTOs
- [ ] **Infrastructure/**: Konkrete Implementierungen (Repositories, Controllers, Adapters)
- [ ] **Presentation/** oder UI: Controllers, Templates, API Resources
- [ ] Keine umgekehrten Abhängigkeiten (Domain hängt von nichts ab)

**Erzielte Punkte**: ___/5

#### Verantwortungstrennung (5 Punkte)

- [ ] Domain enthält nur Geschäftslogik
- [ ] Application orchestriert Use Cases
- [ ] Infrastructure verwaltet Persistenz und externe Services
- [ ] Keine Geschäftslogik in Controllern
- [ ] Kein direkter Doctrine/ORM-Zugriff von Controllern

**Erzielte Punkte**: ___/5

### Schritt 3: Domain-Driven Design (DDD) überprüfen

#### Entities und Value Objects (5 Punkte)

- [ ] Entities mit klar definierter Identität
- [ ] Unveränderliche Value Objects für Geschäftskonzepte
- [ ] Keine systematischen Getter/Setter (Tell Don't Ask)
- [ ] Geschäftsmethoden in Entities
- [ ] Validierung in der Domain (nicht nur in Formularen)

**Erzielte Punkte**: ___/5

#### Aggregates und Repositories (5 Punkte)

- [ ] Korrekt definierte Aggregates mit Aggregate Root
- [ ] Repository-Interfaces in der Domain
- [ ] Repository-Implementierungen in Infrastructure
- [ ] Kein direkter ORM-Zugriff aus der Domain
- [ ] Aggregate-Collections über Repository verwaltet

**Erzielte Punkte**: ___/5

### Schritt 4: Hexagonale Architektur überprüfen

#### Ports (Interfaces) (2.5 Punkte)

- [ ] Primäre Ports (Application Services, Use Cases) definiert
- [ ] Sekundäre Ports (Repository, Email, Logger) als Interfaces definiert
- [ ] Interfaces in Domain oder Application
- [ ] Keine Framework-Kopplung in Interfaces
- [ ] Klare Benennung (z.B.: `UserRepositoryInterface`, `EmailSenderInterface`)

**Erzielte Punkte**: ___/2.5

#### Adapters (Implementierungen) (2.5 Punkte)

- [ ] Primäre Adapter: REST/GraphQL-Controller, CLI-Commands
- [ ] Sekundäre Adapter: DoctrineRepository, SymfonyMailer usw.
- [ ] Adapter im Infrastructure-Ordner
- [ ] Konfiguration über Dependency Injection
- [ ] Adapter können einfach ersetzt werden

**Erzielte Punkte**: ___/2.5

### Schritt 5: Überprüfung mit Deptrac

Deptrac ausführen, um Abhängigkeiten zwischen Schichten zu überprüfen:

```bash
# Prüfen, ob deptrac.yaml existiert
docker run --rm -v $(pwd):/app php:8.2-cli test -f /app/deptrac.yaml && echo "✅ deptrac.yaml gefunden" || echo "❌ deptrac.yaml fehlt"

# Deptrac ausführen
docker run --rm -v $(pwd):/app qossmic/deptrac analyse
```

Erwartete Deptrac-Konfiguration:

```yaml
deptrac:
  layers:
    - name: Domain
      collectors:
        - type: directory
          value: src/Domain/.*
    - name: Application
      collectors:
        - type: directory
          value: src/Application/.*
    - name: Infrastructure
      collectors:
        - type: directory
          value: src/Infrastructure/.*
  ruleset:
    Domain: []
    Application: [Domain]
    Infrastructure: [Domain, Application]
```

- [ ] deptrac.yaml vorhanden und konfiguriert
- [ ] Keine Abhängigkeitsverletzungen erkannt
- [ ] Domain vollständig isoliert
- [ ] Application hängt nur von Domain ab
- [ ] Infrastructure kann von Domain und Application abhängen

**Erzielte Punkte**: ___/5

### Schritt 6: Architektur-Score berechnen

**ARCHITEKTUR-SCORE**: ___/25 Punkte

Details:
- Schichtstruktur: ___/5
- Verantwortungstrennung: ___/5
- Entities und Value Objects: ___/5
- Aggregates und Repositories: ___/5
- Ports (Interfaces): ___/2.5
- Adapters (Implementierungen): ___/2.5
- Deptrac: ___/5

### Schritt 7: Detaillierter Bericht

```
=================================================
   SYMFONY ARCHITEKTUR-AUDIT
=================================================

📊 SCORE: ___/25

📐 Schichtstruktur                  : ___/5  [✅|⚠️|❌]
🔄 Verantwortungstrennung           : ___/5  [✅|⚠️|❌]
🎯 Entities und Value Objects       : ___/5  [✅|⚠️|❌]
📦 Aggregates und Repositories      : ___/5  [✅|⚠️|❌]
🔌 Ports (Interfaces)               : ___/2.5 [✅|⚠️|❌]
🔧 Adapters (Implementierungen)     : ___/2.5 [✅|⚠️|❌]
🔍 Deptrac (Abhängigkeitsprüfung)   : ___/5  [✅|⚠️|❌]

=================================================
   ERKANNTE PROBLEME
=================================================

[Liste der Probleme mit Beispieldateien]

Beispiele:
❌ src/Infrastructure/Repository/UserDoctrineRepository.php direkt in Controller verwendet
⚠️ src/Domain/Entity/User.php enthält Doctrine-Annotations
❌ Keine Domain/Application/Infrastructure-Trennung
⚠️ Veränderliche Value Objects erkannt
❌ Deptrac ist nicht konfiguriert

=================================================
   TOP 3 PRIORITÄTEN
=================================================

1. 🎯 [PRIORITÄT] - Projekt nach Clean Architecture umstrukturieren
   Auswirkung: ⭐⭐⭐⭐⭐ | Aufwand: 🔥🔥🔥🔥

2. 🎯 [PRIORITÄT] - Repository-Interfaces in Domain erstellen
   Auswirkung: ⭐⭐⭐⭐ | Aufwand: 🔥🔥

3. 🎯 [PRIORITÄT] - Deptrac konfigurieren und ausführen
   Auswirkung: ⭐⭐⭐ | Aufwand: 🔥

=================================================
   EMPFEHLUNGEN
=================================================

Architektur:
- Domain/Application/Infrastructure/Presentation-Struktur erstellen
- Geschäftslogik von Controllern in Use Cases verschieben
- Domain vollständig von Frameworks isolieren

DDD:
- Anämische Entities in Rich Domain Models umwandeln
- Value Objects für Geschäftskonzepte erstellen (Email, Money usw.)
- Aggregates und ihre Grenzen klar definieren

Hexagonal:
- Interfaces für alle externen Services erstellen
- Adapter in Infrastructure implementieren
- Dependency Injection verwenden, um Ports und Adapter zu verbinden

Tools:
- Deptrac installieren und konfigurieren: composer require --dev qossmic/deptrac-shim
- deptrac.yaml mit Abhängigkeitsregeln erstellen
- Deptrac in CI/CD integrieren

=================================================
```

## Nützliche Docker-Befehle

```bash
# Projektstruktur analysieren
docker run --rm -v $(pwd):/app php:8.2-cli find /app/src -type d -maxdepth 2

# Abhängigkeiten mit Deptrac überprüfen
docker run --rm -v $(pwd):/app qossmic/deptrac analyse --no-progress

# Klassen nach Namespace auflisten
docker run --rm -v $(pwd):/app php:8.2-cli find /app/src -name "*.php" -exec grep -l "namespace" {} \;

# Doctrine-Annotations in Domain prüfen
docker run --rm -v $(pwd):/app php:8.2-cli grep -r "@ORM" /app/src/Domain/ || echo "✅ Keine ORM-Annotations in Domain"
```

## WICHTIG

- IMMER Docker für Befehle verwenden
- NIEMALS Dateien in /tmp speichern
- Konkrete Beispiele für problematische Dateien liefern
- Progressive und realistische Refactorings vorschlagen
