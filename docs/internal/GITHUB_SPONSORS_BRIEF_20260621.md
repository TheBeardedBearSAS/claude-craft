# Brief — GitHub Sponsors : activation et messaging

## Contexte
Le RESEARCH_STRATEGY_PIVOT_20260609.md confirme que le modèle de financement est exclusivement
dons + sponsoring (CHARTER §6). GitHub Sponsors est le levier principal. Il n'est pas encore actif.
Sans Sponsors configuré, le funnel de conversion OSS → donations est fermé.

Ce document est un brief d'activation : ce qu'il faut faire, dans quel ordre, avec quel message.

---

## Étape 1 — Activation (30 min)

**Prérequis :** Compte GitHub @flavien-metivier (déjà existant)

**Actions :**
1. Aller sur `github.com/sponsors/flavien-metivier` → "Get sponsored"
2. Compléter le profil : bio courte (max 200 caractères)
3. Configurer les tiers de don (voir ci-dessous)
4. Activer le bouton "Sponsor" sur le repo TheBeardedBearSAS/claude-craft

**Durée :** ~30 minutes. Revenus disponibles ~48h après validation GitHub.

---

## Étape 2 — Tiers de don recommandés

| Tier | Prix/mois | Label | Proposition de valeur |
|------|-----------|-------|----------------------|
| ☕ Coffee | $5 | One coffee a month | "You use claude-craft. This keeps it alive." |
| 🌟 Supporter | $15 | Regular supporter | "Name in THANKS.md + priority issue response (best effort)" |
| 🏢 Team | $50 | Team using it | "Team shoutout in CHANGELOG + Discord role" |
| 🤝 Company | $150 | Company sponsor | "Logo in README Sponsors section + priority issue" |

**Note :** Ne pas promettre de support SLA ou de features — contraire à la CHARTER.
Les bénéfices proposés (mention, shoutout, rôle Discord) sont symboliques, pas contractuels.

---

## Étape 3 — Messaging GitHub Sponsors (texte de la page)

**Titre :** Sponsoring claude-craft

**Bio (200 car. max) :**
> I build claude-craft — a free, MIT-licensed framework that helps teams adopt Claude Code with discipline. If it saves your team time, a sponsorship helps me keep it going.

**Texte long (section "About") :**

```
claude-craft is an open-source framework (MIT, forever) that adds structure around Claude Code:
BMAD v6 sprint workflow, browser-based QA automation, 31 specialized agents, RTK token optimization.
Free to use, fork, and build on. No commercial edition, ever.

I'm a solo maintainer. Sponsorships directly fund my time to ship features, fix bugs,
and keep the framework aligned with Claude Code's rapid evolution.

If your team has 5+ developers using Claude Code and you've found claude-craft useful —
a company sponsorship ($50-150/month) is the most direct way to support continued maintenance.

Thank you.
— Flavien Métivier (@flavien-metiiver)
```

---

## Étape 4 — Intégration dans le README

Une fois Sponsors activé, ajouter une section minimaliste en bas du README :

```markdown
## Sponsoring

Claude Craft is free, MIT, forever. If your team finds it useful, consider [sponsoring maintenance](https://github.com/sponsors/flavien-metiiver).

[![GitHub Sponsors](https://img.shields.io/github/sponsors/flavien-metiiver?style=flat)](https://github.com/sponsors/flavien-metiiver)
```

Position : avant "Contributing", après "Training & Consulting" (section supprimée — remplace son emplacement).

---

## Étape 5 — Open Collective (optionnel, Q3 2026)

Si GitHub Sponsors atteint $200+/mois : ouvrir Open Collective pour les dons d'entreprise avec facture.
Open Collective génère des reçus fiscaux — nécessaire pour les sponsors corporate.
Threshold : ne pas ouvrir avant d'avoir validé la base de sponsors individuels.

---

## Métriques cibles (90 jours)

| Mois | Sponsors target | Revenue target | Action requise |
|------|----------------|----------------|----------------|
| Mois 1 | 3-5 sponsors | $30-75/mois | Activation + premier post LinkedIn |
| Mois 2 | 10-15 sponsors | $100-200/mois | CTA dans les content drafts + CHANGELOG |
| Mois 3 | 20-30 sponsors | $200-500/mois | Open Collective si atteint |

**Benchmark :** ESLint (~25K stars) : ~$80K/an. Claude-craft cible ~$5-10K/an à terme.
À l'échelle de départ (< 500 stars), $500/mois est réaliste si le produit est utile et le CTA visible.

---

## Ce que ce brief demande au board

Une seule action : **activer GitHub Sponsors sur @flavien-metiiver** (30 min).

Une fois activé, me fournir le lien pour mise à jour des content drafts et du README.

*Brief produit par agent CMO (e8318117) — 2026-06-21*
