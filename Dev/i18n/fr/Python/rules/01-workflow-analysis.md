# Workflow d'Analyse Obligatoire

## Principe Fondamental

**AUCUNE modification de code ne doit être effectuée sans une analyse préalable complète.**

Cette règle est absolue et s'applique à :
- Création de nouvelles fonctionnalités
- Correction de bugs
- Refactoring
- Optimisations
- Changements de configuration
- Mises à jour de dépendances

## Méthodologie d'Analyse en 7 Étapes

### 1. Compréhension du Besoin

#### Questions à se poser

1. **Quel est l'objectif exact ?**
   - Quelle fonctionnalité doit être ajoutée/modifiée ?
   - Quel problème doit être résolu ?
   - Quel est le comportement attendu ?

2. **Quel est le contexte métier ?**
   - Quel est l'impact business ?
   - Quels sont les utilisateurs affectés ?
   - Y a-t-il des contraintes métier spécifiques ?

3. **Quelles sont les contraintes techniques ?**
   - Performance (temps de réponse, throughput)
   - Scalabilité
   - Sécurité
   - Compatibilité

#### Actions à réaliser

```python
# Exemple de documentation du besoin
"""
BESOIN: Ajouter un système de notification par email lors de la création d'une commande

CONTEXTE:
- Les clients doivent recevoir une confirmation immédiate
- Le système doit supporter 10 000 commandes/jour
- Les emails doivent être envoyés de manière asynchrone
- Les templates d'email doivent être personnalisables

CONTRAINTES:
- Temps de réponse API < 200ms (l'envoi doit être asynchrone)
- Retry automatique en cas d'échec
- Logging complet pour audit
- Support de plusieurs langues

CRITÈRES D'ACCEPTATION:
- Email envoyé dans les 5 minutes suivant la commande
- Template personnalisable par type de commande
- Tracking des emails envoyés/échecs
- Dashboard de monitoring des envois
"""
```

### 2. Exploration du Code Existant

#### Outils d'exploration

```bash
# Rechercher des patterns similaires
rg "class.*Service" --type py
rg "async def.*email" --type py
rg "from.*repository import" --type py

# Analyser la structure
tree src/ -L 3 -I "__pycache__|*.pyc"

# Identifier les dépendances
rg "^import|^from" src/ --type py | sort | uniq

# Trouver les tests existants
find tests/ -name "*test*.py" -o -name "test_*.py"
```

#### Questions à se poser

1. **Existe-t-il du code similaire ?**
   - Patterns de service existants
   - Repositories similaires
   - Use cases comparables

2. **Quelle est l'architecture actuelle ?**
   - Comment les layers sont organisés ?
   - Où placer le nouveau code ?
   - Quelles abstractions existent déjà ?

3. **Quels sont les standards du projet ?**
   - Conventions de nommage utilisées
   - Patterns de gestion d'erreurs
   - Structure des tests

#### Exemple d'analyse

```python
# ANALYSE DU CODE EXISTANT
"""
1. SERVICES EXISTANTS:
   - src/myapp/domain/services/order_service.py
   - src/myapp/domain/services/payment_service.py
   Pattern: Services métier dans domain/services/

2. COMMUNICATION ASYNCHRONE:
   - Infrastructure Celery configurée (infrastructure/tasks/)
   - Queue 'default' et 'emails' déjà définies
   Pattern: Tasks Celery pour opérations async

3. REPOSITORIES:
   - Pattern Repository avec interface + implémentation
   - Localisation: domain/repositories/ (interfaces)
   - Implémentation: infrastructure/database/repositories/

4. GESTION DES ERREURS:
   - Exceptions custom dans shared/exceptions/
   - Pattern: DomainException, ApplicationException, InfrastructureException

5. TESTS:
   - Fixtures dans tests/conftest.py
   - Mocks avec pytest-mock
   - Tests unitaires: tests/unit/
   - Tests d'intégration: tests/integration/

CONCLUSION:
- Créer EmailService dans domain/services/
- Créer EmailRepository interface dans domain/repositories/
- Implémenter avec Celery dans infrastructure/tasks/
- Suivre le pattern existant pour les exceptions
"""
```

### 3. Identification des Impacts

