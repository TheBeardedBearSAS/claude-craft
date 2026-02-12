# Início Rápido - Claude Craft em 5 Minutos

Comece a usar o Claude Craft em apenas 5 minutos!

---

## Verificação de Pré-requisitos

Antes de começar, verifique se estas ferramentas estão instaladas:

```bash
# Verificar Node.js (20+ necessário)
node --version

# Verificar npm
npm --version

# Verificar yq (necessário para config YAML)
yq --version

# Verificar Docker (recomendado)
docker --version
```

**Faltando algo?** Veja o [Guia de Pré-requisitos](PREREQUISITES.md) para instruções de instalação.

---

## Instalação

### Método 1: NPX (Recomendado)

A forma mais rápida de começar:

```bash
# Assistente interativo
npx @the-bearded-bear/claude-craft

# Ou instalar diretamente em um projeto
npx @the-bearded-bear/claude-craft install ~/meu-projeto --tech=symfony --lang=pt
```

### Método 2: Clone + Makefile

```bash
# 1. Clonar o repositório
git clone https://github.com/TheBeardedBearSAS/claude-craft.git
cd claude-craft

# 2. Instalar no seu projeto (escolha sua tecnologia)
make install-symfony TARGET=~/meu-projeto RULES_LANG=pt
```

---

## Seu Primeiro Projeto em 3 Comandos

```bash
# 1. Criar um novo diretório de projeto
mkdir ~/minha-primeira-app && cd ~/minha-primeira-app && git init

# 2. Instalar regras do Claude Craft (exemplo: Symfony + Português)
npx @the-bearded-bear/claude-craft install . --tech=symfony --lang=pt

# 3. Iniciar o Claude Code
claude
```

É isso! Agora você tem acesso a todas as funcionalidades do Claude Craft.

---

## Verificar a Instalação

```bash
# Listar arquivos instalados
ls -la ~/minha-primeira-app/.claude/

# Você deve ver:
# CLAUDE.md          - Configuração principal
# INDEX.md           - Referência rápida
# references/        - Documentação completa
# agents/            - Especialistas IA
# commands/          - Comandos slash
# skills/            - Melhores práticas
```

---

## Teste Seus Primeiros Comandos

No Claude Code, tente estes comandos:

```
# Verificar a arquitetura do seu projeto
/symfony:check-architecture

# Obter uma revisão de código
@symfony-reviewer Revise minha pasta src/

# Gerar uma nova entidade com CRUD
/symfony:generate-crud Produto
```

---

## O Que Vem Depois?

| Tarefa | Guia |
|--------|------|
| Entender a estrutura do projeto | [Guia de Arquitetura](../ARCHITECTURE.md) |
| Criar uma funcionalidade completa | [Desenvolvimento de Features](../guides/pt/03-feature-development.md) |
| Configurar gestão de projeto BMAD | [Guia Prático BMAD](../BMAD-PRACTICAL-GUIDE.md) |
| Executar Claude em loop contínuo | [Guia Ralph Wiggum](../RALPH-GUIDE.md) |

---

## Tecnologias Disponíveis

| Tecnologia | Comando de Instalação | Foco |
|------------|----------------------|------|
| Symfony/PHP | `make install-symfony` | Clean Architecture, DDD |
| Flutter/Dart | `make install-flutter` | BLoC, Riverpod |
| React | `make install-react` | Hooks, State Management |
| React Native | `make install-reactnative` | Mobile, Navigation |
| Python | `make install-python` | FastAPI, async/await |
| Angular | `make install-angular` | Signals, Standalone |
| C#/.NET | `make install-csharp` | Clean Architecture, CQRS |
| Laravel | `make install-laravel` | Clean Architecture, Pest |
| Vue.js | `make install-vuejs` | Composition API, Pinia |
| PHP | `make install-php` | Clean Architecture, PSR-12 |

---

## Precisa de Ajuda?

- **FAQ**: Perguntas frequentes → [FAQ.md](../FAQ.md)
- **Solução de Problemas**: Erros comuns → [TROUBLESHOOTING.md](../TROUBLESHOOTING.md)
- **GitHub Issues**: [Reportar um bug](https://github.com/TheBeardedBearSAS/claude-craft/issues)
