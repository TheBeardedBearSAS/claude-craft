---
description: React Native Sicherheit überprüfen
argument-hint: [arguments]
---

# React Native Sicherheit überprüfen

## Argumente

$ARGUMENTS

## Plan-Modus

> Der Plan-Modus wird automatisch aktiviert, wenn der Umfang mehrere Module umfasst oder eine modulübergreifende Untersuchung erfordert.

## MISSION

Sie sind ein Experte für React Native Sicherheitsaudits. Ihre Aufgabe ist es, die Sicherheitspraktiken gemäß den Standards in `.claude/rules/11-security.md` zu analysieren.

### Schritt 1: Abhängigkeiten und Konfigurationsanalyse

1. Installierte Sicherheitsabhängigkeiten überprüfen
2. Sensible Konfigurationsdateien analysieren
3. Nach Secrets im Code suchen
4. Angeforderte Berechtigungen analysieren

### Schritt 2: Sichere Speicherung (6 Punkte)

#### 🔐 Expo SecureStore / Keychain

- [ ] **(2 Pkt)** Verwendung von `expo-secure-store` oder `react-native-keychain` für sensible Daten
- [ ] **(1 Pkt)** Keine Token/Secrets-Speicherung in AsyncStorage
- [ ] **(1 Pkt)** Keine Klartext-Passwort-Speicherung
- [ ] **(1 Pkt)** Keine sensiblen Daten in nicht-persistentem Redux/Zustand State
- [ ] **(1 Pkt)** Biometrische Konfiguration für Zugriff auf sensible Daten falls zutreffend

**Zu prüfende Dateien:**
```bash
src/services/storage.ts
src/utils/secureStorage.ts
src/hooks/useAuth.ts
```

Nach gefährlichen Mustern suchen:
```bash
# AsyncStorage nach sensiblen Daten durchsuchen
grep -r "AsyncStorage.setItem.*token" src/
grep -r "AsyncStorage.setItem.*password" src/
grep -r "AsyncStorage.setItem.*secret" src/
```

### Schritt 3: Secrets und API-Schlüssel-Verwaltung (5 Punkte)

#### 🔑 Keine Secrets im Code

- [ ] **(2 Pkt)** Kein hartcodierter API-Schlüssel im Quellcode
- [ ] **(1 Pkt)** Verwendung von Umgebungsvariablen (`.env`, `app.config.js`)
- [ ] **(1 Pkt)** `.env` in `.gitignore`
- [ ] **(1 Pkt)** Dokumentation erforderlicher Umgebungsvariablen (`.env.example`)

**Zu prüfende Dateien:**
```bash
.env
.env.example
.gitignore
app.config.js
app.json
```

Nach hartcodierten Secrets suchen:
```bash
# Verdächtige Muster
grep -rE "(api[_-]?key|secret|password|token|private[_-]?key).*=.*['\"][a-zA-Z0-9]{20,}" src/ --exclude-dir=node_modules
grep -rE "https?://[^/]*:([^@]+)@" src/ --exclude-dir=node_modules
```

**Speziell überprüfen:**
- Keine hartcodierten AWS, Google, Firebase Schlüssel
- Keine hartcodierten OAuth-Token
- Keine Zertifikate oder private Schlüssel im Repository

### Schritt 4: Sichere Netzwerkkommunikation (5 Punkte)

#### 🌐 HTTPS und Certificate Pinning

- [ ] **(2 Pkt)** Alle Kommunikation nur über HTTPS
- [ ] **(1 Pkt)** Certificate Pinning für kritische APIs implementiert
- [ ] **(1 Pkt)** SSL-Zertifikat-Validierung aktiviert
- [ ] **(1 Pkt)** Angemessene Timeout- und Retry-Konfiguration für Anfragen

**Zu prüfende Dateien:**
```bash
src/services/api.ts
src/config/network.ts
app.json (iOS NSAppTransportSecurity)
android/app/src/main/AndroidManifest.xml (android:usesCleartextTraffic)
```

Überprüfen:
```typescript
// Gut: Nur HTTPS
const API_URL = 'https://api.example.com';

// Schlecht: HTTP
const API_URL = 'http://api.example.com';
```

