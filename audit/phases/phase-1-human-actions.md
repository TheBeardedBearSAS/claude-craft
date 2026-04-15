# Phase 1 — Actions humaines restantes

> Ces 3 actions ne peuvent pas être automatisées par des agents. Tout le reste (P1-01, 02, 03, 05, 06, 07, 09, 10) est livré en fichiers dans ce commit.

## P1-04 — Envoyer l'email à Anthropic (trademark)

- **Draft prêt** : `audit/legal/anthropic-tos-request.eml`
- **Action** :
  1. Ouvrir le `.eml` dans ton client mail.
  2. Vérifier/ajuster le signature block.
  3. Envoyer à `trademark@anthropic.com` (Cc : `legal@anthropic.com`).
  4. Archiver la réponse dans `audit/legal/anthropic-response-<date>.eml`.
- **DoD** : preuve d'envoi horodatée.

## P1-08 — Cadence release 1/semaine

- **Documenté** : `CONTRIBUTING.md` §"Release Cadence".
- **Action** :
  1. Annoncer publiquement la règle (CHANGELOG + Discord quand il existe).
  2. Respecter la règle à partir de maintenant (dernière release > 7j avant la prochaine, sauf hotfix).
- **DoD** : la dernière release de `main` date de plus de 7 jours quand la suivante sort.

## P1-09 — Créer le serveur Discord

- **Drafts prêts** : `DISCORD.md` (règles), `docs/COMMUNITY.md` (hub).
- **Action** :
  1. Créer le serveur Discord "Claude Craft".
  2. Créer les salons selon `DISCORD.md` (#announcements, #general, #help, #showcase, #contrib, #releases, #random + channels stacks).
  3. Configurer le rôle `@maintainer`, `@contributor`, `@bot`.
  4. Générer un lien d'invitation permanent et remplacer `https://discord.gg/claude-craft` (placeholder) dans :
     - `DISCORD.md`
     - `docs/COMMUNITY.md`
     - `.github/ISSUE_TEMPLATE/config.yml`
     - `README.md` (si ajouté)
  5. Inviter 10 premiers membres (contributeurs historiques, early adopters).
  6. Brancher un webhook GitHub releases → `#releases` (GitHub integration).
- **DoD** :
  - Serveur live, ≥10 membres.
  - Liens `https://discord.gg/claude-craft` remplacés par URL réelle.

## Après ces 3 actions

Re-lancer la validation DoD globale (voir plan `compiled-singing-mist.md` §"Vérification end-to-end") et passer à Phase 2.
