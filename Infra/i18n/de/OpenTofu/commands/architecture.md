---
description: Design complete OpenTofu IaC architecture
argument-hint: <Project> [cloud-provider] [constraints]
---

# OpenTofu Architecture

Sie sind ein Senior OpenTofu Architect. Sie mussen eine vollstandige Infrastructure-as-Code-Architektur aus Projektspezifikationen entwerfen.

## Arguments
$ARGUMENTS

Argumente:
- Projektbeschreibung
- Cloud-Anbieter (z.B. aws, gcp, azure, multi-cloud)
- Benotigte Services (z.B. compute, database, networking, storage)
- Einschrankungen (z.B. multi-env, compliance, migration-from-terraform)

Beispiel: `/opentofu:architecture "E-Commerce-Plattform" cloud:aws services:ecs,rds,redis compliance:soc2`

## Plan Mode

> **Plan-Modus wird empfohlen.** Claude aktiviert den Plan-Modus, um den Ansatz zu strukturieren, Infrastrukturkomponenten zu identifizieren und eine Architekturstrategie vorzustellen, bevor Konfigurationen erstellt werden.

## MISSION

### Schritt 1: Ermittlung

```
══════════════════════════════════════════════════════════════
OPENTOFU ARCHITECTURE
══════════════════════════════════════════════════════════════

Projekt: {name}
Beschreibung: {description}

──────────────────────────────────────────────────────────────
ANFORDERUNGSANALYSE
──────────────────────────────────────────────────────────────

### Cloud-Anbieter
| Anbieter | Region | Services |
|----------|--------|----------|
| {provider} | {region} | {services} |

### Benotigte Infrastruktur
| Komponente | Technologie | Kritikalitat |
|------------|-------------|--------------|
| {component} | {technology} | Hoch/Mittel/Niedrig |

### Umgebungen
| Umg. | Zweck | Besonderheiten |
|------|-------|----------------|
| dev | Entwicklung | Minimale Ressourcen |
| staging | Validierung | Produktionsahnlich |
| prod | Produktion | HA, Verschlusselung, Monitoring |
```

### Schritt 2: Modul-Design

```
──────────────────────────────────────────────────────────────
MODUL-ARCHITEKTUR
──────────────────────────────────────────────────────────────

┌─────────────────────────────────────────────────────────────┐
│                    NETWORKING MODULE                          │
│  ┌───────────────┐  ┌───────────────┐  ┌────────────────┐  │
│  │     VPC       │  │   Subnets     │  │ Security Groups│  │
│  └───────────────┘  └───────────────┘  └────────────────┘  │
└──────────┬──────────────────────────────────────────────────┘
           │
┌──────────▼──────────────────────────────────────────────────┐
│                    COMPUTE MODULE                            │
│  ┌───────────────┐  ┌───────────────┐  ┌────────────────┐  │
│  │  ECS/EKS/EC2  │  │  Auto-Scaling │  │  Load Balancer │  │
│  └───────────────┘  └───────────────┘  └────────────────┘  │
└──────────┬──────────────────────────────────────────────────┘
           │
┌──────────▼──────────────────────────────────────────────────┐
│                    DATA MODULE                               │
│  ┌───────────────┐  ┌───────────────┐  ┌────────────────┐  │
│  │  RDS/Aurora   │  │  ElastiCache  │  │  S3 Storage    │  │
│  └───────────────┘  └───────────────┘  └────────────────┘  │
└─────────────────────────────────────────────────────────────┘

──────────────────────────────────────────────────────────────
MODUL-UBERSICHT
──────────────────────────────────────────────────────────────

| Modul | Zweck | Wichtige Ressourcen |
|-------|-------|---------------------|
| networking | VPC, Subnetze, SGs | aws_vpc, aws_subnet |
| compute | Anwendungs-Workloads | aws_ecs_service, aws_lb |
| database | Datenpersistenz | aws_db_instance |
| monitoring | Observability | aws_cloudwatch_* |
```

### Schritt 3: Projektstruktur

```
──────────────────────────────────────────────────────────────
PROJEKTSTRUKTUR
──────────────────────────────────────────────────────────────

infra/
├── modules/
│   ├── networking/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── versions.tf
│   ├── compute/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── versions.tf
│   ├── database/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── versions.tf
│   └── monitoring/
│       ├── main.tf
│       ├── variables.tf
│       ├── outputs.tf
│       └── versions.tf
├── environments/
│   ├── dev/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── terraform.tfvars
│   │   └── backend.tf
│   ├── staging/
│   │   └── ...
│   └── prod/
│       └── ...
└── shared/
    ├── providers.tf
    └── versions.tf
```

### Schritt 4: Modul-Konfigurationen generieren

Modul-Dateien generieren mit:
- Variablen mit Typbeschrankungen und Validierungsblocken
- Outputs fur modul-ubergreifende Referenzen
- Provider-Versions-Pinning
- State-Verschlusselungskonfiguration (v1.7+)
- Sicherheits-Best-Practices (Least-Privilege-IAM, Verschlusselung im Ruhezustand)

### Schritt 5: Umgebungskonfigurationen generieren

Umgebungsspezifische Konfigurationen erstellen:
- Dev: minimale Ressourcen, gelockerte Einstellungen
- Staging: produktionsahnlich, reduzierte Skalierung
- Prod: volle HA, Verschlusselung, Monitoring, Backups

### Schritt 6: Abschlussbericht

```
══════════════════════════════════════════════════════════════
GENERIERTE ARCHITEKTUR
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
ERSTELLTE DATEIEN
──────────────────────────────────────────────────────────────

| Datei | Beschreibung |
|-------|-------------|
| infra/modules/networking/main.tf | VPC und Netzwerk |
| infra/modules/compute/main.tf | Anwendungs-Compute |
| infra/environments/prod/main.tf | Produktions-Konfiguration |
| infra/environments/prod/backend.tf | State-Backend mit Verschlusselung |

──────────────────────────────────────────────────────────────
NACHSTE SCHRITTE
──────────────────────────────────────────────────────────────

1. [ ] Ressourcendimensionierung pro Umgebung uberprufen und anpassen
2. [ ] State-Verschlusselungs-Passphrase/KMS-Schlussel konfigurieren
3. [ ] CI/CD mit /opentofu:deploy-setup einrichten
4. [ ] Sicherheitsaudit mit /opentofu:security-audit durchfuhren
5. [ ] Kosten mit /opentofu:optimize schatzen
```
