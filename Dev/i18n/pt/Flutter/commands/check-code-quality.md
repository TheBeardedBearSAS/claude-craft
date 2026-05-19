---
description: Verificação da Qualidade do Código Flutter
argument-hint: [arguments]
---

# Verificação da Qualidade do Código Flutter

## Argumentos

$ARGUMENTS

## Modo Plano

> O modo plano é ativado automaticamente quando o escopo abrange vários módulos ou requer investigação transversal.

## MISSÃO

Você é um especialista Flutter responsável por auditar a qualidade do código segundo o Effective Dart e as melhores práticas.

### Etapa 1 : Análise do projeto

- [ ] Identificar todos os arquivos Dart do projeto
- [ ] Analisar o arquivo `analysis_options.yaml`
- [ ] Referenciar as regras de `/rules/03-coding-standards.md`
- [ ] Referenciar os princípios de `/rules/05-kiss-dry-yagni.md`
- [ ] Verificar a configuração do linter

### Etapa 2 : Verificações de Qualidade do Código (25 pontos)

#### 2.1 Convenções de nomenclatura Effective Dart (6 pontos)
- [ ] **Classes/Enums** : UpperCamelCase (0-1 pt)
  - Exemplos : `UserProfile`, `AuthenticationState`
- [ ] **Variáveis/Métodos** : lowerCamelCase (0-1 pt)
  - Exemplos : `userName`, `fetchUserData()`
- [ ] **Constantes** : lowerCamelCase (0-1 pt)
  - Exemplos : `maxRetries`, `defaultTimeout`
- [ ] **Arquivos** : snake_case (0-1 pt)
  - Exemplos : `user_profile.dart`, `authentication_bloc.dart`
- [ ] **Pacotes** : snake_case (0-1 pt)
  - Verificar `pubspec.yaml`
- [ ] **Nomes descritivos** : Evitar abreviações crípticas (0-1 pt)

#### 2.2 Linting e análise estática (7 pontos)
- [ ] **analysis_options.yaml** configurado com regras estritas (0-2 pts)
  - Incluir `flutter_lints` ou `very_good_analysis`
  - Regras personalizadas ativadas
- [ ] **Nenhum warning** em `flutter analyze` (0-3 pts)
  - Executar : `docker run --rm -v $(pwd):/app -w /app cirrusci/flutter:stable flutter analyze`
- [ ] **Nenhuma violação** de `prefer_const_constructors`, `unnecessary_null_in_if_null_operators` (0-2 pts)

#### 2.3 Princípios KISS, DRY, YAGNI (6 pontos)
- [ ] **KISS (Keep It Simple)** : Métodos < 50 linhas (0-2 pts)
  - Sem lógica complexa desnecessária
  - Um nível de abstração por método
- [ ] **DRY (Don't Repeat Yourself)** : Sem código duplicado (0-2 pts)
  - Utilitários comuns em `/core/utils/`
  - Widgets reutilizáveis extraídos
- [ ] **YAGNI (You Ain't Gonna Need It)** : Sem over-engineering (0-2 pts)
  - Sem código "por precaução"
  - Abstrações justificadas

#### 2.4 Documentação e comentários (3 pontos)
- [ ] **Classes públicas** documentadas com `///` (0-1 pt)
- [ ] **Métodos complexos** com comentários explicativos (0-1 pt)
- [ ] **Sem código comentado** em produção (0-1 pt)
  - Usar git para histórico

#### 2.5 Gestão de erros (3 pontos)
- [ ] **Try-catch** adequados com logging (0-1 pt)
- [ ] **Tipos de erro** específicos (não apenas `catch (e)`) (0-1 pt)
- [ ] **Sem print()** em produção (usar logger) (0-1 pt)

### Etapa 3 : Cálculo do score

```
SCORE QUALIDADE CÓDIGO = Total de pontos / 25

Interpretação :
✅ 20-25 pts : Qualidade excelente
⚠️ 15-19 pts : Qualidade correta, melhorias recomendadas
⚠️ 10-14 pts : Qualidade a melhorar
❌ 0-9 pts : Qualidade problemática
```

### Etapa 4 : Relatório detalhado

Gere um relatório com:

#### 📊 SCORE QUALIDADE CÓDIGO : XX/25

#### ✅ Pontos fortes
- Convenções bem respeitadas
- Exemplos de código limpo e legível

#### ⚠️ Pontos de atenção
- Violações menores detectadas com arquivos
- Sugestões de melhoria

#### ❌ Violações críticas
- Problemas de nomenclatura
- Código duplicado ou muito complexo
- Warnings não resolvidos

#### 📝 Exemplos de código a melhorar

```dart
// ❌ Ruim
var d = DateTime.now(); // Nome críptico
void doStuff() { ... } // Muito vago

// ✅ Bom
final currentDate = DateTime.now();
void authenticateUser() { ... }
```

#### 🎯 TOP 3 AÇÕES PRIORITÁRIAS

1. **[PRIORIDADE ALTA]** Resolver os warnings de `flutter analyze` (Impacto : manutenibilidade)
2. **[PRIORIDADE MÉDIA]** Refatorar os métodos > 50 linhas (Impacto : legibilidade)
3. **[PRIORIDADE BAIXA]** Documentar as classes públicas faltando (Impacto : API)

---

**Nota** : Este relatório foca apenas na qualidade do código. Para uma auditoria completa, use `/check-compliance`.