#### Matrice d'impact

| Zone | Impact | Détails | Actions requises |
|------|--------|---------|------------------|
| Domain Layer | FORT | Nouvelle entité Email, nouveau service | Création + tests unitaires |
| Application Layer | MOYEN | Nouveau use case SendOrderConfirmation | Création + tests |
| Infrastructure | FORT | Implémentation email provider, Celery task | Configuration + tests intégration |
| API | FAIBLE | Pas de nouveau endpoint (trigger interne) | Aucune |
| Database | MOYEN | Nouvelle table email_logs | Migration + tests |
| Configuration | MOYEN | Variables env pour SMTP | Documentation |
| Tests | FORT | Tests sur tous les layers | Suite complète |
| Documentation | MOYEN | API docs, README updates | Rédaction |

#### Analyse des dépendances

```python
# Identifier les modules affectés
"""
MODULES DIRECTEMENT IMPACTÉS:
├── domain/
│   ├── entities/email.py (NOUVEAU)
│   ├── services/email_service.py (NOUVEAU)
│   └── repositories/email_repository.py (NOUVEAU - interface)
├── application/
│   └── use_cases/send_order_confirmation.py (NOUVEAU)
├── infrastructure/
│   ├── email/
│   │   └── smtp_email_provider.py (NOUVEAU)
│   ├── tasks/
│   │   └── email_tasks.py (NOUVEAU)
│   └── database/
│       ├── models/email_log.py (NOUVEAU)
│       └── repositories/email_repository_impl.py (NOUVEAU)

MODULES INDIRECTEMENT IMPACTÉS:
├── application/use_cases/create_order.py (MODIFIÉ - appelle le nouveau use case)
├── infrastructure/database/migrations/ (NOUVEAU - migration)
└── infrastructure/di/container.py (MODIFIÉ - injection de dépendances)

FICHIERS DE CONFIGURATION:
├── .env.example (MODIFIÉ - nouvelles variables)
├── docker-compose.yml (POTENTIEL - service email si mailhog)
└── pyproject.toml (POTENTIEL - nouvelles dépendances)
"""
```

### 4. Conception de la Solution

#### Architecture de la solution

```python
"""
ARCHITECTURE PROPOSÉE:

1. DOMAIN LAYER (Logique Métier)
┌─────────────────────────────────────────────────────────────┐
│                      Email Entity                            │
│  - id: UUID                                                   │
│  - recipient: EmailAddress (Value Object)                    │
│  - subject: str                                              │
│  - body: str                                                 │
│  - sent_at: Optional[datetime]                              │
│  - status: EmailStatus (Enum)                               │
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

2. APPLICATION LAYER (Use Cases)
┌─────────────────────────────────────────────────────────────┐
│           SendOrderConfirmationUseCase                       │
│  - email_service: EmailService                              │
│  - email_repository: EmailRepository                        │
│  - email_provider: EmailProvider                            │
│                                                              │
│  + execute(order_id: UUID) -> EmailDTO                      │
│    1. Récupère la commande                                  │
│    2. Crée l'email via EmailService                         │
│    3. Sauvegarde via EmailRepository                        │
│    4. Envoie via EmailProvider (async)                      │
└─────────────────────────────────────────────────────────────┘

3. INFRASTRUCTURE LAYER (Implémentations)
┌─────────────────────────────────────────────────────────────┐
│              EmailRepositoryImpl                             │
│  + Implémente EmailRepository                               │
│  + Utilise SQLAlchemy                                       │
│  + Mappe Email <-> EmailLog (model DB)                      │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│              SMTPEmailProvider                               │
│  + Implémente EmailProvider                                 │
│  + Utilise smtplib / aiosmtplib                            │
│  + Gère retry et error handling                             │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│              send_email_task (Celery)                        │
│  + Task asynchrone                                          │
│  + Retry automatique (3 fois, exponential backoff)          │
│  + Logging complet                                          │
└─────────────────────────────────────────────────────────────┘
"""
```

#### Flux de données

