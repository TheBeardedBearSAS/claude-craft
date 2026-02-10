---
description: Équipe de Revue de Sécurité - Audit de sécurité multi-dimension parallèle utilisant les Agent Teams
argument-hint: "[--scope=full|code|deps|infra] [--max-workers=3]"
---

# Équipe de Revue de Sécurité - Audit de Sécurité Multi-Dimension Parallèle

Orchestrer un audit de sécurité complet en utilisant les Claude Code Agent Teams (v2.1.32+). Lance un security lead (opus) plus 3 reviewers haiku spécialisés, chacun analysant une dimension de sécurité différente en parallèle : vulnérabilités du code source, dépendances/chaîne d'approvisionnement, et infrastructure/configuration.

## Arguments

$ARGUMENTS

- `--scope=full` : Périmètre de l'audit (par défaut : `full`). Options : `full`, `code`, `deps`, `infra`
- `--max-workers=3` : Nombre maximum de reviewers parallèles (par défaut : 3, max : 3)
- `--severity=medium` : Sévérité minimum à rapporter : `low`, `medium`, `high`, `critical`
- `--output-dir=<path>` : Répertoire de sortie personnalisé pour les résultats de sécurité
- `--dry-run` : Afficher la composition de l'équipe et le plan de scan sans exécuter
- `--sarif` : Sortir les résultats au format SARIF (pour intégration CI/CD)

## Prérequis

- Claude Code v2.1.32+ avec support Agent Teams
- Variable d'environnement `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` définie
- Docker disponible pour exécuter les scanners de sécurité
- `Tools/AgentTeams/lib/compatibility-check.sh` disponible
- `Tools/AgentTeams/lib/result-aggregator.sh` disponible
- `Tools/AgentTeams/lib/cost-estimator.sh` disponible

## Composition de l'équipe

| Rôle | Modèle | Agent | Responsabilité |
|------|--------|-------|----------------|
| Security Lead | opus | Custom (team lead) | Orchestration, modélisation des menaces, rapport |
| Code Reviewer | haiku | `{tech}-reviewer` | Analyse des vulnérabilités du code source |
| Auditeur de Dépendances | haiku | `{tech}-reviewer` | Chaîne d'approvisionnement, CVE, conformité des licences |
| Reviewer Infrastructure | haiku | `devops-engineer` ou `docker-architect` | Sécurité des conteneurs, secrets, configuration |

**Taille de l'équipe** : 4 agents (1 lead + 3 workers). Composition fixe pour la revue de sécurité.

## Processus

### Étape 1 : Reconnaissance du projet

Le security lead effectue la reconnaissance initiale :

1. Détecter les stacks technologiques (même détection que le full-audit)
2. Identifier les points d'entrée : endpoints API, formulaires, upload de fichiers
3. Mapper la surface d'attaque : routes publiques, frontières d'authentification, flux de données
4. Créer l'ébauche du modèle de menaces (catégories STRIDE)

### Étape 2 : Vérification de compatibilité

```bash
# Vérifier que l'agent code reviewer a les outils requis
Tools/AgentTeams/lib/compatibility-check.sh \
  --agent Dev/i18n/en/<Tech>/agents/<tech>-reviewer.md \
  --require-tools Read,Glob,Grep,Bash

# Vérifier le reviewer infrastructure
Tools/AgentTeams/lib/compatibility-check.sh \
  --agent Dev/i18n/en/Common/agents/devops-engineer.md \
  --require-tools Read,Glob,Grep,Bash
```

### Étape 3 : Lancement de l'équipe (Fan-Out)

```
Security Lead (opus) — orchestre via TaskCreate/SendMessage
  |
  +-- [Reviewers Parallèles] ------------------+
  |   Code Reviewer (haiku) : Analyse source     |
  |   Auditeur de Dépendances (haiku) : Chaîne  |
  |   d'approvisionnement                        |
  |   Reviewer Infra (haiku) : Configuration     |
  +---------------------------------------------+
  |
  v (barrière de synchronisation)
  |
  Security Lead : Corrélation, priorisation, rapport
```

Le lead crée 3 tâches via `TaskCreate` :

#### Tâche A : Revue de Sécurité du Code Source

**Périmètre** : Analyse des vulnérabilités du code applicatif

| Vérification | Quoi chercher | Catégorie OWASP |
|-------------|--------------|-----------------|
| Injection | Patterns d'injection SQL, NoSQL, commande OS, LDAP | A03:2021 |
| XSS | Sortie non échappée, innerHTML, dangerouslySetInnerHTML | A03:2021 |
| Authentification | Politiques de mots de passe faibles, MFA manquant, fixation de session | A07:2021 |
| Autorisation | Contrôles d'accès manquants, IDOR, escalade de privilèges | A01:2021 |
| Cryptographie | Algorithmes faibles, clés codées en dur, random non sécurisé | A02:2021 |
| Validation des entrées | Sanitisation manquante, coercion de type, upload de fichiers | A03:2021 |
| Gestion des erreurs | Stack traces dans les réponses, erreurs verbeuses | A05:2021 |
| Journalisation | Données sensibles dans les logs, piste d'audit manquante | A09:2021 |

