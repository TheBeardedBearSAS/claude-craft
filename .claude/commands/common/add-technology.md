---
description: Ajouter une nouvelle technologie à claude-craft avec les best practices de Context7 et recherche web
argument-hint: <nom-technologie>
---

# Ajouter une Technologie

Vous êtes un expert intégrateur de technologies pour claude-craft. Votre mission est d'ajouter une nouvelle stack technologique en :
1. Recherchant les best practices via Context7 MCP et recherche web
2. Générant tous les fichiers nécessaires (rules, commands, templates, skills, agents)
3. Créant le script d'installation
4. Mettant à jour la documentation et la page de présentation

## Arguments
$ARGUMENTS

Arguments:
- `nom-technologie` : Nom de la technologie à ajouter (ex: "nextjs", "nestjs", "golang", "laravel")
- (Optionnel) `catégorie` : Catégorie de la technologie (frontend, backend, mobile, devops, fullstack)

Exemple : `/common:add-technology "nestjs"` ou `/common:add-technology "golang" backend`

## MISSION

### Étape 1 : Analyser la Technologie

Identifier :
- Nom officiel et alias courants
- Type : framework, bibliothèque, langage, outil
- Catégorie : frontend, backend, mobile, devops, fullstack
- Écosystème : outils associés, frameworks de test, options de déploiement
- Public cible : web, mobile, API, CLI, etc.

### Étape 2 : Rechercher avec Context7 (MCP)

**Utiliser Context7 pour accéder à la documentation officielle :**

```
Interroger Context7 pour :
1. Guide de démarrage officiel
2. Structure de projet recommandée
3. Best practices et design patterns
4. Stratégies de test (unitaire, intégration, e2e)
5. Best practices sécurité
6. Conseils d'optimisation performance
7. Recommandations de déploiement
```

#### Informations à Extraire

| Sujet | Détails à Trouver |
|-------|-------------------|
| Architecture | Patterns recommandés (MVC, Clean, Hexagonal, etc.) |
| Standards de Code | Guide de style, conventions de nommage, structure des fichiers |
| Outillage | Outils CLI, formateurs, linters, bundlers |
| Tests | Frameworks de test, outils de couverture, stratégies de mock |
| Sécurité | Authentification, autorisation, vulnérabilités courantes |
| Qualité | Analyse statique, vérification de types, pratiques de review |

### Étape 3 : Compléter avec Recherche Web

**Rechercher les tendances 2026 et pratiques communautaires :**

1. **Dernières Tendances**
   - Version stable actuelle
   - Fonctionnalités à venir
   - Avertissements de dépréciation
   - Guides de migration

2. **Best Practices Communautaires**
   - Boilerplates populaires
   - Configurations de production
   - Benchmarks de performance
   - Architectures réelles

3. **Pièges Courants**
   - Erreurs fréquentes
   - Anti-patterns
   - Vulnérabilités de sécurité
   - Goulots de performance

4. **Écosystème**
   - Bibliothèques recommandées
   - Outils de test
   - Intégrations DevOps
   - Solutions de monitoring

### Étape 4 : Générer les Fichiers Technologie

**Créer la structure complète dans les 5 langues (en, fr, es, de, pt) :**

```
Dev/i18n/{lang}/{TECHNOLOGY}/
├── CLAUDE.md.template
├── rules/
│   ├── 00-project-context.md.template
│   ├── 02-architecture-{tech}.md
│   ├── 03-coding-standards.md
│   ├── 06-tooling.md
│   ├── 07-testing-{tech}.md
│   ├── 08-quality-tools.md
│   └── 11-security-{tech}.md
├── commands/
│   ├── check-compliance.md
│   ├── check-architecture.md
│   ├── check-code-quality.md
│   ├── check-testing.md
│   ├── check-security.md
│   └── [generate-*.md si applicable]
├── templates/
│   └── [templates spécifiques à la technologie]
├── checklists/
│   ├── pre-commit.md
│   └── new-feature.md
├── agents/
│   └── {tech}-reviewer.md
└── skills/
    └── [skills spécifiques à la technologie]
```

#### Rules à Générer

| Fichier | Contenu |
|---------|---------|
| `02-architecture-{tech}.md` | Patterns d'architecture, structure des dossiers, principes clean architecture |
| `03-coding-standards.md` | Guide de style, conventions de nommage, organisation des fichiers |
| `06-tooling.md` | Commandes CLI, formateurs, linters, outils de build |
| `07-testing-{tech}.md` | Stratégies de test, frameworks, exigences de couverture |
| `08-quality-tools.md` | Analyse statique, vérification de types, intégration CI/CD |
| `11-security-{tech}.md` | Pratiques de sécurité, vulnérabilités courantes, authentification |

#### Commands à Générer

| Commande | Objectif |
|----------|----------|
| `check-compliance.md` | Audit complet de conformité (score /100) |
| `check-architecture.md` | Revue d'architecture |
| `check-code-quality.md` | Analyse de qualité du code |
| `check-testing.md` | Couverture et qualité des tests |
| `check-security.md` | Audit de sécurité |

### Étape 5 : Créer le Script d'Installation

**Générer `Dev/scripts/install-{tech}-rules.sh` :**

Suivre le pattern des scripts existants :
- Support des options `--lang`, `--force`, `--update`, `--dry-run`, `--backup`
- Copier les règles génériques depuis Common/
- Copier les règles spécifiques à la technologie
- Générer CLAUDE.md et 00-project-context.md
- Afficher le résumé d'installation

