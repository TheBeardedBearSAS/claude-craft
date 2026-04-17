# Module 3 : Patterns de Travail

> **Duree :** 2h
> **Prerequis :** [Module 2 - CLAUDE.md et Configuration](./02-claudemd-configuration.md)
> **Prochain module :** [Module 4 - Pratique Guidee](./04-pratique-guidee.md)

---

## Objectifs

A l'issue de ce module, vous serez capable de :

1. Formuler des prompts efficaces pour Claude Code
2. Utiliser le Plan Mode pour explorer avant d'agir
3. Gerer la context window de maniere optimale
4. Deleguer des taches aux sub-agents
5. Utiliser le mode headless pour l'automatisation
6. Gerer les sessions et le checkpointing
7. Utiliser /effort, /context et /loop pour optimiser le travail
8. Exploiter toutes les fonctionnalites avancees de l'interface

---

## 1. Prompt engineering pour Claude Code

### 1.1 Principes fondamentaux

Claude Code est un agent : vos prompts doivent etre formules comme des **objectifs** plutot que comme des instructions pas-a-pas. Laissez l'agent decider du comment.

```
❌ MAUVAIS (trop directif)
> Ouvre le fichier src/auth.ts, trouve la fonction login,
> ajoute un parametre rememberMe de type boolean,
> puis modifie le corps de la fonction pour creer un cookie
> si rememberMe est true.

✅ BON (objectif clair avec contraintes)
> Ajoute une option "Se souvenir de moi" a la fonctionnalite
> de login. Quand l'utilisateur coche cette option, la session
> doit durer 30 jours au lieu de 24h. Utilise un cookie securise.
```

### 1.2 Structure d'un bon prompt

Un prompt efficace contient :

1. **Le contexte** : Qu'est-ce qui existe deja ?
2. **L'objectif** : Que voulez-vous accomplir ?
3. **Les contraintes** : Quelles regles respecter ?
4. **Le resultat attendu** : Comment verifier le succes ?

```
> Notre API d'authentification utilise JWT (contexte).
> Je veux ajouter un endpoint de refresh token (objectif).
> Le refresh token doit expirer apres 7 jours et etre stocke
> en base de donnees, pas en cookie (contraintes).
> Ajoute des tests unitaires qui couvrent les cas nominaux
> et les cas d'erreur (resultat attendu).
```

### 1.3 L'iterativite

Ne cherchez pas le prompt parfait du premier coup. Iterez :

```
# Iteration 1 : Demande initiale
> Cree un service de notification par email

# Iteration 2 : Preciser
> Utilise un template HTML plutot que du texte brut

# Iteration 3 : Contrainte supplementaire
> Ajoute une file d'attente async pour ne pas bloquer la requete

# Iteration 4 : Tests
> Ajoute des tests unitaires pour le service
```

### 1.4 Exemples bons vs mauvais

#### Pour du refactoring

```
❌ MAUVAIS
> Refactorise ce code

✅ BON
> Le fichier src/services/order.ts fait 500 lignes et gere a la fois
> la validation, le calcul des prix et l'envoi d'emails. Decoupe-le
> en services distincts en suivant le principe SRP. Conserve les
> tests existants et assure-toi qu'ils passent toujours.
```

#### Pour du debugging

```
❌ MAUVAIS
> Ca marche pas, corrige

✅ BON
> L'endpoint POST /api/orders renvoie une erreur 500 quand le champ
> discount est null. Voici le stack trace : [coller le stack trace].
> Le comportement attendu est de traiter null comme 0% de remise.
```

#### Pour de la generation

```
❌ MAUVAIS
> Fais un CRUD utilisateur

✅ BON
> Cree un CRUD complet pour l'entite User avec les champs :
> email (unique, valide), name (requis, 2-100 chars), role (enum: admin, user).
> Inclus la validation, les tests unitaires et la migration de base de donnees.
> Suis l'architecture Clean Architecture du projet.
```

---

## 2. Plan Mode

### 2.1 Concept

