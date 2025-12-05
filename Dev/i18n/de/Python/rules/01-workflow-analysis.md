# Obligatorischer Analyse-Workflow

## Grundprinzip

**KEINE Codeänderung sollte ohne vollständige vorherige Analyse vorgenommen werden.**

Diese Regel ist absolut und gilt für:
- Erstellung neuer Features
- Behebung von Bugs
- Refactoring
- Optimierungen
- Konfigurationsänderungen
- Abhängigkeitsaktualisierungen

## 7-Schritt-Analyse-Methodologie

### 1. Verständnis des Bedarfs

#### Zu stellende Fragen

1. **Was ist das genaue Ziel?**
   - Welche Funktionalität soll hinzugefügt/geändert werden?
   - Welches Problem soll gelöst werden?
   - Was ist das erwartete Verhalten?

2. **Was ist der Geschäftskontext?**
   - Was ist die geschäftliche Auswirkung?
   - Welche Benutzer sind betroffen?
   - Gibt es spezifische geschäftliche Einschränkungen?

3. **Was sind die technischen Einschränkungen?**
   - Leistung (Antwortzeit, Durchsatz)
   - Skalierbarkeit
   - Sicherheit
   - Kompatibilität

#### Durchzuführende Aktionen

```python
# Beispiel für Bedarfsdokumentation
"""
BEDARF: Hinzufügen eines E-Mail-Benachrichtigungssystems beim Erstellen einer Bestellung

KONTEXT:
- Kunden müssen sofortige Bestätigung erhalten
- Das System muss 10.000 Bestellungen/Tag unterstützen
- E-Mails müssen asynchron gesendet werden
- E-Mail-Vorlagen müssen anpassbar sein

EINSCHRÄNKUNGEN:
- API-Antwortzeit < 200ms (Senden muss asynchron sein)
- Automatische Wiederholung bei Fehler
- Vollständiges Logging für Audit
- Mehrsprachige Unterstützung

AKZEPTANZKRITERIEN:
- E-Mail innerhalb von 5 Minuten nach Bestellung gesendet
- Vorlage nach Bestellungstyp anpassbar
- Verfolgung gesendeter/fehlgeschlagener E-Mails
- Versand-Überwachungs-Dashboard
"""
```

### 2. Erkundung des bestehenden Codes

#### Explorationswerkzeuge

```bash
# Nach ähnlichen Mustern suchen
rg "class.*Service" --type py
rg "async def.*email" --type py
rg "from.*repository import" --type py

# Struktur analysieren
tree src/ -L 3 -I "__pycache__|*.pyc"

# Abhängigkeiten identifizieren
rg "^import|^from" src/ --type py | sort | uniq

# Bestehende Tests finden
find tests/ -name "*test*.py" -o -name "test_*.py"
```

#### Zu stellende Fragen

1. **Existiert ähnlicher Code?**
   - Bestehende Service-Muster
   - Ähnliche Repositories
   - Vergleichbare Anwendungsfälle

2. **Was ist die aktuelle Architektur?**
   - Wie sind die Schichten organisiert?
   - Wo soll der neue Code platziert werden?
   - Welche Abstraktionen existieren bereits?

3. **Was sind die Projektstandards?**
   - Verwendete Namenskonventionen
   - Fehlerbehandlungsmuster
   - Teststruktur

#### Analysebeispiel

```python
# BESTEHENDE CODE-ANALYSE
"""
1. BESTEHENDE SERVICES:
   - src/myapp/domain/services/order_service.py
   - src/myapp/domain/services/payment_service.py
   Pattern: Business-Services in domain/services/

2. ASYNCHRONE KOMMUNIKATION:
   - Celery-Infrastruktur konfiguriert (infrastructure/tasks/)
   - Warteschlangen 'default' und 'emails' bereits definiert
   Pattern: Celery-Tasks für asynchrone Operationen

3. REPOSITORIES:
   - Repository-Pattern mit Interface + Implementierung
   - Standort: domain/repositories/ (Interfaces)
   - Implementierung: infrastructure/database/repositories/

4. FEHLERBEHANDLUNG:
   - Benutzerdefinierte Exceptions in shared/exceptions/
   - Pattern: DomainException, ApplicationException, InfrastructureException

5. TESTS:
   - Fixtures in tests/conftest.py
   - Mocks mit pytest-mock
   - Unit-Tests: tests/unit/
   - Integrationstests: tests/integration/

SCHLUSSFOLGERUNG:
- EmailService in domain/services/ erstellen
- EmailRepository-Interface in domain/repositories/ erstellen
- Mit Celery in infrastructure/tasks/ implementieren
- Bestehendes Pattern für Exceptions folgen
"""
```

