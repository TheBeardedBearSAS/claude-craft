# Guide de Workflow Complet : De l'Idée à la Production

Guide complet étape par étape pour construire une application complète avec Claude Craft, de l'idée initiale au déploiement en production.

---

## Vue d'ensemble

Ce guide vous accompagne à travers le cycle de développement complet :

1. **Idéation** - Définir votre vision produit
2. **Exigences** - Documenter ce que vous construisez
3. **Architecture** - Concevoir la solution technique
4. **Planification** - Créer des sprints actionnables
5. **Développement** - Implémenter avec TDD
6. **Qualité** - Valider et tester
7. **Déploiement** - Livrer en production

**Prérequis :**
- Claude Craft installé dans votre projet
- Compréhension basique de votre stack technologique
- Claude Code en cours d'exécution

---

## Phase 1 : Idéation (5-10 minutes)

### Démarrer avec BMAD

```bash
# Initialiser BMAD dans votre projet
/bmad:init

# Ou démarrer un workflow
/workflow:init
```

### Définir la Vision

Travaillez avec l'agent Product Manager :

```
@pm Je veux construire une plateforme e-commerce pour vendre des produits artisanaux.
Fonctionnalités clés :
- Catalogue de produits avec catégories
- Panier et paiement
- Authentification utilisateur
- Gestion des commandes
```

Le PM vous aidera à :
- Clarifier le problème que vous résolvez
- Identifier les utilisateurs cibles
- Définir les métriques de succès

### Créer le Document de Vision

```
@pm Crée un document de vision pour ce projet
```

Sortie : `docs/vision.md`

---

## Phase 2 : Exigences (15-30 minutes)

### Analyser les Exigences

Travaillez avec le Business Analyst :

```
@ba Analyse les exigences de la plateforme e-commerce basé sur la vision
```

Le BA va :
- Décomposer les fonctionnalités en user stories
- Identifier les dépendances
- Créer une carte des user stories

### Créer le PRD

```
@pm Crée un Product Requirements Document
```

### Valider le PRD

```
/gate:validate-prd docs/prd.md
```

Assurez-vous de passer la PRD Gate (≥80%) :
- [ ] Énoncé du problème défini
- [ ] Utilisateurs cibles identifiés
- [ ] Objectifs clairs
- [ ] Métriques de succès définies
- [ ] Périmètre délimité

---

## Phase 3 : Architecture (20-45 minutes)

### Concevoir l'Architecture

Travaillez avec l'Architecte :

```
@architect Conçois l'architecture système pour la plateforme e-commerce
À considérer :
- Backend Symfony avec API Platform
- Base de données PostgreSQL
- Cache Redis
- Déploiement Docker
```

L'Architecte va créer :
- Diagramme d'architecture système
- Conception des composants
- Modèle de données
- Contrats d'API

### Créer la Spécification Technique

```
@architect Crée la spécification technique à partir du PRD
```

Sortie : `docs/tech-spec.md`

### Documenter les Décisions

Pour les choix importants :

```
@architect Crée un ADR pour le choix de JWT plutôt que les sessions
```

Sortie : `docs/adr/001-jwt-authentication.md`

### Valider la Spec Technique

```
/gate:validate-techspec docs/tech-spec.md
```

Assurez-vous de passer la Tech Spec Gate (≥90%) :
- [ ] Architecture documentée
- [ ] Contrats d'API définis
- [ ] Sécurité adressée
- [ ] Exigences de performance définies
- [ ] Stratégie de test définie
- [ ] Plan de déploiement créé

---

## Phase 4 : Planification (15-30 minutes)

### Créer le Backlog

Travaillez avec le Product Owner :

```
@po Crée les user stories à partir de la spécification technique
Priorise avec la méthode MoSCoW
```

