---
description: Adicionar uma nova tecnologia ao claude-craft com boas práticas do Context7 e pesquisa web
argument-hint: <technology-name>
---

# Adicionar Tecnologia

Você é um integrador de tecnologia especialista para o claude-craft. Sua missão é adicionar uma nova stack de tecnologia:
1. Pesquisando boas práticas usando o Context7 MCP e pesquisa web
2. Gerando todos os arquivos necessários (regras, comandos, templates, skills, agentes)
3. Criando o script de instalação
4. Atualizando a documentação e a landing page

## Argumentos
$ARGUMENTS

Argumentos:
- `technology-name`: Nome da tecnologia a ser adicionada (ex.: "nextjs", "nestjs", "golang", "laravel")
- (Opcional) `category`: Categoria da tecnologia (frontend, backend, mobile, devops, fullstack)

Exemplo: `/common:add-technology "nestjs"` ou `/common:add-technology "golang" backend`

## Modo de Planejamento

> **O modo de planejamento é obrigatório.** Antes de executar, o Claude ativa o modo de planejamento para analisar o código impactado, propor um plano de implementação e aguardar sua validação antes de fazer qualquer alteração.

## MISSÃO

### Passo 1: Analisar a Tecnologia

Identificar:
- Nome oficial e aliases comuns
- Tipo: framework, biblioteca, linguagem, ferramenta
- Categoria: frontend, backend, mobile, devops, fullstack
- Ecossistema: ferramentas relacionadas, frameworks de teste, opções de implantação
- Público-alvo: web, mobile, API, CLI, etc.

### Passo 2: Pesquisa com Context7 (MCP)

**Usar o Context7 para acessar a documentação oficial:**

```
Consultar Context7 para:
1. Guia oficial de introdução
2. Estrutura de projeto recomendada
3. Boas práticas e padrões de design
4. Estratégias de teste (unitário, integração, e2e)
5. Boas práticas de segurança
6. Dicas de otimização de performance
7. Recomendações de implantação
```

#### Informações a Extrair

| Tópico | Detalhes a Encontrar |
|--------|----------------------|
| Arquitetura | Padrões recomendados (MVC, Clean, Hexagonal, etc.) |
| Padrões de Codificação | Guia de estilo, convenções de nomeação, estrutura de arquivos |
| Ferramentas | Ferramentas CLI, formatadores, linters, bundlers |
| Testes | Frameworks de teste, ferramentas de cobertura, estratégias de mock |
| Segurança | Autenticação, autorização, vulnerabilidades comuns |
| Qualidade | Análise estática, verificação de tipos, práticas de revisão de código |

### Passo 3: Complementar com Pesquisa Web

**Pesquisar tendências de 2026 e práticas da comunidade:**

1. **Últimas Tendências**
   - Versão estável atual
   - Recursos futuros
   - Avisos de depreciação
   - Guias de migração

2. **Boas Práticas da Comunidade**
   - Boilerplates populares
   - Configurações de produção
   - Benchmarks de performance
   - Arquiteturas do mundo real

3. **Armadilhas Comuns**
   - Erros frequentes
   - Anti-padrões
   - Vulnerabilidades de segurança
   - Gargalos de performance

4. **Ecossistema**
   - Bibliotecas recomendadas
   - Ferramentas de teste
   - Integrações DevOps
   - Soluções de monitoramento

### Passo 4: Gerar Arquivos da Tecnologia

**Criar a estrutura de arquivos completa em todos os 5 idiomas (en, fr, es, de, pt):**

```
Dev/i18n/{lang}/{TECHNOLOGY}/
├── CLAUDE.md.template
├── rules/
│   ├── 00-project-context.md.template
│   ├── 02-architecture-{tech}.md
│   ├── 03-coding-standards.md
│   ├── 06-tooling.md
│   ├── 07-testing-{tech}.md
│   ├── 08-quality-tools.md
│   └── 11-security-{tech}.md
├── commands/
│   ├── check-compliance.md
│   ├── check-architecture.md
│   ├── check-code-quality.md
│   ├── check-testing.md
│   ├── check-security.md
│   └── [generate-*.md if applicable]
├── templates/
│   └── [technology-specific templates]
├── checklists/
│   ├── pre-commit.md
│   └── new-feature.md
├── agents/
│   └── {tech}-reviewer.md
└── skills/
    └── [technology-specific skills]
```

#### Regras a Gerar

| Arquivo | Conteúdo |
|---------|----------|
| `02-architecture-{tech}.md` | Padrões de arquitetura, estrutura de pastas, princípios de arquitetura limpa |
| `03-coding-standards.md` | Guia de estilo, convenções de nomeação, organização de arquivos |
| `06-tooling.md` | Comandos CLI, formatadores, linters, ferramentas de build |
| `07-testing-{tech}.md` | Estratégias de teste, frameworks, requisitos de cobertura |
| `08-quality-tools.md` | Análise estática, verificação de tipos, integração CI/CD |
| `11-security-{tech}.md` | Práticas de segurança, vulnerabilidades comuns, autenticação |

#### Comandos a Gerar

| Comando | Propósito |
|---------|-----------|
| `check-compliance.md` | Auditoria completa de conformidade (pontuação /100) |
| `check-architecture.md` | Revisão de arquitetura |
| `check-code-quality.md` | Análise de qualidade do código |
| `check-testing.md` | Cobertura e qualidade de testes |
| `check-security.md` | Auditoria de segurança |

### Passo 5: Criar Script de Instalação

**Gerar `Dev/scripts/install-{tech}-rules.sh`:**

