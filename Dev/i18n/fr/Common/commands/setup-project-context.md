---
name: setup-project-context
description: Analyser la codebase et configurer le contexte projet interactivement
arguments:
  - name: mode
    description: Mode de detection (--auto questions minimales, --full questionnaire complet)
    required: false
---

# Configuration du Contexte Projet

Configure `.claude/rules/00-project-context.md` en analysant la codebase et en posant des questions ciblees.

## Execution

### Phase 1 : Detection Automatique

Analyser les fichiers et repertoires suivants :

**Fichiers de Configuration :**
- `package.json` → Nom projet Node.js, dependances, scripts
- `composer.json` → Nom projet PHP, dependances, framework
- `pubspec.yaml` → Nom projet Flutter/Dart, dependances
- `requirements.txt` / `pyproject.toml` → Dependances Python
- `Cargo.toml` → Projet Rust
- `go.mod` → Module Go

**Environnement & Config :**
- `.env`, `.env.example` → Base de donnees, services
- `config/` → Configuration framework
- `docker-compose.yml` → Services (DB, Redis, etc.)

**Structure :**
- `src/`, `lib/`, `app/` → Emplacement code source
- `tests/`, `spec/` → Framework de test
- `docs/`, `specifications/` → Documentation
- `.github/`, `.gitlab-ci.yml` → CI/CD

**Domaine (si applicable) :**
- `src/Entity/`, `src/Domain/` → Entites metier (PHP/Symfony)
- `lib/models/`, `lib/domain/` → Modeles (Flutter/Dart)
- `models/`, `schemas/` → Modeles de donnees
- `migrations/` → Schema base de donnees

Afficher les resultats d'analyse :

```
╔══════════════════════════════════════════════════════════════╗
║             RESULTATS D'ANALYSE DU PROJET                     ║
╚══════════════════════════════════════════════════════════════╝

✅ Informations Detectees :
┌─────────────────┬────────────────────────────────┐
│ Element         │ Valeur                         │
├─────────────────┼────────────────────────────────┤
│ Nom du Projet   │ {nom_detecte}                  │
│ Langage         │ {langage_detecte}              │
│ Framework       │ {framework_detecte}            │
│ Base de Donnees │ {database_detectee}            │
│ Tests           │ {tests_detectes}               │
│ CI/CD           │ {cicd_detecte}                 │
└─────────────────┴────────────────────────────────┘

📁 Structure du Projet :
{structure_detectee}

📄 Documentation Trouvee :
{docs_detectees}

❌ Non Detecte (sera demande) :
- {elements_manquants}
```

### Phase 2 : Questions Interactives

Poser uniquement les questions pour les informations NON detectees en Phase 1.
Ignorer les questions si le mode `--auto` est utilise et qu'une valeur par defaut raisonnable existe.

**Questions Essentielles :**

1. **Type d'Application** (si non detecte) :
   ```
   Quel type d'application est-ce ?
   [ ] API REST      [ ] Application Web    [ ] Application Mobile
   [ ] Outil CLI     [ ] Librairie/Package  [ ] Monorepo
   ```

2. **Domaine Metier** :
   ```
   Quel est le domaine metier ?
   [ ] E-commerce    [ ] Plateforme SaaS    [ ] FinTech
   [ ] HealthTech    [ ] EdTech             [ ] Social/Communaute
   [ ] Media/Contenu [ ] IoT                [ ] Autre : _____
   ```

3. **Utilisateurs Cibles** (2-3 personas) :
   ```
   Decrivez vos utilisateurs principaux :

   Utilisateur Principal :
   > Role : _____
   > Objectif principal : _____

   Utilisateur Secondaire (optionnel) :
   > Role : _____
   > Objectif principal : _____
   ```

4. **Exigences de Conformite** :
   ```
   Quelles exigences de conformite s'appliquent ?
   [ ] RGPD (Protection des donnees EU)
   [ ] HIPAA (Sante US)
   [ ] PCI-DSS (Cartes de paiement)
   [ ] SOC2 (Securite)
   [ ] Aucune / Non applicable
   ```

**Questions Etendues** (uniquement avec le mode `--full`) :

5. **Objectifs Business** :
   ```
   Objectifs court-terme (3-6 mois) :
   > _____

   Objectifs moyen-terme (6-12 mois) :
   > _____
   ```

6. **Problemes Connus/Dette Technique** :
   ```
   Y a-t-il des problemes connus ou de la dette technique a documenter ?
   > _____
   ```

7. **Termes du Glossaire** :
   ```
   Termes metier cles a definir (separes par des virgules) :
   > _____
   ```

