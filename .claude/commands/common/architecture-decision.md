---
description: Architecture Decision Record (ADR)
argument-hint: [arguments]
---

# Architecture Decision Record (ADR)

Tu es un architecte logiciel senior. Tu dois créer un Architecture Decision Record (ADR) pour documenter une décision technique importante.

## Arguments
$ARGUMENTS

Arguments :
- Titre de la décision
- (Optionnel) Numéro ADR

Exemple : `/common:architecture-decision "Choix de PostgreSQL pour la base de données principale"`

## MISSION

### Étape 1 : Collecter les Informations

Poser les questions clés :
1. Quel problème essayons-nous de résoudre ?
2. Quelles sont les contraintes ?
3. Quelles options avons-nous considérées ?
4. Pourquoi cette option plutôt qu'une autre ?

### Étape 2 : Créer le Fichier ADR

Emplacement : `docs/architecture/decisions/` ou `docs/adr/`

Nommage : `NNNN-titre-en-kebab-case.md`

### Étape 3 : Rédiger l'ADR

Template ADR (format Michael Nygard) :

```markdown
# ADR-{NNNN}: {Titre}

**Date**: {YYYY-MM-DD}
**Statut**: {Proposé | Accepté | Déprécié | Remplacé par ADR-XXXX}
**Décideurs**: {Noms des personnes impliquées}

## Contexte

{Décrire les forces en jeu, incluant les forces technologiques, politiques,
sociales et liées au projet. Ces forces sont probablement en tension, et
doivent être appelées comme telles. Le langage dans cette section est
neutre sur la valeur - on décrit simplement les faits.}

### Situation actuelle

{Description de l'état actuel du système/projet}

### Problème

{Description claire du problème à résoudre}

### Contraintes

- {Contrainte 1}
- {Contrainte 2}
- {Contrainte 3}

## Options Considérées

### Option 1: {Nom}

{Description de l'option}

**Avantages**:
- {Avantage 1}
- {Avantage 2}

**Inconvénients**:
- {Inconvénient 1}
- {Inconvénient 2}

**Effort estimé**: {Faible | Moyen | Élevé}

### Option 2: {Nom}

{Description de l'option}

**Avantages**:
- {Avantage 1}
- {Avantage 2}

**Inconvénients**:
- {Inconvénient 1}
- {Inconvénient 2}

**Effort estimé**: {Faible | Moyen | Élevé}

### Option 3: {Nom}

{Description de l'option}

**Avantages**:
- {Avantage 1}
- {Avantage 2}

**Inconvénients**:
- {Inconvénient 1}
- {Inconvénient 2}

**Effort estimé**: {Faible | Moyen | Élevé}

## Décision

{Nous avons décidé d'utiliser **Option X** parce que...}

### Justification

{Explication détaillée de pourquoi cette option a été choisie par rapport
aux autres. Inclure les compromis acceptés.}

## Conséquences

### Positives

- {Conséquence positive 1}
- {Conséquence positive 2}

### Négatives

- {Conséquence négative 1}
- {Conséquence négative 2}

### Risques

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| {Risque 1} | Faible/Moyenne/Haute | Faible/Moyen/Haut | {Action} |
| {Risque 2} | Faible/Moyenne/Haute | Faible/Moyen/Haut | {Action} |

## Plan d'Implémentation

### Phase 1: {Titre}
- [ ] {Tâche 1}
- [ ] {Tâche 2}

### Phase 2: {Titre}
- [ ] {Tâche 3}
- [ ] {Tâche 4}

## Métriques de Succès

- {Métrique 1}: {Valeur cible}
- {Métrique 2}: {Valeur cible}

## Références

- {Lien vers documentation}
- {Lien vers étude comparative}
- {ADR liés}

---

## Historique

| Date | Action | Par |
|------|--------|-----|
| {YYYY-MM-DD} | Créé | {Nom} |
| {YYYY-MM-DD} | Accepté | {Équipe} |
```

### Étape 4 : Exemples d'ADR Complet

