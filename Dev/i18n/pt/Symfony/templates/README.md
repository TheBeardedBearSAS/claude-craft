# Architecture Decision Records (ADR)

> Documentation des décisions architecturales majeures du projet Atoll Tourisme

## 📖 Qu'est-ce qu'une ADR ?

Une **Architecture Decision Record** (ADR) est un document qui capture une décision architecturale importante, incluant :
- Le **contexte** et le problème à résoudre
- Les **alternatives** considérées avec leurs avantages/inconvénients
- La **décision** prise et sa justification
- Les **conséquences** positives ET négatives
- Les détails d'**implémentation**

**Format utilisé** : MADR 4.0.0 (Markdown Any Decision Records) en français

---

## 📚 Index des ADRs

### Critiques (P0)

| ADR | Titre | Statut | Date | Tags |
|-----|-------|--------|------|------|
| [0001](0001-chiffrement-halite.md) | Chiffrement Halite pour Données Sensibles RGPD | ✅ Accepted | 2025-11-26 | security, rgpd, halite |
| [0002](0002-gedmo-doctrine-extensions.md) | Gedmo Doctrine Extensions pour Audit Trail | ✅ Accepted | 2025-11-26 | audit, gedmo, rgpd |
| [0003](0003-clean-architecture-ddd.md) | Clean Architecture + DDD + Hexagonal | 🔄 Refactoring | 2025-11-26 | architecture, ddd |

### Importantes (P1)

| ADR | Titre | Statut | Date | Tags |
|-----|-------|--------|------|------|
| [0004](0004-docker-multi-stage.md) | Docker Multi-stage pour Dev et Prod | ✅ Accepted | 2025-11-26 | docker, infra |
| [0005](0005-symfony-messenger-async.md) | Symfony Messenger pour Emails Asynchrones | 📝 Proposed | 2025-11-26 | async, messaging |
| [0006](0006-postgresql-database.md) | PostgreSQL 16 comme Base de Données | ✅ Accepted | 2025-11-26 | database |

### Standards (P2)

| ADR | Titre | Statut | Date | Tags |
|-----|-------|--------|------|------|
| [0007](0007-easyadmin-backoffice.md) | EasyAdmin pour le Backoffice | ✅ Accepted | 2025-11-26 | admin, crud |
| [0008](0008-tailwind-alpine-frontend.md) | Tailwind CSS + Alpine.js pour Frontend | ✅ Accepted | 2025-11-26 | frontend |
| [0009](0009-phpstan-quality-tools.md) | PHPStan et Outils de Qualité | ✅ Accepted | 2025-11-26 | quality, phpstan |
| [0010](0010-conventional-commits.md) | Conventional Commits | ✅ Accepted | 2025-11-26 | git, commits |

### Légende des Statuts

- 📝 **Proposed** : En cours de discussion, pas encore acceptée
- ✅ **Accepted** : Décision validée et en production
- 🔄 **Refactoring** : Implementation en cours (migration progressive)
- ⚠️ **Deprecated** : Obsolète, à ne plus utiliser
- 🔄 **Superseded** : Remplacée par une nouvelle ADR (voir lien)

---

## ✍️ Quand Créer une ADR ?

### ✅ CRÉER une ADR si :

- **Décision architecturale structurante** impactant > 1 bounded context
- **Trade-offs significatifs** entre plusieurs options viables
- **Contrainte** réglementaire/sécurité/performance imposant un choix
- **Question récurrente** en code review nécessitant une réponse officielle
- **Changement de paradigme** (ex: sync → async, monolithe → microservices)
- **Choix de technologie** majeur (framework, bibliothèque, infrastructure)
- **Pattern architectural** nouveau pour l'équipe

### ❌ NE PAS CRÉER d'ADR si :

- **Décision tactique locale** affectant < 3 fichiers
- **Bug fix** simple sans impact architectural
- **CRUD standard** suivant les patterns existants
- **Update dépendance mineure** (patch/minor version)
- **Choix évident** sans alternative viable
- **Configuration** environnement (sauf si impact sécurité/conformité)

**Règle d'or** : Si vous hésitez, discutez-en avec le Lead Dev avant de créer l'ADR.

---

## 🔄 Processus de Création d'une ADR

### 1️⃣ Proposition (Status: Proposed)

```bash
# 1. Créer branche dédiée
git checkout -b adr/0011-titre-decision

# 2. Copier le template
cp .claude/adr/template.md .claude/adr/0011-titre-decision.md

# 3. Remplir toutes les sections obligatoires
# - Minimum 2 options avec avantages/inconvénients
# - Justification claire de la décision
# - Conséquences positives ET négatives

# 4. Commit
git add .claude/adr/0011-titre-decision.md
git commit -m "docs: add ADR-0011 for [titre] (Proposed)"
```

### 2️⃣ Discussion (Pull Request)

```bash
# 5. Push et créer PR
git push origin adr/0011-titre-decision

# 6. Ouvrir PR avec titre : [ADR] ADR-0011 : Titre Décision
#    - Tag : [ADR]
#    - Reviewers : Lead Dev + 1 Senior minimum
#    - Description : Lien vers ADR dans le corps de la PR
```

**Éléments à discuter en PR** :
- Les options ont-elles toutes été considérées ?
- La justification est-elle convaincante ?
- Les conséquences négatives sont-elles acceptables ?
- Y a-t-il des risques non documentés ?
- L'implémentation est-elle claire ?

### 3️⃣ Acceptation (Status: Accepted)

