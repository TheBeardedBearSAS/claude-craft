---
description: Projetar arquitetura completa de IaC com OpenTofu
argument-hint: <Projeto> [provedor-cloud] [restrições]
---

# OpenTofu Architecture

Você é um arquiteto OpenTofu sênior. Você deve projetar uma arquitetura completa de Infraestrutura como Código a partir das especificações do projeto.

## Argumentos
$ARGUMENTS

Argumentos:
- Descrição do projeto
- Provedor de nuvem (ex: aws, gcp, azure, multi-cloud)
- Serviços necessários (ex: compute, database, networking, storage)
- Restrições (ex: multi-env, compliance, migration-from-terraform)

Exemplo: `/opentofu:architecture "Plataforma E-commerce" cloud:aws services:ecs,rds,redis compliance:soc2`

## Modo Plan

> **O modo plan é recomendado.** Claude ativa o modo plan para estruturar a abordagem, identificar componentes de infraestrutura e apresentar uma estratégia de arquitetura antes de criar as configurações.

## MISSÃO

### Etapa 1: Descoberta

```
══════════════════════════════════════════════════════════════
OPENTOFU ARCHITECTURE
══════════════════════════════════════════════════════════════

Project: {name}
Description: {description}

──────────────────────────────────────────────────────────────
REQUIREMENTS ANALYSIS
──────────────────────────────────────────────────────────────

### Cloud Provider
| Provider | Region | Services |
|----------|--------|----------|
| {provider} | {region} | {services} |

### Required Infrastructure
| Component | Technology | Criticality |
|-----------|------------|-------------|
| {component} | {technology} | High/Medium/Low |

### Environments
| Env | Purpose | Specifics |
|-----|---------|-----------|
| dev | Development | Minimal resources |
| staging | Validation | Production-like |
| prod | Production | HA, encryption, monitoring |
```

### Etapa 2: Design de Módulos

```
──────────────────────────────────────────────────────────────
MODULE ARCHITECTURE
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
MODULE LAYOUT
──────────────────────────────────────────────────────────────

| Module | Purpose | Key Resources |
|--------|---------|---------------|
| networking | VPC, subnets, SGs | aws_vpc, aws_subnet |
| compute | Application workloads | aws_ecs_service, aws_lb |
| database | Data persistence | aws_db_instance |
| monitoring | Observability | aws_cloudwatch_* |
```

### Etapa 3: Estrutura do Projeto

```
──────────────────────────────────────────────────────────────
PROJECT STRUCTURE
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

### Etapa 4: Gerar Configurações dos Módulos

Gerar arquivos dos módulos com:
- Variáveis com restrições de tipo e blocos de validação
- Outputs para referências entre módulos
- Fixação de versão dos providers
- Configuração de criptografia de estado (v1.7+)
- Boas práticas de segurança (IAM com privilégio mínimo, criptografia em repouso)

### Etapa 5: Gerar Configurações dos Ambientes

Criar configurações específicas por ambiente:
- Dev: recursos mínimos, configurações relaxadas
- Staging: similar à produção, escala reduzida
- Prod: HA completa, criptografia, monitoramento, backups

### Etapa 6: Relatório Final

```
══════════════════════════════════════════════════════════════
GENERATED ARCHITECTURE
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
CREATED FILES
──────────────────────────────────────────────────────────────

| File | Description |
|------|-------------|
| infra/modules/networking/main.tf | VPC and networking |
| infra/modules/compute/main.tf | Application compute |
| infra/environments/prod/main.tf | Production config |
| infra/environments/prod/backend.tf | State backend with encryption |

──────────────────────────────────────────────────────────────
NEXT STEPS
──────────────────────────────────────────────────────────────

1. [ ] Review and adjust resource sizing per environment
2. [ ] Configure state encryption passphrase/KMS key
3. [ ] Setup CI/CD with /opentofu:deploy-setup
4. [ ] Run security audit with /opentofu:security-audit
5. [ ] Estimate costs with /opentofu:optimize
```