### 3. Auswirkungsidentifizierung

#### Auswirkungs-Matrix

| Zone | Auswirkung | Details | Erforderliche Aktionen |
|------|-----------|---------|------------------------|
| Domain-Schicht | HOCH | Neue Email-Entität, neuer Service | Erstellung + Unit-Tests |
| Application-Schicht | MITTEL | Neuer SendOrderConfirmation Use Case | Erstellung + Tests |
| Infrastruktur | HOCH | E-Mail-Provider-Implementierung, Celery-Task | Konfiguration + Integrationstests |
| API | NIEDRIG | Kein neuer Endpoint (interner Trigger) | Keine |
| Datenbank | MITTEL | Neue email_logs-Tabelle | Migration + Tests |
| Konfiguration | MITTEL | Env-Variablen für SMTP | Dokumentation |
| Tests | HOCH | Tests auf allen Schichten | Vollständige Suite |
| Dokumentation | MITTEL | API-Docs, README-Updates | Schreiben |

#### Abhängigkeitsanalyse

```python
# Betroffene Module identifizieren
"""
DIREKT BETROFFENE MODULE:
├── domain/
│   ├── entities/email.py (NEU)
│   ├── services/email_service.py (NEU)
│   └── repositories/email_repository.py (NEU - Interface)
├── application/
│   └── use_cases/send_order_confirmation.py (NEU)
├── infrastructure/
│   ├── email/
│   │   └── smtp_email_provider.py (NEU)
│   ├── tasks/
│   │   └── email_tasks.py (NEU)
│   └── database/
│       ├── models/email_log.py (NEU)
│       └── repositories/email_repository_impl.py (NEU)

INDIREKT BETROFFENE MODULE:
├── application/use_cases/create_order.py (GEÄNDERT - ruft neuen Use Case auf)
├── infrastructure/database/migrations/ (NEU - Migration)
└── infrastructure/di/container.py (GEÄNDERT - Dependency Injection)

KONFIGURATIONSDATEIEN:
├── .env.example (GEÄNDERT - neue Variablen)
├── docker-compose.yml (POTENZIELL - E-Mail-Service falls mailhog)
└── pyproject.toml (POTENZIELL - neue Abhängigkeiten)
"""
```

### 4. Lösungsdesign

#### Lösungsarchitektur

```python
"""
VORGESCHLAGENE ARCHITEKTUR:

1. DOMAIN-SCHICHT (Business-Logik)
┌─────────────────────────────────────────────────────────────┐
│                      Email-Entität                           │
│  - id: UUID                                                  │
│  - recipient: EmailAddress (Value Object)                   │
│  - subject: str                                             │
│  - body: str                                                │
│  - sent_at: Optional[datetime]                             │
│  - status: EmailStatus (Enum)                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   EmailService (Domain)                      │
│  + create_order_confirmation(order: Order) -> Email         │
│  + validate_email_content(email: Email) -> bool             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              EmailRepository (Interface)                     │
│  + save(email: Email) -> Email                              │
│  + find_by_id(id: UUID) -> Optional[Email]                  │
│  + find_by_order_id(order_id: UUID) -> list[Email]         │
└─────────────────────────────────────────────────────────────┘

2. APPLICATION-SCHICHT (Use Cases)
┌─────────────────────────────────────────────────────────────┐
│           SendOrderConfirmationUseCase                       │
│  - email_service: EmailService                              │
│  - email_repository: EmailRepository                        │
│  - email_provider: EmailProvider                            │
│                                                              │
│  + execute(order_id: UUID) -> EmailDTO                      │
│    1. Bestellung abrufen                                    │
│    2. E-Mail über EmailService erstellen                   │
│    3. Über EmailRepository speichern                       │
│    4. Über EmailProvider senden (async)                    │
└─────────────────────────────────────────────────────────────┘

3. INFRASTRUCTURE-SCHICHT (Implementierungen)
┌─────────────────────────────────────────────────────────────┐
│              EmailRepositoryImpl                             │
│  + Implementiert EmailRepository                            │
│  + Verwendet SQLAlchemy                                     │
│  + Mappt Email <-> EmailLog (DB-Modell)                    │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│              SMTPEmailProvider                               │
│  + Implementiert EmailProvider                              │
│  + Verwendet smtplib / aiosmtplib                          │
│  + Behandelt Wiederholung und Fehlerbehandlung             │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│              send_email_task (Celery)                        │
│  + Asynchroner Task                                         │
│  + Automatische Wiederholung (3x, exponentieller Backoff)  │
│  + Vollständiges Logging                                    │
└─────────────────────────────────────────────────────────────┘
"""
```

