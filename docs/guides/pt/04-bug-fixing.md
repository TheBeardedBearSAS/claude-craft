# Guia de Correção de Bugs

Este guia cobre a abordagem sistemática para corrigir bugs usando o Claude-Craft, desde o diagnóstico até a validação.

---

## Índice

1. [Fluxo de Correção de Bugs](#fluxo-de-correção-de-bugs)
2. [Fase 1: Reproduzir](#fase-1-reproduzir)
3. [Fase 2: Diagnosticar](#fase-2-diagnosticar)
4. [Fase 3: Escrever Teste de Regressão](#fase-3-escrever-teste-de-regressão)
5. [Fase 4: Corrigir](#fase-4-corrigir)
6. [Fase 5: Validar](#fase-5-validar)
7. [Fase 6: Documentar](#fase-6-documentar)
8. [Procedimentos de Hotfix](#procedimentos-de-hotfix)
9. [Exemplo Completo](#exemplo-completo)

---

## Fluxo de Correção de Bugs

A abordagem sistemática para corrigir bugs:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ 1. Reproduzir│ --> │2. Diagnosticar│ --> │  3. Teste   │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
                                              v
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ 6. Documentar│ <-- │  5. Validar │ <-- │ 4. Corrigir │
└─────────────┘     └─────────────┘     └─────────────┘
```

### Por Que Esta Abordagem?

1. **Reproduzir primeiro**: Não é possível corrigir o que não se consegue ver
2. **Testar antes de corrigir**: Prova que o bug existe e foi corrigido
3. **Validar completamente**: Garante que não há regressão
4. **Documentar**: Ajuda a prevenir bugs semelhantes no futuro

---

## Fase 1: Reproduzir

Antes de corrigir, reproduza o bug de forma consistente.

### Coletar Informações

Obtenha do relatório de bug:
- Passos para reproduzir
- Comportamento esperado
- Comportamento real
- Ambiente (versão, SO, etc.)
- Mensagens de erro/logs
- Capturas de tela, se aplicável

### Criar Ambiente de Reprodução

```bash
# Fazer checkout da versão problemática
git checkout <commit-ou-tag>

# Configurar ambiente idêntico
make docker-up

# Reproduzir com os passos exatos
```

### Verificar a Reprodução

Você consegue acionar o bug de forma consistente?

- [ ] Bug ocorre com os passos relatados
- [ ] Bug ocorre no mesmo ambiente
- [ ] Bug é determinístico (não aleatório)

### Se Você Não Conseguir Reproduzir

```markdown
@research-assistant Ajude-me a entender por que este bug pode ser específico do ambiente

Relatório de bug:
- Usuário vê erro X ao fazer Y
- Não consigo reproduzir localmente
- Usuário está no ambiente Z

Possíveis causas?
```

---

## Fase 2: Diagnosticar

Encontre a causa raiz do bug.

### Usando o Comando de Análise

```bash
/common:analyze-bug "Os usuários não conseguem fazer login com credenciais corretas após redefinição de senha"
```

Este comando irá:
1. Sugerir áreas para investigar
2. Identificar causas potenciais
3. Recomendar passos de depuração
4. Listar áreas de código relacionadas

### Usando o TDD Coach para Diagnóstico

```markdown
@tdd-coach Ajude-me a diagnosticar este bug de autenticação

Sintomas:
- O usuário redefine a senha com sucesso
- A nova senha é salva (confirmado no banco de dados)
- O login falha com "credenciais inválidas"
- A senha antiga também não funciona

O que devo investigar?
```

### Técnicas de Depuração

#### Adicionar Logging

```php
// Log de depuração temporário
$this->logger->debug('Password verification', [
    'user_id' => $user->getId(),
    'stored_hash' => substr($user->getPasswordHash(), 0, 20) . '...',
    'verification_result' => $result,
]);
```

#### Inspecionar o Estado do Banco de Dados

```sql
-- Verificar estado do usuário após redefinição de senha
SELECT id, email, password_hash, updated_at
FROM users
WHERE email = 'user@example.com';
```

#### Rastrear o Caminho de Execução

```php
// Adicionar stack trace em pontos suspeitos
debug_print_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS);
```

### Identificar a Causa Raiz

Categorias comuns:
- **Erro de lógica**: Condição ou cálculo incorreto
- **Erro de estado**: Estado de dados incorreto
- **Condição de corrida**: Comportamento dependente de temporização
- **Erro de integração**: Problema com serviço externo
- **Erro de configuração**: Configurações erradas

### Checklist de Diagnóstico

- [ ] Bug reproduzido de forma consistente
- [ ] Localização do erro identificada
- [ ] Causa raiz compreendida
- [ ] Áreas de código relacionadas identificadas
- [ ] Abordagem de correção determinada

---

## Fase 3: Escrever Teste de Regressão

Escreva um teste que FALHE ANTES da correção e PASSE DEPOIS.

### Por Que Testar Primeiro?

1. **Prova que o bug existe**: O teste falha com o código atual
2. **Prova que a correção funciona**: O teste passa após a correção
3. **Previne regressão**: O teste detecta quebras futuras
4. **Documenta o comportamento**: O teste descreve o comportamento esperado

### Usando o TDD Coach

```markdown
@tdd-coach Ajude-me a escrever um teste de regressão para este bug

Bug: A redefinição de senha não atualiza o hash de senha corretamente

Comportamento esperado:
- O usuário solicita a redefinição de senha
- O usuário define uma nova senha
- O usuário consegue fazer login com a nova senha

Comportamento real:
- O login falha após a redefinição de senha
```

### Exemplo de Teste de Regressão

```php
/**
 * @test
 * @see https://github.com/company/project/issues/123
 *
 * Bug: Os usuários não conseguiam fazer login após a redefinição de senha
 * Causa raiz: O hash de senha não era persistido corretamente
 */
public function test_user_can_login_after_password_reset(): void
{
    // Arrange: Criar usuário com senha conhecida
    $user = $this->createUser('user@example.com', 'old-password');

    // Act: Redefinir senha
    $this->passwordResetService->resetPassword($user, 'new-password');

    // Assert: Consegue fazer login com a nova senha
    $result = $this->authService->authenticate('user@example.com', 'new-password');

    $this->assertTrue($result->isSuccess());
    $this->assertNotNull($result->getToken());
}

/**
 * @test
 * Relacionado: Garantir que a senha antiga não funciona mais
 */
public function test_old_password_fails_after_reset(): void
{
    $user = $this->createUser('user@example.com', 'old-password');

    $this->passwordResetService->resetPassword($user, 'new-password');

    $result = $this->authService->authenticate('user@example.com', 'old-password');

    $this->assertFalse($result->isSuccess());
}
```

### Checklist de Escrita de Testes

- [ ] O teste reproduz o bug (falha antes da correção)
- [ ] O teste tem nome descritivo
- [ ] O teste referencia o número do issue
- [ ] O teste documenta a causa raiz no comentário
- [ ] Casos extremos relacionados testados

---

## Fase 4: Corrigir

Implemente a correção mínima para o bug.

### Diretrizes de Correção

1. **Mudança mínima**: Corrija apenas o bug, não refatore
2. **Intenção clara**: O código deve mostrar o que estava errado
3. **Sem efeitos colaterais**: Não altere comportamento não relacionado
4. **Manter estilo**: Corresponder aos padrões do código existente

### Exemplo de Correção

```php
// ANTES (com bug)
public function resetPassword(User $user, string $newPassword): void
{
    $hash = $this->hasher->hash($newPassword);
    $user->setPasswordHash($hash);
    // Bug: Falta persist/flush!
}

// DEPOIS (corrigido)
public function resetPassword(User $user, string $newPassword): void
{
    $hash = $this->hasher->hash($newPassword);
    $user->setPasswordHash($hash);
    $this->entityManager->persist($user);  // <-- Correção
    $this->entityManager->flush();          // <-- Correção
}
```

### Executar o Teste de Regressão

```bash
# O teste deve passar agora
make test-unit TEST=tests/Unit/PasswordResetTest.php

# Ou executar teste específico
./vendor/bin/phpunit --filter test_user_can_login_after_password_reset
```

### Checklist de Correção

- [ ] O teste de regressão agora passa
- [ ] A correção é mínima e focada
- [ ] Nenhuma alteração não relacionada incluída
- [ ] Estilo do código mantido

---

## Fase 5: Validar

Certifique-se de que a correção não quebre nada mais.

### Executar a Suite Completa de Testes

```bash
# Todos os testes unitários
make test-unit

# Todos os testes de integração
make test-integration

# Suite completa de testes
make test
```

### Verificações de Qualidade

```bash
# Qualidade do código (por tecnologia)
/symfony:check-code-quality
/flutter:check-code-quality
/python:check-code-quality

# Segurança (se a correção toca código sensível)
/common:security-audit

# Conformidade completa
/symfony:check-compliance
```

### Testes Manuais

Mesmo com testes automatizados, verifique manualmente:

1. Seguir os passos originais de reprodução do bug
2. Verificar que o bug não ocorre mais
3. Testar funcionalidades relacionadas
4. Verificar casos extremos

### Usando o Agente Revisor

```markdown
@symfony-reviewer Revise minha correção para o issue #123

Bug: Os usuários não conseguiam fazer login após a redefinição de senha
Correção: Adicionados persist/flush ausentes em resetPassword()

Arquivos alterados:
- src/Application/Service/PasswordResetService.php
- tests/Unit/PasswordResetTest.php

Por favor, verifique:
1. A correção está correta e completa
2. Ausência de efeitos colaterais
3. Cobertura de teste adequada
```

### Checklist de Validação

- [ ] O teste de regressão passa
- [ ] Todos os testes existentes passam
- [ ] A análise estática passa
- [ ] Os testes manuais confirmam a correção
- [ ] Revisão de código concluída

---

## Fase 6: Documentar

Documente a correção para referência futura.

### Formato da Mensagem de Commit

```
fix(auth): resolver falha de login após redefinição de senha

Bug: Os usuários não conseguiam fazer login após redefinir a senha
Causa raiz: A alteração do hash de senha não era persistida no banco de dados
Correção: Adicionadas chamadas a persist() e flush() em PasswordResetService

Closes #123

Test: test_user_can_login_after_password_reset
```

### Atualizar o Rastreador de Issues

```markdown
## Resolução

**Causa Raiz:**
O método `resetPassword()` em `PasswordResetService` estava atualizando o hash
de senha do usuário na memória, mas não persistia a alteração no banco de dados.

**Correção:**
Adicionadas chamadas a `persist()` e `flush()` após definir o novo hash de senha.

**Testes:**
- Teste de regressão adicionado: `test_user_can_login_after_password_reset`
- Teste de caso extremo adicionado: `test_old_password_fails_after_reset`

**Prevenção:**
Considere adicionar um item de verificação na lista de revisão de código para operações de persistência.
```

### Entrada na Base de Conhecimento (se for um padrão recorrente)

```markdown
# Bug Comum: Alterações de Entidade Não Persistidas

## Sintomas
- As alterações de dados parecem funcionar (sem erros)
- As alterações não aparecem no banco de dados
- As alterações são perdidas após atualização da página

## Causa Raiz
Chamadas a `persist()` e/ou `flush()` ausentes no Doctrine.

## Padrão de Correção
```php
$entity->setSomething($value);
$this->entityManager->persist($entity); // Não esqueça!
$this->entityManager->flush();
```

## Prevenção
- Adicionar verificação de persistência ao checklist de revisão de código
- Considerar auto-flush na classe base do serviço
```

### Checklist de Documentação

- [ ] A mensagem de commit descreve o bug e a correção
- [ ] O rastreador de issues atualizado com a resolução
- [ ] Documentação relacionada atualizada
- [ ] Entrada na base de conhecimento se for um padrão

---

## Procedimentos de Hotfix

Para bugs críticos em produção.

### Fluxo de Hotfix

```
1. Criar branch de hotfix a partir de produção
2. Aplicar correção mínima
3. Testar completamente
4. Implantar em produção
5. Mesclar de volta em main
```

### Passo a Passo

```bash
# 1. Criar branch de hotfix
git checkout production
git checkout -b hotfix/issue-123-login-failure

# 2. Aplicar correção
# ... fazer as alterações ...

# 3. Escrever teste de regressão
# ... adicionar teste ...

# 4. Verificar
make test
/symfony:check-compliance

# 5. Commitar com mensagem clara
git commit -m "fix(auth): resolver falha crítica de login após redefinição de senha

HOTFIX para issue de produção.
Causa raiz: Hash de senha não persistido após redefinição.

Closes #123"

# 6. Criar PR para revisão
gh pr create --base production --title "HOTFIX: Falha de login após redefinição de senha"

# 7. Após merge, implantar
# ... processo de implantação ...

# 8. Mesclar de volta em main
git checkout main
git merge hotfix/issue-123-login-failure
git push origin main
```

### Checklist de Hotfix

- [ ] Branch de hotfix criada a partir de produção
- [ ] Correção mínima e focada apenas
- [ ] Teste de regressão adicionado
- [ ] Todos os testes passando
- [ ] PR revisado e aprovado
- [ ] Implantado em produção
- [ ] Verificado em produção
- [ ] Mesclado de volta em main

---

## Exemplo Completo

Vamos percorrer a correção de um bug real.

### Relatório de Bug

```
Issue #456: Total do pedido calculado incorretamente

Passos para reproduzir:
1. Adicionar item com preço $10.00, quantidade 3
2. Adicionar item com preço $5.50, quantidade 2
3. Visualizar o carrinho

Esperado: Total = $41.00 (30 + 11)
Real: Total = $36.00

Ambiente: Produção v2.3.1
Reportado por: Suporte ao cliente
Prioridade: Alta
```

### Passo 1: Reproduzir

```php
// Teste local rápido
$order = new Order();
$order->addItem(new Item('A', 10.00), 3);  // $30
$order->addItem(new Item('B', 5.50), 2);   // $11
echo $order->getTotal(); // Mostra 36.00 - confirmado!
```

### Passo 2: Diagnosticar

```markdown
@tdd-coach Ajude-me a encontrar o bug no cálculo do total do pedido

O total deveria ser 41.00, mas mostra 36.00
A diferença é 5.00, que é exatamente o preço de um item B

Hipótese: a quantidade do segundo item não está sendo contada?
```

A investigação revela:

```php
// Bug encontrado em Order::calculateTotal()
public function calculateTotal(): Money
{
    $total = Money::zero();
    foreach ($this->items as $item) {
        // BUG: Usando 1 em vez da quantidade do item!
        $total = $total->add($item->getPrice()->multiply(1));
    }
    return $total;
}
```

### Passo 3: Escrever Teste de Regressão

```php
/**
 * @test
 * @see https://github.com/company/shop/issues/456
 *
 * Bug: O total do pedido ignorava as quantidades dos itens
 */
public function test_order_total_includes_all_quantities(): void
{
    $order = new Order();
    $order->addItem($this->createItem(10.00), 3);  // $30
    $order->addItem($this->createItem(5.50), 2);   // $11

    $total = $order->calculateTotal();

    $this->assertEquals(41.00, $total->getAmount());
}

/**
 * @test
 * Caso extremo: item único com quantidade > 1
 */
public function test_single_item_quantity_multiplied(): void
{
    $order = new Order();
    $order->addItem($this->createItem(10.00), 5);

    $this->assertEquals(50.00, $order->calculateTotal()->getAmount());
}
```

Executar o teste — confirma que falha.

### Passo 4: Corrigir

```php
public function calculateTotal(): Money
{
    $total = Money::zero();
    foreach ($this->items as $item) {
        // Corrigido: Usar a quantidade real do item do pedido
        $total = $total->add(
            $item->getPrice()->multiply($item->getQuantity())
        );
    }
    return $total;
}
```

### Passo 5: Validar

```bash
# Teste de regressão passa
./vendor/bin/phpunit --filter test_order_total

# Todos os testes passam
make test

# Verificação de qualidade
/symfony:check-compliance
# Pontuação: 94/100 ✓
```

### Passo 6: Documentar

```bash
git commit -m "fix(order): corrigir cálculo do total para incluir as quantidades

Bug: O total do pedido ignorava as quantidades dos itens, sempre usando 1
Causa raiz: multiply(1) codificado em vez de multiply(quantity)
Correção: Usar getQuantity() do item do pedido no cálculo

Closes #456

Testes de regressão adicionados:
- test_order_total_includes_all_quantities
- test_single_item_quantity_multiplied"
```

---

## Dicas de Prevenção de Bugs

1. **Escreva os testes primeiro**: TDD previne muitos bugs
2. **Revisão de código**: Outros olhos detectam problemas
3. **Análise estática**: Ferramentas encontram erros comuns
4. **Testes de integração**: Capturam bugs de interação
5. **Monitorar produção**: Detectar problemas mais cedo
6. **Use `/loop`**: Configure verificações de qualidade recorrentes (ex.: `/loop 5m /common:pre-commit-check`)
7. **Salve aprendizados**: Use `/memory` para persistir padrões de bugs entre sessões

---

[&larr; Desenvolvimento de Features](03-feature-development.md) | [Referência de Ferramentas &rarr;](05-tools-reference.md)