### Étape 6 : Mettre à Jour la Documentation

**Fichiers à mettre à jour :**

| Fichier | Modifications |
|---------|---------------|
| `README.md` | Ajouter la technologie à la liste des stacks supportées |
| `docs/index.html` | Incrémenter les stats, ajouter la carte technologie |
| `docs/COMMANDS.md` | Documenter les nouvelles commandes |
| `Makefile` | Ajouter la cible `install-{tech}` |

#### Mises à Jour Page d'Accueil (docs/index.html)

1. **Section Stats** : Incrémenter le compteur "Tech Stacks"
2. **Grille Technologies** : Ajouter la nouvelle carte :

```html
<div class="bg-slate-800/50 p-6 rounded-xl border border-white/5 hover:border-brand-500/50 transition-colors text-center group">
    <div class="h-16 w-16 mx-auto bg-black rounded-full flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
        <span class="text-2xl font-bold text-white">{ICON}</span>
    </div>
    <h3 class="font-bold text-white">{NOM_TECH}</h3>
    <p class="text-xs text-slate-400 mt-2" data-i18n="tech_{tech}_desc">{DESCRIPTION}</p>
</div>
```

3. **Traductions** : Ajouter les clés i18n pour les 5 langues

#### Cible Makefile

```makefile
install-{tech}:
	./Dev/scripts/install-{tech}-rules.sh --lang=$(RULES_LANG) $(OPTIONS) $(TARGET)
```

### Étape 7 : Validation

#### Checklist Definition of Done

```
══════════════════════════════════════════════════════════════
✅ DEFINITION OF DONE : Ajout Technologie [{NOM_TECH}]
══════════════════════════════════════════════════════════════

📁 FICHIERS CRÉÉS
──────────────────────────────────────────────────────────────
- [ ] Rules (7 fichiers × 5 langues = 35 fichiers)
- [ ] Commands (5 fichiers × 5 langues = 25 fichiers)
- [ ] Templates (au moins 2 par langue)
- [ ] Checklists (2 fichiers × 5 langues = 10 fichiers)
- [ ] Agent {tech}-reviewer (1 fichier × 5 langues = 5 fichiers)
- [ ] CLAUDE.md.template (× 5 langues)
- [ ] Script d'installation (Dev/scripts/install-{tech}-rules.sh)

📄 DOCUMENTATION MISE À JOUR
──────────────────────────────────────────────────────────────
- [ ] README.md : Technologie ajoutée aux stacks supportées
- [ ] docs/index.html : Stats incrémentées
- [ ] docs/index.html : Carte technologie ajoutée
- [ ] docs/index.html : Traductions i18n ajoutées (5 langues)
- [ ] docs/COMMANDS.md : Nouvelles commandes documentées
- [ ] Makefile : Cible install-{tech} ajoutée

🧪 VÉRIFICATION
──────────────────────────────────────────────────────────────
- [ ] Le script d'installation s'exécute sans erreurs
- [ ] Tous les fichiers sont correctement formatés
- [ ] Les commandes sont fonctionnelles
- [ ] La documentation est exacte

══════════════════════════════════════════════════════════════
```

### Format de Sortie

Après avoir terminé toutes les étapes, fournir :

```
══════════════════════════════════════════════════════════════
🎉 TECHNOLOGIE AJOUTÉE : {NOM_TECH}
══════════════════════════════════════════════════════════════

📊 RÉSUMÉ
──────────────────────────────────────────────────────────────
Technologie : {NOM_TECH}
Catégorie : {CATÉGORIE}
Version : {VERSION_ACTUELLE}

Fichiers créés : {NOMBRE}
- Rules : 35 fichiers
- Commands : 25 fichiers
- Templates : {NOMBRE}
- Checklists : 10 fichiers
- Agents : 5 fichiers

📁 STRUCTURE
──────────────────────────────────────────────────────────────
Dev/i18n/
├── en/{TECH}/
├── fr/{TECH}/
├── es/{TECH}/
├── de/{TECH}/
└── pt/{TECH}/

Dev/scripts/
└── install-{tech}-rules.sh

🔧 INSTALLATION
──────────────────────────────────────────────────────────────
# Via Makefile
make install-{tech} TARGET=~/mon-projet RULES_LANG=fr

# Script direct
./Dev/scripts/install-{tech}-rules.sh ~/mon-projet

📚 DOCUMENTATION
──────────────────────────────────────────────────────────────
- README.md ✅ Mis à jour
- docs/index.html ✅ Mis à jour
- docs/COMMANDS.md ✅ Mis à jour
- Makefile ✅ Mis à jour

✅ DEFINITION OF DONE : COMPLÈTE
══════════════════════════════════════════════════════════════
```

### Directives Importantes

1. **Rechercher d'abord** - Toujours utiliser Context7 et recherche web avant de générer les fichiers
2. **Suivre les patterns** - Utiliser les technologies existantes (React, Symfony, Flutter) comme modèles
3. **Les 5 langues** - Générer le contenu pour en, fr, es, de, pt
4. **Qualité avant vitesse** - S'assurer que tous les fichiers sont correctement formatés et fonctionnels
5. **Tout mettre à jour** - Ne pas oublier la documentation et la page d'accueil

### Gestion des Erreurs

Si la recherche échoue :
- Indiquer clairement les informations manquantes
- Proposer des sources alternatives
- Demander des clarifications à l'utilisateur si nécessaire
- NE JAMAIS générer de fichiers avec du contenu placeholder ou inventé