#### Datenfluss

```python
"""
DATENFLUSS:

1. BESTELLUNGSERSTELLUNG
   CreateOrderUseCase
   └── order = order_repository.save(order)
   └── send_order_confirmation_use_case.execute(order.id)  # Asynchron

2. BESTÄTIGUNGSSENDUNG
   SendOrderConfirmationUseCase.execute(order_id)
   ├── order = order_repository.find_by_id(order_id)
   ├── email = email_service.create_order_confirmation(order)
   ├── email = email_repository.save(email)  # Status: PENDING
   └── send_email_task.delay(email.id)  # Celery-Task

3. CELERY-TASK
   send_email_task(email_id)
   ├── email = email_repository.find_by_id(email_id)
   ├── try:
   │   ├── email_provider.send(email)
   │   ├── email.mark_as_sent()
   │   └── email_repository.save(email)  # Status: SENT
   └── except Exception as e:
       ├── email.mark_as_failed(e)
       ├── email_repository.save(email)  # Status: FAILED
       └── raise  # Celery-Wiederholung

4. FEHLERBEHANDLUNG
   - Automatische Celery-Wiederholung (3 Versuche)
   - Exponentieller Backoff (2^retry * 60 Sekunden)
   - Logging jedes Versuchs
   - Alarm bei definitivem Fehler
"""
```

#### Technische Entscheidungen

```python
"""
BEGRÜNDETE TECHNISCHE ENTSCHEIDUNGEN:

1. CELERY vs RQ vs ARQ
   Wahl: Celery
   Gründe:
   - Bereits im Projekt verwendet
   - Erweiterte Wiederholungsunterstützung
   - Überwachung mit Flower
   - Großes Ökosystem

2. E-MAIL-PROVIDER
   Wahl: aiosmtplib (async SMTP)
   Gründe:
   - Kompatibel mit asyncio
   - Leistungsstark für hohe Volumen
   - TLS/SSL-Unterstützung
   Alternative: SendGrid/AWS SES für Produktion

3. E-MAIL-SPEICHERUNG
   Wahl: PostgreSQL (email_logs-Tabelle)
   Gründe:
   - Vollständiger Audit-Trail
   - Suche und Reporting
   - Transaktionale Konsistenz
   - Keine Notwendigkeit für S3-Speicherung für einfache Vorlagen

4. VORLAGEN
   Wahl: Jinja2
   Gründe:
   - Python-Standard
   - Bereits für andere Vorlagen verwendet
   - Einfache Syntax
   - i18n-Unterstützung

5. VALIDIERUNG
   Wahl: Pydantic + email-validator
   Gründe:
   - Strikte E-Mail-Validierung
   - Typ-Sicherheit
   - FastAPI/Django-Integration
"""
```

### 5. Implementierungsplanung

#### Aufgliederung der Aufgaben

