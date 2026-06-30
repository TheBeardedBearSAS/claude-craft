---
description: "Génère un DESIGN.md à la racine du projet à partir du template Claude Craft + analyse des sources UI existantes (Tailwind, tokens, CSS)."
argument-hint: "[--from-tailwind] [--from-tokens=<path>] [--interactive]"
---

# Generate DESIGN.md

Crée un fichier `DESIGN.md` à la racine du projet pour servir de source de vérité du design system, lu par tous les agents IA (voir skill `design-md-convention`).

## Quand utiliser

- Nouveau projet avec UI
- Projet existant sans DESIGN.md (et donc inconsistances UI fréquentes)
- Migration d'un design system Figma vers format AI-friendly

## Usage

```bash
# Copie simple du template (à remplir manuellement)
/uiux:generate-design-md

# Pré-remplir depuis tailwind.config.*
/uiux:generate-design-md --from-tailwind

# Pré-remplir depuis fichier de tokens JSON
/uiux:generate-design-md --from-tokens=./design-tokens.json

# Mode interactif (questions ciblées)
/uiux:generate-design-md --interactive
```

## Processus

### 1. Vérification

```bash
# Check si DESIGN.md existe déjà
if [[ -f "DESIGN.md" ]]; then
  echo "⚠️  DESIGN.md existe déjà. Utiliser --force pour écraser."
  exit 1
fi
```

### 2. Détection des sources UI

Auto-détecter ce qui est déjà défini :
- `tailwind.config.{js,ts,mjs}` → extraire `theme.colors`, `fontFamily`, `fontSize`, `spacing`, `screens`
- `design-tokens.json` / `tokens.json` → W3C Design Tokens format
- `src/styles/_variables.scss` / `styles.css` avec `:root { --color-* }`
- `theme.ts` (Chakra, Mantine, MUI)

### 3. Copie du template

Base : `.claude/templates/DESIGN.md.template` (7 sections obligatoires).

### 4. Pré-remplissage intelligent

Si `--from-tailwind` :
- Parser `tailwind.config.*` via `tw-loader` ou lecture JSON
- Mapper les couleurs vers `color.{role}.{shade}`
- Extraire les breakpoints vers la section grille
- Extraire les `fontSize` vers la section typographie

Si `--from-tokens` :
- Respecter le format W3C Design Tokens (W3C Community Group spec)
- Mapper `{color.primary.500.value}` vers tokens DESIGN.md

### 5. Mode interactif

Si `--interactive`, poser ces questions à l'utilisateur :

1. **Personnalité du produit** : professionnel / moderne / chaleureux / minimaliste ?
2. **Couleur primaire** : hex ou choix dans palette Tailwind ?
3. **Font principale** : système / Google Font / custom ?
4. **Niveau accessibilité cible** : WCAG 2.2 AA (standard) ou AAA (strict) ?
5. **Library composants existante** : aucune / shadcn/ui / MUI / Chakra / Mantine / custom ?

### 6. Output

- Créer `DESIGN.md` à la racine du projet
- Ajouter entry dans `.gitignore` ? Non, DESIGN.md doit être versionné.
- Ajouter référence dans `CLAUDE.md` projet : `@DESIGN.md`
- Suggérer de lier depuis README.md

## Post-génération

Le DESIGN.md nécessite une **review humaine** :
- Valider les couleurs extraites
- Compléter les sections peu documentées (patterns d'interaction, a11y)
- Ajouter les références externes (Figma, design system inspiré)

**Temps cible :** 30-60 min pour un DESIGN.md complet et utile.

## Validation

Checklist post-génération :

- [ ] Les 7 sections obligatoires présentes
- [ ] Tokens cohérents (pas de couleur hors palette)
- [ ] Niveau a11y explicite (AA ou AAA)
- [ ] DO/DON'T pour les composants principaux
- [ ] Pas de valeur hardcoded hors tokens
- [ ] Commit dans le repo

## Intégration

- **Skill `design-md-convention`** — règles de rédaction
- **Template** `.claude/templates/DESIGN.md.template`
- **Agents consommateurs** : `@ui-designer`, `@ux-ergonome`, `@accessibility-expert`, `@{react,vue,angular}-reviewer`
- **Commandes liées** : `/uiux:design-tokens`, `/uiux:audit`, `/uiux:a11y-audit`

## Exemples

### Projet React + Tailwind

```bash
/uiux:generate-design-md --from-tailwind --interactive
# Questions interactives
# → DESIGN.md généré avec palette Tailwind + breakpoints + typo
```

### Projet sans stack UI détectable

```bash
/uiux:generate-design-md --interactive
# Copie template + questions
# → DESIGN.md à compléter manuellement
```

## Ressources

- Skill : `.claude/skills/design-md-convention/SKILL.md`
- Template : `.claude/templates/DESIGN.md.template`
- [W3C Design Tokens spec](https://design-tokens.github.io/community-group/format/)
- [Awesome DESIGN.md](https://github.com/VoltAgent/awesome-design-md) — 55+ exemples