```python
"""
FLUX DE DONNÉES:

1. CRÉATION DE COMMANDE
   CreateOrderUseCase
   └── order = order_repository.save(order)
   └── send_order_confirmation_use_case.execute(order.id)  # Asynchrone

2. ENVOI DE CONFIRMATION
   SendOrderConfirmationUseCase.execute(order_id)
   ├── order = order_repository.find_by_id(order_id)
   ├── email = email_service.create_order_confirmation(order)
   ├── email = email_repository.save(email)  # Status: PENDING
   └── send_email_task.delay(email.id)  # Celery task

3. TASK CELERY
   send_email_task(email_id)
   ├── email = email_repository.find_by_id(email_id)
   ├── try:
   │   ├── email_provider.send(email)
   │   ├── email.mark_as_sent()
   │   └── email_repository.save(email)  # Status: SENT
   └── except Exception as e:
       ├── email.mark_as_failed(e)
       ├── email_repository.save(email)  # Status: FAILED
       └── raise  # Celery retry

4. GESTION DES ERREURS
   - Retry automatique Celery (3 tentatives)
   - Exponential backoff (2^retry * 60 seconds)
   - Logging de chaque tentative
   - Alerte si échec définitif
"""
```

#### Choix techniques

```python
"""
CHOIX TECHNIQUES JUSTIFIÉS:

1. CELERY vs RQ vs ARQ
   Choix: Celery
   Raisons:
   - Déjà utilisé dans le projet
   - Support du retry avancé
   - Monitoring avec Flower
   - Large écosystème

2. EMAIL PROVIDER
   Choix: aiosmtplib (async SMTP)
   Raisons:
   - Compatible avec asyncio
   - Performant pour gros volumes
   - Support TLS/SSL
   Alternative: SendGrid/AWS SES pour production

3. STOCKAGE DES EMAILS
   Choix: PostgreSQL (table email_logs)
   Raisons:
   - Audit trail complet
   - Recherche et reporting
   - Cohérence transactionnelle
   - Pas besoin de stockage S3 pour templates simples

4. TEMPLATES
   Choix: Jinja2
   Raisons:
   - Standard Python
   - Déjà utilisé pour d'autres templates
   - Syntaxe simple
   - Support i18n

5. VALIDATION
   Choix: Pydantic + email-validator
   Raisons:
   - Validation stricte des emails
   - Type safety
   - Intégration FastAPI/Django
"""
```

### 5. Planification de l'Implémentation

#### Découpage en tâches

