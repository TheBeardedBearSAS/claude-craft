# Verificar Segurança do Aplicativo Flutter

Execute uma auditoria de segurança completa do aplicativo Flutter.

## Verificações de Segurança

### 1. Secrets Hardcoded

```bash
# Buscar possíveis secrets
grep -r "API_KEY\|SECRET\|PASSWORD\|TOKEN" lib/ --exclude-dir={build,test}
grep -r "http://" lib/ # Deve usar HTTPS
```

### 2. Storage Seguro

```bash
# Verificar uso de SecureStorage
grep -r "flutter_secure_storage" lib/
grep -r "SharedPreferences" lib/ | grep -i "token\|password"
```

### 3. Validação de Inputs

- [ ] Validação client-side presente
- [ ] Sanitização de inputs
- [ ] Prevenção de injeção

### 4. Permissões

```bash
# Android
cat android/app/src/main/AndroidManifest.xml | grep "uses-permission"

# iOS
cat ios/Runner/Info.plist | grep "UsageDescription"
```

### 5. Obfuscação

```bash
# Verificar configuração
grep -r "obfuscate" build.gradle
grep -r "ProGuard" android/app/build.gradle
```

## Vulnerabilidades Comuns

- [ ] Sem secrets hardcoded
- [ ] HTTPS apenas
- [ ] Dados sensíveis em SecureStorage
- [ ] Certificate pinning implementado
- [ ] Permissões mínimas
- [ ] Obfuscação habilitada em produção

## Relatório

Liste todas as vulnerabilidades encontradas com severidade (Crítica/Alta/Média/Baixa) e recomendações de correção.