```python
"""
IMPLEMENTIERUNGSPLAN (Reihenfolge: oben nach unten)

PHASE 1: DOMAIN-SCHICHT
□ Aufgabe 1.1: EmailStatus-Enum erstellen
  └── src/myapp/domain/value_objects/email_status.py
  └── Tests: tests/unit/domain/value_objects/test_email_status.py

□ Aufgabe 1.2: EmailAddress Value Object erstellen
  └── src/myapp/domain/value_objects/email_address.py
  └── Validierung mit email-validator
  └── Tests: tests/unit/domain/value_objects/test_email_address.py

□ Aufgabe 1.3: Email-Entität erstellen
  └── src/myapp/domain/entities/email.py
  └── Methoden: mark_as_sent(), mark_as_failed()
  └── Tests: tests/unit/domain/entities/test_email.py

□ Aufgabe 1.4: EmailRepository-Interface erstellen
  └── src/myapp/domain/repositories/email_repository.py
  └── Protocol mit abstrakten Methoden

□ Aufgabe 1.5: EmailProvider-Interface erstellen
  └── src/myapp/domain/interfaces/email_provider.py
  └── Protocol für Abstraktion

□ Aufgabe 1.6: EmailService erstellen
  └── src/myapp/domain/services/email_service.py
  └── E-Mail-Erstellungslogik
  └── Tests: tests/unit/domain/services/test_email_service.py

PHASE 2: INFRASTRUCTURE-SCHICHT
□ Aufgabe 2.1: Datenbankm Migration erstellen
  └── alembic revision --autogenerate -m "add_email_logs_table"
  └── Spalten: id, recipient, subject, body, status, sent_at, error, metadata

□ Aufgabe 2.2: EmailLog-Modell erstellen
  └── src/myapp/infrastructure/database/models/email_log.py
  └── SQLAlchemy-Modell

□ Aufgabe 2.3: EmailRepositoryImpl erstellen
  └── src/myapp/infrastructure/database/repositories/email_repository_impl.py
  └── Implementiert EmailRepository
  └── Tests: tests/integration/infrastructure/repositories/test_email_repository.py

□ Aufgabe 2.4: SMTPEmailProvider erstellen
  └── src/myapp/infrastructure/email/smtp_provider.py
  └── SMTP-Konfiguration
  └── Tests: tests/integration/infrastructure/email/test_smtp_provider.py

□ Aufgabe 2.5: Vorlagen-Engine erstellen
  └── src/myapp/infrastructure/email/template_engine.py
  └── Jinja2-Vorlagen
  └── Tests: tests/unit/infrastructure/email/test_template_engine.py

□ Aufgabe 2.6: Celery-Task erstellen
  └── src/myapp/infrastructure/tasks/email_tasks.py
  └── Wiederholungskonfiguration
  └── Tests: tests/integration/infrastructure/tasks/test_email_tasks.py

PHASE 3: APPLICATION-SCHICHT
□ Aufgabe 3.1: EmailDTO erstellen
  └── src/myapp/application/dtos/email_dto.py
  └── Pydantic-Modell

□ Aufgabe 3.2: SendOrderConfirmationUseCase erstellen
  └── src/myapp/application/use_cases/send_order_confirmation.py
  └── Tests: tests/unit/application/use_cases/test_send_order_confirmation.py

□ Aufgabe 3.3: In CreateOrderUseCase integrieren
  └── src/myapp/application/use_cases/create_order.py ändern
  └── Asynchronen Aufruf hinzufügen
  └── Tests: tests/unit/application/use_cases/test_create_order.py (aktualisieren)

PHASE 4: KONFIGURATION & DI
□ Aufgabe 4.1: Dependency Injection konfigurieren
  └── src/myapp/infrastructure/di/container.py
  └── EmailService, Repositories, Provider registrieren

□ Aufgabe 4.2: Umgebungsvariablen hinzufügen
  └── .env.example
  └── Dokumentation in README

□ Aufgabe 4.3: E-Mail-Vorlagen erstellen
  └── src/myapp/infrastructure/email/templates/order_confirmation.html
  └── src/myapp/infrastructure/email/templates/order_confirmation.txt

PHASE 5: TESTS & QUALITÄT
□ Aufgabe 5.1: End-to-End-Tests
  └── tests/e2e/test_order_confirmation_flow.py

□ Aufgabe 5.2: Leistungstests
  └── tests/performance/test_email_throughput.py
  └── 10k E-Mails/Tag überprüfen

□ Aufgabe 5.3: Code-Qualität
  └── make lint
  └── make type-check
  └── make test-cov (>80%)

PHASE 6: DOKUMENTATION
□ Aufgabe 6.1: API-Dokumentation
  └── Vollständige Docstrings
  └── Sphinx-Docs

□ Aufgabe 6.2: README-Update
  └── E-Mail-Benachrichtigungsabschnitt
  └── Konfigurationsanleitung

□ Aufgabe 6.3: ADR (Architecture Decision Record)
  └── docs/adr/0001-email-notification-system.md
"""
```