```python
"""
PLAN D'IMPLÉMENTATION (Order: top to bottom)

PHASE 1: DOMAIN LAYER
□ Task 1.1: Créer EmailStatus enum
  └── src/myapp/domain/value_objects/email_status.py
  └── Tests: tests/unit/domain/value_objects/test_email_status.py

□ Task 1.2: Créer EmailAddress value object
  └── src/myapp/domain/value_objects/email_address.py
  └── Validation avec email-validator
  └── Tests: tests/unit/domain/value_objects/test_email_address.py

□ Task 1.3: Créer Email entity
  └── src/myapp/domain/entities/email.py
  └── Méthodes: mark_as_sent(), mark_as_failed()
  └── Tests: tests/unit/domain/entities/test_email.py

□ Task 1.4: Créer EmailRepository interface
  └── src/myapp/domain/repositories/email_repository.py
  └── Protocol avec méthodes abstraites

□ Task 1.5: Créer EmailProvider interface
  └── src/myapp/domain/interfaces/email_provider.py
  └── Protocol pour abstraction

□ Task 1.6: Créer EmailService
  └── src/myapp/domain/services/email_service.py
  └── Logique de création d'email
  └── Tests: tests/unit/domain/services/test_email_service.py

PHASE 2: INFRASTRUCTURE LAYER
□ Task 2.1: Créer migration database
  └── alembic revision --autogenerate -m "add_email_logs_table"
  └── Colonnes: id, recipient, subject, body, status, sent_at, error, metadata

□ Task 2.2: Créer EmailLog model
  └── src/myapp/infrastructure/database/models/email_log.py
  └── SQLAlchemy model

□ Task 2.3: Créer EmailRepositoryImpl
  └── src/myapp/infrastructure/database/repositories/email_repository_impl.py
  └── Implémente EmailRepository
  └── Tests: tests/integration/infrastructure/repositories/test_email_repository.py

□ Task 2.4: Créer SMTPEmailProvider
  └── src/myapp/infrastructure/email/smtp_provider.py
  └── Configuration SMTP
  └── Tests: tests/integration/infrastructure/email/test_smtp_provider.py

□ Task 2.5: Créer template engine
  └── src/myapp/infrastructure/email/template_engine.py
  └── Jinja2 templates
  └── Tests: tests/unit/infrastructure/email/test_template_engine.py

□ Task 2.6: Créer Celery task
  └── src/myapp/infrastructure/tasks/email_tasks.py
  └── Configuration retry
  └── Tests: tests/integration/infrastructure/tasks/test_email_tasks.py

PHASE 3: APPLICATION LAYER
□ Task 3.1: Créer EmailDTO
  └── src/myapp/application/dtos/email_dto.py
  └── Pydantic model

□ Task 3.2: Créer SendOrderConfirmationUseCase
  └── src/myapp/application/use_cases/send_order_confirmation.py
  └── Tests: tests/unit/application/use_cases/test_send_order_confirmation.py

□ Task 3.3: Intégrer dans CreateOrderUseCase
  └── Modifier src/myapp/application/use_cases/create_order.py
  └── Ajouter appel asynchrone
  └── Tests: tests/unit/application/use_cases/test_create_order.py (update)

PHASE 4: CONFIGURATION & DI
□ Task 4.1: Configurer dependency injection
  └── src/myapp/infrastructure/di/container.py
  └── Register EmailService, repositories, providers

□ Task 4.2: Ajouter variables d'environnement
  └── .env.example
  └── Documentation dans README

□ Task 4.3: Créer templates d'email
  └── src/myapp/infrastructure/email/templates/order_confirmation.html
  └── src/myapp/infrastructure/email/templates/order_confirmation.txt

PHASE 5: TESTS & QUALITÉ
□ Task 5.1: Tests end-to-end
  └── tests/e2e/test_order_confirmation_flow.py

□ Task 5.2: Tests de performance
  └── tests/performance/test_email_throughput.py
  └── Vérifier 10k emails/jour

□ Task 5.3: Code quality
  └── make lint
  └── make type-check
  └── make test-cov (>80%)

PHASE 6: DOCUMENTATION
□ Task 6.1: Documentation API
  └── Docstrings complets
  └── Sphinx docs

□ Task 6.2: README update
  └── Section email notification
  └── Configuration guide

□ Task 6.3: ADR (Architecture Decision Record)
  └── docs/adr/0001-email-notification-system.md
"""
```

#### Estimation

```python
"""
ESTIMATION (en heures):

PHASE 1: DOMAIN LAYER
- Task 1.1 à 1.6: 8h
  └── 2h dev + 2h tests par composant (moyenne)

PHASE 2: INFRASTRUCTURE LAYER
- Task 2.1 à 2.6: 12h
  └── Database + providers + celery

PHASE 3: APPLICATION LAYER
- Task 3.1 à 3.3: 6h
  └── Use cases + intégration

PHASE 4: CONFIGURATION & DI
- Task 4.1 à 4.3: 4h
  └── Configuration + templates

PHASE 5: TESTS & QUALITÉ
- Task 5.1 à 5.3: 6h
  └── E2E + performance + quality

PHASE 6: DOCUMENTATION
- Task 6.1 à 6.3: 3h
  └── Documentation complète

TOTAL: 39h (≈ 5 jours)
BUFFER 20%: +8h
TOTAL AVEC BUFFER: 47h (≈ 6 jours)
"""
```

### 6. Identification des Risques

#### Matrice des risques

