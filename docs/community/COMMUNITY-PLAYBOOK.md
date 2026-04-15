# Community Playbook

Guide opérationnel pour la gestion de la communauté Claude Craft : Discord, engagement, modération, croissance.

**Objectifs phase 4 :** 1000+ membres Discord, 100+ contributeurs actifs, NPS >50, temps de réponse <24h.

---

## Structure Discord

### Salons par stack (catégorie STACKS)

| Salon | Description | Rôle auto-assignable |
|-------|-------------|----------------------|
| `#symfony` | Questions, discussions Symfony 8.0+ | @symfony-dev |
| `#react` | React 19.2, Server Components, Compiler | @react-dev |
| `#flutter` | Flutter 3.41, Dart 3.11, BLoC v9 | @flutter-dev |
| `#python` | Python 3.14+, FastAPI, async | @python-dev |
| `#php` | PHP 8.5, Property Hooks, Pest 4 | @php-dev |
| `#laravel` | Laravel 13.x, Actions, Sanctum | @laravel-dev |
| `#angular` | Angular 20+ LTS, Signals, Zoneless | @angular-dev |
| `#vuejs` | Vue 3.5+, Composition API, Pinia | @vuejs-dev |
| `#csharp` | C# 14, .NET 10 LTS, Clean Architecture | @csharp-dev |
| `#reactnative` | React Native 0.85, New Architecture | @reactnative-dev |
| `#go` | Go 1.24+, Clean Architecture patterns | @go-dev |
| `#rust` | Rust 1.85+, async, patterns | @rust-dev |
| `#svelte` | Svelte 5+, Runes, SvelteKit 3 | @svelte-dev |

### Salons par domaine (catégorie COMMUNITY)

| Salon | Description | Mode |
|-------|-------------|------|
| `#announcements` | Releases, news officielles | Read-only (Staff) |
| `#help` | Questions générales, débutants | Public |
| `#showcase` | Projets utilisant Claude Craft | Public |
| `#contrib` | Discussions contributeurs, PRs | Public |
| `#jobs` | Offres d'emploi (1/semaine max) | Modéré |
| `#off-topic` | Discussions hors-sujet | Public |
| `#office-hours` | Annonces sessions live | Read-only (Staff) |

### Salons internes (catégorie STAFF)

| Salon | Rôle requis | Usage |
|-------|-------------|-------|
| `#staff-general` | @Staff | Coordination équipe |
| `#moderation-logs` | @Staff | Actions modération bot |
| `#metrics` | @Staff | KPIs hebdo automatiques |

---

## Rôles et progression

### Hiérarchie

| Rôle | Attribution | Permissions | Couleur |
|------|-------------|-------------|---------|
| **Newcomer** | Automatique (0-7 jours) | Read + write | Gris |
| **Member** | Automatique (>7 jours) | Read + write + react | Blanc |
| **Contributor** | ≥1 PR mergée | + voice priority | Vert |
| **Top Contributor** | ≥10 PR mergées | + threads creation | Bleu |
| **Certified** | Formation officielle complétée | Badge spécial | Or |
| **Partner** | Entreprise partenaire | Badge spécial | Violet |
| **Staff** | Équipe core | Modération | Rouge |
| **Maintainer** | Équipe core tech | Admin | Rouge foncé |

### Auto-assignation rôles stack

Commande `/role` dans `#help` affiche menu réactions → utilisateur sélectionne ses stacks → bot assigne rôles.

---

## Bots

### Statbot (custom)

**Fonctions :**
- Message welcome DM automatique avec quiz intérêts (5 questions : stack préférée, niveau, objectif, timezone, découverte)
- Stats hebdomadaires dans `#metrics` : new members, active members (≥1 message J+7), messages/semaine, top channels, top contributors
- Commande `/stats @user` : contributions (messages, PRs, helping score)

**Config :**
```yaml
welcome_dm:
  enabled: true
  quiz:
    - question: "Quelle stack utilises-tu principalement ?"
      options: ["Symfony", "React", "Flutter", "Python", "PHP", "Laravel", "Angular", "Vue.js", "C#", "React Native", "Go", "Rust", "Svelte", "Autre"]
    - question: "Quel est ton niveau ?"
      options: ["Débutant", "Intermédiaire", "Avancé", "Expert"]
    - question: "Pourquoi rejoins-tu Claude Craft ?"
      options: ["Apprendre", "Contribuer", "Utiliser dans projets", "Recruter", "Networking"]
    - question: "Timezone ?"
      options: ["Europe", "Americas", "Asia", "Other"]
    - question: "Comment as-tu découvert Claude Craft ?"
      options: ["GitHub", "Reddit", "Twitter/X", "Blog", "Bouche-à-oreille", "Autre"]

stats_schedule: "0 9 * * 1"  # Lundi 9h UTC
```

