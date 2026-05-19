---
name: design-md-convention
description: Convention DESIGN.md pour design systems AI-friendly. Use when setting up a new project UI, documenting design tokens, or generating UI consistent with a design system.
context: fork
disable-model-invocation: true
triggers:
  files: ["DESIGN.md", "tailwind.config.*", "tokens.json"]
  keywords: ["design system", "DESIGN.md", "design tokens", "UI guidelines", "design consistency"]
auto_suggest: true
---

# DESIGN.md — Convention Design System AI-Friendly

Convention inspirée de [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md) (55+ design systems populaires, concept Google Stitch).

**Principe :** un fichier `DESIGN.md` en markdown à la racine du projet sert de **source de vérité** pour les agents IA qui génèrent ou modifient l'UI. Pas de Figma, pas de JSON complexe, juste du texte lisible par humain et par LLM.

## Pourquoi DESIGN.md ?

| Problème sans DESIGN.md | Solution avec DESIGN.md |
|-------------------------|--------------------------|
| IA génère des couleurs aléatoires | IA lit la palette définie |
| Incohérence spacing entre composants | IA applique l'échelle documentée |
| Typographie variable | IA utilise les tokens définis |
| Onboarding designer/dev lent | DESIGN.md = réponse unique |
| Dépendance à Figma pour chaque décision | Markdown versionné avec le code |

## Structure recommandée

Un DESIGN.md contient **7 sections obligatoires** :

1. **Principes visuels** — ton, personnalité, do/don't
2. **Design tokens** — couleurs, typographie, espacements, rayons, ombres
3. **Grille & layout** — breakpoints, colonnes, gutters, container widths
4. **Composants** — liste + variantes + règles d'usage
5. **Patterns d'interaction** — hover, focus, active, disabled, loading
6. **Accessibilité** — niveau cible (AA/AAA), contrastes, focus rings
7. **Références** — lien vers Figma (optionnel), design system inspiré

Voir `.claude/templates/DESIGN.md.template` pour la structure complète.

## Règles de rédaction

### 1. Concis et structuré
- Tableaux > prose
- Tokens > valeurs hardcoded
- Exemples concrets > théorie

### 2. Tokens nommés, pas valeurs brutes

```
❌ MAUVAIS
Primary button: background #3B82F6

✅ BON
| Token | Valeur | Usage |
|-------|--------|-------|
| `color.primary.500` | #3B82F6 | Boutons primaires, liens actifs |
| `color.primary.600` | #2563EB | Hover des éléments primaires |
```

### 3. Do / Don't explicites

```
### Boutons

**DO**
- Utiliser `button.primary` pour l'action principale d'un écran (1 max)
- Utiliser `button.secondary` pour actions secondaires

**DON'T**
- Jamais 2 boutons primaires sur le même écran
- Jamais de couleur custom hors palette
```

### 4. Versionner avec le code

`DESIGN.md` est **dans le repo**, reviewé en PR au même titre que le code.

## Intégration avec agents Claude Craft

Les agents suivants lisent `DESIGN.md` par défaut :

- **`@ui-designer`** — génère UI conforme aux tokens
- **`@ux-ergonome`** — valide les patterns d'interaction
- **`@accessibility-expert`** — vérifie contrastes vs niveau cible
- **`@{react,vue,angular}-reviewer`** — flag les valeurs hardcoded

## Workflow recommandé

```
1. Nouveau projet → copier .claude/templates/DESIGN.md.template à la racine
2. Remplir les 7 sections (30-60 min)
3. Commiter DESIGN.md
4. Référencer depuis @.claude/CLAUDE.md projet : "@DESIGN.md"
5. Les agents IA le chargent automatiquement
6. Mettre à jour à chaque évolution du design system
```

## Génération assistée

Command dédiée (Phase 4) : `/uiux:generate-design-md`
- Analyse `tailwind.config.js` ou tokens existants
- Pré-remplit les sections
- Demande validation sur les zones ambiguës

## Exemples de DESIGN.md inspirants

- [Stripe Dashboard](https://github.com/VoltAgent/awesome-design-md#stripe)
- [Linear](https://github.com/VoltAgent/awesome-design-md#linear)
- [Vercel](https://github.com/VoltAgent/awesome-design-md#vercel)
- Liste complète : [awesome-design-md](https://github.com/VoltAgent/awesome-design-md)

## Anti-patterns

| Anti-pattern | Solution |
|--------------|----------|
| DESIGN.md > 500 lignes | Extraire sous-fichiers `docs/design/*.md` |
| Prose sans tableaux | Reformater en tokens structurés |
| Pas de do/don't | Ajouter règles explicites |
| Screenshots uniquement | Compléter par description textuelle (LLM ne voit pas toujours les images) |
| Désynchro avec code | Ajouter check CI (lint tokens) |

---

**Date de dernière mise à jour :** 2026-04-15
**Version :** 1.0.0
