---
description: Lista de Verificação para Publicação React Native nas Lojas
argument-hint: [arguments]
---

# Lista de Verificação para Publicação React Native nas Lojas

Você é um especialista em publicação mobile. Você deve preparar a aplicação para submissão à App Store (iOS) e ao Google Play Store (Android).

## Argumentos
$ARGUMENTS

Argumentos:
- (Opcional) Loja: ios, android, both
- (Opcional) Tipo: new, update

Exemplo: `/reactnative:store-prepare both new`

## Modo de Planejamento

> O modo de planejamento é ativado automaticamente quando o escopo abrange múltiplos módulos ou requer investigação transversal.

## MISSÃO

### Etapa 1: Lista de Verificação Pré-Submissão

```
══════════════════════════════════════════════════════════════
📱 LISTA DE VERIFICAÇÃO PARA PUBLICAÇÃO NAS LOJAS
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
🔧 CONFIGURAÇÃO TÉCNICA
──────────────────────────────────────────────────────────────

### Versão e Build

[ ] Versão incrementada (semver)
    - iOS: CFBundleShortVersionString
    - Android: versionName

[ ] Número de build incrementado
    - iOS: CFBundleVersion (inteiro)
    - Android: versionCode (inteiro)

[ ] Changelog preparado para esta versão

### Build de Release

[ ] Modo release configurado (sem modo dev)
[ ] Bundle JS otimizado
[ ] ProGuard/R8 habilitado (Android)
[ ] Bitcode desabilitado se necessário (iOS)
[ ] Hermes habilitado (recomendado)

### Segurança

[ ] Chaves de API em variáveis de ambiente
[ ] Nenhum segredo no código
[ ] Certificate pinning se necessário
[ ] Keystore assinada corretamente (Android)
[ ] Perfil de provisioning válido (iOS)
```

### Etapa 2: Configuração iOS

```xml
<!-- ios/{App}/Info.plist -->

<!-- Versão -->
<key>CFBundleShortVersionString</key>
<string>1.2.0</string>
<key>CFBundleVersion</key>
<string>45</string>

<!-- Permissões (com descrições para o usuário) -->
<key>NSCameraUsageDescription</key>
<string>Este app usa a câmera para escanear QR codes.</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>Este app acessa suas fotos para permitir que você envie imagens.</string>

<key>NSLocationWhenInUseUsageDescription</key>
<string>Este app usa sua localização para exibir lojas próximas.</string>

<key>NSFaceIDUsageDescription</key>
<string>Este app usa o Face ID para proteger o acesso à sua conta.</string>

<key>NSMicrophoneUsageDescription</key>
<string>Este app usa o microfone para mensagens de voz.</string>

<!-- App Transport Security -->
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <false/>
    <!-- Exceções se necessário -->
</dict>

<!-- Capacidades exigidas -->
<key>UIRequiredDeviceCapabilities</key>
<array>
    <string>armv7</string>
</array>

<!-- Orientações suportadas -->
<key>UISupportedInterfaceOrientations</key>
<array>
    <string>UIInterfaceOrientationPortrait</string>
</array>
<key>UISupportedInterfaceOrientations~ipad</key>
<array>
    <string>UIInterfaceOrientationPortrait</string>
    <string>UIInterfaceOrientationLandscapeLeft</string>
    <string>UIInterfaceOrientationLandscapeRight</string>
</array>
```

```ruby
# ios/Podfile - Configuração de release
post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      # iOS mínimo
      config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '13.0'

      # Bitcode
      config.build_settings['ENABLE_BITCODE'] = 'NO'

      # Arquitetura
      config.build_settings['EXCLUDED_ARCHS[sdk=iphonesimulator*]'] = 'arm64'
    end
  end
end
```

### Etapa 3: Configuração Android

```groovy
// android/app/build.gradle

android {
    compileSdkVersion 34
    buildToolsVersion "34.0.0"

    defaultConfig {
        applicationId "com.example.myapp"
        minSdkVersion 24
        targetSdkVersion 34
        versionCode 45
        versionName "1.2.0"
    }

    signingConfigs {
        release {
            storeFile file(MYAPP_UPLOAD_STORE_FILE)
            storePassword MYAPP_UPLOAD_STORE_PASSWORD
            keyAlias MYAPP_UPLOAD_KEY_ALIAS
            keyPassword MYAPP_UPLOAD_KEY_PASSWORD
        }
    }

    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
            signingConfig signingConfigs.release
        }
    }

    // App Bundle (recomendado)
    bundle {
        language {
            enableSplit = false // Manter todos os idiomas
        }
        density {
            enableSplit = true
        }
        abi {
            enableSplit = true
        }
    }
}
```

