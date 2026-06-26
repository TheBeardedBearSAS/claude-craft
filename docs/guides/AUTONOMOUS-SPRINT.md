# Autonomous Sprint Mode

Guide complet pour utiliser le mode Autonomous Sprint : user story → code + tests + PR avec human-in-the-loop aux quality gates.

---

## Concept

**Autonomous Sprint** permet à Claude Craft d'implémenter une user story **end-to-end** en autonomie, avec des checkpoints humains aux **quality gates** BMAD v6.

**Workflow** :
```
User Story (input)
  ↓
Analyze → Plan → Design → Implement → Test → PR
  ↑         ↑       ↑                    ↑      ↑
  Human checkpoint (if needed)           Human  Human
```

**Philosophie** : AI-driven execution avec human-in-the-loop pour validation critique (PRD, Tech Spec, Code Review).

---

## Prérequis

### Framework

- ✅ BMAD v6 initialisé (`/workflow:init`)
- ✅ Ralph Wiggum configuré (`ralph.yml`)
- ✅ Agent Teams activés (PM, BA, Architect, Dev, QA)
- ✅ TDD workflow configuré

### Configuration

```yaml
# .bmad/config.yaml
version: 6

autonomous_sprint:
  enabled: true
  # Human checkpoints
  human_checkpoints:
    - prd_review          # Après phase Plan
    - tech_spec_review    # Après phase Design
    - code_review         # Avant PR
  # Auto-proceed si gates >= threshold
  auto_proceed_threshold:
    prd: 80
    tech_spec: 90
    code_quality: 85
  # Circuit breaker
  max_iterations_per_phase: 10
  stop_on_failure: true
```

---

## Phases

### Phase 1 : Analyze

**Agent** : `@business-analyst`

**Input** : User story (titre + description)

**Output** : PRD (Product Requirements Document)

**Actions** :
1. Analyser le besoin utilisateur
2. Définir les critères d'acceptation
3. Identifier les contraintes
4. Générer le PRD

**Quality Gate** : PRD Score >= 80%

**Checklist PRD** :
- [ ] Objectif clair
- [ ] Critères d'acceptation mesurables (INVEST)
- [ ] Contraintes identifiées
- [ ] User flows décrits
- [ ] Success metrics définis

**Human checkpoint** : Review PRD si score < 80%

**Exemple** :
```
Input: "En tant qu'utilisateur, je veux pouvoir me connecter avec mon email"

Output PRD:
---
# PRD-001: User Login with Email

## Objectif
Permettre aux utilisateurs de s'authentifier via email/password.

## Critères d'acceptation
- [ ] L'utilisateur peut saisir email + password
- [ ] Validation côté client (email format, password min 8 chars)
- [ ] Validation côté serveur
- [ ] Message d'erreur si credentials invalides
- [ ] Redirection vers dashboard si succès

## Contraintes
- OWASP 2025 compliance (Argon2id hashing)
- Session HTTP-only cookies
- Rate limiting (5 tentatives/10min)

## Success metrics
- Login success rate > 95%
- P95 latency < 500ms
---

PRD Score: 85% ✅
```

---

### Phase 2 : Plan

**Agent** : `@architect`

**Input** : PRD validé

**Output** : Technical Specification

**Actions** :
1. Définir l'architecture (couches, patterns)
2. Identifier les fichiers impactés
3. Décomposer en tâches atomiques
4. Estimer la complexité

**Quality Gate** : Tech Spec Score >= 90%

**Checklist Tech Spec** :
- [ ] Architecture définie (Clean Architecture, DDD)
- [ ] Fichiers impactés listés
- [ ] Tâches atomiques (< 30 min chacune)
- [ ] Patterns identifiés (SOLID, DRY, KISS)
- [ ] Tests TDD définis

**Human checkpoint** : Review Tech Spec si score < 90%