Seguir o padrão dos scripts existentes:
- Suportar as opções `--lang`, `--force`, `--update`, `--dry-run`, `--backup`
- Copiar regras genéricas de Common/
- Copiar regras específicas da tecnologia
- Gerar CLAUDE.md e 00-project-context.md
- Exibir resumo da instalação

### Passo 6: Atualizar Documentação

**Arquivos a atualizar:**

| Arquivo | Alterações |
|---------|------------|
| `README.md` | Adicionar tecnologia à lista de stacks suportadas |
| `docs/index.html` | Incrementar estatísticas, adicionar card de tecnologia |
| `docs/COMMANDS.md` | Documentar novos comandos |
| `Makefile` | Adicionar target `install-{tech}` |

#### Atualizações da Landing Page (docs/index.html)

1. **Seção de Estatísticas**: Incrementar o contador "Tech Stacks"
2. **Grade de Tecnologias**: Adicionar novo card de tecnologia:

```html
<div class="bg-slate-800/50 p-6 rounded-xl border border-white/5 hover:border-brand-500/50 transition-colors text-center group">
    <div class="h-16 w-16 mx-auto bg-black rounded-full flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
        <span class="text-2xl font-bold text-white">{ICON}</span>
    </div>
    <h3 class="font-bold text-white">{TECH_NAME}</h3>
    <p class="text-xs text-slate-400 mt-2" data-i18n="tech_{tech}_desc">{DESCRIPTION}</p>
</div>
```

3. **Traduções**: Adicionar chaves i18n para todos os 5 idiomas

#### Target do Makefile

```makefile
install-{tech}:
	./Dev/scripts/install-{tech}-rules.sh --lang=$(RULES_LANG) $(OPTIONS) $(TARGET)
```

### Passo 7: Validação

#### Checklist de Definição de Pronto

```
══════════════════════════════════════════════════════════════
✅ DEFINIÇÃO DE PRONTO: Adicionar Tecnologia [{TECH_NAME}]
══════════════════════════════════════════════════════════════

📁 ARQUIVOS CRIADOS
──────────────────────────────────────────────────────────────
- [ ] Regras (7 arquivos × 5 idiomas = 35 arquivos)
- [ ] Comandos (5 arquivos × 5 idiomas = 25 arquivos)
- [ ] Templates (mínimo 2 por idioma)
- [ ] Checklists (2 arquivos × 5 idiomas = 10 arquivos)
- [ ] Agente {tech}-reviewer (1 arquivo × 5 idiomas = 5 arquivos)
- [ ] CLAUDE.md.template (× 5 idiomas)
- [ ] Script de instalação (Dev/scripts/install-{tech}-rules.sh)

📄 DOCUMENTAÇÃO ATUALIZADA
──────────────────────────────────────────────────────────────
- [ ] README.md: Tecnologia adicionada à lista de stacks suportadas
- [ ] docs/index.html: Estatísticas incrementadas
- [ ] docs/index.html: Card de tecnologia adicionado
- [ ] docs/index.html: Traduções i18n adicionadas (5 idiomas)
- [ ] docs/COMMANDS.md: Novos comandos documentados
- [ ] Makefile: Target install-{tech} adicionado

🧪 VERIFICAÇÃO
──────────────────────────────────────────────────────────────
- [ ] Script de instalação executa sem erros
- [ ] Todos os arquivos estão devidamente formatados
- [ ] Os comandos são funcionais
- [ ] A documentação é precisa

══════════════════════════════════════════════════════════════
```

### Formato de Saída

Após concluir todos os passos, fornecer:

```
══════════════════════════════════════════════════════════════
🎉 TECNOLOGIA ADICIONADA: {TECH_NAME}
══════════════════════════════════════════════════════════════

📊 RESUMO
──────────────────────────────────────────────────────────────
Tecnologia: {TECH_NAME}
Categoria: {CATEGORY}
Versão: {CURRENT_VERSION}

Arquivos criados: {COUNT}
- Regras: 35 arquivos
- Comandos: 25 arquivos
- Templates: {COUNT}
- Checklists: 10 arquivos
- Agentes: 5 arquivos

📁 ESTRUTURA
──────────────────────────────────────────────────────────────
Dev/i18n/
├── en/{TECH}/
├── fr/{TECH}/
├── es/{TECH}/
├── de/{TECH}/
└── pt/{TECH}/

Dev/scripts/
└── install-{tech}-rules.sh

🔧 INSTALAÇÃO
──────────────────────────────────────────────────────────────
# Via Makefile
make install-{tech} TARGET=~/my-project RULES_LANG=en

# Script direto
./Dev/scripts/install-{tech}-rules.sh ~/my-project

📚 DOCUMENTAÇÃO
──────────────────────────────────────────────────────────────
- README.md ✅ Atualizado
- docs/index.html ✅ Atualizado
- docs/COMMANDS.md ✅ Atualizado
- Makefile ✅ Atualizado

✅ DEFINIÇÃO DE PRONTO: CONCLUÍDA
══════════════════════════════════════════════════════════════
```

### Diretrizes Importantes

1. **Pesquisar Primeiro** - Sempre usar o Context7 e a pesquisa web antes de gerar arquivos
2. **Seguir Padrões** - Usar tecnologias existentes (React, Symfony, Flutter) como modelos
3. **Todos os 5 Idiomas** - Gerar conteúdo para en, fr, es, de, pt
4. **Qualidade antes da Velocidade** - Garantir que todos os arquivos estejam devidamente formatados e funcionais
5. **Atualizar Tudo** - Não esquecer a documentação e a landing page

### Tratamento de Erros

Se a pesquisa falhar:
- Indicar claramente quais informações estão faltando
- Propor fontes alternativas
- Pedir esclarecimento ao usuário se necessário
- NUNCA gerar arquivos com conteúdo de placeholder ou inventado
