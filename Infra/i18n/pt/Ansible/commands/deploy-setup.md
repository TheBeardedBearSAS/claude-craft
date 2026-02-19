---
description: Setup CI/CD pipeline for Ansible automation
argument-hint: <Platform> [ci-tool]
---

# Ansible Deploy Setup

Voce e um especialista em deploy Ansible. Voce deve configurar um pipeline CI/CD completo para execucao de playbooks Ansible.

## Argumentos
$ARGUMENTS

Argumentos:
- Descricao da plataforma
- (Opcional) Ferramenta CI: github-actions, gitlab-ci (padrao: github-actions)
- (Opcional) Controlador: awx, semaphore, none

Exemplo: `/ansible:deploy-setup "Infraestrutura web" ci:github-actions controller:awx`

## Plan Mode

> **Plan mode e obrigatorio.** Antes de executar, Claude ativa o plan mode para analisar o projeto, propor uma estrategia de pipeline e aguardar validacao.

## MISSAO

### Passo 1: Analisar Projeto

```
══════════════════════════════════════════════════════════════
ANSIBLE DEPLOY SETUP
══════════════════════════════════════════════════════════════

Projeto: {name}

──────────────────────────────────────────────────────────────
DETECCAO DA STACK
──────────────────────────────────────────────────────────────

| Componente | Detectado | Detalhes |
|-----------|----------|---------|
| Playbooks | {count} | {paths} |
| Roles | {count} | {names} |
| Collections | {count} | {names} |
| Uso de Vault | {yes/no} | {encrypted files} |
| Inventarios | {count} | {environments} |
| Testes Molecule | {yes/no} | {scenarios} |
```

### Passo 2: Design do Pipeline

```
──────────────────────────────────────────────────────────────
ESTRATEGIA DO PIPELINE
──────────────────────────────────────────────────────────────

Ferramenta CI: {GitHub Actions / GitLab CI}
Controlador: {AWX / Semaphore / None}

Pipeline:
  Push / PR
    → Lint: ansible-lint + yamllint
    → Test: molecule converge + verify
    → Dry Run: ansible-playbook --check --diff
    → Deploy Staging: executar playbook contra staging
    → Gate de Aprovacao: aprovacao manual para producao
    → Deploy Prod: executar playbook contra producao

──────────────────────────────────────────────────────────────
SELECAO DE ESTRATEGIA
──────────────────────────────────────────────────────────────

| Estagio | Ferramenta | Acionamento | Artefatos |
|---------|------------|-------------|-----------|
| Lint | ansible-lint | On push/PR | Relatorio de lint |
| Test | Molecule | On push/PR | Resultados de teste |
| Dry Run | ansible-playbook --check | On merge to main | Saida diff |
| Deploy Staging | {controller/direto} | On merge to main | Log de execucao |
| Deploy Prod | {controller/direto} | Aprovacao manual | Log de execucao |
```

### Passo 3: Gerar Pipeline CI

Gerar o arquivo de configuracao CI/CD:

Para **GitHub Actions** (`.github/workflows/ansible.yml`):
- Instalar Ansible e dependencias a partir de `requirements.yml`
- Executar `yamllint` e `ansible-lint` em todos os playbooks e roles
- Executar `molecule test` para cada role com cenario de teste
- Executar `ansible-playbook --check --diff` para validacao de sintaxe e dry-run
- Deploy no staging ao fazer merge na main
- Deploy em producao com gate de aprovacao manual
- Usar GitHub Secrets para senha do vault e chaves SSH

Para **GitLab CI** (`.gitlab-ci.yml`):
- Usar stages: lint, test, deploy-staging, deploy-prod
- Cachear collections Ansible entre execucoes
- Usar variaveis protegidas para senha do vault e chaves SSH

### Passo 4: Gerar Configuracao do Controlador

Se o controlador for **AWX**:
- Definicoes de Organization, Project e Inventory
- Job Template para cada playbook com variaveis de survey
- Workflow Template encadeando lint -> deploy staging -> deploy prod
- Tipos de credenciais para senha do vault, chave SSH e credenciais cloud

Se o controlador for **Semaphore**:
- Configuracao do projeto com repositorio Git
- Definicoes de ambiente por inventario
- Templates de tarefas para cada playbook
- Configuracao de agendamento para tarefas recorrentes

### Passo 5: Gerar Execution Environment

Gerar `execution-environment.yml` para `ansible-builder`:

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

Isso garante um ambiente de execucao reproduzivel entre CI, AWX e estacoes de trabalho dos desenvolvedores.

### Passo 6: Relatorio Final

```
══════════════════════════════════════════════════════════════
RELATORIO DE SETUP
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
ARQUIVOS CRIADOS
──────────────────────────────────────────────────────────────

| Arquivo | Descricao |
|---------|-----------|
| .github/workflows/ansible.yml | Pipeline CI/CD |
| execution-environment.yml | Definicao de EE para Ansible Builder |
| .yamllint.yml | Configuracao de lint YAML |
| .ansible-lint | Configuracao de lint Ansible |

──────────────────────────────────────────────────────────────
PROXIMOS PASSOS
──────────────────────────────────────────────────────────────

1. [ ] Instalar AWX/Semaphore no host controlador (se aplicavel)
2. [ ] Armazenar senha do vault nos secrets do CI (ANSIBLE_VAULT_PASSWORD)
3. [ ] Armazenar chave SSH privada nos secrets do CI (ANSIBLE_SSH_KEY)
4. [ ] Testar pipeline end-to-end em uma feature branch
5. [ ] Configurar monitoramento e notificacao com @ansible-quality
6. [ ] Auditar postura de seguranca com /ansible:security-audit
```
