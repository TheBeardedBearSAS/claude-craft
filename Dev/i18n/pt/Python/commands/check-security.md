# Verificar Segurança Python

## Argumentos

$ARGUMENTS (opcional: caminho para o projeto a analisar)

## MISSÃO

Realizar uma auditoria completa de segurança do projeto Python identificando vulnerabilidades, secrets expostos e más práticas de segurança definidas nas regras do projeto.

### Passo 1: Análise de Segurança com Bandit

Escanear código com Bandit para detectar vulnerabilidades:
- [ ] Sem senhas/secrets hardcoded
- [ ] Sem uso de `eval()` ou `exec()`
- [ ] Sem deserialização insegura (pickle)
- [ ] Sem SQL injection (ORM ou queries parametrizadas)
- [ ] Sem injeção de comando shell
- [ ] Criptografia segura (não MD5/SHA1)

**Comando**: Executar `docker run --rm -v $(pwd):/app python:3.11 sh -c "pip install bandit && bandit -r /app -f json"`

**Referência**: `rules/06-tooling.md` seção "Security Analysis"

### Passo 2: Detecção de Secrets

Buscar secrets e credenciais no código:
- [ ] Sem chaves de API no código fonte
- [ ] Sem tokens em arquivos
- [ ] Sem senhas em texto plano
- [ ] Variáveis de ambiente para configuração sensível
- [ ] .env no .gitignore
- [ ] .env.example fornecido (sem valores reais)

**Comando**: Usar grep/busca para detectar padrões de secrets

**Padrões para buscar**:
- `password\s*=\s*["'][^"']+["']`
- `api_key\s*=\s*["'][^"']+["']`
- `secret\s*=\s*["'][^"']+["']`
- `token\s*=\s*["'][^"']+["']`

**Referência**: `rules/03-coding-standards.md` seção "Security Best Practices"

### Passo 3: Validação de Entrada do Usuário

Verificar validação e sanitização de dados:
- [ ] Validação de todas as entradas do usuário
- [ ] Uso de Pydantic para validação
- [ ] Sanitização de dados antes do processamento
- [ ] Sem confiança cega em dados externos
- [ ] Validação de tipo e formato
- [ ] Limites no tamanho de entrada

**Referência**: `rules/03-coding-standards.md` seção "Input Validation"

### Passo 4: Dependências e Vulnerabilidades

Analisar dependências para vulnerabilidades conhecidas:
- [ ] Sem dependências com CVEs críticos
- [ ] Versões de bibliotecas atualizadas
- [ ] requirements.txt com versões fixadas
- [ ] Uso de `pip-audit` ou `safety`
- [ ] Sem dependências obsoletas

**Comando**: Executar `docker run --rm -v $(pwd):/app python:3.11 sh -c "pip install pip-audit && pip-audit --requirement /app/requirements.txt"`

**Referência**: `rules/06-tooling.md` seção "Dependency Management"

### Passo 5: Gerenciamento de Erros e Logs

Verificar tratamento seguro de erros:
- [ ] Sem stack traces expostos em produção
- [ ] Mensagens de erro genéricas para usuários
- [ ] Logs seguros (sem dados sensíveis)
- [ ] Sem modo debug em produção
- [ ] Tratamento adequado de exceções
- [ ] Logging de eventos de segurança

**Referência**: `rules/03-coding-standards.md` seção "Error Handling"

### Passo 6: Autenticação e Autorização

Verificar segurança de autenticação:
- [ ] Sem gerenciamento manual de senhas (usar bcrypt/argon2)
- [ ] Tokens JWT com expiração
- [ ] HTTPS obrigatório para endpoints sensíveis
- [ ] Proteção CSRF se aplicável
- [ ] Rate limiting em endpoints sensíveis
- [ ] Validação de permissões (RBAC/ABAC)

**Referência**: `rules/02-architecture.md` seção "Security Layer"

### Passo 7: Configuração e Ambiente

Analisar configuração de segurança:
- [ ] Variáveis de ambiente para secrets
- [ ] Configuração diferente por ambiente (dev/staging/prod)
- [ ] Sem secrets em docker-compose.yml
- [ ] Secrets em variáveis de ambiente ou vault
- [ ] .env.example documentado
- [ ] DEBUG=False em produção

**Referência**: `rules/06-tooling.md` seção "Environment Configuration"

### Passo 8: Injeção e XSS

Verificar proteção contra injeções:
- [ ] Sem SQL injection (ORM ou queries parametrizadas)
- [ ] Escape de dados em templates
- [ ] Sem injeção de comando (subprocess seguro)
- [ ] Validação de caminho de arquivo (path traversal)
- [ ] Content-Security-Policy se aplicação web
- [ ] Sanitização de entrada HTML

**Referência**: `rules/03-coding-standards.md` seção "Security Best Practices"

### Passo 9: Calcular Pontuação

Atribuição de pontos (de 25):
- Bandit (vulnerabilidades): 6 pontos
- Secrets e credenciais: 5 pontos
- Validação de entrada: 4 pontos
- Dependências seguras: 4 pontos
- Tratamento de erros: 3 pontos
- Auth/Authz: 2 pontos
- Injection/XSS: 1 ponto

## FORMATO DE SAÍDA

```
AUDITORIA DE SEGURANÇA PYTHON
================================

PONTUAÇÃO GERAL: XX/25

PONTOS FORTES:
- [Lista de boas práticas de segurança observadas]

MELHORIAS:
- [Lista de melhorias menores de segurança]

PROBLEMAS CRÍTICOS:
- [Lista de vulnerabilidades críticas a corrigir IMEDIATAMENTE]

DETALHES POR CATEGORIA:

1. SCAN BANDIT (XX/6)
   Status: [Análise de vulnerabilidades]
   Problemas Críticos: XX
   Problemas Médios: XX
   Problemas Baixos: XX

2. SECRETS EXPOSTOS (XX/5)
   Status: [Detecção de secrets]
   Secrets Hardcoded: XX
   Arquivos .env Seguros: ✅/❌

3. VALIDAÇÃO DE ENTRADA (XX/4)
   Status: [Validação e sanitização]
   Entradas Não Validadas: XX
   Uso de Pydantic: ✅/❌

4. DEPENDÊNCIAS (XX/4)
   Status: [Vulnerabilidades de dependências]
   CVEs Críticos: XX
   CVEs Médios: XX
   Dependências Obsoletas: XX

5. TRATAMENTO DE ERROS (XX/3)
   Status: [Segurança de erros e logs]
   Stack Traces Expostos: XX
   Dados Sensíveis em Logs: XX

6. AUTENTICAÇÃO (XX/2)
   Status: [Auth/Authz]
   Hashing Seguro: ✅/❌
   JWT com Expiração: ✅/❌

7. INJEÇÕES (XX/1)
   Status: [Proteção contra injeção]
   Riscos SQL Injection: XX
   Riscos Command Injection: XX

VULNERABILIDADES CRÍTICAS:
[Lista detalhada de vulnerabilidades a corrigir imediatamente com arquivo:linha]

TOP 3 AÇÕES PRIORITÁRIAS:
1. [Ação de segurança mais crítica - URGENTE]
2. [Segunda ação prioritária - IMPORTANTE]
3. [Terceira ação prioritária - RECOMENDADO]
```

## NOTAS

- Problemas de segurança DEVEM ser tratados com prioridade absoluta
- Usar Docker para executar ferramentas de segurança
- Fornecer arquivo e linha exatos para cada vulnerabilidade
- Propor correções concretas para cada problema
- Documentar riscos e impacto potencial
- Testar correções sugeridas
- NUNCA fazer commit de secrets no código