Le Plan Mode demande a Claude de **planifier** ses actions avant de les executer. Au lieu de modifier directement le code, Claude propose d'abord un plan que vous pouvez valider, modifier ou rejeter.

### 2.2 Activation

```bash
# Via la commande slash
/plan

# Via le raccourci clavier
Shift+Tab

# Dans le prompt
> Plan comment tu implementerais un systeme de cache Redis
```

### 2.3 Workflow du Plan Mode

```
┌──────────────────────────────────────┐
│          PLAN MODE ACTIVE            │
├──────────────────────────────────────┤
│                                      │
│  1. Claude explore la codebase       │
│     (lecture de fichiers, grep)      │
│                                      │
│  2. Claude propose un plan :         │
│     - Fichiers a modifier            │
│     - Ordre des modifications        │
│     - Tests a ajouter                │
│     - Risques identifies             │
│                                      │
│  3. Vous validez / modifiez :        │
│     "OK, proceed"                    │
│     "Modifie le point 3"            │
│     "Ajoute aussi les tests E2E"    │
│                                      │
│  4. Claude execute le plan           │
│                                      │
└──────────────────────────────────────┘
```

### 2.4 Quand utiliser le Plan Mode ?

| Situation | Plan Mode ? |
|-----------|-------------|
| Bug simple, 1 fichier | Non |
| Renommer une variable | Non |
| Nouvelle feature (2-3 fichiers) | Recommande |
| Refactoring multi-fichiers | Oui |
| Changement d'architecture | Obligatoire |
| Impact incertain | Oui |

### 2.5 Exemple pratique

```bash
# Activer le Plan Mode
> /plan

# Poser la question
> Comment implementer un systeme de pagination
> pour notre API REST qui supporte cursor-based
> et offset-based pagination ?

# Claude repond avec un plan detaille
# Vous validez :
> Le plan me convient. Commence par les tests.
```

---

## 3. Gestion du contexte

### 3.1 La context window

La context window (~200K tokens) est **LA ressource critique** de Claude Code. Tout ce que Claude "sait" doit tenir dans cette fenetre.

```
┌─────────────────────────────────────────────┐
│           Context Window (~200K tokens)      │
├─────────────────────────────────────────────┤
│ CLAUDE.md + Rules             ~5K tokens    │
│ Historique conversation       ~80K tokens   │
│ Fichiers lus par Claude       ~40K tokens   │
│ Resultats de commandes        ~20K tokens   │
│ Espace pour la reponse        ~55K tokens   │
└─────────────────────────────────────────────┘
```

### 3.2 /clear : Nettoyer le contexte

La commande `/clear` vide **toute** la conversation en cours. Utilisez-la entre deux taches non liees.

```bash
# Apres avoir termine une tache
/clear

# Commencer une nouvelle tache avec un contexte propre
> Maintenant, travaillons sur le systeme de notifications
```

**Quand utiliser /clear :**
- Entre deux taches non liees
- Apres une longue investigation
- Quand le contexte depasse 50%
- Quand Claude commence a se repeter ou a confondre des choses

**Quand NE PAS utiliser /clear :**
- Au milieu d'une tache en cours
- Si le contexte precedent est necessaire
- Juste apres avoir charge des fichiers pertinents

### 3.3 /compact : Compacter le contexte

La commande `/compact` **resume** la conversation existante au lieu de la supprimer. Claude garde l'essentiel mais libere de l'espace.

```bash
# La conversation devient longue mais le contexte est utile
/compact

# Claude resume automatiquement et continue
> Maintenant, passons a l'implementation du point 3 du plan
```

### 3.4 Compaction automatique

Quand le contexte approche les limites de la fenetre, Claude Code **compacte automatiquement** les messages anciens. Les messages recents sont preserves, les anciens sont resumes.

### 3.5 Hook SessionStart:compact

Vous pouvez configurer un hook pour re-injecter du contexte critique apres une compaction :

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "compact",
        "command": "cat .claude/context-essentials.md"
      }
    ]
  }
}
```

Le fichier `.claude/context-essentials.md` contient les informations critiques :

```markdown
# Contexte essentiel