Für iOS (app.json):
```json
{
  "ios": {
    "infoPlist": {
      "NSAppTransportSecurity": {
        "NSAllowsArbitraryLoads": false
      }
    }
  }
}
```

Für Android (AndroidManifest.xml):
```xml
<!-- Muss false oder abwesend sein -->
<application android:usesCleartextTraffic="false">
```

### Schritt 5: Authentifizierung und Autorisierung (4 Punkte)

#### 🔒 Token- und Session-Verwaltung

- [ ] **(1 Pkt)** JWT sicher gespeichert (SecureStore)
- [ ] **(1 Pkt)** Refresh-Token implementiert
- [ ] **(1 Pkt)** Token-Ablauf behandelt
- [ ] **(1 Pkt)** Automatischer Logout nach Inaktivität (falls zutreffend)

**Zu prüfende Dateien:**
```bash
src/services/auth.ts
src/hooks/useAuth.ts
src/contexts/AuthContext.tsx
```

**Ablauf überprüfen:**
```typescript
// Gutes Muster
const token = await SecureStore.getItemAsync('access_token');
const refreshToken = await SecureStore.getItemAsync('refresh_token');

// Schlechtes Muster
const token = await AsyncStorage.getItem('access_token');
```

### Schritt 6: Berechtigungen und Benutzerdaten (3 Punkte)

#### 📱 Android/iOS Berechtigungen

- [ ] **(1 Pkt)** Angeforderte Berechtigungen gerechtfertigt und minimal
- [ ] **(1 Pkt)** Laufzeit-Berechtigungsanfragen (nicht alle beim Start)
- [ ] **(1 Pkt)** Erklärende Nachrichten für sensible Berechtigungen

**Zu prüfende Dateien:**
```bash
app.json (iOS/Android permissions)
android/app/src/main/AndroidManifest.xml
ios/[AppName]/Info.plist
```

**Zu prüfende Berechtigungen:**
- Kamera (NSCameraUsageDescription / CAMERA)
- Standort (NSLocationWhenInUseUsageDescription / ACCESS_FINE_LOCATION)
- Kontakte (NSContactsUsageDescription / READ_CONTACTS)
- Speicher (READ_EXTERNAL_STORAGE, WRITE_EXTERNAL_STORAGE)

### Schritt 7: Code-Schutz (2 Punkte)

#### 🛡️ Obfuskation und Schutz

- [ ] **(1 Pkt)** Obfuskation für Production-Builds aktiviert (ProGuard/R8)
- [ ] **(1 Pkt)** Sensible Logs in Production deaktiviert (keine console.log von Token)

**Zu prüfende Dateien:**
```bash
android/app/build.gradle (minifyEnabled, shrinkResources)
src/**/*.ts (console.log statements)
```

