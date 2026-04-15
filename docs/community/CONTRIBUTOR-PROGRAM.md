# Contributor Program

Programme structuré pour onboarder, accompagner et retenir les contributeurs externes. Objectif phase 4 : 100+ contributeurs actifs, bus factor >10.

---

## Good first issues

### Quota permanent : 50 actives

**Stratégie :** maintenir en permanence 50 issues labellisées `good-first-issue`, réparties sur toutes les stacks et domaines.

### Répartition cible

| Catégorie | Quota | Exemples |
|-----------|-------|----------|
| **Documentation** | 10 | Traduire guide, corriger typo, ajouter exemple |
| **Tests** | 10 | Ajouter test unitaire manquant, augmenter couverture |
| **Templates** | 8 | Créer template projet pour nouvelle stack |
| **Skills** | 8 | Ajouter skill manquant (ex: AWS Lambda, Terraform) |
| **Agents** | 6 | Améliorer agent existant, ajouter commande |
| **Bugs mineurs** | 8 | Corriger typo code, fix warning linter |

### Auto-refill via CI bot

**Mécanisme :** GitHub Action hebdomadaire (lundi 9h UTC) qui :
1. Compte issues `good-first-issue` ouvertes
2. Si <50 → crée issues depuis backlog pré-approuvé (fichier `backlog/good-first-issues.yml`)
3. Assigne labels appropriés + stack + priority

**Config :**
```yaml
# .github/workflows/refill-good-first-issues.yml
name: Refill Good First Issues

on:
  schedule:
    - cron: '0 9 * * 1'  # Lundi 9h UTC
  workflow_dispatch:

jobs:
  refill:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Count good-first-issue
        id: count
        run: |
          count=$(gh issue list --label "good-first-issue" --state open --json number | jq length)
          echo "count=$count" >> $GITHUB_OUTPUT
      - name: Create issues from backlog
        if: steps.count.outputs.count < 50
        run: |
          needed=$((50 - ${{ steps.count.outputs.count }}))
          node scripts/create-issues-from-backlog.js $needed
```

### Monitoring quota

Dashboard Grafana affiche :
- Nombre good-first-issues ouvertes (cible : 50)
- Taux de prise en charge (<7 jours : >70%)
- Taux de complétion (<30 jours : >60%)

---

## Parcours contributeur

### Étapes

```
Découverte
  ↓
First PR (good-first-issue)
  ↓
≥5 PR → Contributor (badge Discord + mention AUTHORS.md)
  ↓
≥10 PR → Top Contributor (swag + mentorship access)
  ↓
Invitation Maintainer (vote Staff + acceptance criteria)
```

### Acceptance criteria Maintainer

- ≥25 PR mergées de qualité (dont ≥5 complexes)
- Relectures PR régulières (≥10 reviews approfondies)
- Présence communauté Discord (helping score >100)
- Adhésion vision projet (entretien Staff)
- Disponibilité ≥5h/semaine

**Process invitation :**
1. Proposition Staff dans `#staff-general`
2. Vote (unanimité requise)
3. Entretien candidat (fit culturel + expectations)
4. Onboarding Maintainer (accès repos, Discord admin, process décision)

---

## Mentorship program

### Principe

Top Contributors parrainent newbies (contributeurs <5 PR) en binômes 1:1 pendant 3 mois.

### Format

- **Kick-off :** appel 30 min pour définir objectifs (ex: "Ajouter 3 skills Terraform", "Améliorer couverture tests React")
- **Suivi :** 1 appel/mois + échanges async Discord DM
- **Livrables attendus :** ≥3 PR mergées sur la période

### Bénéfices

| Rôle | Bénéfices |
|------|-----------|
| **Mentor** | Badge "Mentor" Discord, mention AUTHORS.md, invitation retreat annuel |
| **Mentee** | Accélération progression, feedback direct, réseau |

### Matching

Statbot match automatiquement selon :
- Stack commune (prioritaire)
- Timezone compatible (≤3h décalage)
- Disponibilité déclarée

### Métriques

- Taux complétion programme (cible : >80%)
- NPS mentees (cible : >60)
- Rétention mentees M+6 (cible : >70%)

