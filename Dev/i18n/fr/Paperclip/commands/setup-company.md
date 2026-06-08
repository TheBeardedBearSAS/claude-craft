---
description: Initialiser une nouvelle entreprise Paperclip (onboarding + premier agent)
argument-hint: [nom-entreprise]
---

# Initialiser une nouvelle entreprise Paperclip

## Arguments

1. `company-name` (requis) — nom court et descriptif (ex. "Acme Labs")

## MISSION

Guider un opérateur à travers l'onboarding : installer, créer l'instance, initialiser le compte opérateur initial, créer l'entreprise via l'UI, et exécuter le premier agent avec l'adaptateur `claude-local`.

> Le vrai CLI `paperclipai` (v2026.529.0) n'expose **pas** de commande `companies create`. La création d'entreprise se fait soit via le tableau de bord, soit en important un package avec `paperclipai company import`. Ne pas inventer de flags qui n'existent pas — ouvrir `paperclipai company --help` et suivre ce qui est là.

## Procédure

### 1. Préconditions

- [ ] Node.js 20+ et pnpm 9.15+ installés
- [ ] PostgreSQL accessible **OU** accepter le Postgres embarqué pour le dev local
- [ ] Port 3100 disponible (ou définir `PORT`)

### 2. Installer & onboarder

Chemin le plus rapide :

```bash
npx paperclipai onboard --yes
```

Ou depuis un checkout :

```bash
git clone https://github.com/paperclipai/paperclip.git
cd paperclip
pnpm install
pnpm dev
```

Le tableau de bord par défaut est à `http://localhost:3100` (ou quel que soit le `PORT` que vous avez défini).

### 3. Vérification de diagnostic

```bash
paperclipai doctor
# ou, pour tenter des réparations auto :
paperclipai doctor --repair --yes
```

Corriger tout ce qui est rapporté comme échec dur avant de continuer.

### 4. Initialiser le premier opérateur (CEO)

```bash
paperclipai auth-bootstrap-ceo
```

Cela crée le compte opérateur initial utilisé pour se connecter au tableau de bord. **Révoquer ou faire tourner** après que l'onboarding soit terminé.

### 5. Créer l'entreprise

Il n'y a pas de commande CLI pour créer une entreprise de zéro. Deux chemins supportés :

**A — Tableau de bord (recommandé pour les utilisateurs novices) :**
- Se connecter à `http://localhost:3100` avec l'opérateur bootstrap
- **Entreprises → Nouvelle** → définir le nom "$1" et un slug d'URL

**B — Importer depuis un package préparé :**
```bash
paperclipai company import --target new --new-company-name "$1" chemin/vers/company.pcpkg
```

Dans tous les cas, noter le `companyId` retourné.

### 6. Lister les entreprises pour confirmer

```bash
paperclipai company list
paperclipai company get --id <companyId>
```

### 7. Vérifier la disponibilité de l'adaptateur

Paperclip est livré avec des adaptateurs intégrés (observés v2026.529.0) :
`claude_local`, `codex_local`, `cursor_local`, `gemini_local`, `opencode_local`, `openclaw_gateway`, `pi_local`.

Ils s'enregistrent eux-mêmes dans le registre d'adaptateurs du serveur au démarrage. Utiliser le tableau de bord (ou les routes `/companies/:companyId/adapters/:type/...`) pour confirmer que celui que vous voulez est présent et répond.

### 8. Embaucher le premier agent

Paperclip n'embauche **pas** d'agents depuis un fichier YAML via CLI (à la v2026.529.0). Embaucher un agent :

- **Via le tableau de bord** : **Agents → Embaucher** avec l'adaptateur `claude_local`, choisir un modèle, définir un budget, assigner un objectif.
- **Via l'API HTTP** : `POST /companies/:companyId/agents` (authentifié). Champs : `adapterType`, config spécifique à l'adaptateur, métadonnées de l'agent. Voir `server/src/routes/agents.ts` pour la forme autoritaire.

Après l'embauche, l'inspecter :

```bash
paperclipai agent list
paperclipai agent get --id <agentId>
```

### 9. Boîte de réception des approbations

Tester les approbations :

```bash
paperclipai approval list
# quand une requête est en attente :
paperclipai approval approve --id <approvalId>
# ou rejeter / demander-révision / commenter
paperclipai approval reject --id <approvalId> --reason "<raison courte>"
```

### 10. Optionnel — installer un plugin

```bash
paperclipai plugin list
paperclipai plugin examples     # voir les exemples échafaudés
paperclipai plugin install <package>
paperclipai plugin inspect <pluginKey>
paperclipai plugin enable <pluginKey>
```

### 11. Activité & audit

```bash
paperclipai activity list
# filtrer par entreprise, plage de dates, etc.
```

### 12. Documenter localement

Créer un répertoire `.paperclip/` local au dépôt avec des notes opérateur non secrètes :

```
.paperclip/
├── README.md           # qui se connecte, comment le premier agent a été embauché
└── runbook.md          # kill-switch, désactivation de plugin, procédures d'export
```

Le commiter. **Ne jamais commiter de secrets, `.env`, ou le `BETTER_AUTH_SECRET`.**

## Checklist post-configuration

- [ ] Tableau de bord accessible et l'opérateur CEO peut se connecter
- [ ] `paperclipai doctor` entièrement vert
- [ ] Entreprise visible dans `paperclipai company list`
- [ ] Adaptateur cible (`claude_local` ou similaire) enregistré et répond
- [ ] Premier agent embauché et produisant de l'activité
- [ ] Flux d'approbations testé de bout en bout
- [ ] `.paperclip/` commité sans secrets

## Sortie

Rapport : ID d'entreprise, adaptateur(s) disponible(s), ID du premier agent, URL du tableau de bord, et les commandes CLI exactes qui ont fonctionné. Lien vers https://docs.paperclip.ing/foundation/quickstart pour les suivis.
