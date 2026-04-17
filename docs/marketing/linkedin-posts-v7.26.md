# Claude-Craft v7.25 + v7.26 — Post LinkedIn

**Post unique** | **Langue** : Français | **Date cible** : semaine du 14 avril 2026

---

## Texte du post

43 versions de Claude Code en une nuit. Et 55% de tokens en moins pour les utiliser.

Claude-Craft v7.25 et v7.26 sont sorties. Une double release qui couvre 6 semaines d'évolution de Claude Code et transforme la façon dont vous consommez vos tokens.

-- Compatibilité massive (v7.25) --

43 nouvelles versions de Claude Code documentées. De la v2.1.63 à la v2.1.105, chaque feature, chaque breaking change, chaque CVE.

Ce que ça débloque :
- Auto Mode : un classificateur IA qui décide automatiquement quelles opérations sont sûres. Fini le "Allow/Deny" en boucle
- MCP Tool Search : chargement paresseux des outils MCP. 95% de réduction de consommation contexte
- 8 nouveaux hooks : PostCompact, FileChanged, PermissionDenied... Le système d'événements devient complet
- Agent frontmatter : contrôlez effort, maxTurns et disallowedTools par agent
- 7 CVE corrigées (v2.1.97-v2.1.101) + sandboxing des sous-processus par namespace PID

Version recommandée : 2.1.105. Minimum sécurité : 2.1.97.

-- Optimisation tokens (v7.26) --

Une commande : `/common:setup-rtk`

Elle configure en une fois :
- RTK (Rust Token Killer) : proxy CLI qui compresse les outputs. 60-90% d'économies sur les commandes dev
- PostToolUse hooks : filtre automatiquement les outputs > 50KB (Bash, Grep, Glob) avant que Claude ne les traite
- PreCompact hook : préserve votre contexte critique avant compaction
- Sub-agent model : vos sous-agents tournent sur Sonnet au lieu d'Opus. -40% de coût sans perte de qualité

Mais le vrai travail, c'est sous le capot :
- CLAUDE.md : 221 → 173 lignes. Chaque ligne en trop dilue l'attention du modèle
- Rules auto-chargées : 2 510 → 1 152 lignes (-54%). Les exemples verbeux déplacés en références à la demande
- 5 agents rétrogradés d'Opus vers Sonnet (devops, UI/UX, refactoring). Même qualité, -40% de coût
- maxTurns ajouté aux 22 agents. Fini les sessions qui tournent sans limite

Résultat combiné : 55-65% de réduction sur votre consommation de tokens.

-- Les chiffres v7.26 --

204 commandes, 63 agents (tous avec garde-fous), 26 namespaces, 18 stacks technos, 5 langues. Et maintenant, un contexte 54% plus léger dès le démarrage.

La meilleure feature n'est pas celle qu'on ajoute. C'est celle qui rend tout le reste moins cher.

---
Claude-Craft : https://github.com/TheBeardedBearSAS/claude-craft

#ClaudeCode #AI #DevTools #OpenSource #TokenOptimization #MCP #DeveloperExperience

---

## Prompt Gemini (illustration)

> Create a modern tech illustration for a LinkedIn post about token optimization and compatibility. The scene shows a dual concept: on the left side, a massive version timeline wall with 43 glowing nodes connected vertically (representing Claude Code versions), each node pulsing with electric cyan (#00d4ff) light. On the right side, a funnel visualization showing tokens flowing in at the top (large stream) and compressed output at the bottom (small efficient stream), with the compression ratio "55-65%" subtly implied by the funnel shape. A bridge of orange (#ff6b35) light connects both sides, symbolizing the link between compatibility and optimization. Small icons float around: a shield (security/CVE), a gear (hooks), a lightning bolt (RTK speed). Color palette: dark background (#0a0a1a), cyan (#00d4ff) for the version timeline, orange (#ff6b35) for the optimization funnel. Style: flat design, clean vector, professional, no text overlay. Aspect ratio 1200x627.

---

## Vérification

### Compteur de caractères

| Élément | Caractères | Limite LinkedIn |
|---------|------------|-----------------|
| Post complet | ~1700 | < 3000 |

### Correspondance features/CHANGELOG

| Feature citée | Version | Confirmé |
|---------------|---------|----------|
| 43 versions Claude Code (v2.1.63-v2.1.105) | v7.25.0 | oui |
| Auto Mode classificateur IA | v7.25.0 | oui |
| MCP Tool Search 95% réduction | v7.25.0 | oui |
| 8 nouveaux hooks | v7.25.0 | oui |
| Agent frontmatter | v7.25.0 | oui |
| 7 CVE (v2.1.97-v2.1.101) | v7.25.0 | oui |
| Subprocess sandboxing PID namespace | v7.25.0 | oui |
| Version recommandée 2.1.105 | v7.25.0 | oui |
| Security minimum 2.1.97 | v7.25.0 | oui |
| /common:setup-rtk commande | v7.26.0 | oui |
| RTK 60-90% économies | v7.26.0 | oui |
| PostToolUse output filter | v7.26.0 | oui |
| PreCompact hook template | v7.26.0 | oui |
| 55-65% réduction combinée | v7.26.0 | oui |
| 204 commandes, 63 agents, 26 namespaces | v7.25.0 | oui |

### Réponses FAQ anticipées

| Question probable | Réponse suggérée |
|-------------------|------------------|
| "RTK c'est quoi ?" | "Rust Token Killer — un proxy CLI open source qui réécrit les commandes dev pour produire des outputs compacts. Installé en une commande avec /common:setup-rtk." |
| "Auto Mode, c'est safe ?" | "Auto Mode est réservé aux plans Team avec approbation admin. Après 3 blocages consécutifs, il revient en mode manuel automatiquement." |
| "55-65% c'est réel ?" | "Mesuré sur nos propres sessions. RTK couvre les outputs CLI, le sub-agent model réduit le coût des sous-agents, et les hooks évitent la pollution de contexte." |
| "v2.1.105 obligatoire ?" | "Recommandée. Le minimum sécurité est 2.1.97 (hardening critique du Bash tool). En dessous, vous êtes exposé à des CVE connues." |

### Hashtags

Primaires : `#ClaudeCode` `#AI` `#DevTools` `#OpenSource`
Secondaires : `#TokenOptimization` `#MCP` `#DeveloperExperience`
