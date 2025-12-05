# Comando: Verificar Testes

Avalie a cobertura e qualidade dos testes na aplicação React Native.

---

## Objetivo

Este comando analisa a suite de testes, identifica gaps de cobertura e avalia a qualidade dos testes existentes.

---

## Análise

### 1. Executar Testes

**Comandos:**

```bash
# Executar todos os testes
npm test

# Com cobertura
npm test -- --coverage

# Modo watch
npm test -- --watch
```

### 2. Cobertura de Testes

**Verificar:**

```bash
# Gerar relatório de cobertura
npm test -- --coverage --coverageReporters=text --coverageReporters=html

# Abrir relatório
open coverage/index.html
```

**Avaliar:**

- [ ] Cobertura de statements > 80%
- [ ] Cobertura de branches > 80%
- [ ] Cobertura de functions > 80%
- [ ] Cobertura de lines > 80%
- [ ] Componentes críticos 100% cobertos

### 3. Qualidade dos Testes

**Verificar:**

- [ ] Testes são significativos (não apenas para cobertura)
- [ ] Testes isolados (sem dependências entre testes)
- [ ] Testes rápidos (< 1s por teste)
- [ ] Asserções claras e específicas
- [ ] Mocks apropriados
- [ ] Setup e teardown adequados

### 4. Tipos de Testes

**Avaliar cobertura:**

- [ ] **Testes Unitários**: Hooks, utils, serviços
- [ ] **Testes de Componentes**: UI components
- [ ] **Testes de Integração**: Fluxos de usuário
- [ ] **Testes E2E**: Jornadas críticas (se aplicável)

### 5. Gaps de Cobertura

**Identificar:**

```bash
# Arquivos sem testes
find src -name "*.tsx" -o -name "*.ts" | while read file; do
  test_file="${file%.tsx}.test.tsx"
  test_file="${test_file%.ts}.test.ts"
  if [ ! -f "$test_file" ]; then
    echo "Missing test: $file"
  fi
done
```

---

## Relatório

```markdown
## Análise de Testes

### Métricas de Cobertura
- Statements: [X]%
- Branches: [X]%
- Functions: [X]%
- Lines: [X]%

### Arquivos sem Testes
- [lista de arquivos]

### Testes Frágeis
- [testes que falham intermitentemente]

### Recomendações
1. [Adicionar testes para componentes críticos]
2. [Melhorar qualidade de testes existentes]
3. [Implementar testes E2E para fluxos principais]
```

---

## Ações

- [ ] Adicionar testes para arquivos sem cobertura
- [ ] Melhorar testes frágeis
- [ ] Atingir meta de cobertura de 80%
- [ ] Implementar testes de integração
- [ ] Configurar CI/CD para falhar se cobertura cair

---

**Testes não são custo, são investimento em confiança e velocidade de desenvolvimento.**
