---
name: setup-project-context
description: Analisar o codigo e configurar o contexto do projeto interativamente
arguments:
  - name: mode
    description: Modo de detecao (--auto perguntas minimas, --full questionario completo)
    required: false
---

# Configuracao do Contexto do Projeto

Configura `.claude/rules/00-project-context.md` analisando o codigo e fazendo perguntas direcionadas.

## Execucao

### Fase 1: Detecao Automatica

Analisar os seguintes arquivos e diretorios:

**Arquivos de Configuracao:**
- `package.json` → Nome do projeto Node.js, dependencias, scripts
- `composer.json` → Nome do projeto PHP, dependencias, framework
- `pubspec.yaml` → Nome do projeto Flutter/Dart, dependencias
- `requirements.txt` / `pyproject.toml` → Dependencias Python
- `Cargo.toml` → Projeto Rust
- `go.mod` → Modulo Go

**Ambiente e Configuracao:**
- `.env`, `.env.example` → Banco de dados, servicos
- `config/` → Configuracao do framework
- `docker-compose.yml` → Servicos (DB, Redis, etc.)

**Estrutura:**
- `src/`, `lib/`, `app/` → Localizacao do codigo fonte
- `tests/`, `spec/` → Framework de testes
- `docs/`, `specifications/` → Documentacao
- `.github/`, `.gitlab-ci.yml` → CI/CD

**Dominio (se aplicavel):**
- `src/Entity/`, `src/Domain/` → Entidades de negocio (PHP/Symfony)
- `lib/models/`, `lib/domain/` → Modelos (Flutter/Dart)
- `models/`, `schemas/` → Modelos de dados
- `migrations/` → Schema do banco de dados

Exibir resultados da analise:

```
╔══════════════════════════════════════════════════════════════╗
║             RESULTADOS DA ANALISE DO PROJETO                  ║
╚══════════════════════════════════════════════════════════════╝

✅ Informacoes Detectadas:
┌─────────────────┬────────────────────────────────┐
│ Elemento        │ Valor                          │
├─────────────────┼────────────────────────────────┤
│ Nome do Projeto │ {nome_detectado}               │
│ Linguagem       │ {linguagem_detectada}          │
│ Framework       │ {framework_detectado}          │
│ Banco de Dados  │ {database_detectado}           │
│ Testes          │ {testes_detectados}            │
│ CI/CD           │ {cicd_detectado}               │
└─────────────────┴────────────────────────────────┘

📁 Estrutura do Projeto:
{estrutura_detectada}

📄 Documentacao Encontrada:
{docs_detectados}

❌ Nao Detectado (sera perguntado):
- {elementos_faltantes}
```

### Fase 2: Perguntas Interativas

Perguntar apenas sobre informacoes NAO detectadas na Fase 1.
Pular perguntas se o modo `--auto` for usado e existir um padrao razoavel.

**Perguntas Essenciais:**

1. **Tipo de Aplicacao** (se nao detectado):
   ```
   Que tipo de aplicacao e esta?
   [ ] API REST      [ ] Aplicacao Web     [ ] Aplicativo Movel
   [ ] Ferramenta CLI [ ] Biblioteca/Pacote [ ] Monorepo
   ```

2. **Dominio de Negocio**:
   ```
   Qual e o dominio de negocio?
   [ ] E-commerce    [ ] Plataforma SaaS   [ ] FinTech
   [ ] HealthTech    [ ] EdTech            [ ] Social/Comunidade
   [ ] Midia/Conteudo [ ] IoT              [ ] Outro: _____
   ```

3. **Usuarios Alvo** (2-3 personas):
   ```
   Descreva seus usuarios principais:

   Usuario Principal:
   > Funcao: _____
   > Objetivo principal: _____

   Usuario Secundario (opcional):
   > Funcao: _____
   > Objetivo principal: _____
   ```

4. **Requisitos de Conformidade**:
   ```
   Quais requisitos de conformidade se aplicam?
   [ ] LGPD/GDPR (Protecao de dados)
   [ ] HIPAA (Saude EUA)
   [ ] PCI-DSS (Cartoes de pagamento)
   [ ] SOC2 (Seguranca)
   [ ] Nenhum / Nao aplicavel
   ```

**Perguntas Estendidas** (apenas com modo `--full`):

5. **Objetivos de Negocio**:
   ```
   Objetivos de curto prazo (3-6 meses):
   > _____

   Objetivos de medio prazo (6-12 meses):
   > _____
   ```

6. **Problemas Conhecidos/Divida Tecnica**:
   ```
   Ha problemas conhecidos ou divida tecnica a documentar?
   > _____
   ```

7. **Termos do Glossario**:
   ```
   Termos de negocio chave para definir (separados por virgula):
   > _____
   ```

