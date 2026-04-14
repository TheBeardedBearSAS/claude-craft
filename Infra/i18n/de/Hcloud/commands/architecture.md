---
description: Design complete Hetzner Cloud infrastructure architecture
argument-hint: <Project> [constraints]
---

# Hcloud Architecture

> ⚠️ **Pflichtmigration vor dem 2026-07-01**: der Parameter `location` ist zugunsten von `location` veraltet. Hetzner Cloud Terraform-Provider >= 1.58.0. Quelle: https://github.com/hetznercloud/terraform-provider-hcloud/releases

Du bist ein Senior Hetzner Cloud Architekt. Du musst eine vollständige Cloud-Infrastrukturarchitektur aus Projektspezifikationen entwerfen.

## Argumente
$ARGUMENTS

Argumente:
- Projektbeschreibung
- Ziel-Workload (z.B. web-application, microservices, database-cluster)
- Einschränkungen (z.B. Budget, Datacenter, Compliance)

Beispiel: `/hcloud:architecture "E-Commerce-Plattform" workload:web-application location:fsn1 budget:100eur`

## Plan-Modus

> **Plan-Modus wird empfohlen.** Claude aktiviert den Plan-Modus, um den Ansatz zu strukturieren, Servertypen zu identifizieren und eine Netzwerktopologie zu präsentieren, bevor hcloud-CLI-Befehle generiert werden.

## MISSION

### Schritt 1: Bestandsaufnahme

```
══════════════════════════════════════════════════════════════
HCLOUD ARCHITECTURE
══════════════════════════════════════════════════════════════

Projekt: {name}
Beschreibung: {description}

──────────────────────────────────────────────────────────────
ANFORDERUNGSANALYSE
──────────────────────────────────────────────────────────────

### Anwendungsstack
| Komponente | Technologie | Anforderungen |
|------------|-------------|---------------|
| Webserver | {tech} | {CPU/RAM-Bedarf} |
| Anwendung | {tech} | {CPU/RAM-Bedarf} |
| Datenbank | {tech} | {Speicher/IOPS-Bedarf} |

### Zielumgebung
| Attribut | Wert |
|----------|------|
| Datacenter | {fsn1/nbg1/hel1/ash/hil/sin} |
| Budget | {monatliches Limit} |
| HA erforderlich | {ja/nein} |
| Compliance | {DSGVO/keine} |
```

### Schritt 2: Architekturentwurf

```
──────────────────────────────────────────────────────────────
INFRASTRUKTURTOPOLOGIE
──────────────────────────────────────────────────────────────

┌─────────────────────────────────────────────────────────────┐
│                    HETZNER CLOUD                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Load Balancer│  │  Firewalls   │  │ Floating IPs │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└──────────┬──────────────────────────────────────────────────┘
           │
┌──────────▼──────────────────────────────────────────────────┐
│  NETWORK → SERVERS → VOLUMES → SNAPSHOTS                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Private  │  │ CX/CPX/  │  │ Block    │  │ Backup   │   │
│  │ Subnets  │  │ CAX/CCX  │  │ Storage  │  │ Images   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘

──────────────────────────────────────────────────────────────
SERVERTYP-AUSWAHL
──────────────────────────────────────────────────────────────

| Rolle | Servertyp | Anzahl | Begründung |
|-------|-----------|--------|------------|
| Web | {cax21/cx22} | {n} | {Begründung} |
| App | {cpx31/cax31} | {n} | {Begründung} |
| DB | {ccx23/ccx33} | {n} | {Begründung} |

──────────────────────────────────────────────────────────────
NETZWERKDESIGN
──────────────────────────────────────────────────────────────

| Subnetz | IP-Bereich | Zweck | Server |
|---------|-----------|-------|--------|
| web | 10.0.1.0/24 | Web-Frontends | web-01, web-02 |
| app | 10.0.2.0/24 | Anwendungs-Tier | app-01 |
| data | 10.0.3.0/24 | Datenbanken, Cache | db-01, redis-01 |
```

### Schritt 3: Firewall-Regeln

```
──────────────────────────────────────────────────────────────
FIREWALL-DESIGN
──────────────────────────────────────────────────────────────

| Firewall | Richtung | Protokoll | Port | Quelle | Angewandt auf |
|----------|----------|-----------|------|--------|---------------|
| fw-web | in | TCP | 80,443 | 0.0.0.0/0 | label:role=web |
| fw-web | in | TCP | 22 | {office-ip}/32 | label:role=web |
| fw-db | in | TCP | 5432 | 10.0.0.0/8 | label:role=db |
| fw-db | in | TCP | 22 | 10.0.0.0/8 | label:role=db |
```

### Schritt 4: hcloud-CLI-Befehle generieren

Generiere das vollständige Provisionierungsskript mit hcloud-CLI-Befehlen für:
- Netzwerk- und Subnetz-Erstellung
- Firewall-Regeln mit Label-Selektoren
- SSH-Schlüssel-Registrierung
- Placement Groups für kritische Dienste
- Server-Erstellung mit cloud-init
- Volume-Erstellung und -Anhängen
- Load Balancer mit Health Checks
- Floating-IP-Zuweisung (falls benötigt)

### Schritt 5: Cloud-Init generieren

Generiere `cloud-init.yml`-Vorlagen für jede Serverrolle mit Paketinstallation, Sicherheitshärtung (fail2ban, UFW) und Anwendungs-Setup.

### Schritt 6: Abschlussbericht

```
══════════════════════════════════════════════════════════════
GENERIERTE ARCHITEKTUR
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
RESSOURCENÜBERSICHT
──────────────────────────────────────────────────────────────

| Ressource | Anzahl | Monatliche Kosten |
|-----------|--------|-------------------|
| Server | {n} | {Kosten}€ |
| Volumes | {n} | {Kosten}€ |
| Load Balancer | {n} | {Kosten}€ |
| Floating IPs | {n} | {Kosten}€ |
| **Gesamt** | | **{Gesamt}€** |

──────────────────────────────────────────────────────────────
NÄCHSTE SCHRITTE
──────────────────────────────────────────────────────────────

1. [ ] Servertypen überprüfen und für Budget anpassen
2. [ ] Sicherheitslage mit /hcloud:security-audit auditieren
3. [ ] CI/CD-Pipeline mit /hcloud:deploy-setup konfigurieren
4. [ ] Kosten mit @hcloud-cost optimieren
5. [ ] Monitoring und Alerting einrichten
```
