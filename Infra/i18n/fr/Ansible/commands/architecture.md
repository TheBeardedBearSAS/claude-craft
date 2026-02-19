---
description: Design complete Ansible automation architecture
argument-hint: <Project> [constraints]
---

# Ansible Architecture

Vous etes un architecte Ansible senior. Vous devez concevoir une architecture d'automatisation complete a partir des specifications du projet.

## Arguments
$ARGUMENTS

Arguments :
- Description du projet
- Infrastructure cible (ex. : serveurs web, bases de donnees, multi-cloud)
- Automatisation requise (ex. : provisioning, configuration, deploiement)
- Contraintes (ex. : multi-env, conformite, taille de l'equipe)

Exemple : `/ansible:architecture "Plateforme e-commerce" infra:aws services:nginx,postgresql,redis compliance:soc2`

## Plan Mode

> **Le plan mode est recommande.** Claude active le plan mode pour structurer l'approche, identifier les cibles d'infrastructure et presenter une strategie d'automatisation avant de generer les playbooks et les roles.

## MISSION

### Etape 1 : Decouverte

```
══════════════════════════════════════════════════════════════
ARCHITECTURE ANSIBLE
══════════════════════════════════════════════════════════════

Projet : {name}
Description : {description}

──────────────────────────────────────────────────────────────
ANALYSE DES EXIGENCES
──────────────────────────────────────────────────────────────

### Stack Technique
| Composant | Technologie | Version |
|-----------|-------------|---------|
| Serveur Web | {tech} | {version} |
| Base de donnees | {tech} | {version} |
| Cache | {tech} | {version} |

### Hotes Cibles
| Groupe | OS | Nombre | Objectif |
|--------|----|--------|----------|
| {group} | {os} | {count} | {purpose} |

### Environnements
| Env | Objectif | Specificites |
|-----|----------|--------------|
| dev | Developpement | VMs locales (Vagrant/Docker) |
| staging | Validation | Similaire a la production |
| prod | Production | HA, durci, monitore |
```

### Etape 2 : Conception de l'Architecture

```
──────────────────────────────────────────────────────────────
TOPOLOGIE D'AUTOMATISATION
──────────────────────────────────────────────────────────────

┌─────────────────────────────────────────────────────────────┐
│                     CONTROL NODE                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  ansible.cfg │  │ requirements │  │  .ansible-   │      │
│  │              │  │     .yml     │  │    lint       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└──────────┬──────────────────────────────────────────────────┘
           │
┌──────────▼──────────────────────────────────────────────────┐
│  INVENTORIES → PLAYBOOKS → ROLES → TARGET HOSTS            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ dev/stg/ │  │ site.yml │  │  common  │  │ servers  │   │
│  │ prod     │  │ deploy   │  │  nginx   │  │ (managed │   │
│  │ (hosts)  │  │ security │  │ postgres │  │  nodes)  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘

──────────────────────────────────────────────────────────────
STRATEGIE D'INVENTAIRE
──────────────────────────────────────────────────────────────

| Environnement | Source | Group Vars | Specificites |
|----------------|--------|------------|--------------|
| dev | YAML statique | Ressources reduites | Vagrant/local |
| staging | Dynamique (cloud) | Similaire a la production | Auto-decouverte |
| prod | Dynamique (cloud) | Ressources completes, HA | Vault chiffre |

──────────────────────────────────────────────────────────────
DECOMPOSITION DES ROLES
──────────────────────────────────────────────────────────────

| Role | Perimetre | Dependances | Molecule |
|------|-----------|-------------|----------|
| common | Configuration OS de base, utilisateurs, paquets | aucune | Oui |
| {service} | {description} | common | Oui |
```

### Etape 3 : Structure du Projet

```
──────────────────────────────────────────────────────────────
STRUCTURE DU PROJET
──────────────────────────────────────────────────────────────

ansible/
├── ansible.cfg
├── requirements.yml
├── .ansible-lint
├── inventories/
│   ├── dev/
│   │   ├── hosts.yml
│   │   └── group_vars/
│   ├── staging/
│   │   └── hosts.yml, group_vars/
│   └── prod/
│       ├── hosts.yml
│       └── group_vars/all/{vars,vault}.yml
├── playbooks/
│   ├── site.yml
│   ├── deploy.yml
│   └── security.yml
├── roles/
│   ├── common/
│   │   ├── defaults/, handlers/, tasks/main.yml
│   │   ├── templates/
│   │   └── molecule/default/
│   └── {service}/
└── collections/
    └── requirements.yml
```

### Etape 4 : Generer la Configuration

Generer `ansible.cfg` (chemins d'inventaire, parametres SSH, mise en cache des facts, valeurs de securite par defaut), `requirements.yml` (collections : `ansible.posix`, `community.general`), la structure d'inventaire par environnement et `.ansible-lint` avec le profil de securite production. Toutes les taches doivent utiliser le FQCN (ex. : `ansible.builtin.copy`).

### Etape 5 : Generer les Roles

Generer les squelettes de roles pour chaque service identifie avec `defaults/main.yml`, `tasks/main.yml` (idempotent), `handlers/main.yml`, `templates/` et `molecule/default/` pour les tests.

### Etape 6 : Rapport Final

```
══════════════════════════════════════════════════════════════
ARCHITECTURE GENEREE
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
FICHIERS CREES
──────────────────────────────────────────────────────────────

| Fichier | Description |
|---------|-------------|
| ansible/ansible.cfg | Configuration Ansible principale |
| ansible/requirements.yml | Dependances de collections |
| ansible/inventories/prod/hosts.yml | Inventaire de production |
| ansible/playbooks/site.yml | Playbook principal |
| ansible/roles/common/tasks/main.yml | Role de configuration OS de base |

──────────────────────────────────────────────────────────────
PROCHAINES ETAPES
──────────────────────────────────────────────────────────────

1. [ ] Revoir les group_vars et ajuster pour chaque environnement
2. [ ] Configurer Ansible Vault avec /ansible:security-audit
3. [ ] Configurer le pipeline CI/CD avec /ansible:deploy-setup
4. [ ] Lancer la verification qualite avec @ansible-quality
5. [ ] Tester les roles avec Molecule avant le premier deploiement
```
