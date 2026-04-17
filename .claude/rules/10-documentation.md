# Documentation — Quick Reference

Documentation as Code, à jour, concise et utile.

| Type | Format | Contenu clé |
|------|--------|-------------|
| **README** | Markdown | Installation, démarrage rapide, config (10 sections requises) |
| **Code comments** | Inline | POURQUOI, pas QUOI (décisions non évidentes, workarounds, refs externes) |
| **API docs** | OpenAPI 3.2 | Endpoints, schemas, exemples, erreurs (RFC 9457), auth, rate limits |
| **ADR** | Markdown | Statut, Contexte, Décision, Alternatives, Conséquences (Log4brains recommandé) |
| **Changelog** | Markdown | Keep a Changelog (Added, Changed, Deprecated, Removed, Fixed, Security) |

**Principes clés :** Single Source of Truth, mise à jour avec chaque PR, automatisation (CI/CD génère docs), code auto-documenté.

> Détails complets, ADR outils et checklists : `@.claude/skills/documentation/REFERENCE.md`