Für Android (build.gradle):
```gradle
buildTypes {
    release {
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

Nach sensiblen Logs suchen:
```bash
grep -rE "console\.(log|debug|info).*token" src/
grep -rE "console\.(log|debug|info).*password" src/
grep -rE "console\.(log|debug|info).*secret" src/
```

### Schritt 8: Punktzahl berechnen

```
┌──────────────────────────────────┬─────────┬────────┐
│ Kriterium                        │ Punkte  │ Status │
├──────────────────────────────────┼─────────┼────────┤
│ Sichere Speicherung              │ XX/6    │ ✅/⚠️/❌│
│ Secrets und API-Schlüssel        │ XX/5    │ ✅/⚠️/❌│
│ Netzwerkkommunikation            │ XX/5    │ ✅/⚠️/❌│
│ Authentifizierung                │ XX/4    │ ✅/⚠️/❌│
│ Berechtigungen                   │ XX/3    │ ✅/⚠️/❌│
│ Code-Schutz                      │ XX/2    │ ✅/⚠️/❌│
├──────────────────────────────────┼─────────┼────────┤
│ SICHERHEIT GESAMT                │ XX/25   │ ✅/⚠️/❌│
└──────────────────────────────────┴─────────┴────────┘
```

**Legende:**
- ✅ Ausgezeichnet (≥ 20/25)
- ⚠️ Warnung (15-19/25)
- ❌ Kritisch (< 15/25)

### Schritt 9: Schwachstellen-Scan

Folgende Befehle ausführen, um Schwachstellen zu erkennen:

#### 🔍 NPM Audit

```bash
npm audit
```

Ergebnisse analysieren:
- **Kritische Schwachstellen:** XX (Ziel: 0)
- **Hohe Schwachstellen:** XX (Ziel: 0)
- **Mittlere Schwachstellen:** XX (Ziel: < 5)
- **Niedrige Schwachstellen:** XX

#### 📦 Veraltete Abhängigkeiten

```bash
npm outdated
```

Veraltete Sicherheitsabhängigkeiten auflisten:
- `expo-secure-store`
- `react-native-keychain`
- `react-native-ssl-pinning`
- etc.

### Schritt 10: Detaillierter Bericht

## 📊 SICHERHEITSAUDIT-ERGEBNISSE

### ✅ Stärken

Identifizierte gute Praktiken auflisten:
- [Praktik 1 mit Ort]
- [Praktik 2 mit Ort]

### 🚨 Kritische Schwachstellen

Kritische Sicherheitsprobleme auflisten (sofort ❌ Punktzahl):

1. **[KRITISCH - Problem 1]**
   - **Schweregrad:** KRITISCH
   - **Ort:** [Betroffene Dateien]
   - **Risiko:** [Risikobeschreibung]
   - **Beispiel:**
   ```typescript
   // Anfälliger Code
   const API_KEY = "sk_live_123456789abcdef"; // ❌ KRITISCH
   ```
   - **Sofortige Behebung:**
   ```typescript
   // Sicherer Code
   const API_KEY = process.env.EXPO_PUBLIC_API_KEY; // ✅
   ```

### ⚠️ Verbesserungspunkte

Probleme nach Priorität auflisten:

1. **[Problem 1]**
   - **Schweregrad:** Hoch/Mittel
   - **Ort:** [Betroffene Dateien]
   - **Risiko:** [Beschreibung]
   - **Empfehlung:** [Maßnahme]

2. **[Problem 2]**
   - **Schweregrad:** Hoch/Mittel
   - **Ort:** [Betroffene Dateien]
   - **Risiko:** [Beschreibung]
   - **Empfehlung:** [Maßnahme]

### 📈 Sicherheitsmetriken

#### Abhängigkeitsschwachstellen

```
┌─────────────────────┬──────────┐
│ Schweregrad         │ Anzahl   │
├─────────────────────┼──────────┤
│ 🔴 Kritisch         │ XX       │
│ 🟠 Hoch             │ XX       │
│ 🟡 Mittel           │ XX       │
│ 🟢 Niedrig          │ XX       │
└─────────────────────┴──────────┘
```

#### Erkannte Secrets

- **Hartcodierte API-Schlüssel:** XX (Ziel: 0)
- **Hartcodierte Token:** XX (Ziel: 0)
- **Hartcodierte Passwörter:** XX (Ziel: 0)
- **Private Schlüssel im Repository:** XX (Ziel: 0)

#### Berechtigungen

- **Gesamt angeforderte Berechtigungen:** XX
- **Sensible Berechtigungen:** XX
- **Ungerechtfertigte Berechtigungen:** XX (Ziel: 0)

#### Speicherung

- **SecureStore/Keychain Verwendung:** Ja/Nein
- **Sensible Daten in AsyncStorage:** XX Vorkommen (Ziel: 0)
- **Biometrie konfiguriert:** Ja/Nein

#### Kommunikation

- **HTTP-Endpunkte (unsicher):** XX (Ziel: 0)
- **HTTPS-Endpunkte:** XX
- **Certificate Pinning:** Ja/Nein
- **Klartext-Traffic erlaubt:** Ja/Nein (Ziel: Nein)

### 🎯 TOP 3 PRIORITÄTSAKTIONEN

#### 1. [SICHERHEITSAKTION #1]
- **Aufwand:** Niedrig/Mittel/Hoch
- **Auswirkung:** KRITISCH/Hoch/Mittel
- **Risiko bei Nichtbehebung:** [Risikobeschreibung]
- **Beschreibung:** [Schwachstellendetail]
- **Lösung:** [Konkrete Maßnahme und Code]
- **Betroffene Dateien:**
  - `[datei1]` - [Problem]
  - `[datei2]` - [Problem]
- **Behebungsbeispiel:**
```typescript
// VORHER (anfällig)
[anfälliger Code]

