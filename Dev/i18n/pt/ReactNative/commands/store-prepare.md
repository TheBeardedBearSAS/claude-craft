---
description: Comando: Preparar para Publicação
---

# Comando: Preparar para Publicação

Prepare sua aplicação React Native para submissão à App Store (iOS) e Google Play Store (Android).

---

## Objetivo

Este comando guia através do processo completo de preparação para publicação nas lojas de aplicativos.

---

## Checklist Pré-Submissão

### Configuração Técnica

- [ ] Versão incrementada (semver)
- [ ] Build number incrementado
- [ ] Changelog preparado
- [ ] Release mode configurado
- [ ] Hermes habilitado
- [ ] ProGuard/R8 habilitado (Android)
- [ ] Secrets em variáveis de ambiente

### iOS

- [ ] CFBundleShortVersionString atualizado
- [ ] CFBundleVersion incrementado
- [ ] Provisioning profile válido
- [ ] Certificados de distribuição configurados
- [ ] Info.plist atualizado com descrições de permissões
- [ ] App icons configurados (todos os tamanhos)
- [ ] Launch screen configurada

### Android

- [ ] versionName atualizado
- [ ] versionCode incrementado
- [ ] Keystore configurado
- [ ] Assinatura de release configurada
- [ ] ProGuard rules configuradas
- [ ] Permissões no AndroidManifest.xml justificadas
- [ ] App icons configurados (todos os tamanhos)
- [ ] Splash screen configurada

---

## Assets Necessários

### Ícones do App

**iOS:**
- 1024x1024 (App Store)
- 180x180 (iPhone @3x)
- 120x120 (iPhone @2x)
- 167x167 (iPad Pro @2x)

**Android:**
- 512x512 (Google Play)
- xxxhdpi: 192x192
- xxhdpi: 144x144
- xhdpi: 96x96
- hdpi: 72x72
- mdpi: 48x48

### Screenshots

**iOS (por dispositivo):**
- 6.7": 1290x2796
- 6.5": 1242x2688
- 5.5": 1242x2208

**Android:**
- Telefone: 1080x1920
- Tablet 7": 1920x1200
- Tablet 10": 2560x1600

---

## Build de Release

### iOS

```bash
# Limpar build anterior
cd ios && rm -rf build && cd ..

# Instalar pods
cd ios && pod install && cd ..

# Build do arquivo
cd ios
xcodebuild -workspace YourApp.xcworkspace \
  -scheme YourApp \
  -configuration Release \
  -archivePath build/YourApp.xcarchive \
  archive

# Exportar IPA
xcodebuild -exportArchive \
  -archivePath build/YourApp.xcarchive \
  -exportPath build/Release \
  -exportOptionsPlist ExportOptions.plist
```

### Android

```bash
# Limpar build anterior
cd android && ./gradlew clean && cd ..

# Build AAB (recomendado para Google Play)
cd android && ./gradlew bundleRelease

# ou Build APK
cd android && ./gradlew assembleRelease

# Arquivo gerado em:
# AAB: android/app/build/outputs/bundle/release/app-release.aab
# APK: android/app/build/outputs/apk/release/app-release.apk
```

---

## Metadados da Loja

### Informações Básicas

- [ ] Nome do app (curto)
- [ ] Título (longo, com keywords)
- [ ] Descrição curta (80-100 caracteres)
- [ ] Descrição completa
- [ ] Keywords / Tags
- [ ] Categoria principal
- [ ] Classificação etária
- [ ] Política de privacidade URL
- [ ] Termos de serviço URL
- [ ] Website URL
- [ ] Email de suporte

### Localização

- [ ] Traduções para idiomas suportados
- [ ] Screenshots localizados
- [ ] Descrições localizadas

---

## Testes Finais

### Funcionalidade

- [ ] Fluxos principais testados
- [ ] Pagamentos testados (se aplicável)
- [ ] Notificações push testadas
- [ ] Deep links testados
- [ ] Compartilhamento testado
- [ ] Permissões testadas

### Performance

- [ ] Tempo de inicialização < 3s
- [ ] Sem crashes
- [ ] Sem memory leaks
- [ ] Performance em dispositivos antigos
- [ ] Bateria não drena excessivamente

### Compliance

- [ ] GDPR compliant (se aplicável)
- [ ] COPPA compliant (se app para crianças)
- [ ] Acessibilidade implementada
- [ ] Guidelines da loja seguidas

---

## Submissão

### iOS (App Store Connect)

1. Criar app no App Store Connect
2. Preencher metadados
3. Upload de screenshots
4. Upload do build (via Xcode ou Transporter)
5. Selecionar build para revisão
6. Responder questões de compliance
7. Submeter para revisão

### Android (Google Play Console)

1. Criar app no Google Play Console
2. Preencher metadados
3. Upload de screenshots
4. Upload do AAB/APK
5. Configurar países e preço
6. Responder questões de compliance
7. Submeter para revisão

---

## Pós-Submissão

- [ ] Monitorar status da revisão
- [ ] Responder a solicitações do review team
- [ ] Preparar release notes
- [ ] Configurar staged rollout (Google Play)
- [ ] Monitorar crashes pós-lançamento
- [ ] Monitorar reviews e feedback
- [ ] Preparar hotfix se necessário

---

## Ferramentas Úteis

- **Fastlane**: Automação de build e deploy
- **EAS Build**: Build na nuvem (Expo)
- **TestFlight**: Beta testing (iOS)
- **Google Play Beta**: Beta testing (Android)

---

## Checklist Final

- [ ] Todos os builds testados
- [ ] Metadados completos
- [ ] Screenshots prontos
- [ ] Políticas de privacidade e termos prontos
- [ ] Compliance verificado
- [ ] Equipe de suporte preparada
- [ ] Monitoramento configurado
- [ ] Plano de marketing pronto

---

**Primeira impressão importa. Invista tempo em metadados e screenshots de qualidade.**