### Phase 3 : Generer le Fichier de Contexte

Creer `.claude/rules/00-project-context.md` :

```markdown
# Contexte Projet - {NOM_PROJET}

> Genere automatiquement par `/common:setup-project-context` le {DATE}
> A revoir et personnaliser selon vos besoins.

## Mode Plan

> **Le mode plan est recommandé.** Claude active le mode plan pour structurer l'approche, identifier les dépendances et présenter une stratégie de génération avant de créer les artefacts.

## Vue d'Ensemble

**{NOM_PROJET}** est une application {TYPE} pour le domaine {DOMAINE}.

{DESCRIPTION_DEPUIS_README_OU_UTILISATEUR}

## Stack Technique

| Composant    | Technologie          |
|--------------|----------------------|
| Langage      | {LANGAGE}            |
| Framework    | {FRAMEWORK}          |
| Base Donnees | {DATABASE}           |
| Cache        | {CACHE_SI_DETECTE}   |
| Tests        | {FRAMEWORKS_TEST}    |
| CI/CD        | {PLATEFORME_CICD}    |

## Structure du Projet

```
{STRUCTURE_DETECTEE}
```

## Domaine Metier

### Concepts Cles

{ENTITES_SI_DETECTEES}

### Bounded Contexts

<!-- Ajouter si utilisation de DDD -->
- Contexte 1 : ...
- Contexte 2 : ...

## Utilisateurs & Personas

### {ROLE_UTILISATEUR_PRINCIPAL}
- **Objectif :** {OBJECTIF_UTILISATEUR_PRINCIPAL}
- **Points de friction :** A documenter
- **Workflows cles :** A documenter

### {ROLE_UTILISATEUR_SECONDAIRE}
- **Objectif :** {OBJECTIF_UTILISATEUR_SECONDAIRE}
- **Points de friction :** A documenter
- **Workflows cles :** A documenter

## Contraintes

### Conformite
{EXIGENCES_CONFORMITE}

### Objectifs de Performance
- Temps de chargement page : < 3s
- Temps de reponse API : < 200ms
- Disponibilite : 99.9%

### Exigences de Securite
- Conformite OWASP Top 10
- Validation des entrees sur tous les endpoints
- Authentification requise pour les ressources protegees

## Objectifs

### Court-terme
{OBJECTIFS_COURT_TERME_OU_PLACEHOLDER}

### Moyen-terme
{OBJECTIFS_MOYEN_TERME_OU_PLACEHOLDER}

## Problemes Connus / Dette Technique

{PROBLEMES_OU_PLACEHOLDER}

## Glossaire

| Terme | Definition |
|-------|------------|
{TERMES_GLOSSAIRE_OU_EXEMPLES}
```

### Phase 4 : Validation & Prochaines Etapes

Afficher le resume et les recommandations :

```
╔══════════════════════════════════════════════════════════════╗
║              CONTEXTE PROJET GENERE                           ║
╚══════════════════════════════════════════════════════════════╝

✅ Fichier cree : .claude/rules/00-project-context.md

Resume :
┌─────────────────┬────────────────────────────────┐
│ Projet          │ {NOM_PROJET}                   │
│ Type            │ {TYPE}                         │
│ Stack           │ {FRAMEWORK} + {DATABASE}       │
│ Domaine         │ {DOMAINE}                      │
│ Conformite      │ {CONFORMITE}                   │
│ Personas        │ {NOMBRE} definis               │
└─────────────────┴────────────────────────────────┘

📋 Prochaines Etapes Recommandees :

1. Revoir le fichier genere et completer les sections placeholder
2. Ajouter des bounded contexts detailles si utilisation de DDD
3. Documenter les workflows metier cles
4. Envisager d'executer des agents specialises :
   - @database-architect → Documenter le schema de base de donnees
   - @api-designer → Documenter les endpoints API
   - @security-reviewer → Revoir les contraintes de securite

Voulez-vous que j'ouvre le fichier pour revision ?
```

## Modes

| Mode | Comportement |
|------|--------------|
| (defaut) | Detection + questions essentielles (type, domaine, utilisateurs, conformite) |
| `--auto` | Detection maximale, ignorer les questions avec valeurs par defaut raisonnables |
| `--full` | Toutes les questions incluant objectifs, problemes et glossaire |

## Exemples

```bash
# Mode standard - detection et questions equilibrees
/common:setup-project-context

# Mode auto - interaction minimale
/common:setup-project-context --auto

# Mode complet - questionnaire exhaustif
/common:setup-project-context --full
```
