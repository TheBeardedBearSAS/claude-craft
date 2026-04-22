# Module 8 : Qualite et Securite (1h)

## Objectifs

A la fin de ce module, vous serez capable de :
- Appliquer le cycle TDD (Red-Green-Refactor) avec Claude Code
- Realiser des audits de code automatises
- Identifier et corriger les vulnerabilites OWASP Top 10
- Utiliser les conventional commits et creer des PRs avec Claude Code
- Gerer les couts et optimiser la consommation de tokens

---

## 1. TDD/BDD avec Claude Code

### Le Cycle Red-Green-Refactor

Le TDD (Test-Driven Development) est une discipline de developpement ou les tests sont ecrits **avant** le code. Claude Code excelle dans ce workflow car il peut generer les tests a partir de specifications, puis implementer le code minimal pour les faire passer.

```
     ┌─────────────────────────────────────┐
     │                                     │
     v                                     │
┌─────────┐    ┌─────────┐    ┌──────────┐│
│   RED   │───>│  GREEN  │───>│ REFACTOR ││
│  Ecrire │    │  Code   │    │ Ameliorer││
│  test   │    │ minimal │    │  le code ││
│  (fail) │    │ (pass)  │    │  (pass)  ││
└─────────┘    └─────────┘    └──────────┘│
                                   │      │
                                   └──────┘
```

### Workflow TDD avec Claude

```
Etape 1 - RED : Demander les tests
  "Ecris les tests pour un service de calcul de TVA.
   Criteres :
   - TVA standard 20%
   - TVA reduite 5.5% pour l'alimentaire
   - TVA 0% pour les exportations
   - Arrondi a 2 decimales"

  -> Claude genere les tests qui echouent (aucun code n'existe)

Etape 2 - GREEN : Demander l'implementation
  "Implemente le TaxCalculatorService pour faire passer ces tests.
   Code minimal uniquement."

  -> Claude ecrit le code le plus simple qui passe les tests

Etape 3 - REFACTOR : Demander l'amelioration
  "Refactorise le TaxCalculatorService en appliquant les principes SOLID.
   Les tests doivent continuer a passer."

  -> Claude ameliore le code tout en gardant les tests verts
```

### Generation de tests

Claude Code peut generer differents types de tests :

| Type | Commande typique | Usage |
|------|-----------------|-------|
| **Unitaires** | "Ecris les tests unitaires pour cette classe" | Logique metier isolee |
| **Integration** | "Ecris un test d'integration pour ce endpoint" | Interactions entre composants |
| **Edge cases** | "Ajoute les tests pour les cas limites" | Robustesse |
| **Regression** | "Ecris un test qui reproduit ce bug" | Prevention recidive |

### Couverture de code

```
> Lance les tests avec couverture et identifie les fichiers sous 80%

Claude :
- Execute la commande de couverture appropriee
- Identifie les fichiers non couverts
- Propose des tests supplementaires pour les zones non couvertes
```

### BDD avec Gherkin

Claude Code peut generer des scenarios BDD au format Gherkin :

```
> Ecris les scenarios BDD pour le processus d'inscription utilisateur

Claude genere :

Feature: Inscription utilisateur
  En tant que visiteur
  Je veux creer un compte
  Afin d'acceder aux fonctionnalites

  Scenario: Inscription reussie
    Given je suis sur la page d'inscription
    When je remplis le formulaire avec des donnees valides
    And je soumets le formulaire
    Then mon compte est cree
    And je recois un email de confirmation

  Scenario: Email deja utilise
    Given un utilisateur avec l'email "test@example.com" existe
    When je m'inscris avec l'email "test@example.com"
    Then je vois un message d'erreur "Cet email est deja utilise"
    And aucun compte n'est cree

  Scenario: Mot de passe trop faible
    Given je suis sur la page d'inscription
    When je saisis le mot de passe "123"
    Then je vois un message d'erreur sur la force du mot de passe
```

---

## 2. Audit de Code

### Analyse d'architecture

Claude Code peut analyser l'architecture globale d'un projet :

```
> Analyse l'architecture de ce projet. Verifie :
  1. La separation des couches (presentation, application, domain, infrastructure)
  2. Les dependances entre modules
  3. Les violations de SOLID
  4. Les couplages forts

Claude :
- Lit la structure du projet
- Analyse les imports et dependances
- Identifie les violations architecturales
- Propose un rapport structure avec scores
```

### Detection d'anti-patterns

