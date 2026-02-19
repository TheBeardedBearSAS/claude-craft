---
description: Setup CI/CD pipeline for Ansible automation
argument-hint: <Platform> [ci-tool]
---

# Ansible Deploy Setup

Vous etes un specialiste du deploiement Ansible. Vous devez configurer un pipeline CI/CD complet pour l'execution des playbooks Ansible.

## Arguments
$ARGUMENTS

Arguments :
- Description de la plateforme
- (Optionnel) Outil CI : github-actions, gitlab-ci (defaut : github-actions)
- (Optionnel) Controleur : awx, semaphore, none

Exemple : `/ansible:deploy-setup "Infrastructure web" ci:github-actions controller:awx`

## Plan Mode

> **Le plan mode est obligatoire.** Avant d'executer, Claude active le plan mode pour analyser le projet, proposer une strategie de pipeline et attendre la validation.

## MISSION

### Etape 1 : Analyser le Projet

```
══════════════════════════════════════════════════════════════
ANSIBLE DEPLOY SETUP
══════════════════════════════════════════════════════════════

Projet : {name}

──────────────────────────────────────────────────────────────
DETECTION DE LA STACK
──────────────────────────────────────────────────────────────

| Composant | Detecte | Details |
|-----------|---------|---------|
| Playbooks | {count} | {paths} |
| Roles | {count} | {names} |
| Collections | {count} | {names} |
| Utilisation Vault | {oui/non} | {fichiers chiffres} |
| Inventaires | {count} | {environnements} |
| Tests Molecule | {oui/non} | {scenarios} |
```

### Etape 2 : Concevoir le Pipeline

```
──────────────────────────────────────────────────────────────
STRATEGIE DE PIPELINE
──────────────────────────────────────────────────────────────

Outil CI : {GitHub Actions / GitLab CI}
Controleur : {AWX / Semaphore / Aucun}

Pipeline :
  Push / PR
    → Lint : ansible-lint + yamllint
    → Test : molecule converge + verify
    → Dry Run : ansible-playbook --check --diff
    → Deploy Staging : execution du playbook sur staging
    → Porte d'Approbation : approbation manuelle pour la production
    → Deploy Prod : execution du playbook sur production

──────────────────────────────────────────────────────────────
SELECTION DE STRATEGIE
──────────────────────────────────────────────────────────────

| Etape | Outil | Declencheur | Artefacts |
|-------|-------|-------------|-----------|
| Lint | ansible-lint | Sur push/PR | Rapport de lint |
| Test | Molecule | Sur push/PR | Resultats de tests |
| Dry Run | ansible-playbook --check | Sur merge vers main | Sortie diff |
| Deploy Staging | {controleur/direct} | Sur merge vers main | Log d'execution |
| Deploy Prod | {controleur/direct} | Approbation manuelle | Log d'execution |
```

### Etape 3 : Generer le Pipeline CI

Generer le fichier de configuration CI/CD :

Pour **GitHub Actions** (`.github/workflows/ansible.yml`) :
- Installer Ansible et les dependances depuis `requirements.yml`
- Executer `yamllint` et `ansible-lint` sur tous les playbooks et roles
- Executer `molecule test` pour chaque role avec un scenario de test
- Executer `ansible-playbook --check --diff` pour la validation syntaxique et le dry-run
- Deployer sur staging lors du merge vers main
- Deployer en production avec porte d'approbation manuelle
- Utiliser GitHub Secrets pour le mot de passe vault et les cles SSH

Pour **GitLab CI** (`.gitlab-ci.yml`) :
- Utiliser les stages : lint, test, deploy-staging, deploy-prod
- Mettre en cache les collections Ansible entre les executions
- Utiliser des variables protegees pour le mot de passe vault et les cles SSH

### Etape 4 : Generer la Configuration du Controleur

Si le controleur est **AWX** :
- Definitions d'Organisation, Projet et Inventaire
- Job Template pour chaque playbook avec variables de survey
- Workflow Template chainant lint -> deploy staging -> deploy prod
- Types de credentials pour mot de passe vault, cle SSH et credentials cloud

Si le controleur est **Semaphore** :
- Configuration du projet avec depot Git
- Definitions d'environnement par inventaire
- Templates de taches pour chaque playbook
- Configuration de planification pour les taches recurrentes

### Etape 5 : Generer l'Execution Environment

Generer `execution-environment.yml` pour `ansible-builder` :

```yaml
---
version: 3
dependencies:
  galaxy: requirements.yml
  python: requirements.txt
  system: bindep.txt
images:
  base_image:
    name: quay.io/ansible/ansible-runner:latest
additional_build_steps:
  append_final:
    - RUN pip3 install --upgrade pip
```

Cela garantit un environnement d'execution reproductible a travers la CI, AWX et les postes de developpeurs.

### Etape 6 : Rapport Final

```
══════════════════════════════════════════════════════════════
RAPPORT DE CONFIGURATION
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
FICHIERS CREES
──────────────────────────────────────────────────────────────

| Fichier | Description |
|---------|-------------|
| .github/workflows/ansible.yml | Pipeline CI/CD |
| execution-environment.yml | Definition EE Ansible Builder |
| .yamllint.yml | Configuration YAML lint |
| .ansible-lint | Configuration Ansible lint |

──────────────────────────────────────────────────────────────
PROCHAINES ETAPES
──────────────────────────────────────────────────────────────

1. [ ] Installer AWX/Semaphore sur l'hote controleur (si applicable)
2. [ ] Stocker le mot de passe vault dans les secrets CI (ANSIBLE_VAULT_PASSWORD)
3. [ ] Stocker la cle SSH privee dans les secrets CI (ANSIBLE_SSH_KEY)
4. [ ] Tester le pipeline de bout en bout sur une branche feature
5. [ ] Configurer le monitoring et les notifications avec @ansible-quality
6. [ ] Auditer la posture de securite avec /ansible:security-audit
```
