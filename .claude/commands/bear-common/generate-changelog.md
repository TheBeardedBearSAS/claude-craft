---
description: Génération Automatique du Changelog
argument-hint: [arguments]
---

# Génération Automatique du Changelog

Tu es un assistant de documentation. Tu dois analyser les commits git et générer un changelog formaté selon les conventions Conventional Commits et Keep a Changelog.

## Arguments
$ARGUMENTS

Arguments :
- Version cible (ex: `1.2.0`)
- Depuis (tag précédent, défaut: dernier tag)

Exemple : `/bear-common:generate-changelog 1.2.0 v1.1.0`

## MISSION

### Étape 1 : Récupérer les Commits

```bash
# Identifier le dernier tag
LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")

# Lister les commits depuis le dernier tag
if [ -z "$LAST_TAG" ]; then
    git log --pretty=format:"%H|%s|%an|%ad" --date=short
else
    git log ${LAST_TAG}..HEAD --pretty=format:"%H|%s|%an|%ad" --date=short
fi
```

### Étape 2 : Parser les Commits (Conventional Commits)

Format attendu : `type(scope): description`

| Type | Catégorie Changelog |
|------|---------------------|
| feat | Added |
| fix | Fixed |
| docs | Documentation |
| style | (ignoré) |
| refactor | Changed |
| perf | Performance |
| test | (ignoré) |
| chore | (ignoré) |
| build | Build |
| ci | (ignoré) |
| revert | Removed |
| BREAKING CHANGE | Breaking Changes |

### Étape 3 : Analyser les PRs (si disponible)

```bash
# Récupérer les PRs mergées
gh pr list --state merged --base main --json number,title,labels,author
```

### Étape 4 : Générer le Changelog

Format Keep a Changelog :

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [{VERSION}] - {DATE}

### Breaking Changes
- **{scope}**: {description} ({author}) - #{PR}

### Added
- **{scope}**: {description} ({author}) - #{PR}
- **{scope}**: {description} ({author}) - #{PR}

### Changed
- **{scope}**: {description} ({author}) - #{PR}

### Deprecated
- **{scope}**: {description} ({author}) - #{PR}

### Removed
- **{scope}**: {description} ({author}) - #{PR}

### Fixed
- **{scope}**: {description} ({author}) - #{PR}

### Security
- **{scope}**: {description} ({author}) - #{PR}

### Performance
- **{scope}**: {description} ({author}) - #{PR}

## [{PREVIOUS_VERSION}] - {DATE}
...

[Unreleased]: https://github.com/{owner}/{repo}/compare/v{VERSION}...HEAD
[{VERSION}]: https://github.com/{owner}/{repo}/compare/v{PREVIOUS_VERSION}...v{VERSION}
```

### Étape 5 : Exemple de Sortie

```markdown
## [1.2.0] - 2024-01-15

### Breaking Changes
- **api**: Changed authentication from session to JWT (#123) - @john

### Added
- **auth**: Add OAuth2 social login support (#145) - @jane
- **users**: Add user profile picture upload (#142) - @john
- **dashboard**: Add real-time notifications (#138) - @alice

### Changed
- **api**: Upgrade API Platform to v3.2 (#150) - @bob
- **ui**: Migrate to TailwindCSS v3 (#148) - @jane

### Fixed
- **auth**: Fix password reset email not sending (#141) - @john
- **orders**: Fix calculation of total with discounts (#139) - @alice
- **mobile**: Fix crash on iOS 17 (#137) - @bob

### Security
- **deps**: Update symfony/http-kernel for CVE-2024-1234 (#146) - @security-bot

### Performance
- **api**: Add Redis caching for user sessions (#144) - @alice
- **db**: Optimize N+1 queries on orders list (#140) - @bob

---

**Full Changelog**: https://github.com/org/repo/compare/v1.1.0...v1.2.0

### Contributors
- @john (4 commits)
- @jane (3 commits)
- @alice (3 commits)
- @bob (3 commits)

### Statistics
- Commits: 13
- Files changed: 87
- Lines added: +2,345
- Lines removed: -876
```

### Étape 6 : Actions Suggérées

```
══════════════════════════════════════════════════════════════
📝 CHANGELOG GÉNÉRÉ
══════════════════════════════════════════════════════════════

Version : 1.2.0
Période : 2024-01-01 → 2024-01-15
Commits analysés : 13

──────────────────────────────────────────────────────────────
📊 RÉSUMÉ PAR CATÉGORIE
──────────────────────────────────────────────────────────────

| Catégorie | Nombre |
|-----------|--------|
| Added | 3 |
| Changed | 2 |
| Fixed | 3 |
| Security | 1 |
| Performance | 2 |
| Breaking | 1 |

──────────────────────────────────────────────────────────────
⚠️ POINTS D'ATTENTION
──────────────────────────────────────────────────────────────

1. ⚠️ BREAKING CHANGE détecté - nécessite version MAJOR ?
2. 🔒 1 fix de sécurité - mentionner dans les notes de release
3. 📝 5 commits sans format conventionnel (à améliorer)

──────────────────────────────────────────────────────────────
🎯 PROCHAINES ÉTAPES
──────────────────────────────────────────────────────────────

1. Vérifier et éditer le changelog généré
2. Créer le fichier CHANGELOG.md ou le mettre à jour
3. Commiter : git commit -am "docs: update changelog for v1.2.0"
4. Créer le tag : git tag -a v1.2.0 -m "Release v1.2.0"
```

## Commandes Associées

```bash
# Sauvegarder le changelog
# Le contenu sera affiché, vous pouvez le copier dans CHANGELOG.md

# Outils recommandés pour automatisation
# - git-cliff : https://github.com/orhun/git-cliff
# - conventional-changelog : https://github.com/conventional-changelog/conventional-changelog
# - release-please : https://github.com/googleapis/release-please
```

## Conventional Commits Rappel

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]

# Types standards
feat:     Nouvelle fonctionnalité
fix:      Correction de bug
docs:     Documentation uniquement
style:    Formatage (pas de changement de code)
refactor: Refactoring (pas de nouvelle feature ni fix)
perf:     Amélioration de performance
test:     Ajout/modification de tests
chore:    Maintenance (deps, config, etc.)
build:    Build system, deps externes
ci:       CI/CD configuration
revert:   Revert d'un commit précédent

# Breaking change
feat!: description
# ou
feat: description

BREAKING CHANGE: explication du breaking change
```
