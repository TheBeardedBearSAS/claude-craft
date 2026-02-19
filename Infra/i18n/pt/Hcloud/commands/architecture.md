---
description: Design complete Hetzner Cloud infrastructure architecture
argument-hint: <Project> [constraints]
---

# Hcloud Architecture

Voce e um arquiteto senior de Hetzner Cloud. Voce deve projetar uma arquitetura completa de infraestrutura em nuvem a partir das especificacoes do projeto.

## Arguments
$ARGUMENTS

Argumentos:
- Descricao do projeto
- Workload alvo (ex: web-application, microservices, database-cluster)
- Restricoes (ex: budget, datacenter, compliance)

Exemplo: `/hcloud:architecture "Plataforma E-commerce" workload:web-application datacenter:fsn1 budget:100eur`

## Plan Mode

> **O modo plan e recomendado.** Claude ativa o modo plan para estruturar a abordagem, identificar tipos de servidor e apresentar uma topologia de rede antes de gerar os comandos hcloud CLI.

## MISSION

### Passo 1: Descoberta

```
══════════════════════════════════════════════════════════════
HCLOUD ARCHITECTURE
══════════════════════════════════════════════════════════════

Project: {name}
Description: {description}

──────────────────────────────────────────────────────────────
REQUIREMENTS ANALYSIS
──────────────────────────────────────────────────────────────

### Stack da Aplicacao
| Component | Technology | Requirements |
|-----------|------------|-------------|
| Web Server | {tech} | {cpu/ram needs} |
| Application | {tech} | {cpu/ram needs} |
| Database | {tech} | {storage/iops needs} |

### Ambiente Alvo
| Attribute | Value |
|-----------|-------|
| Datacenter | {fsn1/nbg1/hel1/ash/hil/sin} |
| Budget | {monthly limit} |
| HA Required | {yes/no} |
| Compliance | {GDPR/none} |
```

### Passo 2: Design da Arquitetura

```
──────────────────────────────────────────────────────────────
INFRASTRUCTURE TOPOLOGY
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
SERVER TYPE SELECTION
──────────────────────────────────────────────────────────────

| Role | Server Type | Count | Justification |
|------|-------------|-------|---------------|
| Web | {cax21/cx22} | {n} | {reason} |
| App | {cpx31/cax31} | {n} | {reason} |
| DB | {ccx23/ccx33} | {n} | {reason} |

──────────────────────────────────────────────────────────────
NETWORK DESIGN
──────────────────────────────────────────────────────────────

| Subnet | IP Range | Purpose | Servers |
|--------|----------|---------|---------|
| web | 10.0.1.0/24 | Web frontends | web-01, web-02 |
| app | 10.0.2.0/24 | Application tier | app-01 |
| data | 10.0.3.0/24 | Databases, cache | db-01, redis-01 |
```

### Passo 3: Regras de Firewall

```
──────────────────────────────────────────────────────────────
FIREWALL DESIGN
──────────────────────────────────────────────────────────────

| Firewall | Direction | Protocol | Port | Source | Applied To |
|----------|-----------|----------|------|--------|------------|
| fw-web | in | TCP | 80,443 | 0.0.0.0/0 | label:role=web |
| fw-web | in | TCP | 22 | {office-ip}/32 | label:role=web |
| fw-db | in | TCP | 5432 | 10.0.0.0/8 | label:role=db |
| fw-db | in | TCP | 22 | 10.0.0.0/8 | label:role=db |
```

### Passo 4: Gerar Comandos hcloud CLI

Gerar o script de provisionamento completo com comandos hcloud CLI para:
- Criacao de rede e sub-redes
- Regras de firewall com label selectors
- Registro de chave SSH
- Grupos de posicionamento para servicos criticos
- Criacao de servidores com cloud-init
- Criacao e anexacao de volumes
- Load balancer com health checks
- Atribuicao de floating IP (se necessario)

### Passo 5: Gerar Cloud-Init

Gerar templates `cloud-init.yml` para cada funcao de servidor com instalacao de pacotes, hardening de seguranca (fail2ban, UFW) e setup da aplicacao.

### Passo 6: Relatorio Final

```
══════════════════════════════════════════════════════════════
GENERATED ARCHITECTURE
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
RESOURCE SUMMARY
──────────────────────────────────────────────────────────────

| Resource | Count | Monthly Cost |
|----------|-------|-------------|
| Servers | {n} | {cost}€ |
| Volumes | {n} | {cost}€ |
| Load Balancers | {n} | {cost}€ |
| Floating IPs | {n} | {cost}€ |
| **Total** | | **{total}€** |

──────────────────────────────────────────────────────────────
NEXT STEPS
──────────────────────────────────────────────────────────────

1. [ ] Revisar tipos de servidor e ajustar para orcamento
2. [ ] Auditar postura de seguranca com /hcloud:security-audit
3. [ ] Configurar pipeline CI/CD com /hcloud:deploy-setup
4. [ ] Otimizar custos com @hcloud-cost
5. [ ] Configurar monitoramento e alertas
```