### Fase 3: Gerar Arquivo de Contexto

Criar `.claude/rules/00-project-context.md`:

```markdown
# Contexto do Projeto - {NOME_PROJETO}

> Gerado automaticamente por `/common:setup-project-context` em {DATA}
> Revisar e personalizar conforme necessario.

## Modo Plano

> **O modo plano é recomendado.** Claude ativa o modo plano para estruturar a abordagem, identificar dependências e apresentar uma estratégia de geração antes de criar artefatos.

## Visao Geral

**{NOME_PROJETO}** e uma aplicacao {TIPO} para o dominio {DOMINIO}.

{DESCRICAO_DO_README_OU_USUARIO}

## Stack Tecnico

| Componente   | Tecnologia           |
|--------------|----------------------|
| Linguagem    | {LINGUAGEM}          |
| Framework    | {FRAMEWORK}          |
| Banco Dados  | {DATABASE}           |
| Cache        | {CACHE_SE_DETECTADO} |
| Testes       | {FRAMEWORKS_TESTE}   |
| CI/CD        | {PLATAFORMA_CICD}    |

## Estrutura do Projeto

```
{ESTRUTURA_DETECTADA}
```

## Dominio de Negocio

### Conceitos Chave

{ENTIDADES_SE_DETECTADAS}

### Bounded Contexts

<!-- Adicionar se usar DDD -->
- Contexto 1: ...
- Contexto 2: ...

## Usuarios e Personas

### {FUNCAO_USUARIO_PRINCIPAL}
- **Objetivo:** {OBJETIVO_USUARIO_PRINCIPAL}
- **Pontos de dor:** A documentar
- **Fluxos chave:** A documentar

### {FUNCAO_USUARIO_SECUNDARIO}
- **Objetivo:** {OBJETIVO_USUARIO_SECUNDARIO}
- **Pontos de dor:** A documentar
- **Fluxos chave:** A documentar

## Restricoes

### Conformidade
{REQUISITOS_CONFORMIDADE}

### Metas de Desempenho
- Tempo de carregamento da pagina: < 3s
- Tempo de resposta da API: < 200ms
- Disponibilidade: 99.9%

### Requisitos de Seguranca
- Conformidade OWASP Top 10
- Validacao de entrada em todos os endpoints
- Autenticacao necessaria para recursos protegidos

## Objetivos

### Curto prazo
{OBJETIVOS_CURTO_PRAZO_OU_PLACEHOLDER}

### Medio prazo
{OBJETIVOS_MEDIO_PRAZO_OU_PLACEHOLDER}

## Problemas Conhecidos / Divida Tecnica

{PROBLEMAS_OU_PLACEHOLDER}

## Glossario

| Termo | Definicao |
|-------|-----------|
{TERMOS_GLOSSARIO_OU_EXEMPLOS}
```

### Fase 4: Validacao e Proximos Passos

Exibir resumo e recomendacoes:

```
╔══════════════════════════════════════════════════════════════╗
║              CONTEXTO DO PROJETO GERADO                       ║
╚══════════════════════════════════════════════════════════════╝

✅ Arquivo criado: .claude/rules/00-project-context.md

Resumo:
┌─────────────────┬────────────────────────────────┐
│ Projeto         │ {NOME_PROJETO}                 │
│ Tipo            │ {TIPO}                         │
│ Stack           │ {FRAMEWORK} + {DATABASE}       │
│ Dominio         │ {DOMINIO}                      │
│ Conformidade    │ {CONFORMIDADE}                 │
│ Personas        │ {QUANTIDADE} definidos         │
└─────────────────┴────────────────────────────────┘

📋 Proximos Passos Recomendados:

1. Revisar arquivo gerado e completar secoes placeholder
2. Adicionar bounded contexts detalhados se usar DDD
3. Documentar fluxos de negocio chave
4. Considerar executar agentes especializados:
   - @database-architect → Documentar schema do banco de dados
   - @api-designer → Documentar endpoints da API
   - @security-reviewer → Revisar restricoes de seguranca

Deseja que eu abra o arquivo para revisao?
```

## Modos

| Modo | Comportamento |
|------|---------------|
| (padrao) | Detecao + perguntas essenciais (tipo, dominio, usuarios, conformidade) |
| `--auto` | Detecao maxima, pular perguntas com padroes razoaveis |
| `--full` | Todas as perguntas incluindo objetivos, problemas e glossario |

## Exemplos

```bash
# Modo padrao - detecao e perguntas equilibradas
/common:setup-project-context

# Modo auto - interacao minima
/common:setup-project-context --auto

# Modo completo - questionario exaustivo
/common:setup-project-context --full
```