| Anti-pattern | Description | Impact |
|-------------|-------------|--------|
| **God Class** | Classe avec trop de responsabilites | Maintenabilite |
| **Feature Envy** | Methode qui utilise plus les donnees d'une autre classe | Couplage |
| **Shotgun Surgery** | Modification necessitant des changements partout | Fragilite |
| **Long Method** | Methode > 20 lignes | Lisibilite |
| **Data Clump** | Groupes de donnees toujours passes ensemble | Abstraction manquante |
| **Magic Numbers** | Valeurs numeriques en dur | Maintenabilite |

```
> Cherche les anti-patterns dans le module src/services/.
  Pour chaque anti-pattern trouve, donne :
  - Le fichier et la ligne
  - Le type d'anti-pattern
  - La severite (critique, majeur, mineur)
  - La correction recommandee
```

### Metriques de complexite

```
> Calcule les metriques de complexite :
  - Complexite cyclomatique (cible < 10 par methode)
  - Nombre de lignes par classe (cible < 200)
  - Nombre de parametres par methode (cible < 4)
  - Profondeur d'imbrication (cible < 3)
  - Nombre de dependances par classe (cible < 7)

Claude :
- Analyse chaque fichier
- Calcule les metriques
- Identifie les fichiers hors cible
- Recommande des refactorings
```

---

## 3. Securite

### OWASP Top 10

Claude Code peut auditer votre code pour les 10 vulnerabilites les plus critiques :

| # | Vulnerabilite | Ce que Claude verifie |
|---|---------------|----------------------|
| 1 | **Broken Access Control** | Verification des permissions a chaque endpoint |
| 2 | **Cryptographic Failures** | Algorithmes obsoletes, secrets en dur |
| 3 | **Injection** | SQL injection, command injection, XSS |
| 4 | **Insecure Design** | Absence de rate limiting, validation insuffisante |
| 5 | **Security Misconfiguration** | Debug en production, headers manquants |
| 6 | **Vulnerable Components** | Dependances avec CVE connues |
| 7 | **Authentication Failures** | Sessions faibles, MFA absent |
| 8 | **Data Integrity Failures** | Signatures manquantes, CI/CD non securise |
| 9 | **Logging Failures** | Evenements securite non logges |
| 10 | **SSRF** | URLs non validees, acces reseau interne |

### Audit de securite generique

```
> Effectue un audit de securite OWASP Top 10 sur ce projet.
  Pour chaque categorie, verifie les points suivants et donne un statut (OK/KO) :

  1. Access Control : Les endpoints verifient-ils les permissions ?
  2. Crypto : Les mots de passe sont-ils hashes correctement ?
  3. Injection : Les inputs sont-ils valides et les requetes parametrees ?
  4. Design : Y a-t-il du rate limiting sur les endpoints sensibles ?
  5. Misconfiguration : Le mode debug est-il desactive en production ?
  6. Components : Les dependances ont-elles des vulnerabilites connues ?
  7. Auth : Les sessions expirent-elles ? MFA sur les acces critiques ?
  8. Integrity : Les dependances sont-elles verifiees (checksums) ?
  9. Logging : Les evenements securite sont-ils logges ?
  10. SSRF : Les URLs utilisateur sont-elles validees ?
```

### Audit des dependances

```
> Verifie les dependances du projet pour les vulnerabilites connues.
  Utilise les outils disponibles (npm audit, pip audit, composer audit, etc.)
  et liste les CVE trouvees par severite.

Claude :
- Execute l'outil d'audit adapte au langage
- Parse les resultats
- Priorise par severite (critical > high > medium > low)
- Propose les mises a jour necessaires
```

### Detection de secrets

```
> Cherche dans le codebase des secrets qui ne devraient pas etre commites :
  - Cles API en dur
  - Mots de passe dans le code
  - Tokens d'acces
  - URLs de bases de donnees avec credentials
  - Cles privees

Claude :
- Analyse les fichiers source
- Cherche les patterns de secrets (regex + semantique)
- Verifie que .gitignore couvre les fichiers sensibles
- Verifie que .env.example ne contient pas de vraies valeurs
```

### CVEs corrigees dans Claude Code (v2.1.45 -> v2.1.105)

Claude Code lui-meme a fait l'objet de corrections de securite importantes. Assurez-vous d'utiliser une version recente :

