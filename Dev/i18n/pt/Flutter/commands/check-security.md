---
description: Verificação de Segurança Flutter
argument-hint: [arguments]
---

# Verificação de Segurança Flutter

## Argumentos

$ARGUMENTS

## Modo Plano

> O modo plano é ativado automaticamente quando o escopo abrange vários módulos ou requer investigação transversal.

## MISSÃO

Você é um especialista Flutter responsável por auditar a segurança do projeto segundo as melhores práticas.

### Etapa 1 : Análise de arquivos sensíveis

- [ ] Examinar `pubspec.yaml` para dependências de segurança
- [ ] Procurar arquivos de configuração (`.env`, `config.dart`)
- [ ] Referenciar as regras de `/rules/11-security.md`
- [ ] Verificar `.gitignore` para secrets
- [ ] Escanear arquivos Dart para credenciais hardcoded

### Etapa 2 : Verificações de Segurança (25 pontos)

#### 2.1 Gestão de secrets (8 pontos)
- [ ] **Sem secrets hardcoded** no código (0-4 pts)
  - Procurar: chaves de API, tokens, senhas, URLs sensíveis
  - Comando: `grep -r -E "(api[_-]?key|token|password|secret)" lib/ --include="*.dart"`
  - Exemplos a evitar:
    ```dart
    ❌ const apiKey = "sk_live_123abc";
    ❌ final password = "admin123";
    ```
- [ ] **Variáveis de ambiente** utilizadas (0-2 pts)
  - Pacote `flutter_dotenv` ou `envied`
  - Arquivo `.env` em `.gitignore`
  - Arquivo `.env.example` commitado
- [ ] **Armazenamento seguro** com flutter_secure_storage (0-2 pts)
  - Para tokens, credenciais de usuário
  - Sem SharedPreferences para dados sensíveis

#### 2.2 Comunicação de rede (6 pontos)
- [ ] **HTTPS obrigatório** para todas as APIs (0-3 pts)
  - Sem `http://` em produção
  - Certificate pinning para APIs críticas
  - Verificar chamadas Dio/http
- [ ] **Validação de certificados** SSL/TLS (0-2 pts)
  - Sem `badCertificateCallback` que aceite tudo
  - Trust anchor corretamente configurado
- [ ] **Timeouts configurados** para evitar DoS (0-1 pt)

#### 2.3 Dados sensíveis (5 pontos)
- [ ] **Criptografia de dados locais** (0-2 pts)
  - flutter_secure_storage para credenciais
  - Hive/SQLite com criptografia para PII
- [ ] **Sem logs sensíveis** (0-2 pts)
  - Sem `print()` com tokens, e-mails, senhas
  - Logger configurado para filtrar dados sensíveis
  - Exemplos a evitar:
    ```dart
    ❌ print('User password: $password');
    ❌ debugPrint('API Response: $token');
    ```
- [ ] **Ofuscação do código** no release (0-1 pt)
  - `flutter build --obfuscate --split-debug-info`

#### 2.4 Permissões e acesso (3 pontos)
- [ ] **Permissões mínimas** Android/iOS (0-2 pts)
  - AndroidManifest.xml: apenas as necessárias
  - Info.plist: justificativas NSUsage*Description
- [ ] **Validação de entradas do usuário** (0-1 pt)
  - Sem injeção em queries
  - Sanitização de inputs

#### 2.5 Dependências (3 pontos)
- [ ] **Pacotes atualizados** sem vulnerabilidades conhecidas (0-2 pts)
  - Comando: `docker run --rm -v $(pwd):/app -w /app cirrusci/flutter:stable flutter pub outdated`
  - Verificar avisos de segurança no pub.dev
- [ ] **Auditoria de dependências** de terceiros (0-1 pt)
  - Sem pacotes abandonados
  - Fontes confiáveis (pub.dev verificado)

### Etapa 3 : Scans automatizados

```bash
# Escanear secrets hardcoded
docker run --rm -v $(pwd):/app -w /app alpine/git sh -c "
  grep -r -n -E '(api[_-]?key|token|password|secret|credential).*[=:]\s*[\"'\''][^\"'\'']+[\"'\'']' lib/ || echo 'Nenhum secret encontrado'
"

# Verificar HTTPS
docker run --rm -v $(pwd):/app -w /app alpine/git sh -c "
  grep -r -n 'http://' lib/ --include='*.dart' || echo 'Sem HTTP encontrado'
"

# Listar pacotes sensíveis
docker run --rm -v $(pwd):/app -w /app cirrusci/flutter:stable flutter pub deps --style=compact
```

### Etapa 4 : Cálculo do score

```
SCORE SEGURANÇA = Total de pontos / 25

Interpretação :
✅ 20-25 pts : Segurança excelente
⚠️ 15-19 pts : Segurança correta, vigilância necessária
⚠️ 10-14 pts : Segurança a reforçar
❌ 0-9 pts : Vulnerabilidades críticas
```

### Etapa 5 : Relatório detalhado

Gere um relatório com:

#### 📊 SCORE SEGURANÇA : XX/25

#### ✅ Pontos fortes
- Boas práticas de segurança detectadas
- flutter_secure_storage utilizado
- HTTPS configurado

#### ⚠️ Pontos de atenção
- Pacotes a atualizar
- Permissões muito amplas
- Logs potencialmente sensíveis

#### ❌ Vulnerabilidades críticas

**SECRETS HARDCODED DETECTADOS:**
```
❌ lib/config/api_config.dart:5
  const apiKey = "sk_live_abc123xyz";

❌ lib/services/auth_service.dart:12
  final baseUrl = "http://api.example.com"; // HTTP em vez de HTTPS
```

**ARMAZENAMENTO NÃO SEGURO:**
```
❌ lib/repositories/auth_repository.dart:23
  await prefs.setString('auth_token', token); // SharedPreferences para token
```

#### 🔒 Recomendações de segurança

1. **Migrar secrets para .env**
   ```dart
   // ✅ Bom
   final apiKey = dotenv.env['API_KEY'];
   ```

2. **Usar flutter_secure_storage**
   ```dart
   // ✅ Bom
   final storage = FlutterSecureStorage();
   await storage.write(key: 'token', value: token);
   ```

3. **Forçar HTTPS**
   ```dart
   // ✅ Bom
   final dio = Dio(BaseOptions(
     baseUrl: 'https://api.example.com',
     validateStatus: (status) => status! < 500,
   ));
   ```

#### 🎯 TOP 3 AÇÕES PRIORITÁRIAS

1. **[PRIORIDADE CRÍTICA]** Remover todos os secrets hardcoded e migrar para .env (Impacto: segurança dos dados)
2. **[PRIORIDADE ALTA]** Substituir SharedPreferences por flutter_secure_storage para tokens (Impacto: roubo de credenciais)
3. **[PRIORIDADE MÉDIA]** Ativar certificate pinning para APIs de produção (Impacto: ataques MITM)

---

**⚠️ ATENÇÃO**: Nunca comitar secrets! Verificar `.gitignore` e usar `git-secrets` ou `truffleHog`.

**Nota**: Este relatório foca apenas na segurança. Para uma auditoria completa, use `/check-compliance`.
