# Git Workflow — Quick Reference

GitHub Flow + Conventional Commits obligatoires.

| Élément | Format/Règle | Exemple |
|---------|--------------|---------|
| **Commits** | `<type>(<scope>): <description>` | `feat(auth): add login endpoint` |
| **Types** | feat, fix, docs, style, refactor, perf, test, build, ci, chore | - |
| **Branches** | `<type>/<description-courte>` (max 3 jours) | `feature/add-user-registration` |
| **PR** | Review obligatoire, CI verte, squash merge | - |
| **SemVer** | MAJOR (breaking), MINOR (feature), PATCH (fix) | alpha → beta → rc → stable |

**Principes clés :** `main` toujours déployable, commits atomiques testés, branches courtes (< 3 jours), code review (checklist SOLID/KISS/Tests/Sécurité), squash merge pour historique propre.

> Détails complets, code review checklist et templates : `@.claude/skills/git-workflow/REFERENCE.md`