## Tache en cours
Implementer le systeme de pagination pour l'API REST.

## Decisions prises
- Cursor-based pagination par defaut
- Offset disponible en fallback
- Limite max : 100 items par page

## Fichiers cles
- src/middleware/pagination.ts
- src/types/pagination.ts
- tests/pagination.test.ts
```

### 3.6 Seuils d'action

| Contexte utilise | Action recommandee |
|------------------|-------------------|
| < 30% | Normal, continuez |
| 30-60% | Surveillez, evitez les lectures inutiles |
| 60-80% | Deleguez aux sub-agents, envisagez /clear |
| > 80% | Compaction imminente, sauvegardez le contexte critique |

---

## 4. Sub-agents

### 4.1 Concept

Les sub-agents sont des **sessions Claude independantes** lancees par votre session principale. Ils ont leur propre context window et ne polluent pas votre contexte principal.

```
┌─────────────────────────────────┐
│     Session principale          │
│  (votre conversation)           │
│                                 │
│  > Explore l'architecture       │
│    ┌─────────────────────┐      │
│    │ Sub-agent (Task)    │      │
│    │ Lit 20 fichiers     │      │
│    │ Analyse patterns    │      │
│    │ Retourne un resume  │      │
│    └─────────────────────┘      │
│                                 │
│  ← Resume (500 tokens)         │
│  (au lieu de 20000 tokens)     │
└─────────────────────────────────┘
```

### 4.2 Types de sub-agents

| Type | Usage | Exemple |
|------|-------|---------|
| **Explore** | Investigation multi-fichiers | "Comment fonctionne l'auth dans ce projet ?" |
| **Plan** | Planification d'implementation | "Planifie l'ajout d'un cache Redis" |
| **General-purpose** | Tache independante | "Genere les tests pour ce module" |

### 4.3 Quand utiliser un sub-agent ?

| Situation | Action |
|-----------|--------|
| Chercher un fichier precis | `Glob`/`Grep` directement |
| Lire 1-2 fichiers | `Read` directement |
| Explorer une architecture inconnue | Sub-agent Explore |
| Investigation multi-fichiers (> 3) | Sub-agent Explore |
| Planifier une implementation complexe | Sub-agent Plan |
| Tache independante en parallele | Sub-agent general |

### 4.4 run_in_background

Les sub-agents peuvent s'executer en arriere-plan pendant que vous continuez a travailler :

```bash
# Claude lance un sub-agent en background
> Pendant que j'implemente le service, analyse les performances
> de la requete SQL principale en arriere-plan

# Vous continuez a travailler...
> Cree le service de notification

# Le resultat du sub-agent arrive quand il est pret
```

### 4.5 Exemple pratique

```bash
# Au lieu de lire 20 fichiers dans le contexte principal :
> Utilise un sub-agent pour explorer le systeme d'authentification
> de ce projet. Je veux savoir :
> - Quel framework d'auth est utilise
> - Ou sont stockes les tokens
> - Comment les permissions sont gerees
> - Y a-t-il des failles potentielles

# Claude delegue a un sub-agent qui :
# 1. Parcourt les fichiers auth/
# 2. Lit les configurations
# 3. Analyse les middlewares
# 4. Retourne un resume structure

# Votre contexte principal recoit uniquement le resume
```

---

## 5. Fast Mode

### 5.1 Concept

Le Fast Mode (`/fast`) permet d'obtenir des reponses **2.5x plus rapides** avec Opus 4.6. Il utilise le meme modele mais avec une generation optimisee.

> **Cout :** Le Fast Mode coute **6x le prix normal** ($30 / $150 par M tokens au lieu de $5 / $25). A utiliser avec parcimonie pour les taches ou la vitesse est critique.

### 5.2 Activation

```bash
# Toggle le Fast Mode
/fast

