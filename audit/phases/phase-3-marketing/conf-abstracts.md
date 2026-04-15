# Conference Abstracts — Phase 3 P3-27

> **Status** : DRAFT. 3 abstracts prêts à soumettre aux CFP.
> **Owner** : Flavien Métivier (speaker).

## 1. Devoxx France 2026

**Titre** : *AI-first dev : de 3 mois à 3 semaines avec BMAD v6*

**Format** : Conférence 45 min.

**Catégorie** : AI & Data / Architecture & Clean Code.

**Niveau** : Intermediate (dev 2-5 ans).

**Abstract (1500 caractères)** :

Vos sprints durent 3 mois. Votre PO rédige des tickets flous. Vos devs refactorent en boucle. Votre PR review prend 2 semaines. Vous n'êtes pas seul.

BMAD v6 (Build, Manage, Act, Deliver) — adopté par Claude Code, Cursor, et désormais opiniâtrement packagé dans Claude Craft — structure le cycle AI-assisté en phases contrôlées : Plan, Design, Implement, Review.

Dans cette conférence, je montre :
- Comment réduire le sprint planning de 10h à 10 min (démo live)
- Comment imposer Clean Architecture à Claude Code sans le frustrer
- Comment mesurer le ROI AI sur un sprint réel (métriques, pièges, faux positifs)
- Comment industrialiser le pattern sur une équipe de 10 devs multi-stack

Retour d'expérience : 4 projets clients Symfony / React / Flutter, 12 mois, équipes 3-8 devs. Ce qui marche, ce qui ne marche pas, les anti-patterns AI que personne ne documente.

Slides, repo GitHub public, feedback communauté. Claude Craft est MIT, vous repartez avec les outils en main.

**Bio speaker** :
Flavien Métivier — CTO fractionnel (The Bearded CTO), 15 ans d'expérience Symfony/DDD, mainteneur Claude Craft. Speaker occasionnel sur Clean Architecture et AI-assisted dev.

**Takeaways** :
- Maîtriser les 6 phases BMAD v6
- Appliquer Clean Architecture avec Claude Code (do's / don'ts)
- Mesurer l'impact AI sur la vélocité réelle
- Repository open-source à réutiliser dès lundi matin

---

## 2. Symfony Live 2026

**Titre** : *Claude Craft pour Symfony : DDD, CQRS, QA Recette en pratique*

**Format** : Conférence 40 min + 10 min Q&A.

**Catégorie** : Outillage / Architecture.

**Niveau** : Avanced (dev Symfony 3+ ans, familier DDD).

**Abstract (1200 caractères)** :

Symfony 8 + PHP 8.4, c'est un écrin. Mais que fait-on avec les 80% de code boilerplate que Claude Code peut générer — sans trahir Clean Architecture ?

Cette session décortique :
- Comment les règles Claude Craft forcent la séparation Domain / Application / Infrastructure
- Implémentation CQRS avec Symfony Messenger, générée par Claude sous supervision
- Tests Pest 4 + Browser Mode : 80% coverage en suivant le TDD Red-Green-Refactor
- QA Recette : acceptance testing via Chrome extension, bug fix en mode TDD

Démos live : une feature complète (Entity → Repository → Query Handler → API Platform → Tests) en 30 min.

Cibles : tech leads Symfony cherchant à industrialiser AI-assisted dev, developers curieux du stack Claude Code.

**Takeaways** :
- Commandes `/symfony:*` claude-craft (check-architecture, generate-crud)
- Agent `@symfony-reviewer` en action
- Stratégie de dual licensing OSS/Commercial
- Intégration QA Recette dans CI/CD

---

## 3. React Conf 2026 (ou React Summit)

**Titre** : *React 19 + Compiler + Claude Craft : measured productivity gains*

**Format** : 30 min.

**Catégorie** : Developer experience / Tooling.

**Niveau** : Intermediate.

**Abstract (1000 caractères)** :

React 19 + Compiler 1.0 + Server Components + Claude Code = promesse d'une productivité inédite. Mais quels sont les vrais gains mesurés, et où tombent les pièges AI-assisted ?

Dans cette session, je présente :
- Benchmarks réels (3 projets, 6 mois) : temps feature, coverage, bundle size
- Les patterns Claude Craft qui évitent la régression Compiler
- Zustand + React Query + Claude Code : pipeline CQRS côté front
- Storybook + tests Vitest 4 browser mode : recipe qualité
- L'anti-pattern "hallucination d'API" et comment l'éviter systématiquement

Démo live : création d'un composant accessible (WCAG 2.2 AA) testé et publié Storybook en 10 min.

**Takeaways** :
- Chiffres réels productivité AI-assisted en contexte React 19
- Commandes `/react:*` pour industrialiser
- Recommandations pour équipes 5-15 devs
- Code repository MIT à cloner

---

## Timeline soumission

| Conf | CFP Open | CFP Close | Réponse | Conf Date |
|---|---|---|---|---|
| Devoxx FR 2026 | Oct 2025 | Dec 2025 | Jan 2026 | Avril 2026 |
| Symfony Live Paris 2026 | Nov 2025 | Jan 2026 | Feb 2026 | Mars 2026 |
| React Summit 2026 | Sep 2025 | Dec 2025 | Jan 2026 | Juin 2026 |

(Si on rate 2026, viser éditions 2027.)

## Backup confs (si refus)

- **DevoxxFR** → AFUP Day, PHP Forum Paris
- **Symfony Live** → SymfonyCon (international), PHP Russia
- **React Conf** → React Paris, React Day Berlin