Le PO va créer des stories comme :
```
EPIC-001: Authentification Utilisateur
├── US-001: Inscription utilisateur
├── US-002: Connexion utilisateur
├── US-003: Réinitialisation mot de passe
└── US-004: Connexion sociale

EPIC-002: Catalogue Produits
├── US-005: Parcourir les produits
├── US-006: Recherche de produits
├── US-007: Filtrage par catégorie
└── US-008: Détails du produit
```

### Valider le Backlog

```
/gate:validate-backlog
```

Chaque story doit passer INVEST :
- **I**ndépendante
- **N**égociable
- **V**alorisable
- **E**stimable
- **S**mall (Petite)
- **T**estable

### Planifier le Premier Sprint

Travaillez avec le Scrum Master :

```
@sm Planifie le sprint 1 avec les stories les plus prioritaires
Inclure :
- US-001: Inscription utilisateur
- US-002: Connexion utilisateur
- US-005: Parcourir les produits
```

### Valider le Sprint

```
/gate:validate-sprint
```

---

## Phase 5 : Développement (Variable)

### Démarrer le Développement du Sprint

```
/sprint:dev 1
```

Ou travailler story par story :

### 5.1 Obtenir la Story Suivante

```
/sprint:next-story --claim
```

Exemple : US-001 (Inscription Utilisateur)

### 5.2 Transition vers In-Progress

```
/sprint:transition US-001 in-progress
```

### 5.3 Phase TDD Rouge (Écrire le Test Échouant)

Travaillez avec l'agent Developer :

```
@dev Démarre le TDD pour US-001 (Inscription Utilisateur)
Commence avec la phase 🔴 Rouge - écrire les tests échouants
```

Créer les tests d'abord :
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

### 5.4 Phase TDD Verte (Implémenter)

```
@dev Maintenant implémente la phase 🟢 Verte - faire passer les tests
```

Générer le code :
```
/symfony:generate-crud User
```

### 5.5 Phase TDD Refactoring

```
@dev 🔵 Refactoring - nettoyer l'implémentation
```

### 5.6 Revue de Code

```
@symfony-reviewer Passe en revue l'implémentation de l'inscription utilisateur
```

### 5.7 Valider la Story DoD

```
/gate:validate-story US-001
```

### 5.8 Transition vers Review

```
/sprint:transition US-001 review
```

### 5.9 Validation QA

```
@qa Valide les critères d'acceptation pour US-001
```

### 5.10 Terminer la Story

```
/sprint:transition US-001 done
```

### 5.11 Répéter

Continuer avec la story suivante jusqu'à la fin du sprint.

---

## Phase 6 : Qualité (En continu)

### Vérifications de Qualité Continues

Exécuter régulièrement pendant le développement :

```
# Vérification d'architecture
/symfony:check-architecture

# Qualité du code
/symfony:check-code-quality

# Audit de sécurité
/symfony:check-security

# Couverture de tests
/symfony:check-testing
```

### Audit Complet Avant Release

```
/team:audit --sequential
```

### Validation Pré-Commit

Toujours avant de commiter :

```
/common:pre-commit-check
```

### Revue de Sprint

À la fin du sprint :

```
@sm Lance la revue de sprint pour le sprint 1
```

### Rétrospective

```
@sm Lance la rétrospective du sprint
```

---

## Phase 7 : Déploiement (30-60 minutes)

### Préparer la Configuration Docker

```
@docker-architect Conçois l'architecture Docker pour la production
```

### Créer les Fichiers Docker

```
/docker:compose-setup symfony postgresql redis
```

### Créer le Pipeline CI/CD

```
/docker:cicd-pipeline github-actions
```

### Vérification de Sécurité

```
/docker:security-scan
```

### Checklist Pré-Release

```
/common:release-checklist
```

### Déployer

```bash
# Build et test
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# Exécuter les migrations
docker compose exec app php bin/console doctrine:migrations:migrate

# Vérifier la santé
curl https://votre-app.com/health
```

---

