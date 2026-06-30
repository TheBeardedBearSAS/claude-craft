# Guide de Développement de Fonctionnalités

Ce guide couvre le workflow complet pour développer de nouvelles fonctionnalités avec Claude-Craft, de l'analyse initiale à la revue finale.

---

## Table des Matières

1. [Vue d'Ensemble du Workflow TDD](#vue-densemble-du-workflow-tdd)
2. [Phase 1 : Analyse](#phase-1--analyse)
3. [Phase 2 : Conception](#phase-2--conception)
4. [Phase 3 : Écriture des Tests](#phase-3--écriture-des-tests)
5. [Phase 4 : Implémentation](#phase-4--implémentation)
6. [Phase 5 : Refactoring](#phase-5--refactoring)
7. [Phase 6 : Revue](#phase-6--revue)
8. [Exemple Complet](#exemple-complet)
9. [Ressources Disponibles](#ressources-disponibles)

---

## Vue d'Ensemble du Workflow TDD

Claude-Craft impose un workflow de Développement Piloté par les Tests :

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ 1. Analyser │ --> │ 2. Concevoir│ --> │  3. Tests   │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
                                              v
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  6. Revue   │ <-- │5. Refactorer│ <-- │4. Implémenter│
└─────────────┘     └─────────────┘     └─────────────┘
```

### Pourquoi le TDD ?

- **Confiance** : Les tests prouvent que votre code fonctionne
- **Documentation** : Les tests décrivent le comportement attendu
- **Conception** : Écrire les tests d'abord mène à de meilleures APIs
- **Non-régression** : Les tests détectent les bugs futurs

---

## Phase 1 : Analyse

Avant d'écrire du code, comprenez ce qui doit être construit.

### Utiliser la Commande d'Analyse

```bash
/common:analyze-feature "Authentification utilisateur avec tokens JWT et contrôle d'accès basé sur les rôles"
```

Cette commande va :
1. Décomposer la fonctionnalité en composants
2. Identifier les exigences techniques
3. Lister les cas limites potentiels
4. Suggérer une approche d'implémentation

**Régler l'effort :** `/effort high` pour les phases d'analyse exigeant un raisonnement profond ; `/effort low` pour les recherches simples, `/effort medium` pour l'implémentation standard.

> **Modèles courants (juin 2026) :** `low` → Haiku 4.5, `medium` → **Sonnet 5** (`claude-sonnet-5`, sorti le 2026-06-30 — agentique, prix intro $2/$10 par M tokens jusqu'au 2026-08-31), `high`/`xhigh` → Opus 4.8. L'alias `model:` se résout automatiquement vers la dernière version, donc `CLAUDE_CODE_SUBAGENT_MODEL=sonnet` pointe désormais vers Sonnet 5. Fable 5 est suspendu — ne pas l'utiliser. Grille complète prix/routage : [FAQ](../../FAQ.md).

### Utiliser l'Agent de Recherche

```markdown
@research-assistant Recherche les bonnes pratiques pour l'authentification JWT dans Symfony 7
```

L'agent de recherche va :
- Chercher documentation et bonnes pratiques
- Résumer les découvertes
- Fournir des exemples de code
- Mettre en évidence les considérations de sécurité

### Checklist d'Analyse

- [ ] User story clairement définie
- [ ] Critères d'acceptation documentés
- [ ] Cas limites identifiés
- [ ] Approche technique choisie
- [ ] Dépendances identifiées
- [ ] Implications de sécurité revues

---

## Phase 2 : Conception

Concevez l'architecture avant l'implémentation.

### Conception de Base de Données

```markdown
@database-architect Conçois le schéma pour l'entité User avec rôles et permissions

Exigences :
- Un utilisateur peut avoir plusieurs rôles
- Les rôles ont des permissions
- Support de la suppression logique
- Piste d'audit pour les modifications
```

L'architecte base de données va :
- Concevoir un schéma normalisé
- Suggérer des index
- Considérer les relations
- Planifier les migrations

### Conception d'API

```markdown
@api-designer Conçois l'API REST pour la gestion des utilisateurs

Endpoints nécessaires :
- Opérations CRUD sur les utilisateurs
- Attribution des rôles
- Authentification (login/logout)
- Flux de réinitialisation de mot de passe
```

Le concepteur d'API va :
- Définir les endpoints et méthodes
- Spécifier les formats requête/réponse
- Documenter les exigences d'authentification
- Planifier les réponses d'erreur

### Décision Architecturale

```bash
/common:architecture-decision "Comment implémenter le contrôle d'accès basé sur les rôles"
```

Utilisez cette commande pour les choix architecturaux importants. Elle crée un Architecture Decision Record (ADR) documentant :
- Contexte et problème
- Options considérées
- Solution choisie
- Conséquences

### Checklist de Conception

- [ ] Schéma de base de données conçu
- [ ] Endpoints API définis
- [ ] Décisions architecturales documentées
- [ ] Modèle de sécurité défini
- [ ] Stratégie de gestion d'erreurs planifiée

---

## Phase 3 : Écriture des Tests

Écrivez les tests AVANT l'implémentation. C'est le "TDD" du TDD.

### Utiliser le Coach TDD

```markdown
@tdd-coach Aide-moi à écrire des tests pour la méthode d'authentification de UserService

La méthode doit :
- Accepter email et mot de passe
- Retourner un token JWT en cas de succès
- Lever une exception si identifiants invalides
- Verrouiller le compte après 5 tentatives échouées
```

Le coach TDD va :
- Suggérer des cas de test
- Écrire des exemples de code de test
- Expliquer les assertions
- Identifier les cas limites

### Catégories de Tests

#### Tests Unitaires

Testent les composants individuels en isolation :

```php
// tests/Unit/Domain/User/UserTest.php
public function test_user_can_change_password(): void
{
    $user = User::create(
        email: 'test@example.com',
        password: 'ancien-mot-de-passe'
    );

    $user->changePassword('nouveau-mot-de-passe');

    $this->assertTrue($user->verifyPassword('nouveau-mot-de-passe'));
    $this->assertFalse($user->verifyPassword('ancien-mot-de-passe'));
}
```

#### Tests d'Intégration

Testent les interactions entre composants :

```php
// tests/Integration/UserServiceTest.php
public function test_user_service_creates_user_in_database(): void
{
    $service = $this->container->get(UserService::class);

    $user = $service->createUser(
        email: 'test@example.com',
        password: 'mot-de-passe-securise'
    );

    $this->assertNotNull($user->getId());
    $this->assertDatabaseHas('users', ['email' => 'test@example.com']);
}
```

#### Tests BDD/Fonctionnels

Testent les scénarios métier :

```gherkin
# features/authentification.feature
Fonctionnalité: Authentification Utilisateur
  En tant qu'utilisateur
  Je veux me connecter avec mes identifiants
  Afin d'accéder aux ressources protégées

  Scénario: Connexion réussie
    Étant donné que j'ai un utilisateur enregistré avec l'email "user@example.com"
    Quand je soumets des identifiants valides
    Alors je devrais recevoir un token JWT
    Et le token devrait être valide pendant 1 heure
```

### Commandes de Test par Technologie

```bash
# Symfony
/symfony:check-testing

# Flutter
/flutter:check-testing

# Python
/python:check-testing

# React
/react:check-testing

# Angular
/angular:check-testing

# Vue.js
/vuejs:check-testing

# C# / .NET
/csharp:check-testing

# Laravel
/laravel:check-testing

# React Native
/reactnative:check-testing

# PHP
/php:check-testing
```

### Checklist d'Écriture de Tests

- [ ] Tests unitaires pour la logique métier
- [ ] Tests d'intégration pour les services
- [ ] Tests API pour les endpoints
- [ ] Cas limites couverts
- [ ] Scénarios d'erreur testés
- [ ] Tous les tests en échec (pas encore implémenté)

---

## Phase 4 : Implémentation

Maintenant implémentez le code pour faire passer les tests.

### Commandes de Génération de Code

#### Symfony

```bash
# Générer CRUD avec tests
/symfony:generate-crud User

# Générer endpoint API
/symfony:api-endpoint POST /api/users CreateUserRequest

# Générer commande
/symfony:generate-command SendWelcomeEmailCommand
```

#### Flutter

```bash
# Générer BLoC
/flutter:generate-bloc Authentication

# Générer écran
/flutter:generate-screen LoginScreen

# Générer widget
/flutter:generate-widget UserAvatar
```

#### Python

```bash
# Générer endpoint FastAPI
/python:generate-endpoint POST /users CreateUser

# Générer service
/python:generate-service UserService

# Générer modèle
/python:generate-model User
```

#### React

```bash
# Générer composant
/react:generate-component UserProfile

# Générer hook
/react:generate-hook useAuth

# Générer contexte
/react:generate-context AuthContext
```

#### Angular

```bash
# Générer composant standalone
/angular:generate-component UserProfile
```

#### Vue.js

```bash
# Générer composant avec TypeScript et tests
/vuejs:generate-component UserProfile
```

#### C# / .NET

```bash
# Générer feature complète Clean Architecture
/csharp:generate-feature User
```

#### Laravel

```bash
# Générer contrôleur avec bonnes pratiques
/laravel:generate-controller UserController
```

### Utiliser les Templates

Les templates fournissent des patterns de code prêts à l'emploi. Accédez-y avec :

```markdown
Montre-moi le template de service pour Symfony
```

Templates disponibles par technologie :

| Symfony | Flutter | Python | React |
|---------|---------|--------|-------|
| service.md | bloc.md | service.md | component.md |
| value-object.md | widget.md | repository.md | hook.md |
| aggregate-root.md | screen.md | endpoint.md | context.md |
| domain-event.md | state.md | model.md | reducer.md |
| repository.md | cubit.md | schema.md | - |

### Bonnes Pratiques d'Implémentation

1. **Un test à la fois** : Faites passer un test avant de passer au suivant
2. **Code minimal** : Écrivez juste assez de code pour faire passer le test
3. **Pas d'optimisation prématurée** : Concentrez-vous sur la correction d'abord
4. **Suivez les patterns existants** : Utilisez les templates et conventions

### Checklist d'Implémentation

- [ ] Tous les tests unitaires passent
- [ ] Tous les tests d'intégration passent
- [ ] Tous les tests API passent
- [ ] Pas de valeurs codées en dur
- [ ] Gestion d'erreurs implémentée
- [ ] Logging ajouté

---

## Phase 5 : Refactoring

Avec les tests qui passent, améliorez la qualité du code.

### Commandes de Refactoring

```bash
# Vérifier la qualité du code (disponible pour les 10 stacks dev)
/{tech}:check-code-quality

# Vérifier la conformité architecturale
/{tech}:check-architecture

# Audit de conformité complète (retourne un score /100)
/{tech}:check-compliance
```

### Utiliser le Spécialiste du Refactoring

```markdown
@refactoring-specialist Revois cette classe service pour des améliorations potentielles

[coller le code ici]
```

Le spécialiste du refactoring va :
- Identifier les code smells
- Suggérer des améliorations
- Montrer des exemples refactorisés
- Expliquer les compromis

### Patterns de Refactoring Courants

1. **Extract Method** : Décomposer les méthodes longues en plus petites
2. **Extract Class** : Diviser les grandes classes
3. **Introduce Value Object** : Remplacer les primitives par des types métier
4. **Replace Conditional with Polymorphism** : Utiliser le pattern Strategy
5. **Move Method** : Placer les méthodes là où elles appartiennent

### Checklist de Refactoring

- [ ] Pas de duplication de code
- [ ] Méthodes de moins de 20 lignes
- [ ] Classes de moins de 200 lignes
- [ ] Nommage clair
- [ ] Style cohérent
- [ ] Tous les tests passent toujours

---

## Phase 6 : Revue

Vérification qualité finale avant complétion.

### Audit de Conformité

```bash
# Vérification complète de conformité (retourne un score /100)
/symfony:check-compliance
/flutter:check-compliance
/python:check-compliance
/react:check-compliance
```

Cet audit complet vérifie :
- Conformité architecturale
- Qualité du code
- Couverture de tests
- Problèmes de sécurité
- Documentation

### Revue de Code avec les Agents

```markdown
@symfony-reviewer Revois mon implémentation complète d'authentification User

Fichiers modifiés :
- src/Domain/User/User.php
- src/Application/Service/AuthenticationService.php
- src/Infrastructure/Security/JwtTokenGenerator.php
- tests/Unit/Domain/User/UserTest.php
- tests/Integration/AuthenticationServiceTest.php
```

Le reviewer va :
- Vérifier la conformité architecturale
- Identifier les problèmes potentiels
- Suggérer des améliorations
- Vérifier les bonnes pratiques

### Audit de Sécurité

```bash
/common:security-audit
```

Ou utilisez l'agent orienté sécurité :

```markdown
@devops-engineer Revois la sécurité du système d'authentification

Points d'attention :
- Sécurité des tokens JWT
- Stockage des mots de passe
- Rate limiting
- Configuration CORS
```

### Checklist de Fonctionnalité

Utilisez la checklist intégrée :

```bash
cat .claude/checklists/feature-checklist.md
```

Points clés :
- [ ] Exigences de la user story satisfaites
- [ ] Tous les critères d'acceptation vérifiés
- [ ] Tests écrits et passants (80%+ couverture)
- [ ] Code revu
- [ ] Audit de sécurité passé
- [ ] Documentation mise à jour
- [ ] Pas de problème critique en analyse statique
- [ ] Performance acceptable
- [ ] Prêt pour revue de code

---

## Exemple Complet

Parcourons une fonctionnalité complète : Ajouter l'inscription utilisateur.

### Étape 1 : Analyser

```markdown
/common:analyze-feature "Inscription utilisateur avec vérification email"

Attendu :
- L'utilisateur soumet email et mot de passe
- Le système envoie un email de vérification
- L'utilisateur clique sur le lien pour vérifier
- Le compte devient actif
```

### Étape 2 : Concevoir la Base de Données

```markdown
@database-architect Conçois le schéma pour User avec vérification email

Champs nécessaires :
- id, email, password_hash
- email_verified_at (timestamp nullable)
- verification_token
- created_at, updated_at
```

### Étape 3 : Concevoir l'API

```markdown
@api-designer Conçois les endpoints API d'inscription

POST /api/register - Créer un compte
POST /api/verify-email - Vérifier l'email avec le token
POST /api/resend-verification - Renvoyer l'email de vérification
```

### Étape 4 : Écrire les Tests

```markdown
@tdd-coach Aide-moi à écrire des tests pour UserRegistrationService

Cas de test :
1. Inscription réussie crée l'utilisateur
2. Email en doublon retourne une erreur
3. Mot de passe faible retourne une erreur
4. Email de vérification est envoyé
5. Token de vérification active le compte
6. Token expiré retourne une erreur
```

### Étape 5 : Générer le Code

```bash
/symfony:generate-crud User --with-api
/symfony:generate-command SendVerificationEmailCommand
```

### Étape 6 : Implémenter

Faites passer les tests un par un :

```php
// Faire passer le test 1
public function register(string $email, string $password): User
{
    $user = User::create($email, $password);
    $this->repository->save($user);
    return $user;
}

// Faire passer le test 2
public function register(string $email, string $password): User
{
    if ($this->repository->findByEmail($email)) {
        throw new DuplicateEmailException($email);
    }
    // ...
}

// Continuer pour chaque test...
```

### Étape 7 : Refactoriser

```bash
/symfony:check-code-quality
```

Corrigez les problèmes identifiés.

### Étape 8 : Revoir

```markdown
@symfony-reviewer Revois mon implémentation d'inscription utilisateur

Implémentation complète incluant :
- Domaine : Entité User, ValueObjects
- Application : RegistrationService
- Infrastructure : DoctrineUserRepository
- API : RegisterController
- Tests : Unitaires, Intégration, API
```

### Étape 9 : Vérification Finale

```bash
/symfony:check-compliance
```

Objectif : Score 90+/100

---

## Ressources Disponibles

### Résumé des Agents (70 agents disponibles)

| Agent | Utilisation |
|-------|-------------|
| `@api-designer` | Conception d'endpoints API |
| `@database-architect` | Conception de schémas BDD |
| `@tdd-coach` | Guidance pour l'écriture de tests |
| `@refactoring-specialist` | Amélioration du code |
| `@performance-auditor` | Audit de performance |
| `@{tech}-reviewer` | Revue de code (10 reviewers : symfony, flutter, react, python, angular, laravel, vuejs, reactnative, csharp, php) |
| `@devops-engineer` | Revue d'infrastructure |
| `@research-assistant` | Recherche de bonnes pratiques |
| `@docker-*` | 5 agents Docker |
| `@kubernetes-*` | 5 agents Kubernetes |

### Résumé des Commandes

| Phase | Commandes |
|-------|-----------|
| Analyse | `/common:analyze-feature` |
| Conception | `/common:architecture-decision` |
| Tests | `/{tech}:check-testing` |
| Génération | `/{tech}:generate-*` |
| Qualité | `/{tech}:check-code-quality` |
| Revue | `/{tech}:check-compliance` |
| Sécurité | `/common:security-audit` |

### Emplacement des Templates

```bash
ls .claude/templates/
```

### Emplacement des Checklists

```bash
ls .claude/checklists/
```

---

## Conseils pour Réussir

1. **Ne sautez pas les tests** : C'est votre filet de sécurité
2. **Utilisez les agents** : Ils fournissent des conseils d'experts
3. **Lancez souvent les vérifications de conformité** : Détectez les problèmes tôt
4. **Suivez le workflow** : Chaque phase a un objectif
5. **Documentez les décisions** : Utilisez les ADRs pour les choix importants

---

[&larr; Création de Projet](02-project-creation.md) | [Correction de Bugs &rarr;](04-bug-fixing.md)