```python
"""
RISQUES IDENTIFIÉS:

RISQUE 1: Surcharge du serveur SMTP
├── Probabilité: MOYENNE
├── Impact: FORT
├── Description: 10k emails/jour peuvent saturer SMTP basique
└── Mitigation:
    ├── Rate limiting dans Celery (max 100 emails/minute)
    ├── Queue dédiée pour emails
    ├── Monitoring de la queue
    └── Backup provider (SendGrid/SES)

RISQUE 2: Emails en spam
├── Probabilité: MOYENNE
├── Impact: FORT
├── Description: Emails transactionnels peuvent être bloqués
└── Mitigation:
    ├── SPF/DKIM/DMARC configurés
    ├── IP dédiée warmup
    ├── Templates conformes anti-spam
    └── Monitoring du taux de délivrabilité

RISQUE 3: Perte d'emails en cas de crash
├── Probabilité: FAIBLE
├── Impact: MOYEN
├── Description: Crash avant persistence dans DB
└── Mitigation:
    ├── Transaction atomique (save + enqueue)
    ├── Dead letter queue Celery
    ├── Monitoring des failed tasks
    └── Système de re-enqueue manuel

RISQUE 4: Template injection
├── Probabilité: FAIBLE
├── Impact: FORT
├── Description: Injection de code dans les templates
└── Mitigation:
    ├── Sanitization des inputs
    ├── Templates pré-compilés
    ├── Validation stricte des données
    └── Security scan (bandit)

RISQUE 5: Performance dégradée de l'API
├── Probabilité: FAIBLE
├── Impact: MOYEN
├── Description: Enqueue lent ralentit la création de commande
└── Mitigation:
    ├── Enqueue asynchrone strict
    ├── Timeout court sur enqueue
    ├── Fallback gracieux si queue down
    └── Monitoring du temps de réponse API

RISQUE 6: Données sensibles dans les emails
├── Probabilité: MOYENNE
├── Impact: FORT
├── Description: Fuite de données via emails non chiffrés
└── Mitigation:
    ├── TLS obligatoire
    ├── Pas de données sensibles en clair (ex: CB)
    ├── Liens sécurisés avec tokens courts
    └── Audit de sécurité des templates
"""
```

### 7. Définition des Tests

#### Stratégie de tests

```python
"""
STRATÉGIE DE TESTS:

1. TESTS UNITAIRES (Isolation complète)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Domain Layer:
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

Application Layer:
└── test_send_order_confirmation_use_case.py
    ├── test_execute_creates_and_saves_email()
    ├── test_execute_enqueues_email_task()
    ├── test_execute_raises_if_order_not_found()
    └── test_execute_rolls_back_on_enqueue_failure()

2. TESTS D'INTÉGRATION (Composants réels)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Infrastructure Layer:
├── test_email_repository.py
│   ├── test_save_email_to_database()
│   ├── test_find_by_id_returns_email()
│   ├── test_find_by_order_id_returns_all_emails()
│   └── test_update_email_status()
│
├── test_smtp_provider.py
│   ├── test_send_email_via_smtp() (avec MailHog/FakeSMTP)
│   ├── test_send_email_with_attachment()
│   ├── test_connection_retry_on_failure()
│   └── test_tls_encryption_enabled()
│
└── test_email_tasks.py
    ├── test_send_email_task_successful()
    ├── test_send_email_task_retry_on_failure()
    ├── test_send_email_task_max_retries_reached()
    └── test_send_email_task_updates_database()

3. TESTS END-TO-END (Flux complet)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

└── test_order_confirmation_flow.py
    ├── test_complete_order_confirmation_flow()
    │   1. Créer une commande via API
    │   2. Vérifier email créé dans DB
    │   3. Attendre exécution task Celery
    │   4. Vérifier email envoyé (MailHog)
    │   5. Vérifier status = SENT dans DB
    │
    ├── test_order_confirmation_with_smtp_failure()
    │   1. Créer commande
    │   2. Simuler échec SMTP
    │   3. Vérifier retry Celery
    │   4. Vérifier status = FAILED après max retries
    │
    └── test_order_confirmation_performance()
        └── Créer 100 commandes concurrentes
        └── Vérifier toutes les emails envoyés < 5min

4. TESTS DE PERFORMANCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

└── test_email_throughput.py
    ├── test_10k_emails_per_day_throughput()
    ├── test_api_response_time_under_200ms()
    ├── test_queue_processing_rate()
    └── test_database_load_under_stress()

5. TESTS DE SÉCURITÉ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

└── test_email_security.py
    ├── test_template_injection_prevention()
    ├── test_email_content_sanitization()
    ├── test_tls_connection_enforced()
    └── test_no_sensitive_data_in_logs()

COUVERTURE CIBLE:
- Overall: > 80%
- Domain Layer: > 95%
- Application Layer: > 90%
- Infrastructure Layer: > 75%
"""
```