#### Schätzung

```python
"""
SCHÄTZUNG (in Stunden):

PHASE 1: DOMAIN-SCHICHT
- Aufgaben 1.1 bis 1.6: 8h
  └── 2h Entwicklung + 2h Tests pro Komponente (Durchschnitt)

PHASE 2: INFRASTRUCTURE-SCHICHT
- Aufgaben 2.1 bis 2.6: 12h
  └── Datenbank + Provider + Celery

PHASE 3: APPLICATION-SCHICHT
- Aufgaben 3.1 bis 3.3: 6h
  └── Use Cases + Integration

PHASE 4: KONFIGURATION & DI
- Aufgaben 4.1 bis 4.3: 4h
  └── Konfiguration + Vorlagen

PHASE 5: TESTS & QUALITÄT
- Aufgaben 5.1 bis 5.3: 6h
  └── E2E + Leistung + Qualität

PHASE 6: DOKUMENTATION
- Aufgaben 6.1 bis 6.3: 3h
  └── Vollständige Dokumentation

GESAMT: 39h (≈ 5 Tage)
PUFFER 20%: +8h
GESAMT MIT PUFFER: 47h (≈ 6 Tage)
"""
```

### 6. Risikoidentifizierung

#### Risiko-Matrix

```python
"""
IDENTIFIZIERTE RISIKEN:

RISIKO 1: SMTP-Server-Überlastung
├── Wahrscheinlichkeit: MITTEL
├── Auswirkung: HOCH
├── Beschreibung: 10k E-Mails/Tag können einfaches SMTP sättigen
└── Minderung:
    ├── Rate-Limiting in Celery (max 100 E-Mails/Minute)
    ├── Dedizierte Warteschlange für E-Mails
    ├── Warteschlangenüberwachung
    └── Backup-Provider (SendGrid/SES)

RISIKO 2: E-Mails als Spam markiert
├── Wahrscheinlichkeit: MITTEL
├── Auswirkung: HOCH
├── Beschreibung: Transaktions-E-Mails können blockiert werden
└── Minderung:
    ├── SPF/DKIM/DMARC konfiguriert
    ├── Dedizierte IP-Aufwärmung
    ├── Anti-Spam-konforme Vorlagen
    └── Zustellbarkeitsraten-Überwachung

RISIKO 3: E-Mail-Verlust bei Absturz
├── Wahrscheinlichkeit: NIEDRIG
├── Auswirkung: MITTEL
├── Beschreibung: Absturz vor DB-Persistierung
└── Minderung:
    ├── Atomare Transaktion (Speichern + Einreihen)
    ├── Celery Dead Letter Queue
    ├── Überwachung fehlgeschlagener Tasks
    └── Manuelles Wiedereinreihungssystem

RISIKO 4: Vorlagen-Injection
├── Wahrscheinlichkeit: NIEDRIG
├── Auswirkung: HOCH
├── Beschreibung: Code-Injection in Vorlagen
└── Minderung:
    ├── Eingabe-Sanitisierung
    ├── Vorkompilierte Vorlagen
    ├── Strikte Datenvalidierung
    └── Sicherheitsscan (bandit)

RISIKO 5: API-Leistungsverschlechterung
├── Wahrscheinlichkeit: NIEDRIG
├── Auswirkung: MITTEL
├── Beschreibung: Langsames Einreihen verzögert Bestellungserstellung
└── Minderung:
    ├── Strikt asynchrones Einreihen
    ├── Kurzer Timeout beim Einreihen
    ├── Graceful Fallback wenn Warteschlange down
    └── API-Antwortzeit-Überwachung

RISIKO 6: Sensible Daten in E-Mails
├── Wahrscheinlichkeit: MITTEL
├── Auswirkung: HOCH
├── Beschreibung: Datenleck über unverschlüsselte E-Mails
└── Minderung:
    ├── Obligatorisches TLS
    ├── Keine sensiblen Daten im Klartext (z.B. Kreditkarten)
    ├── Sichere Links mit kurzlebigen Tokens
    └── Vorlagen-Sicherheitsaudit
"""
```

