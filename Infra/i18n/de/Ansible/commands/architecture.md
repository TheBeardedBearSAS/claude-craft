---
description: Design complete Ansible automation architecture
argument-hint: <Project> [constraints]
---

# Ansible Architecture

Sie sind ein erfahrener Ansible-Architect. Sie mussen eine vollstandige Automatisierungsarchitektur aus Projektspezifikationen entwerfen.

## Argumente
$ARGUMENTS

Argumente:
- Projektbeschreibung
- Zielinfrastruktur (z.B. Webserver, Datenbanken, Multi-Cloud)
- Benotigte Automatisierung (z.B. Provisionierung, Konfiguration, Deployment)
- Einschrankungen (z.B. Multi-Umgebung, Compliance, Teamgrosse)

Beispiel: `/ansible:architecture "E-Commerce-Plattform" infra:aws services:nginx,postgresql,redis compliance:soc2`

## Plan-Modus

> **Plan-Modus wird empfohlen.** Claude aktiviert den Plan-Modus, um den Ansatz zu strukturieren, Infrastrukturziele zu identifizieren und eine Automatisierungsstrategie vorzustellen, bevor Playbooks und Rollen generiert werden.

## AUFTRAG

### Schritt 1: Ermittlung

```
══════════════════════════════════════════════════════════════
ANSIBLE ARCHITEKTUR
══════════════════════════════════════════════════════════════

Projekt: {name}
Beschreibung: {description}

──────────────────────────────────────────────────────────────
ANFORDERUNGSANALYSE
──────────────────────────────────────────────────────────────

### Tech-Stack
| Komponente | Technologie | Version |
|------------|-------------|---------|
| Webserver | {tech} | {version} |
| Datenbank | {tech} | {version} |
| Cache | {tech} | {version} |

### Zielhosts
| Gruppe | OS | Anzahl | Zweck |
|--------|----|--------|-------|
| {group} | {os} | {count} | {purpose} |

### Umgebungen
| Umgebung | Zweck | Besonderheiten |
|----------|-------|----------------|
| dev | Entwicklung | Lokale VMs (Vagrant/Docker) |
| staging | Validierung | Produktionsahnlich |
| prod | Produktion | HA, gehartet, uberwacht |
```

### Schritt 2: Architekturentwurf

```
──────────────────────────────────────────────────────────────
AUTOMATISIERUNGSTOPOLOGIE
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
INVENTORY-STRATEGIE
──────────────────────────────────────────────────────────────

| Umgebung | Quelle | Group Vars | Besonderheiten |
|----------|--------|------------|----------------|
| dev | Statisches YAML | Reduzierte Ressourcen | Vagrant/lokal |
| staging | Dynamisch (Cloud) | Produktionsahnlich | Auto-Discovery |
| prod | Dynamisch (Cloud) | Volle Ressourcen, HA | Verschlusselter Vault |

──────────────────────────────────────────────────────────────
ROLLENZERLEGUNG
──────────────────────────────────────────────────────────────

| Rolle | Umfang | Abhangigkeiten | Molecule |
|-------|--------|----------------|----------|
| common | Basis-OS-Konfiguration, Benutzer, Pakete | keine | Ja |
| {service} | {description} | common | Ja |
```

### Schritt 3: Projektstruktur

```
──────────────────────────────────────────────────────────────
PROJEKTSTRUKTUR
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

### Schritt 4: Konfiguration generieren

`ansible.cfg` (Inventory-Pfade, SSH-Einstellungen, Fact-Caching, Sicherheits-Defaults), `requirements.yml` (Collections: `ansible.posix`, `community.general`), Inventory-Struktur pro Umgebung und `.ansible-lint` mit Produktions-Sicherheitsprofil generieren. Alle Tasks mussen FQCN verwenden (z.B. `ansible.builtin.copy`).

### Schritt 5: Rollen generieren

Rollenskelette fur jeden identifizierten Service generieren mit `defaults/main.yml`, `tasks/main.yml` (idempotent), `handlers/main.yml`, `templates/` und `molecule/default/` fur Tests.

### Schritt 6: Abschlussbericht

```
══════════════════════════════════════════════════════════════
GENERIERTE ARCHITEKTUR
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
ERSTELLTE DATEIEN
──────────────────────────────────────────────────────────────

| Datei | Beschreibung |
|-------|--------------|
| ansible/ansible.cfg | Haupt-Ansible-Konfiguration |
| ansible/requirements.yml | Collection-Abhangigkeiten |
| ansible/inventories/prod/hosts.yml | Produktions-Inventory |
| ansible/playbooks/site.yml | Master-Playbook |
| ansible/roles/common/tasks/main.yml | Basis-OS-Konfigurationsrolle |

──────────────────────────────────────────────────────────────
NACHSTE SCHRITTE
──────────────────────────────────────────────────────────────

1. [ ] group_vars prufen und fur jede Umgebung anpassen
2. [ ] Ansible Vault mit /ansible:security-audit einrichten
3. [ ] CI/CD-Pipeline mit /ansible:deploy-setup konfigurieren
4. [ ] Qualitatsprufung mit @ansible-quality durchfuhren
5. [ ] Rollen mit Molecule vor dem ersten Deployment testen
```