```properties
# android/gradle.properties
MYAPP_UPLOAD_STORE_FILE=my-upload-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
MYAPP_UPLOAD_STORE_PASSWORD=***
MYAPP_UPLOAD_KEY_PASSWORD=***

# Otimização de build
org.gradle.jvmargs=-Xmx4g
org.gradle.daemon=true
org.gradle.parallel=true
```

### Etapa 4: Recursos de Marketing

```
══════════════════════════════════════════════════════════════
🎨 RECURSOS NECESSÁRIOS
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
🍎 APP STORE (iOS)
──────────────────────────────────────────────────────────────

### Ícone do App
- 1024x1024 px (PNG, sem transparência, sem cantos arredondados)

### Screenshots do iPhone
Tamanhos obrigatórios (pelo menos um):
- iPhone 6.7" (1290 × 2796 px) - iPhone 15 Pro Max
- iPhone 6.5" (1242 × 2688 px) - iPhone 11 Pro Max
- iPhone 5.5" (1242 × 2208 px) - iPhone 8 Plus

### Screenshots do iPad
Tamanhos obrigatórios (se iPad suportado):
- iPad Pro 12.9" (2048 × 2732 px)
- iPad Pro 11" (1668 × 2388 px)

### Prévia do App (vídeo opcional)
- 15-30 segundos
- Formato .mov ou .mp4
- Mesmas resoluções que os screenshots

### Textos
- Nome do app (máximo 30 caracteres)
- Subtítulo (máximo 30 caracteres)
- Descrição (máximo 4000 caracteres)
- Palavras-chave (máximo 100 caracteres, separadas por vírgula)
- URL de suporte
- URL de política de privacidade
- Notas de versão (máximo 4000 caracteres)

──────────────────────────────────────────────────────────────
🤖 GOOGLE PLAY (Android)
──────────────────────────────────────────────────────────────

### Ícone do App
- 512x512 px (PNG 32-bit com alpha)

### Imagem de Destaque (Feature Graphic)
- 1024x500 px (PNG ou JPG)

### Screenshots do Celular
- Mínimo 2, máximo 8
- 16:9 ou 9:16
- Mínimo 320px, máximo 3840px
- PNG ou JPG

### Screenshots de Tablet 7"
- Opcional, mas recomendado
- Mesmas especificações que celular

### Screenshots de Tablet 10"
- Opcional, mas recomendado

### Vídeo promocional (opcional)
- URL do YouTube
- Não listado ou público

### Textos
- Título (máximo 50 caracteres)
- Descrição curta (máximo 80 caracteres)
- Descrição completa (máximo 4000 caracteres)
- Notas de versão (máximo 500 caracteres)
- URL de política de privacidade
- E-mail do desenvolvedor
```

### Etapa 5: Build e Assinatura

```bash
#!/bin/bash
# scripts/build-release.sh

set -e

echo "📱 Construindo Release..."

# Variáveis
VERSION=$(node -p "require('./package.json').version")
BUILD_NUMBER=$(date +%Y%m%d%H%M)

echo "Versão: $VERSION"
echo "Build: $BUILD_NUMBER"

# iOS
echo "🍎 Construindo iOS..."
cd ios

# Atualizar número de build
/usr/libexec/PlistBuddy -c "Set :CFBundleVersion $BUILD_NUMBER" {App}/Info.plist

# Arquivar
xcodebuild -workspace {App}.xcworkspace \
  -scheme {App} \
  -configuration Release \
  -archivePath build/{App}.xcarchive \
  archive

# Exportar IPA
xcodebuild -exportArchive \
  -archivePath build/{App}.xcarchive \
  -exportPath build \
  -exportOptionsPlist ExportOptions.plist

cd ..

# Android
echo "🤖 Construindo Android..."
cd android

# Atualizar versionCode no build.gradle ou via variável
./gradlew bundleRelease

# Opcional: também gerar APK
./gradlew assembleRelease

cd ..

echo "✅ Build concluído!"
echo "iOS: ios/build/{App}.ipa"
echo "Android: android/app/build/outputs/bundle/release/app-release.aab"
```

```plist
<!-- ios/ExportOptions.plist -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>teamID</key>
    <string>XXXXXXXXXX</string>
    <key>uploadBitcode</key>
    <false/>
    <key>uploadSymbols</key>
    <true/>
</dict>
</plist>
```