## Utiliser Ralph pour l'Automatisation

Pour des cycles de développement automatisés, utilisez Ralph Wiggum :

```bash
# Implémenter une fonctionnalité automatiquement
/common:ralph-run "Implémenter l'inscription utilisateur avec TDD"

# Avec toutes les vérifications DoD
/common:ralph-run --full "Ajouter la fonctionnalité de réinitialisation de mot de passe"
```

Ralph va itérer jusqu'à ce que :
- Tous les tests passent
- Le lint passe
- Les validateurs DoD passent

---

## Séquence de Commandes Complète

Voici une séquence condensée pour une fonctionnalité typique :

```bash
# 1. Initialiser
/bmad:init

# 2. Définir (PM)
@pm Crée le PRD pour la fonctionnalité
/gate:validate-prd docs/prd.md

# 3. Concevoir (Architecte)
@architect Crée la spécification technique
/gate:validate-techspec docs/tech-spec.md

# 4. Planifier (PO + SM)
@po Crée les user stories
@sm Planifie le sprint 1
/gate:validate-sprint

# 5. Développer (Dev)
/sprint:next-story --claim
@dev Implémente avec TDD
/gate:validate-story US-001
/sprint:transition US-001 done

# 6. Réviser (QA)
@qa Valide les critères d'acceptation
/team:audit --sequential

# 7. Déployer
/docker:cicd-pipeline github-actions
/common:release-checklist
```

---

## Conseils pour Réussir

### 1. Ne Sautez Pas les Quality Gates

Chaque gate attrape différents problèmes :
- PRD Gate → Empêche de construire la mauvaise chose
- Tech Spec Gate → Empêche les problèmes d'architecture
- Backlog Gate → Assure que les stories sont implémentables
- Story DoD → Assure un code de qualité

### 2. Utilisez les Agents de Manière Collaborative

Claude-Craft inclut **72 agents** spécialisés. Laissez les agents se passer le relais :
```
@bmad-master Route ceci vers l'agent approprié
```

### 3. Le TDD est Non-Négociable

Toujours suivre 🔴 Rouge → 🟢 Vert → 🔵 Refactoring.

### 4. Documentez les Décisions

Utilisez les ADRs pour les choix importants :
```
@architect Crée un ADR pour le choix de X plutôt que Y
```

### 5. Revues Régulières

- Quotidien : `/common:daily-standup`
- Fin de Sprint : `@sm Lance la revue de sprint`
- Continu : `@{tech}-reviewer Passe en revue ce code`

### 6. Gérez Votre Contexte

Utilisez les commandes de gestion de contexte pour rester productif :
- `/effort high` pour les tâches d'architecture complexes, `/effort low` pour les lookups
- `/context` pour des suggestions d'optimisation du contexte
- `/compact` proactivement quand le contexte dépasse 70%
- `/clear` entre les tâches non liées
- `/loop` pour les tâches récurrentes (ex: `/loop 5m /common:pre-commit-check`)

### 7. Optimisez Vos Tokens

Configurez RTK pour réduire la consommation de tokens de 55-65% :
```
/common:setup-rtk
```

---

## Dépannage

### Le Quality Gate Échoue

```
/gate:report
```

Vérifiez quels critères manquent.

### Story Bloquée

```
/sprint:transition US-001 blocked --reason="En attente de l'API"
```

### Besoin de Rollback

Si vous utilisez Ralph avec le checkpointing Git :
```bash
git log --oneline --grep="[ralph]"
git reset --hard HEAD~3
```

---

## Étapes Suivantes

- [Guide Pratique BMAD](../BMAD-PRACTICAL-GUIDE.md) - Approfondissement BMAD
- [Guide Ralph Wiggum](../RALPH-GUIDE.md) - Développement automatisé
- [Référence des Commandes](../COMMANDS.md) - Toutes les commandes
- [Référence des Agents](../AGENTS.md) - Tous les agents