### 7. Test-Definition

#### Test-Strategie

```python
"""
TEST-STRATEGIE:

1. UNIT-TESTS (Vollständige Isolation)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Domain-Schicht:
├── test_email_entity.py
│   ├── test_create_email_with_valid_data()
│   ├── test_mark_as_sent_updates_status_and_timestamp()
│   ├── test_mark_as_failed_stores_error_message()
│   └── test_cannot_send_already_sent_email()
│
├── test_email_address.py
│   ├── test_valid_email_address()
│   ├── test_invalid_email_raises_exception()
│   ├── test_email_normalization()
│   └── test_equality_comparison()
│
└── test_email_service.py
    ├── test_create_order_confirmation_with_valid_order()
    ├── test_create_order_confirmation_uses_correct_template()
    ├── test_validate_email_content_with_valid_email()
    └── test_validate_email_content_rejects_spam_patterns()

Application-Schicht:
└── test_send_order_confirmation_use_case.py
    ├── test_execute_creates_and_saves_email()
    ├── test_execute_enqueues_email_task()
    ├── test_execute_raises_if_order_not_found()
    └── test_execute_rolls_back_on_enqueue_failure()

2. INTEGRATIONSTESTS (Echte Komponenten)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Infrastructure-Schicht:
├── test_email_repository.py
│   ├── test_save_email_to_database()
│   ├── test_find_by_id_returns_email()
│   ├── test_find_by_order_id_returns_all_emails()
│   └── test_update_email_status()
│
├── test_smtp_provider.py
│   ├── test_send_email_via_smtp() (mit MailHog/FakeSMTP)
│   ├── test_send_email_with_attachment()
│   ├── test_connection_retry_on_failure()
│   └── test_tls_encryption_enabled()
│
└── test_email_tasks.py
    ├── test_send_email_task_successful()
    ├── test_send_email_task_retry_on_failure()
    ├── test_send_email_task_max_retries_reached()
    └── test_send_email_task_updates_database()

3. END-TO-END-TESTS (Vollständiger Ablauf)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

└── test_order_confirmation_flow.py
    ├── test_complete_order_confirmation_flow()
    │   1. Bestellung über API erstellen
    │   2. E-Mail in DB erstellt überprüfen
    │   3. Auf Celery-Task-Ausführung warten
    │   4. E-Mail gesendet überprüfen (MailHog)
    │   5. Status = SENT in DB überprüfen
    │
    ├── test_order_confirmation_with_smtp_failure()
    │   1. Bestellung erstellen
    │   2. SMTP-Fehler simulieren
    │   3. Celery-Wiederholung überprüfen
    │   4. Status = FAILED nach max. Wiederholungen überprüfen
    │
    └── test_order_confirmation_performance()
        └── 100 gleichzeitige Bestellungen erstellen
        └── Alle E-Mails < 5min gesendet überprüfen

4. LEISTUNGSTESTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

└── test_email_throughput.py
    ├── test_10k_emails_per_day_throughput()
    ├── test_api_response_time_under_200ms()
    ├── test_queue_processing_rate()
    └── test_database_load_under_stress()

5. SICHERHEITSTESTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

└── test_email_security.py
    ├── test_template_injection_prevention()
    ├── test_email_content_sanitization()
    ├── test_tls_connection_enforced()
    └── test_no_sensitive_data_in_logs()

ZIEL-COVERAGE:
- Gesamt: > 80%
- Domain-Schicht: > 95%
- Application-Schicht: > 90%
- Infrastructure-Schicht: > 75%
"""
```

## Vollständige Analyse-Checkliste

Vor Beginn jeder Implementierung prüfen:

### Verständnis
- [ ] Ziel klar definiert und dokumentiert
- [ ] Akzeptanzkriterien aufgelistet
- [ ] Technische Einschränkungen identifiziert
- [ ] Geschäftskontext verstanden

### Erkundung
- [ ] Ähnlicher Code identifiziert und analysiert
- [ ] Aktuelle Architektur dokumentiert
- [ ] Projekt-Patterns identifiziert
- [ ] Bestehende Abhängigkeiten aufgelistet

