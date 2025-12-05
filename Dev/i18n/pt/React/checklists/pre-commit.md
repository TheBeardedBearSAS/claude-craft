# Checklist: Pre-Commit React

## Qualidade de Codigo

### Linting

- [ ] ESLint executado sem erros
- [ ] ESLint executado sem warnings
- [ ] Todas as regras de linting respeitadas
- [ ] Imports organizados corretamente

```bash
npm run lint
```

### Formatacao

- [ ] Prettier aplicado em todos os arquivos
- [ ] Formatacao consistente em todo o projeto
- [ ] Sem diferencas de formatacao

```bash
npm run format
```

### TypeScript

- [ ] Compilacao TypeScript sem erros
- [ ] Tipos rigorosos (sem `any`)
- [ ] Interfaces bem definidas
- [ ] Imports de tipos usando `type`

```bash
npm run type-check
```

## Testes

### Testes Unitarios

- [ ] Todos os testes unitarios passando
- [ ] Novos testes adicionados para novo codigo
- [ ] Cobertura de codigo mantida/melhorada (> 80%)
- [ ] Sem testes pulados (`.skip()`)
- [ ] Sem testes focados (`.only()`)

```bash
npm run test
```

### Testes de Snapshot

- [ ] Snapshots atualizados se necessario
- [ ] Mudancas de snapshot revisadas e justificadas

## Codigo

### Limpeza

- [ ] Sem `console.log()` ou `debugger`
- [ ] Sem codigo comentado
- [ ] Sem imports nao utilizados
- [ ] Sem variaveis nao utilizadas
- [ ] Sem TODO/FIXME nao rastreados

### Seguranca

- [ ] Sem segredos hardcoded (chaves API, senhas)
- [ ] Input do usuario validado
- [ ] Dados do usuario sanitizados
- [ ] URLs externas sanitizadas

### Performance

- [ ] Sem loops desnecessarios
- [ ] Memoizacao aplicada quando apropriado
- [ ] Re-renderizacoes minimizadas
- [ ] Lazy loading implementado onde faz sentido

### Acessibilidade

- [ ] Atributos ARIA corretos
- [ ] Labels associados a inputs
- [ ] Navegacao por teclado funcional
- [ ] Contraste de cores adequado

## Arquivos

### Novos Arquivos

- [ ] Nomes de arquivos seguem convencoes
- [ ] Localizacao correta na estrutura
- [ ] Exports apropriados
- [ ] Documentacao incluida

### Arquivos Modificados

- [ ] Mudancas intencionais apenas
- [ ] Sem formatacao acidental
- [ ] Sem refatoracao nao relacionada
- [ ] Documentacao atualizada

## Git

### Commits

- [ ] Commits atomicos (uma mudanca logica por commit)
- [ ] Mensagens de commit seguem Conventional Commits
- [ ] Mensagens de commit claras e descritivas
- [ ] Sem commits de "WIP" ou "teste"

### Branch

- [ ] Branch nomeada corretamente
- [ ] Baseada na branch correta (`develop`)
- [ ] Atualizada com branch base
- [ ] Sem conflitos

## Documentacao

- [ ] Comentarios JSDoc adicionados para novas funcoes/componentes
- [ ] README atualizado se necessario
- [ ] CHANGELOG atualizado
- [ ] Storybook atualizado (se aplicavel)

## Dependencias

- [ ] Sem novas dependencias desnecessarias
- [ ] Novas dependencias justificadas
- [ ] Package.json atualizado
- [ ] Package-lock.json atualizado

## Build

- [ ] Build de producao bem-sucedido
- [ ] Sem warnings no build
- [ ] Tamanho do bundle razoavel
- [ ] Assets otimizados

```bash
npm run build
```

## Pre-Commit Hooks

Se usando Husky:

- [ ] Pre-commit hook executado com sucesso
- [ ] Lint-staged aplicado
- [ ] Testes relacionados passando

## Checklist Final

Antes de fazer commit:

```bash
# 1. Verificar status
git status

# 2. Executar linter
npm run lint

# 3. Executar formatacao
npm run format

# 4. Verificar tipos
npm run type-check

# 5. Executar testes
npm run test

# 6. Build
npm run build

# 7. Revisar mudancas
git diff

# 8. Stage arquivos
git add .

# 9. Commit
git commit -m "tipo(escopo): mensagem descritiva"
```

## Notas

- Esta checklist deve ser executada antes de CADA commit
- Automatizar quando possivel com Husky e lint-staged
- Adaptar conforme necessidades do projeto
- Nao pular etapas por pressa - prevenir problemas futuros