**Exemple** :
```
Tech Spec: User Login

## Architecture
Clean Architecture : Presentation → Application → Domain ← Infrastructure

## Fichiers impactés
- src/Presentation/Controller/AuthController.php (nouveau)
- src/Application/UseCase/AuthenticateUserUseCase.php (nouveau)
- src/Domain/Entity/User.php (lecture seule)
- src/Infrastructure/Repository/UserRepository.php (lecture seule)
- tests/Unit/UseCase/AuthenticateUserUseCaseTest.php (nouveau)

## Tâches atomiques
1. Créer AuthenticateUserUseCase (TDD) — 20 min
2. Créer AuthController — 15 min
3. Configurer routing — 5 min
4. Tests intégration — 20 min
Total: 60 min

## Tests TDD
- test_should_authenticate_with_valid_credentials()
- test_should_fail_with_invalid_password()
- test_should_fail_with_non_existent_email()
- test_should_rate_limit_after_5_attempts()

Tech Spec Score: 92% ✅
```

---

### Phase 3 : Design

**Agent** : `@architect` + `@ui-designer` (si UI)

**Input** : Tech Spec validé

**Output** : Design détaillé (interfaces, contracts, mocks)

**Actions** :
1. Définir les interfaces (ports/adapters)
2. Créer les contracts (DTOs, Value Objects)
3. Générer les mocks/stubs
4. Définir les tests (TDD)

**Quality Gate** : Spec Alignment >= 85%

**Checklist Design** :
- [ ] Interfaces définies
- [ ] Contracts typés (TypeScript, PHP 8.4, etc.)
- [ ] Mocks/stubs créés
- [ ] Tests TDD prêts (Red phase)

**Human checkpoint** : Review Design si score < 85%

**Exemple** :
```
Design: User Login

## Interfaces

```php
// Application layer
interface AuthenticateUserUseCaseInterface
{
    public function execute(AuthenticateUserCommand $command): AuthenticateUserResult;
}

// Domain layer
interface UserRepositoryInterface
{
    public function findByEmail(Email $email): ?User;
}
```

## Contracts

```php
final readonly class AuthenticateUserCommand
{
    public function __construct(
        public string $email,
        public string $password,
    ) {}
}

final readonly class AuthenticateUserResult
{
    public function __construct(
        public bool $success,
        public ?User $user,
        public ?string $error,
    ) {}
}
```

## Tests TDD (Red phase)

```php
public function test_should_authenticate_with_valid_credentials(): void
{
    $command = new AuthenticateUserCommand('user@example.com', 'password123');
    $result = $this->useCase->execute($command);

    $this->assertTrue($result->success);
    $this->assertInstanceOf(User::class, $result->user);
}
```

Spec Alignment: 88% ✅
```

---

### Phase 4 : Implement

**Agent** : `@developer` + `@tdd-coach`

**Input** : Design validé

**Output** : Code implémenté + tests passants

**Actions** :
1. TDD Red : écrire les tests (échouent)
2. TDD Green : implémenter le code minimal
3. TDD Refactor : améliorer le code
4. Vérifier qualité (SOLID, KISS, DRY)

**Quality Gate** : Code Quality Score >= 85%

**Checklist Implement** :
- [ ] Tests TDD passent (Green)
- [ ] Couverture >= 80%
- [ ] Pas de violations SOLID
- [ ] Cognitive Complexity < 10
- [ ] Pas de duplication

**Human checkpoint** : Jamais (auto-proceed si quality gates OK)

**Exemple TDD cycle** :
```php
// RED: Test écrit (échoue)
public function test_should_authenticate_with_valid_credentials(): void
{
    $result = $this->useCase->execute($command);
    $this->assertTrue($result->success); // ❌ Fail
}

// GREEN: Code minimal (passe)
class AuthenticateUserUseCase
{
    public function execute(AuthenticateUserCommand $command): AuthenticateUserResult
    {
        $user = $this->userRepository->findByEmail(new Email($command->email));
        
        if (!$user || !$user->verifyPassword($command->password)) {
            return new AuthenticateUserResult(false, null, 'Invalid credentials');
        }
        
        return new AuthenticateUserResult(true, $user, null);
    }
}

// ✅ Test passe

// REFACTOR: Améliorer
class AuthenticateUserUseCase
{
    public function execute(AuthenticateUserCommand $command): AuthenticateUserResult
    {
        $user = $this->findUser($command->email);
        
        if (!$this->isValidCredentials($user, $command->password)) {
            return AuthenticateUserResult::failure('Invalid credentials');
        }
        
        return AuthenticateUserResult::success($user);
    }
    
    private function findUser(string $email): ?User
    {
        return $this->userRepository->findByEmail(new Email($email));
    }
    
    private function isValidCredentials(?User $user, string $password): bool
    {
        return $user !== null && $user->verifyPassword($password);
    }
}

// ✅ Tests passent toujours + code plus lisible
```