// NACHHER (sicher)
[sicherer Code]
```

#### 2. [SICHERHEITSAKTION #2]
- **Aufwand:** Niedrig/Mittel/Hoch
- **Auswirkung:** KRITISCH/Hoch/Mittel
- **Risiko bei Nichtbehebung:** [Beschreibung]
- **Beschreibung:** [Detail]
- **Lösung:** [Maßnahme]
- **Betroffene Dateien:** [Liste]

#### 3. [SICHERHEITSAKTION #3]
- **Aufwand:** Niedrig/Mittel/Hoch
- **Auswirkung:** KRITISCH/Hoch/Mittel
- **Risiko bei Nichtbehebung:** [Beschreibung]
- **Beschreibung:** [Detail]
- **Lösung:** [Maßnahme]
- **Betroffene Dateien:** [Liste]

---

## 🛡️ OWASP Mobile Security Checkliste

Referenz: [OWASP Mobile Top 10](https://owasp.org/www-project-mobile-top-10/)

- [ ] **M1: Improper Platform Usage** - Korrekte Plattform-API-Verwendung
- [ ] **M2: Insecure Data Storage** - Sichere Speicherung (SecureStore/Keychain)
- [ ] **M3: Insecure Communication** - HTTPS + Certificate Pinning
- [ ] **M4: Insecure Authentication** - Robuste Authentifizierung mit JWT
- [ ] **M5: Insufficient Cryptography** - Keine eigene Krypto, Plattform-APIs nutzen
- [ ] **M6: Insecure Authorization** - Serverseitige Autorisierung validiert
- [ ] **M7: Client Code Quality** - Qualitätscode, in Production obfuskiert
- [ ] **M8: Code Tampering** - Schutz vor Modifikation (Jailbreak-Erkennung)
- [ ] **M9: Reverse Engineering** - Code-Obfuskation und Schutz
- [ ] **M10: Extraneous Functionality** - Keine Backdoors oder Debug-Logs in Prod

---

## 🚀 Empfehlungen

### Sofortmaßnahmen (heute)
1. Alle KRITISCHEN Schwachstellen beheben
2. Alle hartcodierten Secrets entfernen
3. `npm audit fix` für automatisch behebbare Schwachstellen ausführen

### Kurzfristige Maßnahmen (diese Woche)
1. SecureStore für alle Token implementieren
2. Nur HTTPS aktivieren (HTTP blockieren)
3. .env zu .gitignore hinzufügen, falls nicht vorhanden
4. Anfällige Abhängigkeiten aktualisieren

### Mittelfristige Maßnahmen (dieser Monat)
1. Certificate Pinning implementieren
2. Obfuskation in Production aktivieren
3. Vollständiges Berechtigungsaudit durchführen
4. Team-Schulung zu Best Practices

### Empfohlene Tools

```bash
# Sicherheitstools installieren
npm install --save-dev @react-native-community/cli-doctor
npm audit

# Für iOS
gem install fastlane

# Für Android
# ProGuard/R8 verwenden (bereits enthalten)
```

---

## 📚 Referenzen

- `.claude/rules/11-security.md` - Sicherheitsstandards
- [OWASP Mobile Top 10](https://owasp.org/www-project-mobile-top-10/)
- [React Native Security](https://reactnative.dev/docs/security)
- [Expo Security](https://docs.expo.dev/guides/security/)

---

**Endpunktzahl: XX/25**

**⚠️ WARNUNG: Eine Punktzahl < 15/25 bei der Sicherheit erfordert sofortiges Handeln vor jedem Production-Deployment.**