---

## Rewards

### Badges Discord

| Badge | Critère | Couleur |
|-------|---------|---------|
| Contributor | ≥1 PR mergée | Vert |
| Top Contributor | ≥10 PR mergées | Bleu |
| Mentor | Participe mentorship program | Violet |
| Champion | Top 3 Month of Contributors | Or |
| Maintainer | Invitation équipe core | Rouge |

### Mention AUTHORS.md

**Policy :** ajout automatique dès la première PR mergée.

**Format :**
```markdown
## Contributors

Merci à tous nos contributeurs ! 🎉

<!-- ALL-CONTRIBUTORS-LIST:START -->
- [@username](https://github.com/username) - 42 PRs (Symfony, React) - Top Contributor
- [@contributor2](https://github.com/contributor2) - 5 PRs (Python, Tests)
<!-- ALL-CONTRIBUTORS-LIST:END -->
```

**Gouvernance :** liste générée automatiquement par `all-contributors` bot, mise à jour à chaque PR mergée.

### Swag

| Niveau | Reward | Coût estimé | Logistique |
|--------|--------|-------------|------------|
| **≥5 PR** | T-shirt Claude Craft | 15€ | Printful dropshipping |
| **≥25 PR** | Hoodie Claude Craft | 35€ | Printful dropshipping |
| **Top 3 Month of Contributors** | Sticker pack | 5€ | StickerMule |
| **Maintainer** | Invitation retreat annuel | Variable | Staff organise |

**Budget annuel estimé :** 5K€ (100 contributeurs × 50€/an moyenne).

### Recommandation LinkedIn

Top Contributors (≥10 PR) peuvent demander recommandation LinkedIn par Maintainer. Template pré-approuvé :

```
J'ai eu le plaisir de collaborer avec {NAME} sur le projet open-source Claude Craft. {NAME} a contribué {N} pull requests de qualité, démontrant une excellente maîtrise de {STACK} et une capacité à travailler en équipe distribuée.

Je recommande vivement {NAME} pour tout rôle nécessitant {SKILLS}.
```

### Accès beta features

Top Contributors ont accès anticipé (J-7) aux nouvelles fonctionnalités avant release publique (branche `beta`).

---

## AUTHORS.md

### Policy inclusion

**Critère :** ≥1 PR mergée (code, docs, tests, skills, templates).

**Exclusions :** typo <5 mots, PR spam, contributions violant Code of Conduct.

### Gouvernance

**Ajout :** automatique via `all-contributors` bot.

**Retrait :** uniquement si violation grave Code of Conduct (vote unanime Staff).

**Ordre :** par nombre de contributions décroissant, puis alphabétique.

---

## CLA vs DCO

### Choix : DCO (Developer Certificate of Origin)

**Rationale (phase 1) :** simplicité, pas de signature CLA lourde, compatible contribution spontanée.

**Référence :** https://developercertificate.org/

### Process signature

**Méthode :** flag `--signoff` sur commit Git.

```bash
git commit --signoff -m "feat(symfony): add ADR template"
```

**Vérification :** CI vérifie présence ligne `Signed-off-by:` dans tous les commits de la PR. Si manquante → PR bloquée + commentaire bot avec instructions.

**Template commentaire bot :**
```
⚠️ Missing DCO sign-off

This PR contains commits without a DCO sign-off. Please add it:

git commit --amend --signoff
git push --force-with-lease

Or for all commits:
git rebase HEAD~N --signoff
git push --force-with-lease

See https://developercertificate.org/ for details.
```

---

## PR template

### Checklist auto-review

Template `.github/PULL_REQUEST_TEMPLATE.md` :

