# Checklist de Release

## Pré-Release (D-7 a D-1)

### Planejamento

- [ ] Data da release confirmada
- [ ] Escopo da release finalizado (features, correções)
- [ ] Release notes escritas
- [ ] Comunicação planejada (interna + externa)
- [ ] Suporte informado das mudanças
- [ ] Documentação atualizada

### Código

- [ ] Feature freeze respeitado
- [ ] Todas as PRs merged
- [ ] Code reviews completos
- [ ] Não há TODOs críticos pendentes
- [ ] Branch de release criada (se aplicável)
- [ ] Versão incrementada (package.json, build.gradle, etc.)

### Testes

- [ ] Testes unitários passando (100%)
- [ ] Testes de integração passando
- [ ] Testes E2E passando
- [ ] Testes de performance validados
- [ ] Testes de segurança validados
- [ ] Testes de regressão completos
- [ ] UAT (User Acceptance Testing) validado

### Infraestrutura

- [ ] Ambiente de produção pronto
- [ ] Configuração de produção verificada
- [ ] Scaling configurado se necessário
- [ ] Monitoramento em funcionamento
- [ ] Alertas configurados
- [ ] Backups verificados

---

## Dia da Release (D-Day)

### Antes do Deploy

- [ ] Equipe de release briefada
- [ ] Canais de comunicação prontos (Slack, email)
- [ ] Plano de rollback pronto e testado
- [ ] Janela de manutenção comunicada (se aplicável)
- [ ] Suporte em standby
- [ ] Backup do banco de dados realizado

### Deploy

- [ ] Deploy final em staging OK
- [ ] Smoke tests em staging OK
- [ ] Tag de release criada
- [ ] Deploy em produção lançado
- [ ] Monitoramento observado durante deploy
- [ ] Smoke tests em produção OK

### Verificação Pós-Deploy

- [ ] Aplicação acessível
- [ ] Funcionalidades críticas verificadas
- [ ] Não há erros nos logs
- [ ] Métricas de performance normais
- [ ] Não há alertas disparados
- [ ] Integrações de third-party funcionais

---

## Pós-Release (D+1 a D+7)

### Monitoramento

- [ ] Taxa de erro normal (< 0.1%)
- [ ] Tempo de resposta aceitável
- [ ] Não há degradação de performance
- [ ] Feedback dos usuários coletado
- [ ] Tickets de suporte acompanhados

### Comunicação

- [ ] Release notes publicadas
- [ ] Equipe interna informada
- [ ] Clientes/usuários notificados
- [ ] Post de blog / changelog atualizado

### Documentação

- [ ] Documentação técnica atualizada
- [ ] Runbook atualizado se necessário
- [ ] Post-mortem se houver incidentes
- [ ] Lições aprendidas documentadas

### Limpeza

- [ ] Branches de release merged/deletadas
- [ ] Feature flags limpas
- [ ] Ambientes de teste limpos
- [ ] Recursos temporários deletados

---

## Checklist de Rollback

Em caso de problema crítico:

- [ ] Decisão de rollback tomada (critérios definidos previamente)
- [ ] Comunicação imediata à equipe
- [ ] Rollback executado
- [ ] Verificação do rollback
- [ ] Comunicação aos usuários
- [ ] Post-mortem agendado

### Critérios de Rollback

- [ ] Taxa de erro > 5%
- [ ] Funcionalidade crítica não funcionando
- [ ] Perda de dados detectada
- [ ] Vulnerabilidade de segurança descoberta
- [ ] Impacto importante no negócio

---

## Tipos de Release

### Release Major (X.0.0)

- [ ] Todos os critérios acima
- [ ] Comunicação de marketing
- [ ] Treinamento da equipe de suporte
- [ ] Guia de migração se breaking changes
- [ ] Testes beta prévios

### Release Minor (x.Y.0)

- [ ] Critérios padrão
- [ ] Release notes detalhadas
- [ ] Notificação aos usuários

### Patch (x.y.Z)

- [ ] Testes focados na correção
- [ ] Deploy rápido possível
- [ ] Comunicação se crítico

### Hotfix

- [ ] Processo acelerado
- [ ] Testes mínimos mas essenciais
- [ ] Deploy imediato
- [ ] Post-mortem obrigatório

---

## Contatos de Emergência

| Papel | Nome | Contato |
|------|------|---------|
| Release Manager | | |
| Tech Lead | | |
| DevOps | | |
| Support Lead | | |
| Product Owner | | |

---

## Histórico de Releases

| Versão | Data | Status | Notas |
|---------|------|--------|-------|
| | | | |