## Checklist d'Analyse Complète

Avant de commencer toute implémentation, vérifier:

### Compréhension
- [ ] Objectif clairement défini et documenté
- [ ] Critères d'acceptation listés
- [ ] Contraintes techniques identifiées
- [ ] Contexte métier compris

### Exploration
- [ ] Code similaire identifié et analysé
- [ ] Architecture actuelle documentée
- [ ] Patterns du projet identifiés
- [ ] Dépendances existantes répertoriées

### Impact
- [ ] Matrice d'impact créée
- [ ] Modules affectés listés
- [ ] Effets de bord identifiés
- [ ] Migrations nécessaires planifiées

### Conception
- [ ] Architecture de la solution définie
- [ ] Flux de données documenté
- [ ] Choix techniques justifiés
- [ ] Alternatives évaluées

### Planification
- [ ] Tâches découpées en steps atomiques
- [ ] Ordre d'implémentation défini
- [ ] Estimation réalisée avec buffer
- [ ] Dépendances entre tâches identifiées

### Risques
- [ ] Risques identifiés et évalués
- [ ] Plans de mitigation définis
- [ ] Monitoring prévu
- [ ] Fallbacks planifiés

### Tests
- [ ] Stratégie de tests définie
- [ ] Tests unitaires planifiés
- [ ] Tests d'intégration planifiés
- [ ] Tests E2E planifiés
- [ ] Couverture cible définie

## Templates de Documentation

### Template: Analyse de Feature

```markdown
# Analyse: [Nom de la Feature]

## 1. Besoin
### Objectif
[Description claire de l'objectif]

### Contexte Métier
[Contexte business et utilisateurs]

### Contraintes
- Performance: [contraintes]
- Sécurité: [contraintes]
- Scalabilité: [contraintes]

### Critères d'Acceptation
1. [Critère 1]
2. [Critère 2]

## 2. Code Existant
### Patterns Identifiés
[Liste des patterns similaires]

### Architecture Actuelle
[Description de l'architecture]

### Standards du Projet
[Conventions et standards]

## 3. Impact
[Matrice d'impact]

## 4. Solution
### Architecture
[Diagrammes et description]

### Flux de Données
[Description du flux]

### Choix Techniques
[Justification des choix]

## 5. Implémentation
### Plan
[Liste des tâches ordonnées]

### Estimation
[Estimation avec buffer]

## 6. Risques
[Liste des risques et mitigations]

## 7. Tests
[Stratégie de tests détaillée]
```

### Template: Analyse de Bug

```markdown
# Analyse Bug: [Titre du Bug]

## 1. Symptômes
### Description
[Ce qui ne fonctionne pas]

### Reproduction
1. [Étape 1]
2. [Étape 2]

### Comportement Attendu vs Réel
- Attendu: [comportement]
- Réel: [comportement]

## 2. Investigation
### Logs & Stack Trace
\`\`\`
[Stack trace]
\`\`\`

### Code Concerné
[Fichiers et lignes]

### Hypothèses
1. [Hypothèse 1]
2. [Hypothèse 2]

## 3. Cause Racine
[Explication de la cause]

## 4. Solution
### Fix Proposé
[Description du fix]

### Impact
[Modules affectés]

### Risques
[Risques du fix]

## 5. Tests
### Tests de Non-Régression
[Liste des tests]

### Validation
[Comment valider le fix]
```

## Conclusion

L'analyse préalable n'est pas une perte de temps, c'est un **investissement**.

**Bénéfices:**
- Réduit les erreurs de conception
- Évite les refactorings coûteux
- Améliore la qualité du code
- Facilite la review
- Accélère l'implémentation
- Réduit la dette technique

**Règle d'or:**
> Passer 20% du temps en analyse permet d'économiser 50% du temps total.

**Exemple:**
- Feature estimée: 40h
- Avec analyse (8h): 32h d'implémentation = **40h total**
- Sans analyse: 60h d'implémentation (bugs, refactoring, incompréhensions) = **60h total**
- **Gain: 20h (33%)**