---

### Phase 5 : Test

**Agent** : `@qa-engineer`

**Input** : Code implémenté

**Output** : Tests E2E + rapport QA

**Actions** :
1. Exécuter tests unitaires
2. Exécuter tests intégration
3. Exécuter tests E2E (QA Recette si applicable)
4. Générer rapport coverage

**Quality Gate** : Story DoD 100%

**Checklist Test** :
- [ ] Tous les tests passent
- [ ] Couverture >= 80%
- [ ] Pas de régression détectée
- [ ] Critères d'acceptation validés

**Human checkpoint** : Review si DoD < 100%

**Exemple** :
```bash
# Tests unitaires
✓ test_should_authenticate_with_valid_credentials
✓ test_should_fail_with_invalid_password
✓ test_should_fail_with_non_existent_email
✓ test_should_rate_limit_after_5_attempts

# Tests intégration
✓ test_login_endpoint_returns_token
✓ test_login_endpoint_fails_with_invalid_credentials

# Coverage
Lines: 95% (87/92)
Branches: 100% (12/12)

Story DoD: 100% ✅
```

---

### Phase 6 : PR

**Agent** : `@tech-lead`

**Input** : Code testé + DoD 100%

**Output** : Pull Request créée

**Actions** :
1. Commit atomique (Conventional Commits)
2. Push branch
3. Créer PR avec template
4. Assigner reviewers

**Quality Gate** : Human review required

**Checklist PR** :
- [ ] Titre clair (feat: add user login)
- [ ] Description (summary + test plan)
- [ ] CI passe (tests + linter)
- [ ] 1+ approve requis

**Human checkpoint** : TOUJOURS (code review obligatoire)

**Exemple PR** :
```markdown
## Summary
Implements user authentication via email/password.

## Changes
- Add AuthenticateUserUseCase (TDD)
- Add AuthController (POST /auth/login)
- Add rate limiting (5 attempts/10min)
- Add tests (unit + integration)

## Test Plan
- [x] All tests pass
- [x] Coverage >= 80%
- [x] Manual test: login with valid credentials → success
- [x] Manual test: login with invalid password → error

## Screenshots
(login form + success message)

---

Generated with Claude Craft Autonomous Sprint Mode
```

---

## Timeline exemple (CRUD story)

**Story** : "En tant qu'utilisateur, je veux créer un article"

| Phase | Duration | Agent | Output |
|-------|----------|-------|--------|
| **Analyze** | 5 min | @business-analyst | PRD (80%+ score) |
| **Plan** | 10 min | @architect | Tech Spec (90%+ score) |
| **Design** | 10 min | @architect | Interfaces + contracts |
| **Implement** | 30 min | @developer + @tdd-coach | Code + tests (TDD) |
| **Test** | 10 min | @qa-engineer | Coverage 85%, DoD 100% |
| **PR** | 5 min | @tech-lead | PR créée + CI pass |

**Total** : ~70 min (story complète, prête à review)

---

## Limitations

### Complexité max

**Règle** : Autonomous Sprint fonctionne pour stories simples/moyennes (< 4h dev time estimé).

**Hors scope** :
- ❌ Refactoring architectural (> 10 fichiers)
- ❌ Migrations DB complexes (data migration scripts)
- ❌ Intégrations externes non documentées
- ❌ Features nécessitant recherche R&D

**Solution** : Décomposer en plusieurs stories atomiques.

### Pas de migrations DB auto

**Règle** : Les migrations DB nécessitent validation humaine.

**Workflow** :
1. Autonomous Sprint génère la migration
2. Human checkpoint : review migration SQL
3. Approve → migration appliquée
4. Autonomous Sprint continue

### Pas de deploy

**Règle** : Le deploy reste manuel ou via CI/CD (pas auto-deploy).

**Workflow** :
1. PR mergée
2. CI build + tests
3. Human déclenche deploy (staging → prod)

---

## Commandes

### Lancer Autonomous Sprint

