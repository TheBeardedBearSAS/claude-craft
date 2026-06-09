# Charte de Gouvernance Claude Craft

**Version :** 1.0.0  
**Date :** 15 avril 2026  
**Statut :** Adopté

## 1. Préambule

La présente Charte de Gouvernance définit les principes et engagements qui garantissent la pérennité du projet Claude Craft en tant que logiciel libre et la confiance de sa communauté. Elle protège contre toute dérive de type "bait-and-switch" où un projet open-source serait progressivement vidé de ses fonctionnalités au profit d'une version fermée.

## 2. Garantie MIT Perpétuelle

Claude Craft restera sous **licence MIT à perpétuité**. Cette licence ne sera **jamais révoquée ni remplacée** par une licence plus restrictive. Les contributions passées et futures au dépôt public `claude-craft` sont et resteront sous MIT.

**Engagement ferme :** L'intégralité du projet est et demeurera open-source MIT. Il n'existe **aucune** édition commerciale, enterprise ou propriétaire, et aucune fonctionnalité ne sera jamais retirée de l'open-source au profit d'une telle édition.

## 3. Périmètre 100 % Open-Source

Claude Craft est un projet **entièrement open-source MIT**, sans modèle open-core ni édition fermée :

- **`claude-craft` (MIT, public)** : Framework complet — BMAD, 10 stacks, skills, agents, CLI, QA Recette, plugin system, marketplace public. Tout est inclus.
- **Aucune édition propriétaire** : pas de version Enterprise payante, pas de fonctionnalités exclusives derrière une licence commerciale. Toute fonctionnalité développée pour le projet est publiée sous MIT.

**Principe :** un développeur, une équipe ou une entreprise peut utiliser, modifier et redistribuer Claude Craft en production sans aucune restriction ni coût de licence.

## 4. Gouvernance du Projet

### 4.1 Maintainers

Les mainteneurs du projet sont :

- **Flavien Métivier** (@flavien-metiiver) — Mainteneur principal, auteur original
- **The Bearded Bear SAS** — Entité légale sponsor

Après atteinte de **10 contributeurs core** (≥ 10 PR acceptées chacun), un **Comité Consultatif** sera créé avec 3-5 membres élus par la communauté pour un mandat de 12 mois renouvelable.

### 4.2 Processus de Décision

**Décisions ordinaires** (features, bugfixes, refactoring) : consensus des maintainers via GitHub Issues ou Discussions. En cas de désaccord, vote majoritaire des maintainers.

**Décisions stratégiques** (changement de licence, modification de la Charte, fusion de repos) : requièrent :
- Approbation de **2/3 des maintainers**
- RFC (Request for Comments) publié 30 jours avant la décision finale
- Consultation du Comité Consultatif (s'il existe)

### 4.3 RFC (Request for Comments)

Toute décision majeure impactant l'architecture, la roadmap ou la gouvernance doit passer par un RFC publié dans `docs/rfc/`. Format :

- Contexte et problème
- Proposition
- Alternatives considérées
- Impact sur la communauté
- Période de commentaires (minimum 14 jours)

## 5. Protection Contre le Bait-and-Switch

### 5.1 Transparence Totale

Toute évolution susceptible d'affecter le caractère 100 % open-source du projet sera annoncée publiquement avec un RFC 30 jours avant implémentation, et reste soumise à la garantie MIT perpétuelle (§2) et à la clause de non-relicenciement (§10).

### 5.2 Fork-Friendly

Le projet MIT reste **fork-friendly** : architecture modulaire, documentation exhaustive, zéro dépendance cachée vers des services propriétaires. Un fork communautaire doit pouvoir démarrer sans obstacle technique.

### 5.3 Audit Annuel de Conformité

Chaque année, un rapport public `GOVERNANCE-REPORT.md` sera publié, incluant :

- Liste des fonctionnalités ajoutées au projet
- Nombre de contributeurs core et externes
- Budget du projet (dons, sponsoring open-source)
- Décisions stratégiques prises l'année écoulée

## 6. Financement

Le projet est financé exclusivement par des **dons et du sponsoring open-source** (ex. : GitHub Sponsors, Open Collective). Aucune fonctionnalité n'est monétisée et il n'existe aucune édition payante.

Les fonds collectés servent à :

1. Financer l'infrastructure (CI/CD, serveurs de test, hosting marketplace)
2. Sponsoriser des événements et hackathons communautaires
3. Financer des audits de sécurité tiers

**Engagement :** la totalité des fonds est réinvestie dans le projet open-source ; leur usage est documenté dans `GOVERNANCE-REPORT.md`.

## 7. Droit de Fork et Succession

### 7.1 Droit de Fork

Toute personne ou entité peut forker `claude-craft` sous MIT sans restriction. Si un fork atteint une traction significative (≥ 50% des commits du repo original sur 6 mois), les mainteneurs s'engagent à faciliter la transition de gouvernance si la communauté le demande.

### 7.2 Succession des Mainteneurs

En cas d'indisponibilité prolongée (> 6 mois) d'un mainteneur principal sans délégation explicite, le Comité Consultatif peut proposer un nouveau mainteneur par vote 2/3.

## 8. Modification de la Charte

Toute modification de la présente Charte requiert :

- RFC publié 30 jours avant vote
- Approbation 2/3 des mainteneurs
- Approbation 2/3 du Comité Consultatif (si constitué)
- Aucune opposition de > 10% des contributeurs core (sondage GitHub Discussions)

Les modifications triviales (corrections typographiques, clarifications sans changement de fond) peuvent être approuvées par consensus simple.

## 9. Résolution des Conflits

En cas de désaccord persistant entre mainteneurs ou avec la communauté, un **médiateur externe** sera nommé (membre reconnu de la communauté open-source française ou européenne, sans conflit d'intérêts). Sa recommandation sera suivie sauf rejet unanime des mainteneurs.

## 10. Clause de Non-Relicenciement

Les versions publiées de `claude-craft` sous MIT ne peuvent **jamais** être relicenciées rétroactivement. Seules les nouvelles versions futures pourraient théoriquement changer de licence, mais un tel changement requiert le processus de modification de Charte (§8) et serait une **décision stratégique exceptionnelle** soumise à RFC 60 jours.

## 11. Contact et Transparence

- **Gouvernance et questions légales :** governance@thebeardedcto.com
- **Discussions communautaires :** GitHub Discussions, Discord #governance
- **RFC :** `docs/rfc/` dans le dépôt principal

---

**Adopté le :** 15 avril 2026  
**Signataire initial :** Flavien Métivier, au nom de The Bearded Bear SAS

*Cette Charte est elle-même sous licence CC BY-SA 4.0 et peut être forkée/adaptée par d'autres projets open-source.*