### Auswirkung
- [ ] Auswirkungs-Matrix erstellt
- [ ] Betroffene Module aufgelistet
- [ ] Nebeneffekte identifiziert
- [ ] Notwendige Migrationen geplant

### Design
- [ ] Lösungsarchitektur definiert
- [ ] Datenfluss dokumentiert
- [ ] Technische Entscheidungen begründet
- [ ] Alternativen bewertet

### Planung
- [ ] Aufgaben in atomare Schritte aufgegliedert
- [ ] Implementierungsreihenfolge definiert
- [ ] Schätzung mit Puffer abgeschlossen
- [ ] Aufgabenabhängigkeiten identifiziert

### Risiken
- [ ] Risiken identifiziert und bewertet
- [ ] Minderungspläne definiert
- [ ] Überwachung geplant
- [ ] Fallbacks geplant

### Tests
- [ ] Test-Strategie definiert
- [ ] Unit-Tests geplant
- [ ] Integrationstests geplant
- [ ] E2E-Tests geplant
- [ ] Ziel-Coverage definiert

## Dokumentationsvorlagen

### Vorlage: Feature-Analyse

```markdown
# Analyse: [Feature-Name]

## 1. Bedarf
### Ziel
[Klare Beschreibung des Ziels]

### Geschäftskontext
[Geschäftskontext und Benutzer]

### Einschränkungen
- Leistung: [Einschränkungen]
- Sicherheit: [Einschränkungen]
- Skalierbarkeit: [Einschränkungen]

### Akzeptanzkriterien
1. [Kriterium 1]
2. [Kriterium 2]

## 2. Bestehender Code
### Identifizierte Patterns
[Liste ähnlicher Patterns]

### Aktuelle Architektur
[Architekturbeschreibung]

### Projektstandards
[Konventionen und Standards]

## 3. Auswirkung
[Auswirkungs-Matrix]

## 4. Lösung
### Architektur
[Diagramme und Beschreibung]

### Datenfluss
[Flussbeschreibung]

### Technische Entscheidungen
[Entscheidungsbegründung]

## 5. Implementierung
### Plan
[Geordnete Aufgabenliste]

### Schätzung
[Schätzung mit Puffer]

## 6. Risiken
[Liste der Risiken und Minderungen]

## 7. Tests
[Detaillierte Test-Strategie]
```

### Vorlage: Bug-Analyse

```markdown
# Bug-Analyse: [Bug-Titel]

## 1. Symptome
### Beschreibung
[Was funktioniert nicht]

### Reproduktion
1. [Schritt 1]
2. [Schritt 2]

### Erwartetes vs. Tatsächliches Verhalten
- Erwartet: [Verhalten]
- Tatsächlich: [Verhalten]

## 2. Untersuchung
### Logs & Stack Trace
\`\`\`
[Stack Trace]
\`\`\`

### Betroffener Code
[Dateien und Zeilen]

### Hypothesen
1. [Hypothese 1]
2. [Hypothese 2]

## 3. Grundursache
[Erklärung der Ursache]

## 4. Lösung
### Vorgeschlagene Korrektur
[Korrekturbeschreibung]

### Auswirkung
[Betroffene Module]

### Risiken
[Korrekturrisiken]

## 5. Tests
### Regressionstests
[Test-Liste]

### Validierung
[Wie Korrektur zu validieren]
```

## Schlussfolgerung

Vorherige Analyse ist keine Zeitverschwendung, sondern eine **Investition**.

**Vorteile:**
- Reduziert Designfehler
- Vermeidet teures Refactoring
- Verbessert Code-Qualität
- Erleichtert Review
- Beschleunigt Implementierung
- Reduziert technische Schulden

**Goldene Regel:**
> 20% der Zeit für Analyse aufwenden spart 50% der Gesamtzeit.

**Beispiel:**
- Geschätztes Feature: 40h
- Mit Analyse (8h): 32h Implementierung = **40h gesamt**
- Ohne Analyse: 60h Implementierung (Bugs, Refactoring, Missverständnisse) = **60h gesamt**
- **Gewinn: 20h (33%)**
