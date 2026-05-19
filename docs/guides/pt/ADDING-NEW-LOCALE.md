# Adicionando uma nova locale ao Claude Craft

Este guia explica como adicionar um novo idioma ao sistema i18n do Claude Craft. O Claude Craft atualmente suporta 5 idiomas (`en`, `fr`, `es`, `de`, `pt`) e foi projetado para facilitar a adição de novos.

---

## Pré-requisitos

- Node.js 20+ com acesso ao repositório do Claude Craft
- Familiaridade com a estrutura do projeto (ver `docs/guides/pt/01-getting-started.md`)
- Uma abordagem de tradução: tradutores humanos, um agente (`@research-assistant`), ou uma combinação

---

## Passo 1 — Registrar o código de locale

Edite `cli/lib/constants.js` e adicione seu código de idioma ao objeto `LANGUAGES`:

```js
const LANGUAGES = {
  en: 'English',
  fr: 'Français',
  es: 'Español',
  de: 'Deutsch',
  pt: 'Português',
  // Adicione sua nova locale aqui, ex.:
  // it: 'Italiano',
  // ja: '日本語',
};
```

Atualize também `scripts/verify-i18n-parity.sh` — encontre o array `LANGS` e adicione seu código:

```bash
LANGS=("en" "fr" "es" "de" "pt" "it")   # exemplo: adicionando italiano
```

---

## Passo 2 — Criar a estrutura de diretórios

O conteúdo i18n do Claude Craft vive em três árvores. Crie os diretórios correspondentes para sua nova locale:

```bash
# Regras e referências Dev
mkdir -p Dev/i18n/<lang>/

# Guias de infraestrutura
mkdir -p Infra/i18n/<lang>/

# Modelos de gestão de projeto
mkdir -p Project/i18n/<lang>/

# Guias de documentação de usuário
mkdir -p docs/guides/<lang>/
```

Cada árvore deve refletir exatamente a referência em inglês (`en`) — mesmos nomes de arquivo, mesmos caminhos relativos.

---

## Passo 3 — Traduzir os arquivos

A locale de referência (`en`) contém aproximadamente **325 arquivos** em todas as árvores. Você pode delegar a tradução a um agente Claude para acelerar o processo:

```
@research-assistant Traduza todos os arquivos de docs/guides/en/ para o italiano (it).
Mantenha a estrutura idêntica. Gere cada arquivo em docs/guides/it/ com o mesmo nome de arquivo.
Preserve todos os blocos de código, exemplos de comandos e links relativos sem alteração.
```

**Regras de tradução:**

| Regra | Detalhe |
|-------|---------|
| Blocos de código | Nunca traduzir — manter como está |
| Comandos CLI | Nunca traduzir |
| Caminhos de arquivo | Nunca traduzir |
| Títulos de seção | Traduzir, manter a formatação Markdown |
| Links | Atualizar o texto exibido, manter caminhos relativos idênticos |
| Termos técnicos | Usar a convenção estabelecida na comunidade do idioma de destino |

Comece com `docs/guides/<lang>/` (maior valor para o usuário), depois `Dev/i18n/<lang>/`, depois `Infra/` e `Project/`.

---

## Passo 4 — Verificar a paridade

Execute o script de verificação de paridade para confirmar que sua locale está completa e atende ao limiar de tamanho:

```bash
# Verificar paridade de contagem de arquivos (bloqueante — deve ser 100%)
bash scripts/verify-i18n-parity.sh

# Verificar paridade de tamanho em modo estrito (ratio >= 0.80 por arquivo)
STRICT_SIZE=1 bash scripts/verify-i18n-parity.sh

# Executar em modo permissivo durante um PR em andamento
I18N_PARITY_STRICT=0 bash scripts/verify-i18n-parity.sh
```

O script gera um relatório de lacunas em `audit/phases/i18n-gap.csv` listando os arquivos abaixo do limiar de ratio 0.80. Use-o para priorizar o trabalho de tradução restante.

**Saída esperada quando completo:**

```
✓ en: 325 arquivos
✓ it: 325 arquivos
✓ Todos os idiomas em paridade
```

---

## Passo 5 — Atualizar CI e documentação

### Workflow do GitHub Actions

Edite `.github/workflows/i18n-parity.yml`. No filtro `paths` do gatilho `pull_request`, o workflow já cobre `Dev/i18n/**`, `docs/guides/**`, `Infra/i18n/**` e `Project/i18n/**` — nenhuma alteração adicional é necessária para locales padrão.

Se você adicionou um filtro específico de locale em outro lugar no workflow, adicione seu novo código a qualquer lista de permissões ou matriz.

### README

Atualize a tabela de guias multilíngue em `README.md` (seção "User Guides (Multilingual)") para incluir links para sua nova locale em cada guia.

### Detecção automática de locale CLI

Se a nova locale corresponde a um prefixo de locale do SO comum (ex. `it` para `it_IT.UTF-8`), adicione o mapeamento em `cli/lib/installer.js` dentro da função `detectLocale()`:

```js
if (raw.startsWith('it')) return 'it';
```

Adicione um caso de teste correspondente em `tests/cli/detect-locale.test.mjs`.

---

## Checklist

- [ ] Código adicionado a `LANGUAGES` em `cli/lib/constants.js`
- [ ] Código adicionado ao array `LANGS` em `scripts/verify-i18n-parity.sh`
- [ ] Diretórios criados: `Dev/i18n/<lang>/`, `Infra/i18n/<lang>/`, `Project/i18n/<lang>/`, `docs/guides/<lang>/`
- [ ] Todos os arquivos traduzidos (325 arquivos)
- [ ] `bash scripts/verify-i18n-parity.sh` sai com 0
- [ ] `STRICT_SIZE=1 bash scripts/verify-i18n-parity.sh` sai com 0 (ou as lacunas estão documentadas)
- [ ] `audit/phases/i18n-gap.csv` revisado e lacunas tratadas
- [ ] Tabela multilíngue do README atualizada
- [ ] `detectLocale()` atualizado + teste adicionado (se a detecção automática de locale do SO for relevante)
- [ ] PR aberto com a etiqueta `i18n/<lang>`

---

> Veja também: `.claude/rules/16-i18n.md` | `scripts/verify-i18n-parity.sh` | `.github/workflows/i18n-parity.yml`