```bash
# Depuis Claude Code
/sprint:autonomous "US-001: User login with email"

# Ou via CLI
npx @the-bearded-bear/claude-craft autonomous-sprint --story=US-001
```

### Options avancées

```bash
# Avec checkpoints forcés
/sprint:autonomous "US-001" --force-checkpoints

# Sans checkpoints (full auto, risqué)
/sprint:autonomous "US-001" --no-checkpoints

# Dry-run (simulation)
/sprint:autonomous "US-001" --dry-run
```

### Monitoring

```bash
# Status en temps réel
/sprint:status

# Logs détaillés
/sprint:logs --story=US-001
```

---

## Exemples

### Exemple 1 : Login simple

**Input** :
```
/sprint:autonomous "US-001: User login with email/password"
```

**Output** :
```
✅ Phase 1 (Analyze): PRD Score 85% → Proceed
✅ Phase 2 (Plan): Tech Spec Score 92% → Proceed
✅ Phase 3 (Design): Spec Alignment 88% → Proceed
✅ Phase 4 (Implement): Code Quality 87% → Proceed
✅ Phase 5 (Test): Story DoD 100% → Proceed
⏸️  Phase 6 (PR): Human review required

PR created: https://github.com/org/repo/pull/42
Waiting for code review...
```

### Exemple 2 : CRUD article

**Input** :
```
/sprint:autonomous "US-002: Create article (title, body, tags)"
```

**Output** :
```
✅ Phase 1 (Analyze): PRD Score 82% → Proceed
✅ Phase 2 (Plan): Tech Spec Score 91% → Proceed
⏸️  Phase 3 (Design): Spec Alignment 78% < 85% → Human review

Please review Design:
- Interface ArticleRepositoryInterface
- DTO CreateArticleCommand
- Value Object ArticleTitle

Approve? [y/n]
```

---

## Best Practices

### 1. Stories atomiques

**Règle** : 1 story = 1 feature simple, 1 PR.

**Bon** :
- "Add login form"
- "Add password reset"
- "Add remember me checkbox"

**Mauvais** :
- "Complete authentication system" (trop large)

### 2. Critères d'acceptation clairs

**Règle** : Les critères doivent être testables automatiquement.

**Bon** :
- "L'utilisateur peut se connecter avec email/password"
- "Un message d'erreur s'affiche si password invalide"

**Mauvais** :
- "L'application doit être user-friendly" (non testable)

### 3. Review humaine obligatoire

**Règle** : Jamais de merge auto sans review humaine.

**Checkpoints** :
- PRD review (si score < 80%)
- Tech Spec review (si score < 90%)
- Code review (TOUJOURS)

---

## Troubleshooting

### Q: Autonomous Sprint bloqué à une phase

**A:** Vérifier les logs :
```bash
/sprint:logs --story=US-001 --phase=implement
```

Circuit breaker a peut-être déclenché (> 10 itérations). Décomposer la story.

### Q: Quality gate échoue systématiquement

**A:** Ajuster les thresholds dans `.bmad/config.yaml` :
```yaml
auto_proceed_threshold:
  prd: 75          # Était 80
  tech_spec: 85    # Était 90
  code_quality: 80 # Était 85
```

### Q: PR créée mais CI échoue

**A:** Autonomous Sprint a committé du code cassé. Rollback :
```bash
git reset --hard HEAD~1
/sprint:autonomous "US-001" --force-checkpoints
```

---

## Roadmap

### v1.0 (mois 9) — Beta

- [x] Phases 1-6 implémentées
- [x] Human checkpoints configurables
- [x] Integration BMAD v6
- [ ] Documentation complète
- [ ] 10 beta testers

### v1.1 (mois 10)

- [ ] Migration DB auto (avec review)
- [ ] Visual regression tests (QA Recette v2)
- [ ] Multi-story batching (sprint complet en auto)

### v2.0 (mois 12)

- [ ] AI-powered story decomposition (split automatique si trop complexe)
- [ ] Learning feedback loop (amélioration quality gates basée sur historique)
- [ ] Deploy automation (staging auto, prod avec approval)

---

**Date de création** : 2026-04-17  
**Version** : 1.0.0  
**Auteur** : The Bearded CTO  
**Status** : Beta (OPP-02)
