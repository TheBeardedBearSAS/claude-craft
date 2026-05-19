# Ajouter une nouvelle locale à Claude Craft

Ce guide vous explique comment ajouter une nouvelle langue au système i18n de Claude Craft. Claude Craft supporte actuellement 5 langues (`en`, `fr`, `es`, `de`, `pt`) et est conçu pour faciliter l'ajout de nouvelles langues.

---

## Prérequis

- Node.js 20+ avec accès au dépôt Claude Craft
- Familiarité avec la structure du projet (voir `docs/guides/fr/01-getting-started.md`)
- Une approche de traduction : traducteurs humains, un agent (`@research-assistant`), ou une combinaison

---

## Étape 1 — Enregistrer le code de locale

Modifiez `cli/lib/constants.js` et ajoutez votre code de langue dans l'objet `LANGUAGES` :

```js
const LANGUAGES = {
  en: 'English',
  fr: 'Français',
  es: 'Español',
  de: 'Deutsch',
  pt: 'Português',
  // Ajoutez votre nouvelle locale ici, ex. :
  // it: 'Italiano',
  // ja: '日本語',
};
```

Mettez également à jour `scripts/verify-i18n-parity.sh` — trouvez le tableau `LANGS` et ajoutez votre code :

```bash
LANGS=("en" "fr" "es" "de" "pt" "it")   # exemple : ajout de l'italien
```

---

## Étape 2 — Créer la structure de répertoires

Le contenu i18n de Claude Craft vit dans trois arbres. Créez les répertoires correspondants pour votre nouvelle locale :

```bash
# Règles et références Dev
mkdir -p Dev/i18n/<lang>/

# Guides d'infrastructure
mkdir -p Infra/i18n/<lang>/

# Modèles de gestion de projet
mkdir -p Project/i18n/<lang>/

# Guides de documentation utilisateur
mkdir -p docs/guides/<lang>/
```

Chaque arbre doit refléter exactement la référence anglaise (`en`) — mêmes noms de fichiers, mêmes chemins relatifs.

---

## Étape 3 — Traduire les fichiers

La locale de référence (`en`) contient environ **325 fichiers** dans tous les arbres. Vous pouvez déléguer la traduction à un agent Claude pour accélérer le processus :

```
@research-assistant Traduis tous les fichiers de docs/guides/en/ en italien (it).
Garde la structure identique. Génère chaque fichier dans docs/guides/it/ avec le même nom de fichier.
Préserve tous les blocs de code, les exemples de commandes et les liens relatifs tels quels.
```

**Règles de traduction :**

| Règle | Détail |
|-------|--------|
| Blocs de code | Ne jamais traduire — garder tel quel |
| Commandes CLI | Ne jamais traduire |
| Chemins de fichiers | Ne jamais traduire |
| En-têtes de section | Traduire, conserver le formatage Markdown |
| Liens | Mettre à jour le texte affiché, garder les chemins relatifs identiques |
| Termes techniques | Utiliser la convention établie dans la communauté de la langue cible |

Commencez par `docs/guides/<lang>/` (valeur utilisateur la plus élevée), puis `Dev/i18n/<lang>/`, puis `Infra/` et `Project/`.

---

## Étape 4 — Vérifier la parité

Exécutez le script de vérification de parité pour confirmer que votre locale est complète et respecte le seuil de taille :

```bash
# Vérifier la parité du nombre de fichiers (bloquant — doit être 100%)
bash scripts/verify-i18n-parity.sh

# Vérifier la parité de taille en mode strict (ratio >= 0.80 par fichier)
STRICT_SIZE=1 bash scripts/verify-i18n-parity.sh

# Exécuter en mode permissif pendant une PR en cours
I18N_PARITY_STRICT=0 bash scripts/verify-i18n-parity.sh
```

Le script génère un rapport de lacunes dans `audit/phases/i18n-gap.csv` listant les fichiers sous le seuil de ratio 0.80. Utilisez-le pour prioriser le travail de traduction restant.

**Sortie attendue lorsque c'est complet :**

```
✓ en: 325 fichiers
✓ it: 325 fichiers
✓ Toutes les langues à parité
```

---

## Étape 5 — Mettre à jour la CI et la documentation

### Workflow GitHub Actions

Modifiez `.github/workflows/i18n-parity.yml`. Dans le filtre `paths` du déclencheur `pull_request`, le workflow couvre déjà `Dev/i18n/**`, `docs/guides/**`, `Infra/i18n/**` et `Project/i18n/**` — aucune modification supplémentaire n'est nécessaire pour les locales standard.

Si vous avez ajouté un filtre spécifique à une locale ailleurs dans le workflow, ajoutez votre nouveau code dans toute liste d'autorisation ou matrice.

### README

Mettez à jour le tableau des guides multilingues dans `README.md` (section "User Guides (Multilingual)") pour inclure les liens vers votre nouvelle locale pour chaque guide.

### Détection automatique de locale CLI

Si la nouvelle locale correspond à un préfixe de locale OS courant (par ex. `it` pour `it_IT.UTF-8`), ajoutez le mapping dans `cli/lib/installer.js` dans la fonction `detectLocale()` :

```js
if (raw.startsWith('it')) return 'it';
```

Ajoutez un cas de test correspondant dans `tests/cli/detect-locale.test.mjs`.

---

## Checklist

- [ ] Code ajouté à `LANGUAGES` dans `cli/lib/constants.js`
- [ ] Code ajouté au tableau `LANGS` dans `scripts/verify-i18n-parity.sh`
- [ ] Répertoires créés : `Dev/i18n/<lang>/`, `Infra/i18n/<lang>/`, `Project/i18n/<lang>/`, `docs/guides/<lang>/`
- [ ] Tous les fichiers traduits (325 fichiers)
- [ ] `bash scripts/verify-i18n-parity.sh` sort avec 0
- [ ] `STRICT_SIZE=1 bash scripts/verify-i18n-parity.sh` sort avec 0 (ou les lacunes sont documentées)
- [ ] `audit/phases/i18n-gap.csv` examiné et lacunes traitées
- [ ] Tableau multilingue du README mis à jour
- [ ] `detectLocale()` mis à jour + test ajouté (si la détection automatique de locale OS est pertinente)
- [ ] PR ouverte avec le label `i18n/<lang>`

---

> Voir aussi : `.claude/rules/16-i18n.md` | `scripts/verify-i18n-parity.sh` | `.github/workflows/i18n-parity.yml`