### Etapa 6: Submissão

#### iOS - App Store Connect

```bash
# Via Xcode
# Xcode > Product > Archive > Distribute App

# Via linha de comando (Transporter)
xcrun altool --upload-app \
  -f build/{App}.ipa \
  -t ios \
  -u "apple-id@example.com" \
  -p "@keychain:AC_PASSWORD"

# Ou via Fastlane
fastlane ios release
```

#### Android - Google Play Console

```bash
# Via Play Console web
# https://play.google.com/console

# Ou via Fastlane
fastlane android release

# Ou via bundletool
bundletool build-apks --bundle=app-release.aab --output=app.apks

# Via Google Play Developer API
# (requer conta de serviço)
```

### Etapa 7: Lista de Verificação Final

```
══════════════════════════════════════════════════════════════
✅ LISTA DE VERIFICAÇÃO FINAL PRÉ-SUBMISSÃO
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
📱 TESTES
──────────────────────────────────────────────────────────────

[ ] App testado em dispositivo físico iOS
[ ] App testado em dispositivo físico Android
[ ] Testes em versões mais antigas do SO (iOS 13, Android 7)
[ ] Testes em diferentes tamanhos de tela
[ ] Testes no modo escuro
[ ] Testes offline
[ ] Testes com dados reais
[ ] Testes de performance
[ ] Testes de Crash/ANR
[ ] Testes de acessibilidade (VoiceOver, TalkBack)

──────────────────────────────────────────────────────────────
🔒 CONFORMIDADE
──────────────────────────────────────────────────────────────

[ ] Política de privacidade acessível
[ ] Termos de serviço
[ ] Conformidade com LGPD/GDPR (se aplicável)
    - Consentimento de cookies
    - Direito à exclusão
    - Exportação de dados
[ ] Conformidade com COPPA (se destinado a crianças)
[ ] Declarações de permissões
[ ] Nenhum conteúdo proibido

──────────────────────────────────────────────────────────────
🍎 ESPECÍFICO iOS
──────────────────────────────────────────────────────────────

[ ] Diretrizes de revisão do App cumpridas
[ ] Sem links para lojas externas
[ ] In-App Purchase se conteúdo digital
[ ] Sign in with Apple se outras autenticações sociais
[ ] App Tracking Transparency se rastreamento
[ ] Perfil de provisioning válido
[ ] Notificações push configuradas (se aplicável)
[ ] Testado no TestFlight

──────────────────────────────────────────────────────────────
🤖 ESPECÍFICO ANDROID
──────────────────────────────────────────────────────────────

[ ] Nível de API alvo recente (34+)
[ ] Políticas do Play Store cumpridas
[ ] Formulário de segurança de dados preenchido
[ ] Questionário de classificação de conteúdo
[ ] Assinatura do app pelo Google Play
[ ] Testes interno/fechado realizados
[ ] Lançamento gradual planejado

──────────────────────────────────────────────────────────────
📄 DOCUMENTOS PRONTOS
──────────────────────────────────────────────────────────────

[ ] Screenshots em todos os idiomas suportados
[ ] Imagem de destaque (Android)
[ ] Ícone do app em alta resolução
[ ] Descrições em todos os idiomas
[ ] Notas de versão
[ ] Vídeo promocional (opcional)

──────────────────────────────────────────────────────────────
🚀 SUBMISSÃO
──────────────────────────────────────────────────────────────

[ ] Build enviado ao App Store Connect
[ ] Build enviado ao Play Console
[ ] Metadados completos
[ ] Preço e disponibilidade configurados
[ ] Data de lançamento escolhida (imediata ou agendada)
[ ] Perguntas de revisão preparadas
```

### Etapa 8: Pós-Publicação

```
══════════════════════════════════════════════════════════════
📊 APÓS A PUBLICAÇÃO
══════════════════════════════════════════════════════════════

[ ] Monitoramento de crashes (Sentry, Crashlytics)
[ ] Analytics configurado
[ ] Alertas para avaliações negativas
[ ] Plano de resposta a avaliações
[ ] Acompanhar KPIs:
    - Downloads
    - Retenção D1, D7, D30
    - Taxa livre de crashes (> 99%)
    - Taxa de ANR (< 0,47%)
    - Avaliação média
[ ] Preparação de hotfix se necessário
[ ] Comunicação com usuários (in-app, e-mail)
```