**Acceptance criteria** :
- ✅ Minimum 2 reviewers ont approuvé (Lead Dev + 1 Senior)
- ✅ Toutes les sections obligatoires remplies
- ✅ Minimum 2 options documentées avec pros/cons
- ✅ Conséquences positives ET négatives listées
- ✅ Références vers règles/code existantes présentes
- ✅ Exemples de code concrets (pas génériques)

**Merge** :
```bash
# 7. Merger la PR dans main
git checkout main
git merge adr/0011-titre-decision

# 8. Mettre à jour le statut dans README.md (ce fichier)
# 9. Push
git push origin main
```

L'ADR devient alors la **référence officielle** pour cette décision.

### 4️⃣ Implementation

```bash
# Lors de l'implémentation de la décision :
git commit -m "feat: implement [feature] (see ADR-0011)"
```

**Règles d'implémentation** :
- Suivre strictement la décision documentée dans l'ADR
- Référencer l'ADR dans les commits pertinents
- Créer les tests validant la décision
- Documenter tout écart significatif avec l'ADR (et potentiellement l'amender)

### 5️⃣ Superseded (Si Évolution Nécessaire)

Si une décision doit être modifiée significativement :

```bash
# 1. JAMAIS supprimer l'ancienne ADR
# 2. Marquer l'ancienne ADR comme Superseded
#    Status: Superseded by ADR-0015
# 3. Créer nouvelle ADR (ADR-0015) expliquant :
#    - Pourquoi la décision initiale ne tient plus
#    - Ce qui a changé (contexte, contraintes)
#    - La nouvelle décision
# 4. Lier les deux ADRs mutuellement
```

**Raisons valides de Superseded** :
- Changement de contraintes métier/réglementaires
- Nouvelle technologie plus adaptée disponible
- Problème de performance/sécurité découvert
- Évolution des besoins métier

---

## 📋 Checklist de Validation

Avant de soumettre une ADR en PR, vérifiez :

- [ ] **Titre** clair et descriptif (≤10 mots)
- [ ] **Statut** correct (Proposed pour nouvelle ADR)
- [ ] **Date** au format YYYY-MM-DD
- [ ] **Décideurs** listés avec noms complets
- [ ] **Tags** pertinents (3-5 tags)
- [ ] **Contexte** explique clairement le problème (2-3 paragraphes)
- [ ] **Minimum 2 options** documentées
- [ ] Chaque option a **avantages** ET **inconvénients**
- [ ] **Décision** justifiée en détail (pourquoi cette option ?)
- [ ] **Conséquences positives** listées (3-5)
- [ ] **Conséquences négatives** listées honnêtement (2-4)
- [ ] **Risques** identifiés avec mitigation
- [ ] **Implementation** : fichiers affectés listés
- [ ] **Exemple de code** concret du projet (PAS générique)
- [ ] **Références** vers règles `.claude/`, docs, ADRs liées
- [ ] **Tests** requis décrits
- [ ] Relecture orthographe/grammaire

---

## 🔗 Ressources et Références

### Documentation Interne

- **Configuration projet** : [`.claude/CLAUDE.md`](../CLAUDE.md)
- **Règles architecture** : [`.claude/rules/02-architecture-clean-ddd.md`](../rules/02-architecture-clean-ddd.md)
- **Règles sécurité RGPD** : [`.claude/rules/11-security-rgpd.md`](../rules/11-security-rgpd.md)
- **Templates développement** : [`.claude/templates/`](../templates/)
- **Checklists qualité** : [`.claude/checklists/`](../checklists/)

### Ressources MADR

- [MADR (Markdown Any Decision Records)](https://adr.github.io/madr/) - Format officiel
- [ADR Tools](https://github.com/npryce/adr-tools) - CLI pour gérer ADRs
- [Architecture Decision Records (Michael Nygard)](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions) - Article fondateur

### Examples Projets Open Source

- [Symfony ADRs](https://github.com/symfony/symfony-docs/tree/master/adr)
- [adr/adr-examples](https://github.com/adr/adr-examples)

---

## 🎯 Bonnes Pratiques

### ✅ DO

- **Soyez concis** : 2 pages maximum par ADR (sauf cas exceptionnels)
- **Soyez honnête** : Documentez les inconvénients et risques
- **Soyez concret** : Exemples code du projet, pas génériques
- **Référencez** : Liez ADRs, règles, code existant
- **Mettez à jour** : Ajoutez feedback post-implémentation
- **Versionnez** : Numérotation séquentielle (0001, 0002, ...)
- **Datez** : Date de création/acceptation claire

### ❌ DON'T

- **Ne supprimez jamais** une ADR (utilisez Superseded)
- **Ne copiez pas** du code depuis les règles (référencez-les)
- **Ne généralisez pas** à l'excès (gardez le contexte projet)
- **N'oubliez pas** les conséquences négatives (c'est crucial)
- **Ne tardez pas** : Créez l'ADR AVANT l'implémentation si possible
- **Ne négligez pas** les reviews (2+ reviewers obligatoires)

---

## 📞 Contact et Support

**Questions sur les ADRs ?**
- Lead Dev : [Nom Lead Dev]
- Architecture Team : [Équipe]
- Slack : #architecture-decisions

**Proposer une modification de ce README** :
```bash
git checkout -b docs/update-adr-readme
# Modifier .claude/adr/README.md
git commit -m "docs: update ADR README with [description]"
# Ouvrir PR avec tag [Documentation]
```

---

## 📊 Statistiques

**Dernière mise à jour** : 2025-11-26

- **Total ADRs** : 10
- **Acceptées** : 9
- **Proposées** : 1
- **Refactoring** : 1
- **Deprecated** : 0
- **Superseded** : 0

---

*Ce README est maintenu par l'équipe Architecture. Toute modification doit être validée par le Lead Dev.*