### Mee6

**Fonctions :**
- Anti-spam : max 5 messages/10s, max 3 liens/message
- Auto-modération : détection insultes multilingues (EN/FR/ES/DE/PT)
- Logs modération dans `#moderation-logs`

**Config :**
```yaml
auto_mod:
  spam_protection: true
  max_messages: 5
  time_window: 10s
  max_links: 3
  profanity_filter: true
  languages: ["en", "fr", "es", "de", "pt"]
```

### DiscordBot (custom GitHub sync)

**Fonctions :**
- Annonce releases GitHub dans `#announcements` (format embed avec changelog excerpt)
- Annonce PR mergées dans `#contrib` (avec mention auteur → attribution rôle Contributor automatique)
- Commande `/pr <number>` : affiche statut PR avec preview

**Config :**
```yaml
github:
  repo: TheBeardedCTO/Tools/claude-craft
  events:
    - release.published → #announcements
    - pull_request.merged → #contrib
  auto_role_contributor: true
```

---

## Programme "Month of Contributors"

### Principe

Chaque mois est dédié à une stack différente (cycle 13 mois). Challenges hebdo, office hours, rewards.

### Calendrier 2026

| Mois | Stack | Challenge exemple | Reward |
|------|-------|-------------------|--------|
| Avril | Symfony | Implémenter un ADR Symfony + Doctrine | Badge "Symfony Hero" |
| Mai | React | Créer skill React Server Components | Badge "React Pioneer" |
| Juin | Flutter | Ajouter template BLoC v9 | Badge "Flutter Champion" |
| Juillet | Python | Skill FastAPI + async patterns | Badge "Python Guru" |
| Août | PHP | Skill Property Hooks PHP 8.5 | Badge "PHP Wizard" |
| Septembre | Laravel | Template Laravel 13 + Pest 4 | Badge "Laravel Master" |
| Octobre | Angular | Skill Signals + Zoneless | Badge "Angular Ace" |
| Novembre | Vue.js | Skill Composition API patterns | Badge "Vue Virtuoso" |
| Décembre | C# | Template Clean Architecture .NET 10 | Badge "C# Craftsman" |
| Janvier | React Native | Skill New Architecture + TurboModules | Badge "RN Expert" |
| Février | Go | Clean Architecture Go patterns | Badge "Gopher" |
| Mars | Rust | Skill async Rust patterns | Badge "Rustacean" |
| Avril | Svelte | Skill Svelte 5 Runes | Badge "Svelte Ninja" |

### Office hours

**Format :** Zoom ou Discord Stage, 1h, chaque vendredi du mois à 18h CET.

**Agenda :**
- 15 min : présentation challenge de la semaine
- 30 min : live coding / Q&A
- 15 min : showcase contributions de la semaine

**Enregistrement :** publié sur YouTube après (playlist "Month of Contributors").

### Rewards

| Action | Reward |
|--------|--------|
| Participation challenge | Badge Discord du mois |
| Top 3 contributeurs mois | Mention AUTHORS.md + sticker pack |
| Top 1 contributeur mois | T-shirt Claude Craft + recommandation LinkedIn |
| ≥25 PR sur l'année | Hoodie Claude Craft + invitation retreat annuel |

---

## Modération

### Charte communautaire

Référence : **Contributor Covenant 2.1** (voir `docs/community/CODE_OF_CONDUCT.md`).

**Principes :**
- Respect, bienveillance, inclusion
- Pas de harcèlement, discrimination, spam
- Pas de contenu NSFW, politique, religieux
- Pas de self-promotion excessive (max 1 message/semaine dans `#jobs` ou `#showcase`)

### 3-strikes policy

| Strike | Action | Durée |
|--------|--------|-------|
| 1 | Warning DM + log | - |
| 2 | Mute 24h + log | 24h |
| 3 | Ban permanent + report Discord Trust & Safety | Permanent |

**Exceptions :** harcèlement, doxxing, contenu illégal → ban immédiat sans warning.

### Shadow ban automatique

Bot détecte >3 liens dans un message → suppression automatique + DM warning.

### Escalation path