| CVE | Severite | Version corrigee | Impact |
|-----|----------|-----------------|--------|
| CVE-2025-59536 | 8.7/10 CVSS | v2.1.51 | Injection de commandes via inputs MCP dans le pipeline de hooks |
| CVE-2026-21852 | 5.3/10 CVSS | v2.0.65 | Exfiltration de cles API via traversee de chemin dans la resolution de hooks |
| CVE-2026-35020 | High | v2.1.97 | Compound command bypass — permissions non verifiees sur commandes composees |
| CVE-2026-35021 | High | v2.1.97 | Redirection reseau non controlee dans l'outil Bash |
| CVE-2026-35022 | High | v2.1.98 | Injection de prefix via variables d'environnement dans l'outil Bash |
| N/A | High | v2.1.101 | Injection de commandes via fallback POSIX `which` |

> **Recommandation :** Toujours utiliser Claude Code **v2.1.101+** minimum, idealement **v2.1.105**. Les versions anterieures a v2.1.97 sont particulierement vulnerables quand des serveurs MCP sont utilises avec des hooks.

> **Incident (mars 2026) :** Le code source complet de Claude Code a ete expose via le package npm v2.1.88 (fichier `.map` de 59.8 MB non exclu par `.npmignore`). Corrige dans v2.1.89.

### Subprocess Sandboxing (v2.1.98+)

Claude Code isole desormais les sous-processus pour limiter les risques d'exfiltration :

| Mecanisme | Description |
|-----------|-------------|
| **Isolation PID namespace** | Les sous-processus sont isoles dans un namespace PID dedie (Linux) |
| **`CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=1`** | Supprime les credentials des variables d'environnement des sous-processus |
| **`sandbox.failIfUnavailable`** | Echoue si le sandbox ne peut pas etre initialise (v2.1.83+) |

```bash
# Activer le nettoyage des variables d'environnement
export CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=1
```

### Auto Mode (v2.1.94+)

**Auto Mode** est un classificateur de permissions propulse par l'IA. Disponible pour les plans **Team** (avec approbation admin), il remplace `--dangerously-skip-permissions` de maniere plus sure :

| Mode | Protection | Vitesse | Usage |
|------|-----------|---------|-------|
| Manuel | Maximale | Lente | Workflows audites, haute securite |
| Auto Mode | Elevee | Rapide | Workflows de dev de confiance |
| Skip Permissions | Minimale | Maximale | Projets locaux/personnels uniquement |

Securite progressive : 3 blocages consecutifs → retour en mode manuel. 20+ blocages → revert complet.

### Monitor Tool (v2.1.98+)

L'outil `Monitor` permet de streamer les evenements d'un processus en arriere-plan. Chaque ligne stdout est une notification. Utilisez-le au lieu de `sleep` + poll pour attendre la fin d'un processus.

---

## 4. Git Workflow avec Claude Code

### Conventional Commits

Claude Code genere des messages de commit au format Conventional Commits :

| Type | Description | Exemple |
|------|-------------|---------|
| `feat` | Nouvelle fonctionnalite | `feat(auth): add JWT token generation` |
| `fix` | Correction de bug | `fix(cart): correct discount calculation` |
| `docs` | Documentation | `docs(readme): update installation steps` |
| `refactor` | Refactoring | `refactor(user): extract validation logic` |
| `test` | Tests | `test(auth): add edge cases for login` |
| `perf` | Performance | `perf(query): add index on created_at` |
| `ci` | CI/CD | `ci: add lint step to pipeline` |
| `chore` | Maintenance | `chore: update dependencies` |
| `style` | Formatage | `style: apply prettier formatting` |
| `build` | Build system | `build: upgrade to Node 20` |

### Workflow de commit

```
> Regarde les modifications en cours et cree un commit avec un message
  Conventional Commits adapte.

Claude :
1. git status pour voir les fichiers modifies
2. git diff pour analyser les changements
3. git log pour voir le style des commits precedents
4. Propose un message de commit adapte
5. Execute le commit apres validation
```

### Creation de PR avec `gh`

Claude Code utilise la CLI `gh` (GitHub CLI) pour creer des Pull Requests :

```
> Cree une Pull Request pour la branche actuelle.

Claude :
1. Verifie les fichiers modifies et les commits
2. git diff main...HEAD pour voir tous les changements
3. Redige un titre et une description de PR
4. Execute gh pr create avec le titre et le body
5. Retourne l'URL de la PR creee
```

### Code review assistee

```
> Effectue une code review du diff de cette branche par rapport a main.
  Verifie :
  - Architecture et principes SOLID
  - Qualite du code (KISS, DRY, YAGNI)
  - Couverture de tests
  - Securite
  - Performance
  - Documentation

  Format : liste de commentaires par fichier avec severite.
```

---

## 5. Cost Management

### Suivi de consommation

La commande `/cost` affiche la consommation de la session en cours :