```markdown
# ADR-0012: Choix de PostgreSQL pour la base de données principale

**Date**: 2024-01-15
**Statut**: Accepté
**Décideurs**: Jean Dupont (Tech Lead), Marie Martin (DBA), Pierre Durand (CTO)

## Contexte

### Situation actuelle

Notre application utilise actuellement MySQL 5.7 hébergé sur un serveur
dédié. La base contient 50 tables, 10 millions de lignes dans la table
principale, et gère 1000 requêtes/seconde en pointe.

### Problème

1. MySQL 5.7 arrive en fin de support (EOL)
2. Besoin croissant de requêtes JSON complexes
3. Fonctionnalités de recherche full-text limitées
4. Pas de support natif pour les types géospatiaux

### Contraintes

- Budget infrastructure limité
- Migration doit être transparente pour les utilisateurs
- Équipe familière avec MySQL, pas avec PostgreSQL
- Temps de migration : maximum 3 mois

## Options Considérées

### Option 1: Upgrade vers MySQL 8.0

Rester sur MySQL en upgradeant vers la version 8.0.

**Avantages**:
- Pas de migration de schéma
- Équipe déjà formée
- Risque minimal

**Inconvénients**:
- JSON queries toujours moins performantes
- Pas de full-text search en français natif
- Extension géospatiale moins mature

**Effort estimé**: Faible

### Option 2: Migrer vers PostgreSQL 16

Migrer vers PostgreSQL avec toutes les fonctionnalités modernes.

**Avantages**:
- JSONB très performant
- Full-text search avec dictionnaires français
- PostGIS pour géospatial
- Communauté très active
- Extensions riches (pg_trgm, uuid-ossp, etc.)

**Inconvénients**:
- Migration nécessaire
- Formation équipe
- Changements syntaxe SQL mineurs

**Effort estimé**: Moyen

### Option 3: Base NoSQL (MongoDB)

Migrer vers une base document pour plus de flexibilité.

**Avantages**:
- Schéma flexible
- Bon pour JSON natif
- Scalabilité horizontale

**Inconvénients**:
- Perte des contraintes relationnelles
- Migration massive du code
- Transactions complexes
- Équipe non formée

**Effort estimé**: Élevé

## Décision

Nous avons décidé d'utiliser **PostgreSQL 16** parce que :

### Justification

1. **Performance JSON** : JSONB de PostgreSQL surpasse MySQL pour nos
   use cases de stockage de métadonnées utilisateurs.

2. **Full-text search** : Le dictionnaire français natif évite d'installer
   Elasticsearch pour la recherche.

3. **PostGIS** : Nos nouvelles fonctionnalités de géolocalisation seront
   plus simples à implémenter.

4. **Maturité** : PostgreSQL est le SGBD open-source le plus avancé,
   avec une communauté très active.

5. **Compatibilité Doctrine** : Notre ORM supporte parfaitement PostgreSQL.

## Conséquences

### Positives

- Requêtes JSON 3x plus rapides (benchmark interne)
- Full-text search sans infrastructure supplémentaire
- Fonctionnalités géospatiales natives
- Meilleur support des types de données (UUID, arrays, etc.)

### Négatives

- 2 semaines de formation équipe
- Migration data estimée à 4h de downtime
- Quelques requêtes à adapter (LIMIT/OFFSET syntax)

### Risques

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Régression perf | Faible | Moyen | Tests charge avant migration |
| Perte de données | Très faible | Critique | Backup + dry-run |
| Bugs post-migration | Moyenne | Faible | Période de stabilisation 2 semaines |

## Plan d'Implémentation

### Phase 1: Préparation (Semaine 1-2)
- [x] Formation équipe PostgreSQL
- [x] Setup environnement dev PostgreSQL
- [x] Adapter les tests unitaires

### Phase 2: Migration Code (Semaine 3-4)
- [ ] Adapter les requêtes SQL natives
- [ ] Configurer Doctrine pour PostgreSQL
- [ ] Tests d'intégration complets

### Phase 3: Migration Data (Semaine 5)
- [ ] Script de migration pgloader
- [ ] Dry-run sur copie production
- [ ] Migration production (weekend)

### Phase 4: Stabilisation (Semaine 6-8)
- [ ] Monitoring performance
- [ ] Correction bugs éventuels
- [ ] Documentation mise à jour

## Métriques de Succès

- Temps de réponse API : ≤ actuel (100ms P95)
- Requêtes JSON : -50% temps d'exécution
- Uptime post-migration : 99.9%

## Références

- [Benchmark PostgreSQL vs MySQL JSON](internal-wiki/benchmarks)
- [Guide migration Doctrine](internal-wiki/migration-guide)
- ADR-0008: Choix de Doctrine ORM
```

### Étape 5 : Créer l'Index des ADRs

```markdown
# Architecture Decision Records

Ce dossier contient les ADRs du projet.

## Index

| # | Titre | Statut | Date |
|---|-------|--------|------|
| [ADR-0001](0001-use-clean-architecture.md) | Adoption Clean Architecture | Accepté | 2023-06-15 |
| [ADR-0012](0012-postgresql-database.md) | Choix PostgreSQL | Accepté | 2024-01-15 |
| [ADR-0013](0013-api-versioning.md) | Stratégie versioning API | Proposé | 2024-01-20 |

## Statuts

- **Proposé** : En cours de discussion
- **Accepté** : Décision validée
- **Déprécié** : N'est plus d'actualité
- **Remplacé** : Remplacé par un autre ADR
```

## Structure Recommandée

```
docs/
└── architecture/
    └── decisions/
        ├── README.md           # Index des ADRs
        ├── 0001-*.md
        ├── 0002-*.md
        └── templates/
            └── adr-template.md
```