# La status line affiche "fast" quand actif
```

### 5.3 Quand utiliser Fast Mode ?

| Situation | Fast Mode ? |
|-----------|-------------|
| Generation de code boilerplate | Oui |
| Taches repetitives | Oui |
| Modifications simples | Oui |
| Architecture complexe | Non (preferer la reflexion approfondie) |
| Debugging subtil | Non |
| Decisions critiques | Non |

---

## 6. Mode headless

### 6.1 Concept

Le mode headless permet d'utiliser Claude Code de maniere **non interactive**, directement depuis la ligne de commande ou dans des scripts.

### 6.2 Syntaxe de base

```bash
# Prompt direct avec resultat texte
claude -p "Liste les fichiers TypeScript du projet"

# Avec format de sortie specifique
claude -p "Analyse ce fichier" --output-format json
claude -p "Resume ce code" --output-format text
claude -p "Stream la reponse" --output-format stream-json
```

### 6.3 Formats de sortie

| Format | Description | Usage |
|--------|-------------|-------|
| `text` | Texte brut | Lecture humaine, logs |
| `json` | JSON structure | Parsing programmatique |
| `stream-json` | JSON streame ligne par ligne | Traitement temps reel |

### 6.4 Piping et integration scripts

```bash
# Piping vers un fichier
claude -p "Genere un fichier de migration SQL" > migration.sql

# Piping depuis stdin
cat error.log | claude -p "Analyse ces logs et identifie le probleme"

# Integration dans un script bash
#!/bin/bash
ANALYSIS=$(claude -p "Analyse la qualite de $FILE" --output-format text)
echo "Resultat: $ANALYSIS"

# Chainer avec d'autres commandes
claude -p "Liste les TODO dans le code" --output-format text | grep "CRITICAL"
```

### 6.5 Cas d'usage avances

```bash
# Pre-commit hook
claude -p "Verifie que les fichiers stages respectent les conventions" \
  --output-format json

# Revue de code automatique
git diff main..HEAD | claude -p "Fais une revue de code de ce diff"

# Generation de documentation
claude -p "Genere la documentation JSDoc pour src/services/" \
  --output-format text > docs/api.md

# Analyse de logs
tail -100 /var/log/app.log | claude -p "Y a-t-il des erreurs critiques ?"
```

---

## 7. Gestion des sessions

### 7.1 Continuer une session

```bash
# Reprendre la derniere session
claude --continue

# Raccourci
claude -c
```

Cela restaure le contexte de la derniere conversation et vous permet de continuer exactement ou vous en etiez.

### 7.2 Reprendre une session specifique

```bash
# Lister les sessions
claude --history

# Reprendre une session par son ID
claude --resume <session-id>
```

### 7.3 Renommer une session

```bash
# Dans une session active
/rename "Implementation pagination API"
```

Les sessions nommees sont plus faciles a retrouver dans l'historique.

---

## 8. Commandes avancees de contexte et d'automatisation

### 8.1 /effort — Controle de la profondeur de reflexion

La commande `/effort` ajuste le niveau de reflexion du modele, ce qui impacte la qualite et le cout :

```bash
# Tache simple → economiser des tokens
/effort low

# Tache standard
/effort medium

# Architecture complexe, debugging difficile
/effort high
```

| Niveau | Usage | Impact cout |
|--------|-------|-------------|
| `low` | Renommage, lookups, formatage | Minimal |
| `medium` | Implementation courante (defaut) | Standard |
| `high` | Raisonnement complexe, architecture | Maximum |

### 8.2 /context — Diagnostic d'utilisation du contexte

La commande `/context` (v2.1.74+) fournit des **suggestions actionnables** pour optimiser votre utilisation du contexte :

```bash
/context

# Resultat typique :
# - "3 fichiers lus ne sont plus references → /clear recommande"
# - "Le contexte est a 67% → envisagez de deleguer aux sub-agents"
# - "2 gros outputs de commande pourraient etre filtres"
```

Utilisez `/context` regulierement pour identifier les sources de gaspillage de tokens.

### 8.3 /loop — Taches recurrentes

La commande `/loop` (v2.1.71+, alias `/proactive` depuis v2.1.105) permet de planifier des taches recurrentes :

```bash
# Verifier les tests toutes les 5 minutes
/loop 5m npm test