**Commandes Docker par stack** :

```bash
# PHP/Symfony
docker compose exec php vendor/bin/phpstan analyse --level=max
docker compose exec php php bin/console security:check

# React/Node
docker compose exec node npm run lint -- --rule 'no-eval: error'
docker compose exec node npx eslint --plugin security .

# Python
docker compose exec app bandit -r src/
docker compose exec app ruff check --select S .

# Général (tous les stacks)
# Patterns grep pour les vulnérabilités courantes
# Chercher : eval(, exec(, system(, shell_exec(, innerHTML, dangerouslySetInnerHTML
# Chercher : mots de passe codés en dur, clés API, tokens dans le source
```

#### Tâche B : Audit des Dépendances / Chaîne d'Approvisionnement

**Périmètre** : Analyse des vulnérabilités et des licences des dépendances tierces

| Vérification | Quoi analyser |
|-------------|--------------|
| CVE connues | Toutes les dépendances directes et transitives |
| Sévérité | CVE Critiques et Hautes nécessitant une action immédiate |
| Conformité des licences | Licences copyleft dans des projets propriétaires |
| Packages obsolètes | Packages avec des correctifs de sécurité disponibles |
| Typosquatting | Noms de packages suspects similaires aux packages populaires |
| Deps inutilisées | Dépendances déclarées mais jamais importées |

**Commandes Docker par stack** :

```bash
# PHP
docker compose exec php composer audit --format=json
docker compose exec php composer outdated --direct

# Node/React/Angular/Vue
docker compose exec node npm audit --json
docker compose exec node npm outdated

# Python
docker compose exec app pip-audit --format=json
docker compose exec app pip list --outdated

# Flutter/Dart
docker run --rm -v $(pwd):/app -w /app dart dart pub outdated --json

# C#/.NET
docker compose exec app dotnet list package --vulnerable
docker compose exec app dotnet list package --outdated
```

#### Tâche C : Revue de Sécurité Infrastructure / Configuration

**Périmètre** : Docker, configuration de déploiement, gestion des secrets

| Vérification | Quoi analyser |
|-------------|--------------|
| Sécurité Dockerfile | Épinglage de l'image de base, utilisateur non-root, builds multi-stage |
| Exposition des secrets | Fichiers .env, identifiants codés en dur, secrets non chiffrés |
| Docker Compose | Conteneurs privilégiés, ports exposés, montages de volumes |
| Politique réseau | Exposition de ports inutile, isolation réseau manquante |
| TLS/SSL | Validation de certificats, versions de protocole, suites de chiffrement |
| Sécurité CI/CD | Injection de secrets, permissions du pipeline, intégrité des artefacts |
| Permissions de fichiers | Configs lisibles par tous, exposition .git, fichiers de backup |

**Commandes de scan** :

```bash
# Sécurité Docker
docker compose config --quiet  # Valider la syntaxe compose
# Vérifier les Dockerfiles pour : USER root, tags latest, ADD vs COPY

# Scan des secrets
# Chercher : fichiers .env pas dans .gitignore
# Chercher : AWS_SECRET, PRIVATE_KEY, password=, token= dans le source
# Chercher : secrets encodés en base64, clés SSH dans le repo

# Revue de configuration
# Vérifier : politiques CORS, headers CSP, HSTS
# Vérifier : mode debug désactivé dans les configs de production
# Vérifier : rate limiting configuré
```

### Étape 4 : Barrière de synchronisation

Le security lead attend que les 3 tâches de reviewers soient terminées. Timeout : 8 minutes par reviewer. Si un reviewer dépasse le timeout, le lead poursuit avec les résultats disponibles et note la lacune.

### Étape 5 : Corrélation et priorisation

Le security lead corrèle les findings à travers les 3 dimensions :

1. **Référence croisée** : Une dépendance vulnérable (Tâche B) utilisée dans un chemin de code vulnérable à l'injection (Tâche A) est élevée à Critique
2. **Analyse de chaîne d'attaque** : Combiner les findings pour identifier les chemins d'attaque multi-étapes
3. **Dédupliquer** : Le même problème trouvé par plusieurs reviewers est fusionné
4. **Prioriser** : Scorer chaque finding par sévérité x exploitabilité x impact

**Matrice de sévérité** :

| Sévérité | Plage CVSS | Réponse |
|----------|-----------|---------|
| Critique | 9.0 - 10.0 | Correction immédiate requise |
| Haute | 7.0 - 8.9 | Corriger dans le sprint en cours |
| Moyenne | 4.0 - 6.9 | Planifier pour le prochain sprint |
| Basse | 0.1 - 3.9 | Backlog / accepter le risque |

