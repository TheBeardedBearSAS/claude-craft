---
description: Design complete Ansible automation architecture
argument-hint: <Project> [constraints]
---

# Ansible Architecture

Voce e um arquiteto Ansible senior. Voce deve projetar uma arquitetura completa de automacao a partir das especificacoes do projeto.

## Argumentos
$ARGUMENTS

Argumentos:
- Descricao do projeto
- Infraestrutura alvo (ex.: web-servers, databases, multi-cloud)
- Automacao necessaria (ex.: provisionamento, configuracao, deploy)
- Restricoes (ex.: multi-env, conformidade, tamanho-da-equipe)

Exemplo: `/ansible:architecture "Plataforma e-commerce" infra:aws services:nginx,postgresql,redis compliance:soc2`

## Plan Mode

> **Plan mode e recomendado.** Claude ativa o plan mode para estruturar a abordagem, identificar alvos de infraestrutura e apresentar uma estrategia de automacao antes de gerar playbooks e roles.

## MISSAO

### Passo 1: Descoberta

```
══════════════════════════════════════════════════════════════
ANSIBLE ARCHITECTURE
══════════════════════════════════════════════════════════════

Projeto: {name}
Descricao: {description}

──────────────────────────────────────────────────────────────
ANALISE DE REQUISITOS
──────────────────────────────────────────────────────────────

### Stack Tecnologico
| Componente | Tecnologia | Versao |
|-----------|------------|--------|
| Servidor Web | {tech} | {version} |
| Banco de Dados | {tech} | {version} |
| Cache | {tech} | {version} |

### Hosts Alvo
| Grupo | SO | Quantidade | Proposito |
|-------|----|------------|-----------|
| {group} | {os} | {count} | {purpose} |

### Ambientes
| Env | Proposito | Especificidades |
|-----|-----------|-----------------|
| dev | Desenvolvimento | VMs locais (Vagrant/Docker) |
| staging | Validacao | Semelhante a producao |
| prod | Producao | HA, hardened, monitorado |
```

### Passo 2: Design de Arquitetura

```
──────────────────────────────────────────────────────────────
TOPOLOGIA DE AUTOMACAO
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
ESTRATEGIA DE INVENTARIO
──────────────────────────────────────────────────────────────

| Ambiente | Origem | Group Vars | Especificidades |
|----------|--------|------------|-----------------|
| dev | YAML Estatico | Recursos reduzidos | Vagrant/local |
| staging | Dinamico (cloud) | Semelhante a producao | Auto-discovery |
| prod | Dinamico (cloud) | Recursos completos, HA | Vault criptografado |

──────────────────────────────────────────────────────────────
DECOMPOSICAO DE ROLES
──────────────────────────────────────────────────────────────

| Role | Escopo | Dependencias | Molecule |
|------|--------|--------------|----------|
| common | Configuracao base do SO, usuarios, pacotes | none | Yes |
| {service} | {description} | common | Yes |
```

### Passo 3: Estrutura do Projeto

```
──────────────────────────────────────────────────────────────
ESTRUTURA DO PROJETO
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

### Passo 4: Gerar Configuracao

Gerar `ansible.cfg` (caminhos de inventario, configuracoes SSH, cache de facts, valores padrao de seguranca), `requirements.yml` (collections: `ansible.posix`, `community.general`), estrutura de inventario por ambiente e `.ansible-lint` com perfil de seguranca para producao. Todas as tasks devem usar FQCN (ex.: `ansible.builtin.copy`).

### Passo 5: Gerar Roles

Gerar esqueletos de roles para cada servico identificado com `defaults/main.yml`, `tasks/main.yml` (idempotente), `handlers/main.yml`, `templates/` e `molecule/default/` para testes.

### Passo 6: Relatorio Final

```
══════════════════════════════════════════════════════════════
ARQUITETURA GERADA
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
ARQUIVOS CRIADOS
──────────────────────────────────────────────────────────────

| Arquivo | Descricao |
|---------|-----------|
| ansible/ansible.cfg | Configuracao principal do Ansible |
| ansible/requirements.yml | Dependencias de collections |
| ansible/inventories/prod/hosts.yml | Inventario de producao |
| ansible/playbooks/site.yml | Playbook principal |
| ansible/roles/common/tasks/main.yml | Role de configuracao base do SO |

──────────────────────────────────────────────────────────────
PROXIMOS PASSOS
──────────────────────────────────────────────────────────────

1. [ ] Revisar group_vars e ajustar para cada ambiente
2. [ ] Configurar Ansible Vault com /ansible:security-audit
3. [ ] Configurar pipeline CI/CD com /ansible:deploy-setup
4. [ ] Executar verificacao de qualidade com @ansible-quality
5. [ ] Testar roles com Molecule antes do primeiro deploy
```
