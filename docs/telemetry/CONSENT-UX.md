# Télémétrie — UX de consentement (opt-in strict)

> **Status** : DRAFT P3-30. À implémenter dans `cli/src/commands/init.ts` + `cli/src/telemetry/consent.ts`.
> **Principes** : RGPD strict, opt-in explicite, révocable à tout moment, résidence données UE.

## Où/Quand demander le consentement

Au **premier run** de `claude-craft` (quelle que soit la commande), si `~/.claude/telemetry.json` n'existe pas OU `consentedAt === null`, afficher :

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Claude Craft — Télémétrie optionnelle
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Pour améliorer Claude Craft, nous aimerions collecter :

  ✓ Commandes exécutées (ex: /team:audit)
  ✓ Erreurs (stack traces anonymisées)
  ✓ OS + version Node.js

Nous ne collectons PAS :

  ✗ Votre code source
  ✗ Vos prompts ni les réponses Claude
  ✗ Paths fichiers, email, nom
  ✗ Clés API ni secrets

  → Hébergement : Posthog EU + Sentry EU (résidence UE)
  → Rétention : 12 mois max
  → Révocable : claude-craft telemetry off
  → Détails : https://claude-craft.dev/privacy

Choisissez :

  [A] Accept — me permet d'aider à améliorer l'outil
  [D] Decline — aucune donnée envoyée (choix par défaut)
  [R] Remind later — me redemander plus tard

Votre choix [A/D/R] : _
```

## Comportement

| Choix | Effet |
|---|---|
| `A` (Accept) | `enabled: true`, `consentedAt: <now>`, `anonymousId: <uuidv4>` |
| `D` (Decline) | `enabled: false`, `consentedAt: <now>`, écrit pour ne plus redemander |
| `R` (Remind later) | ne rien écrire, redemander au prochain run |
| Timeout 30s sans réponse | équivalent `D` |
| TTY absent (CI) | équivalent `D`, aucun prompt |

## Override par variable d'environnement

```bash
# Désactivation forcée (CI, utilisateurs réticents)
export CLAUDE_CRAFT_TELEMETRY=off

# Activation forcée (dogfooding interne)
export CLAUDE_CRAFT_TELEMETRY=on
```

Quand `CLAUDE_CRAFT_TELEMETRY` est définie, le prompt est **totalement sauté** et la valeur est prioritaire sur `telemetry.json`.

## Commandes de gestion

```bash
# Statut actuel
claude-craft telemetry status

# Activer
claude-craft telemetry on

# Désactiver
claude-craft telemetry off

# Voir les données envoyées (debug)
claude-craft telemetry debug

# Tout effacer (droit à l'oubli RGPD Art. 17)
claude-craft telemetry purge
# → Envoie un signal purge au provider + efface local
```

## Implémentation technique

- **Posthog** : SDK `posthog-node`, `apiHost: 'https://eu.posthog.com'`, queue+retry+flush on exit
- **Sentry** : SDK `@sentry/node`, DSN configuré Sentry EU, `beforeSend` hook pour PII scrubbing
- **anonymousId** : UUID v4 stocké localement, jamais réutilisé entre machines
- **Redaction** : regex + path normalization avant envoi
- **Offline** : échecs réseau silencieux, pas de retry agressif (éviter de ralentir CLI)

## Dashboard public

`stats.claude-craft.dev` affiche (WAU = Weekly Active Users) :

- WAU (courbe 90j)
- Top 10 commands exécutées (anonymisées)
- Taux erreur par command
- Version adoption distribution

Site statique regénéré chaque jour depuis Posthog API.

## Checklist DoD P3-30

- [ ] `telemetry.json.template` commité (ce repo)
- [ ] CLI `telemetry status/on/off/purge` implémenté
- [ ] Prompt UX premier run implémenté
- [ ] PII scrubbing patterns testés (unit tests)
- [ ] Posthog EU account provisioned
- [ ] Sentry EU account provisioned
- [ ] Dashboard `stats.claude-craft.dev` live
- [ ] `PRIVACY.md` mis à jour section télémétrie
- [ ] Audit interne "zéro PII envoyée" sur 100 events réels
