---
description: Audit de la couverture et qualité des tests Paperclip
argument-hint: [chemin-projet]
---

# Audit des tests Paperclip

## MISSION

Vérifier la couverture de tests, les tests de contrat d'adaptateur, la forme des tests d'intégration et l'hygiène des tests.

## Procédure

### 1. Référence

- [ ] Vitest configuré à la racine de l'espace de travail
- [ ] Seuils de couverture ≥ 80 (lignes, fonctions, instructions), ≥ 75 (branches)
- [ ] `pnpm test --coverage` se termine et respecte les seuils

### 2. Couverture par zone

Exécuter la couverture, puis rapporter par zone :
- `server/src/modules/agents/` : cible ≥ 90%
- `server/src/modules/approvals/` : cible ≥ 90%
- `server/src/modules/costs/` : cible ≥ 90%
- `adapters/**` : cible ≥ 85%
- Autres modules serveur : ≥ 80%
- `ui/` : ≥ 70%

Lister tout fichier sous sa cible avec une note en 1 ligne sur ce qui n'est pas couvert.

### 3. Tests d'extension

Adaptateurs intégrés (`packages/adapters/*`) :
- [ ] Les tests unitaires couvrent spawn / parse / câblage env
- [ ] `type`, `label`, `models`, `agentConfigurationDoc` sont couverts par un test d'exports
- [ ] Les tests E2E existent pour au moins l'adaptateur par défaut

Plugins :
- [ ] Les tests utilisent `createTestHarness` de `@paperclipai/plugin-sdk/testing`
- [ ] Chemin heureux + un chemin d'échec par gestionnaire

### 4. Tests d'intégration

- [ ] Au moins un test d'intégration par module serveur
- [ ] Les tests d'intégration se connectent à un PostgreSQL **réel** (testcontainers ou DB jetable), pas un mock
- [ ] Chaque test possède ses propres données (transactions + rollback, ou truncate entre tests)
- [ ] Un test d'**isolation inter-tenants** existe par module (prouver qu'un utilisateur de l'entreprise A ne peut pas lire les données de l'entreprise B)

### 5. E2E

- [ ] La suite Playwright couvre : login opérateur, embauche d'un agent, flux d'approbation, tableau de bord des coûts, enregistrement d'adaptateur
- [ ] E2E s'exécute contre un bundle web construit, pas le serveur de dev

### 6. Hygiène

Grep pour et échouer sur :
- `.only(` dans tout fichier de test sur `main`
- `.skip(` dans tout fichier de test sur `main` (sans issue liée)
- `setTimeout` dans les tests sans `vi.useFakeTimers()`
- Fixtures mutables partagées entre tests
- Fichiers snapshot (`__snapshots__`) plus vieux que 180 jours sans note

### 7. Régressions de correction de bugs

Prendre les 5 derniers commits `fix:`. Pour chacun, vérifier qu'un test correspondant a été ajouté ou modifié. Rapporter les commits qui ne l'ont pas fait.

## Sortie

Rapport Markdown avec passe/échoue par section, fichiers non couverts, adaptateurs en échec, et un score /20 pour `/paperclip:check-compliance`.
