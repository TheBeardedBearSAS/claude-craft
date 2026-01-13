---
description: Adicionar uma nova tecnologia ao claude-craft com best practices do Context7 e pesquisa web
argument-hint: <nome-tecnologia>
---

# Adicionar Tecnologia

Você é um especialista integrador de tecnologias para claude-craft. Sua missão é adicionar uma nova stack tecnológica:
1. Pesquisando best practices usando Context7 MCP e pesquisa web
2. Gerando todos os arquivos necessários (rules, commands, templates, skills, agents)
3. Criando o script de instalação
4. Atualizando documentação e página de apresentação

## Argumentos
$ARGUMENTS

Argumentos:
- `nome-tecnologia`: Nome da tecnologia a adicionar (ex: "nextjs", "nestjs", "golang", "laravel")
- (Opcional) `categoria`: Categoria da tecnologia (frontend, backend, mobile, devops, fullstack)

Exemplo: `/common:add-technology "nestjs"` ou `/common:add-technology "golang" backend`

## MISSÃO

### Passo 1: Analisar a Tecnologia

Identificar:
- Nome oficial e aliases comuns
- Tipo: framework, biblioteca, linguagem, ferramenta
- Categoria: frontend, backend, mobile, devops, fullstack
- Ecossistema: ferramentas relacionadas, frameworks de teste, opções de deploy
- Público-alvo: web, mobile, API, CLI, etc.

### Passo 2: Pesquisar com Context7 (MCP)

**Usar Context7 para acessar documentação oficial:**

```
Consultar Context7 para:
1. Guia oficial de início
2. Estrutura de projeto recomendada
3. Best practices e design patterns
4. Estratégias de teste (unitário, integração, e2e)
5. Best practices de segurança
6. Dicas de otimização de performance
7. Recomendações de deploy
```

#### Informações a Extrair

| Tema | Detalhes a Encontrar |
|------|---------------------|
| Arquitetura | Padrões recomendados (MVC, Clean, Hexagonal, etc.) |
| Padrões de Código | Guia de estilo, convenções de nomenclatura, estrutura de arquivos |
| Ferramentas | Ferramentas CLI, formatadores, linters, bundlers |
| Testes | Frameworks de teste, ferramentas de cobertura, estratégias de mock |
| Segurança | Autenticação, autorização, vulnerabilidades comuns |
| Qualidade | Análise estática, verificação de tipos, práticas de review |

### Passo 3: Complementar com Pesquisa Web

**Buscar tendências 2026 e práticas da comunidade:**

1. **Últimas Tendências**
   - Versão estável atual
   - Recursos futuros
   - Avisos de deprecação
   - Guias de migração

2. **Best Practices da Comunidade**
   - Boilerplates populares
   - Configurações de produção
   - Benchmarks de performance
   - Arquiteturas reais

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

**Criar estrutura completa em 5 idiomas (en, fr, es, de, pt):**

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
│   └── [generate-*.md se aplicável]
├── templates/
│   └── [templates específicos da tecnologia]
├── checklists/
│   ├── pre-commit.md
│   └── new-feature.md
├── agents/
│   └── {tech}-reviewer.md
└── skills/
    └── [skills específicos da tecnologia]
```

### Passo 5: Criar Script de Instalação

**Gerar `Dev/scripts/install-{tech}-rules.sh`:**

Seguir o padrão dos scripts existentes:
- Suporte às opções `--lang`, `--force`, `--update`, `--dry-run`, `--backup`
- Copiar regras genéricas de Common/
- Copiar regras específicas da tecnologia
- Gerar CLAUDE.md e 00-project-context.md
- Exibir resumo da instalação

### Passo 6: Atualizar Documentação

**Arquivos a atualizar:**

| Arquivo | Alterações |
|---------|------------|
| `README.md` | Adicionar tecnologia à lista de stacks suportadas |
| `docs/index.html` | Incrementar stats, adicionar card da tecnologia |
| `docs/COMMANDS.md` | Documentar novos comandos |
| `Makefile` | Adicionar target `install-{tech}` |

### Passo 7: Validação

#### Checklist Definition of Done

```
══════════════════════════════════════════════════════════════
✅ DEFINITION OF DONE: Adicionar Tecnologia [{NOME_TECH}]
══════════════════════════════════════════════════════════════

📁 ARQUIVOS CRIADOS
──────────────────────────────────────────────────────────────
- [ ] Rules (7 arquivos × 5 idiomas = 35 arquivos)
- [ ] Commands (5 arquivos × 5 idiomas = 25 arquivos)
- [ ] Templates (pelo menos 2 por idioma)
- [ ] Checklists (2 arquivos × 5 idiomas = 10 arquivos)
- [ ] Agent {tech}-reviewer (1 arquivo × 5 idiomas = 5 arquivos)
- [ ] CLAUDE.md.template (× 5 idiomas)
- [ ] Script de instalação (Dev/scripts/install-{tech}-rules.sh)

📄 DOCUMENTAÇÃO ATUALIZADA
──────────────────────────────────────────────────────────────
- [ ] README.md: Tecnologia adicionada às stacks suportadas
- [ ] docs/index.html: Stats incrementadas
- [ ] docs/index.html: Card da tecnologia adicionado
- [ ] docs/index.html: Traduções i18n adicionadas (5 idiomas)
- [ ] docs/COMMANDS.md: Novos comandos documentados
- [ ] Makefile: Target install-{tech} adicionado

🧪 VERIFICAÇÃO
──────────────────────────────────────────────────────────────
- [ ] Script de instalação executa sem erros
- [ ] Todos os arquivos estão corretamente formatados
- [ ] Comandos são funcionais
- [ ] Documentação está correta

══════════════════════════════════════════════════════════════
```

### Diretrizes Importantes

1. **Pesquisar primeiro** - Sempre usar Context7 e pesquisa web antes de gerar arquivos
2. **Seguir padrões** - Usar tecnologias existentes (React, Symfony, Flutter) como modelos
3. **5 idiomas** - Gerar conteúdo para en, fr, es, de, pt
4. **Qualidade sobre velocidade** - Garantir que todos os arquivos estejam formatados corretamente
5. **Atualizar tudo** - Não esquecer documentação e página inicial

### Tratamento de Erros

Se a pesquisa falhar:
- Indicar claramente qual informação está faltando
- Propor fontes alternativas
- Pedir esclarecimentos ao usuário se necessário
- NUNCA gerar arquivos com conteúdo placeholder ou inventado