```markdown
## Description

<!-- Décris les changements apportés -->

## Type de changement

- [ ] Bug fix (non-breaking change qui corrige un bug)
- [ ] Nouvelle fonctionnalité (non-breaking change qui ajoute une fonctionnalité)
- [ ] Breaking change (correction ou fonctionnalité qui modifie le comportement existant)
- [ ] Documentation uniquement

## Impact

- [ ] Aucune stack spécifique
- [ ] Symfony
- [ ] React
- [ ] Flutter
- [ ] Python
- [ ] PHP
- [ ] Laravel
- [ ] Angular
- [ ] Vue.js
- [ ] C#
- [ ] React Native
- [ ] Go
- [ ] Rust
- [ ] Svelte

## Tests

- [ ] Tests unitaires ajoutés/mis à jour
- [ ] Tests d'intégration ajoutés/mis à jour
- [ ] Tests manuels effectués
- [ ] Couverture ≥80% maintenue

## Checklist

- [ ] Code suit les conventions du projet (linter passe)
- [ ] Documentation mise à jour (README, guides, CHANGELOG)
- [ ] Commits signés DCO (--signoff)
- [ ] PR liée à une issue (closes #XXX)
- [ ] Self-review effectuée
- [ ] Screenshots/vidéos si changement UI

## Reviewers

<!-- Tag 1-2 reviewers pertinents -->
```

### Validation CI

CI bloque merge si :
- Checklist "Tests" incomplète
- Linter échoue
- Couverture <80%
- DCO manquant

---

## Review SLA

### Engagements

| Métrique | Cible | Action si dépassement |
|----------|-------|----------------------|
| **First response** | <48h | Notification Staff si >72h |
| **Merge PR <200 lignes** | <7j | Escalation Maintainer si >10j |
| **Merge PR >200 lignes** | <14j | Découpage recommandé |

### Process review

1. **Triage** (bot) : assigne reviewer selon `CODEOWNERS` + stack impact
2. **First response** (<48h) : reviewer commente ou approuve
3. **Itération** : auteur applique suggestions
4. **Approval** : ≥1 Maintainer approve
5. **Merge** : squash and merge (historique propre)

### Priorités

| Label | SLA first response | SLA merge |
|-------|-------------------|-----------|
| `priority-critical` | <12h | <48h |
| `priority-high` | <24h | <5j |
| `priority-medium` | <48h | <7j |
| `priority-low` | <72h | <14j |

---

## Contributor Covenant 2.1

### Référence

Texte complet : `docs/community/CODE_OF_CONDUCT.md`

**Résumé principes :**
- Respect, bienveillance, inclusion
- Pas de harcèlement, discrimination, spam
- Confidentialité respectée
- Représentation honnête du projet

### Escalation path

1. **Incident signalé** : email conduct@claude-craft.dev ou DM Staff Discord
2. **Review** (<48h) : Staff examine preuves
3. **Décision** (≥2 Staff, unanimité si ban) : warning, mute, ban
4. **Communication** : DM privé auteur + victime + log public anonymisé si ban
5. **Appel** : possible sous 7j via email (review par CTO final)

---

## Métriques contributeurs

### Bus factor

**Définition :** nombre de personnes qui peuvent être "écrasées par un bus" avant que le projet soit bloqué.

**Cible phase 4 :** >10 (actuellement ~3).

**Mesure :** nombre de Maintainers actifs (≥1 PR/mois).

### PR externes/mois

**Cible phase 4 :** 40+ PR externes/mois (100 contributeurs × 40% actifs × 1 PR/mois).

**Suivi :** dashboard Grafana, alerte si <30/mois pendant 2 mois.

### Diversité reviewers

**Métrique :** nombre de reviewers distincts sur les 30 dernières PRs.

**Cible :** ≥8 reviewers distincts (éviter concentration sur 1-2 personnes).

### Rétention

| Période | Métrique | Cible |
|---------|----------|-------|
| **M+3** | % contributeurs avec ≥1 PR à M+3 | >50% |
| **M+6** | % contributeurs avec ≥1 PR à M+6 | >30% |
| **M+12** | % contributeurs avec ≥1 PR à M+12 | >20% |

**Actions si <cible :** sondage NPS, amélioration onboarding, incentives.

---

## Ressources

- **All-Contributors Spec:** https://allcontributors.org/
- **DCO:** https://developercertificate.org/
- **Contributor Covenant:** https://www.contributor-covenant.org/
- **GitHub CODEOWNERS:** https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners

---

**Date de dernière mise à jour :** 2026-04-15  
**Version :** 1.0.0  
**Auteur :** The Bearded CTO