# Surveiller le deploiement (cadence automatique)
/loop "Verifie le statut du deploiement et alerte si erreur"

# Verifier la conformite avant chaque commit
/loop 5m /common:pre-commit-check
```

Sans intervalle specifie, le modele determine lui-meme la cadence optimale.

---

## 9. Checkpointing et rewind

### 9.1 Concept

Claude Code cree automatiquement des **checkpoints** a chaque action majeure (ecriture de fichier, execution de commande). Vous pouvez revenir a n'importe quel checkpoint precedent.

### 9.2 Rewind

```bash
# Revenir au dernier checkpoint
Esc + Esc

# Ou via la commande
/rewind
```

### 9.3 Workflow de rewind

```
┌──────────────────────────────────────┐
│ Checkpoint 1 : Code initial          │
│      ↓                               │
│ Checkpoint 2 : Tests ajoutes        │
│      ↓                               │
│ Checkpoint 3 : Service implemente    │
│      ↓                               │
│ Checkpoint 4 : Bug introduit !       │
│      ↓                               │
│ Esc+Esc → Retour Checkpoint 3       │
│      ↓                               │
│ Checkpoint 5 : Correction + avance   │
└──────────────────────────────────────┘
```

### 9.4 Cas d'usage

- Claude a pris une mauvaise direction → Rewind
- Une modification a casse les tests → Rewind
- Vous voulez essayer une approche differente → Rewind
- Claude a modifie un fichier qu'il ne devait pas → Rewind

---

## 10. Support images

### 10.1 Injection d'images

Claude Code peut analyser des images (screenshots, diagrammes, maquettes). Vous pouvez les injecter de plusieurs manieres :

```bash
# Drag & drop dans le terminal
# (glissez l'image directement dans la fenetre)

# Copier-coller (selon le terminal)
# Cmd+V / Ctrl+V avec une image dans le presse-papier
```

### 10.2 Cas d'usage

| Usage | Exemple |
|-------|---------|
| **Debug UI** | "Voici un screenshot, le bouton est mal aligne" |
| **Implementation maquette** | "Implemente ce design" (+ image Figma) |
| **Analyse d'erreur** | "Voici le screenshot de l'erreur dans le navigateur" |
| **Documentation** | "Genere un diagramme Mermaid a partir de ce schema" |

---

## 11. Sandboxing

### 11.1 Concept

Le sandbox fournit une **isolation active au niveau OS** pour l'execution de Claude Code. Sur macOS, il utilise Seatbelt (sandbox-exec) pour restreindre les operations. Sur Linux, il utilise des mecanismes de conteneurisation equivalents.

### 11.2 Activation

```bash
# Activer le sandbox
/sandbox

# Ou au lancement
claude --sandbox
```

### 11.3 Ce que le sandbox empeche

- **Ecriture de fichiers** en dehors du repertoire du projet (isolation OS-level)
- **Acces au reseau** (configurable)
- **Execution de commandes systeme** sensibles
- **Acces aux variables d'environnement** systeme

> **Note :** Le sandbox est une isolation active au niveau du systeme d'exploitation, pas une simple prevention passive. Les tentatives de sortie du perimetre sont bloquees par l'OS.

---

## 12. Keybindings et status line

### 12.1 Raccourcis clavier principaux

| Raccourci | Action |
|-----------|--------|
| `Enter` | Envoyer le message |
| `Shift+Enter` | Nouvelle ligne dans le message |
| `Ctrl+C` | Annuler la generation |
| `Esc` | Annuler l'action en cours |
| `Esc+Esc` | Rewind au checkpoint precedent |
| `Shift+Tab` | Basculer en Plan Mode |
| `Tab` | Accepter une suggestion/completion |
| `Up/Down` | Naviguer dans l'historique des prompts |

### 12.2 Status line

La status line en bas de l'interface affiche :

```
┌─────────────────────────────────────────────────┐
│ claude-opus-4-6 │ 23% ctx │ $0.42 │ fast │ plan │
└─────────────────────────────────────────────────┘
   Modele actif    Context   Cout    Mode   Mode
                   utilise   session rapide plan