1. Incident signalé (`/report` ou message Staff)
2. Staff review <24h
3. Décision collégiale (≥2 Staff)
4. Action + DM utilisateur avec explication
5. Log dans `#moderation-logs`

---

## Onboarding

### Message welcome DM

```
Bienvenue sur le serveur Discord de Claude Craft ! 👋

Claude Craft est un framework multi-stack pour développement assisté par IA avec Claude Code.

📌 Étapes recommandées :
1. Lis les règles dans #announcements
2. Présente-toi dans #help (stack, niveau, objectifs)
3. Assigne-toi des rôles stack avec /role
4. Pose tes questions ou partage tes projets !

💡 Ressources :
- Documentation : https://claude-craft.dev
- Guide démarrage : https://claude-craft.dev/docs/QUICKSTART
- Contribuer : https://claude-craft.dev/docs/CONTRIBUTING

🎯 Objectif : Aide-nous à atteindre 1000 membres actifs et 100 contributeurs !

Questions ? Ping @Staff dans #help.

Bon code ! 🚀
```

### Quiz intérêts

Voir config Statbot ci-dessus. Résultats stockés dans Airtable pour segmentation newsletters.

### Auto-assignation rôle stack

Commande `/role` dans n'importe quel salon → affiche menu avec réactions emoji par stack → bot assigne rôle correspondant.

---

## KPIs hebdomadaires

### Métriques suivies

| Métrique | Cible phase 4 | Source |
|----------|---------------|--------|
| **New members** | +50/semaine | Statbot |
| **Active members (J+7)** | 30% des new | Statbot |
| **Messages/semaine** | 500+ | Statbot |
| **PR externes** | 10+/mois | GitHub API |
| **Threads créés** | 20+/semaine | Discord API |
| **Rétention M+1** | >50% | Statbot |
| **NPS trimestriel** | >50 | Typeform sondage |

### Dashboard

Tableau de bord Grafana (datasource Discord API + GitHub API) :
- Graphes croissance membres, messages, PRs
- Top channels par activité
- Top contributors par helping score
- Funnel onboarding (welcome → first message → first PR)

### Alerte

Si métrique <80% cible pendant 2 semaines consécutives → Staff meeting pour action corrective.

---

## Templates

### Message welcome (DM)

Voir section Onboarding ci-dessus.

### Announce release

```
📢 **Claude Craft v{VERSION} is out!**

{EMOJI} **Highlights:**
- {FEATURE_1}
- {FEATURE_2}
- {FEATURE_3}

📖 Full changelog: https://github.com/TheBeardedCTO/Tools/claude-craft/releases/tag/v{VERSION}

⬆️ Update: `npm update @the-bearded-bear/claude-craft`

Questions? #help | Feedback? #contrib

{EMOJI} Happy coding!
```

### Office hour invite

```
🎓 **Office Hour: {STACK} Month of Contributors**

📅 {DATE} at 18:00 CET
🎯 Topic: {TOPIC}
👤 Host: {HOST_NAME}

📌 Agenda:
- Challenge de la semaine: {CHALLENGE}
- Live coding: {DEMO}
- Q&A

🔗 Zoom link: {LINK}

📹 Session enregistrée et publiée sur YouTube après.

See you there! 🚀
```

---

## Crise management

### Protocole incident communautaire

| Type incident | Actions immédiates | Suivi |
|---------------|-------------------|-------|
| **Harcèlement** | Ban auteur + support victime (DM) + report Discord Trust & Safety | Incident report interne + review policy |
| **Leak données sensibles** | Suppression message + rotation secrets si nécessaire | Post-mortem + review permissions |
| **Spam massif** | Shadow ban automatique + review bot config | Renforcement anti-spam |
| **Raid externe** | Lockdown serveur (invites désactivées) + cleanup + report | Review onboarding flow |
| **Conflit entre membres** | Médiation Staff (DM privé) | Warning si escalade |

### Communication crise

- Annonce transparente dans `#announcements` si impact >50 membres
- Post-mortem publié dans `#contrib` sous 7 jours
- Actions correctives trackées dans GitHub issue

---

## Ressources

- **Contributor Covenant 2.1:** https://www.contributor-covenant.org/version/2/1/code_of_conduct/
- **Discord Community Guidelines:** https://discord.com/guidelines
- **Statbot source code:** `tools/discord-bot/statbot/`
- **DiscordBot GitHub sync:** `tools/discord-bot/github-sync/`

---

**Date de dernière mise à jour :** 2026-04-15  
**Version :** 1.0.0  
**Auteur :** The Bearded CTO
