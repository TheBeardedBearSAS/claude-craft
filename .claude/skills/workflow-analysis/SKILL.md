---
name: workflow-analysis
description: Analyse obligatoire en 4 étapes (comprendre, analyser, documenter, valider) avant toute modification de code, puis implémentation TDD. Use when starting a feature, bugfix or refactoring, or before touching existing code with unclear impact.
  files: []
---

# Workflow d'Analyse Obligatoire

This skill enforces mandatory analysis before any code modification.

See @REFERENCE.md for detailed documentation.

## Quick Reference

### Before ANY Change (4 analysis steps, same as rule 01)

1. **Understand**: Clear objective + acceptance criteria
2. **Analyze**: Read affected files + dependencies + tests
3. **Document**: Files, impacts, risks, approach, TDD tests
4. **Validate**: User approval if medium/high impact

Then **implement with TDD** (not an analysis step): write tests FIRST (Red → Green → Refactor).

### Impact Levels

| Impact | Action |
|--------|--------|
| Low (1 file, < 1h) | Proceed |
| Medium (2-5 files, migration, < 4h) | Validate with user |
| High (> 5 files, breaking changes) | Detailed plan + validation required |