```

Surveillez le pourcentage de contexte : au-dela de 60%, envisagez `/clear` ou `/compact`.

---

## 13. Formats de sortie

### 13.1 text (defaut)

Sortie en texte brut, lisible par un humain :

```bash
claude -p "Quelle heure est-il ?" --output-format text
# Il est 14h30.
```

### 13.2 json

Sortie structuree en JSON, parseable programmatiquement :

```bash
claude -p "Liste les fichiers TS" --output-format json
```

```json
{
  "type": "result",
  "subtype": "success",
  "cost_usd": 0.003,
  "is_error": false,
  "duration_ms": 1523,
  "duration_api_ms": 1200,
  "num_turns": 1,
  "result": "Voici les fichiers TypeScript..."
}
```

### 13.3 stream-json

Sortie streamee en JSON, une ligne par evenement :

```bash
claude -p "Genere du code" --output-format stream-json
```

Chaque ligne est un objet JSON independant, permettant le traitement en temps reel.

---

## Exercice pratique : Maitriser les patterns (30 min)

### Etape 1 : Prompt engineering (10 min)

Naviguez dans un projet existant et pratiquez differents styles de prompts :

```bash
# 1. Prompt vague (observez la reponse)
> Explique ce projet

# 2. Prompt precis (comparez)
> Explique l'architecture de ce projet en identifiant :
> - Les couches (presentation, business, data)
> - Les patterns utilises
> - Les dependances externes
> Presente le resultat sous forme de tableau

# 3. Prompt avec contrainte
> Identifie les 3 points d'amelioration les plus impactants
> pour la maintenabilite de ce projet. Pour chaque point,
> donne un exemple concret tire du code.
```

### Etape 2 : Plan Mode (10 min)

```bash
# Activez le Plan Mode
> Shift+Tab

# Demandez une modification complexe
> Ajoute un systeme de cache avec invalidation
> pour les endpoints les plus appeles de l'API

# Lisez le plan propose par Claude
# Modifiez-le si necessaire
> Ajoute aussi un endpoint pour vider le cache manuellement

# Validez le plan
> Le plan est bon, implemente-le
```

### Etape 3 : Mode headless (10 min)

```bash
# Prompt simple
claude -p "Combien de fichiers TypeScript dans ce projet ?" --output-format text

# Piping
claude -p "Genere un .gitignore pour un projet Node.js" > .gitignore

# JSON pour parsing
claude -p "Liste les dependances du projet" --output-format json | jq '.result'

# Enchainement
git diff HEAD~1 | claude -p "Resume les changements du dernier commit"
```

---

## Points Cles a Retenir

1. **Prompts = objectifs** : Decrivez le quoi et le pourquoi, laissez Claude gerer le comment
2. **Plan Mode** : Toujours planifier avant d'agir pour les taches complexes (> 3 fichiers)
3. **Context window** : Ressource critique, surveillez le %, utilisez `/clear` et `/compact`
4. **Sub-agents** : Deleguez les explorations pour garder votre contexte propre
5. **Fast Mode** : 2.5x plus rapide pour les taches simples et repetitives
6. **Headless** : `claude -p` pour l'automatisation et l'integration scripts
7. **Sessions** : `--continue` pour reprendre, `--resume` pour une session specifique
8. **/effort** : Ajustez low/medium/high pour controler la profondeur de reflexion et les couts
9. **/context** : Diagnostiquez l'utilisation du contexte pour identifier le gaspillage
10. **/loop** : Automatisez les taches recurrentes (tests, monitoring, conformite)
11. **Rewind** : `Esc+Esc` pour revenir en arriere quand Claude prend une mauvaise direction
12. **Images** : Drag & drop pour le debug UI et l'implementation de maquettes
13. **Iterez** : Ne cherchez pas le prompt parfait, affinez au fur et a mesure

---

> **Prochain module :** [Module 4 - Pratique Guidee](./04-pratique-guidee.md)
