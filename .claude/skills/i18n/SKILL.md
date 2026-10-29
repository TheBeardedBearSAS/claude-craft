---
name: i18n
description: "Règle 09 : Internationalisation (i18n). Use when implementing internationalization."
---

# Règle 09 : Internationalisation (i18n)

This skill provides guidelines and best practices.

See ../../rules/16-i18n.md for detailed documentation.

## Message formatting

- **ICU MessageFormat 2.0 (MF2)** is a stable part of Unicode CLDR since CLDR 47 (March 2025). It replaces the legacy ICU MessageFormat (MF1, `{count, plural, one {…} other {…}}`) for plurals, gender and selection.
- MF1 is still what most frameworks ship (e.g. Symfony's `+intl-icu` translation domain): check library support before migrating, and do not mix both syntaxes in one catalogue.
- Keep plural/gender logic inside the message, never in application code.