```
/cost

Resultat :
  Session actuelle :
    Input tokens:  45,230
    Output tokens: 12,780
    Total cost:    $0.42

  Historique (dernieres 24h) :
    Total: $3.85
```

### Optimisation des tokens

| Strategie | Economie | Description |
|-----------|----------|-------------|
| **`/clear` entre taches** | 30-50% | Evite l'accumulation de contexte inutile |
| **Sub-agents pour la recherche** | 20-40% | Isole les explorations du contexte principal |
| **Prompts precis** | 15-25% | Moins d'allers-retours |
| **Fichiers specifiques** | 10-20% | Lire uniquement ce qui est necessaire |
| **Plan mode** | Variable | Explorer avant d'agir |

### Choix du modele selon la tache

| Modele | Cout relatif | Tache recommandee |
|--------|-------------|-------------------|
| **Haiku 4.5** | $ ($1/$5 par M tokens) | Taches simples, hooks prompt-based, formatage |
| **Sonnet 4.6** | $$ ($3/$15 par M tokens) | Usage quotidien, features standard, debug |
| **Opus 4.7** | $$$ ($5/$25 par M tokens) | Architecture complexe, flagship, effort `xhigh` |
| **Opus 4.6 Fast** | $$$$ ($30/$150 par M tokens) | Urgences, generation rapide (6x le prix via `/fast`) |

### Regles d'optimisation

```
1. MODELE ADAPTE
   - Bug simple ? Sonnet suffit
   - Refactoring 50 fichiers ? Opus justifie
   - Hook de validation ? Haiku 4.5 est parfait

2. CONTEXTE PROPRE
   - /clear entre taches non liees
   - Sub-agents pour les explorations
   - Ne pas lire 20 fichiers "au cas ou"

3. PROMPTS EFFICACES
   - Preciser le scope (fichier, module, ligne)
   - Donner le resultat attendu
   - Eviter les descriptions vagues

4. BOUCLES COURTES
   - Fournir des tests pour la verification
   - Eviter les allers-retours inutiles
   - Valider incrementalement
```

### Analytics

Surveillez votre consommation pour identifier les patterns couteux :

```
Indicateurs a suivre :
- Cout moyen par session
- Cout par tache (feature, bugfix, review)
- Ratio input/output tokens
- Nombre de compactions par session (signe de contexte surcharge)
- Temps moyen par tache
```

---

## Exercice Pratique (15min)

### TDD avec Claude Code (15min)

Realisez un cycle TDD complet avec Claude Code :

1. **RED** (5min) : Demandez a Claude de generer les tests pour un service de validation de mot de passe :
   - Minimum 12 caracteres
   - Au moins 1 majuscule, 1 minuscule, 1 chiffre, 1 caractere special
   - Pas dans une liste de mots de passe courants
   - Pas de sequences repetitives (aaa, 111)

2. **GREEN** (5min) : Demandez a Claude d'implementer le service pour faire passer les tests.

3. **REFACTOR** (5min) : Demandez a Claude de refactoriser en appliquant le pattern Strategy pour chaque regle de validation.

### Verification

- [ ] Les tests sont ecrits AVANT le code
- [ ] Tous les tests passent apres l'implementation
- [ ] Le refactoring ne casse aucun test
- [ ] Le pattern Strategy est correctement applique
- [ ] Chaque regle de validation est dans sa propre classe

---

## Points Cles a Retenir

1. **TDD avec Claude** : toujours demander les tests en premier (RED), puis l'implementation (GREEN), puis le refactoring
2. **Les audits de code** couvrent architecture, anti-patterns, complexite et securite
3. **OWASP Top 10** est le standard de reference pour les audits de securite
4. **7 CVEs corrigees** entre v2.1.45 et v2.1.105 : maintenez Claude Code a jour
5. **Subprocess sandboxing** (v2.1.98+) : isolation PID + nettoyage des variables d'environnement
6. **Auto Mode** (v2.1.94+) : classificateur IA de permissions pour les plans Team
7. **Conventional Commits** et `gh pr create` standardisent le workflow Git
8. **Le cout se gere** : modele adapte, contexte propre, prompts precis
9. **Haiku 4.5 pour le simple, Sonnet 4.6 pour le quotidien, Opus 4.7 pour le complexe**
10. **Les boucles de verification** (tests, screenshots, outputs attendus) multiplient la qualite par 2-3x
11. **/cost** pour surveiller la consommation en temps reel

---

**Duree :** 1h
**Prochain module :** [Module 9 : Bonus -- Claude Craft](./09-bonus-claude-craft.md)