### Étape 6 : Génération du rapport

```
================================================================
ÉQUIPE DE REVUE DE SÉCURITÉ - Rapport
================================================================

Projet : <nom-du-projet>
Date : AAAA-MM-JJ
Périmètre : <full|code|deps|infra>
Équipe : 1 lead + 3 reviewers

================================================================
RÉSUMÉ EXÉCUTIF
================================================================

| Sévérité | Nombre |
|----------|--------|
| Critique | X |
| Haute | X |
| Moyenne | X |
| Basse | X |
| Total | X |

Niveau de Risque Global : <Critique|Haut|Moyen|Bas>

================================================================
FINDINGS PAR DIMENSION
================================================================

-- CODE SOURCE (Code Reviewer) --

| # | Sévérité | Catégorie | Fichier | Description |
|---|----------|-----------|---------|-------------|
| 1 | HAUTE | A03:Injection | src/... | Injection SQL dans... |
| 2 | MOYENNE | A07:Auth | src/... | Mot de passe faible... |

-- DÉPENDANCES (Auditeur de Dépendances) --

| # | Sévérité | Package | Version | CVE | Correctif disponible |
|---|----------|---------|---------|-----|---------------------|
| 1 | CRITIQUE | lib-x | 1.2.3 | CVE-2026-XXXX | 1.2.4 |
| 2 | HAUTE | lib-y | 4.5.6 | CVE-2026-YYYY | 5.0.0 |

-- INFRASTRUCTURE (Reviewer Infra) --

| # | Sévérité | Composant | Description |
|---|----------|-----------|-------------|
| 1 | HAUTE | Dockerfile | Exécution en tant que root |
| 2 | MOYENNE | .env | Pas dans .gitignore |

================================================================
CHAÎNES D'ATTAQUE (Findings Corrélés)
================================================================

Chaîne 1 : Injection SQL via dépendance vulnérable
  Étape 1 : Bibliothèque ORM obsolète (CVE-2026-XXXX)
  Étape 2 : L'entrée utilisateur atteint le query builder sans sanitisation
  Impact : Compromission de la base de données
  Sévérité : CRITIQUE

================================================================
PLAN DE REMÉDIATION
================================================================

| Priorité | Action | Effort | Impact |
|----------|--------|--------|--------|
| 1 | Mettre à jour lib-x vers 1.2.4 | Faible | Corrige CVE-2026-XXXX |
| 2 | Ajouter la sanitisation des entrées dans src/... | Moyen | Bloque l'injection |
| 3 | Passer à un utilisateur Docker non-root | Faible | Réduit le rayon d'explosion |

================================================================
MÉTRIQUES D'EXÉCUTION
================================================================

| Métrique | Valeur |
|----------|--------|
| Temps total | Xs (vs ~Ys séquentiel) |
| Accélération | ~X.Xx |
| Tokens totaux | ~XK |
| Findings découverts | X |
| Reviewers terminés | 3/3 |
```

### Étape 7 : Nettoyage

Le security lead envoie un `shutdown_request` à tous les reviewers et nettoie les répertoires de sortie isolés.

## Attentes de performance

| Périmètre | Est. séquentielle | Est. équipe | Accélération | Surcoût en tokens |
|-----------|-------------------|-------------|-------------|-------------------|
| Code seul | ~5 min | ~5 min | 1x (pas de parallélisme) | 0% |
| Deps seules | ~3 min | ~3 min | 1x (pas de parallélisme) | 0% |
| Complet | ~12 min | ~6 min | ~2x | +30% |

**Note** : Le périmètre complet bénéficie du parallélisme à 3 voies. Les périmètres individuels (`--scope=code`) s'exécutent comme des tâches single-worker sans surcoût d'équipe.

## Gestion des erreurs

| Erreur | Reprise |
|--------|---------|
| Timeout du reviewer (>8min) | Le lead poursuit avec les résultats partiels, note la lacune |
| Crash du reviewer | Le lead enregistre l'erreur, rapporte la dimension comme "non évaluée" |
| Docker non disponible | Le reviewer bascule sur une analyse par patterns du code source uniquement |
| Aucune vulnérabilité trouvée | Le rapport indique un statut propre (ce n'est pas une erreur) |
| Outil de scan non installé | Le reviewer ignore le scanner, utilise l'analyse par grep |

## Limitations

- Équipe fixe de 4 agents (1 lead + 3 reviewers)
- Ne peut pas remplacer les outils de sécurité spécialisés (SAST/DAST/SCA) — les complète
- Les findings dépendent des connaissances en sécurité du modèle (pas de détection de zero-day)
- Coût en tokens ~30% plus élevé que le séquentiel en raison de la duplication du contexte
- Nécessite Agent Teams Research Preview (l'API peut changer)
- La qualité de corrélation des chaînes d'attaque dépend de la capacité de raisonnement de l'agent lead
