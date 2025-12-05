# Workflow-Analyse - Obligatorische Analyse vor dem Coding

## Einführung

**ABSOLUTE REGEL**: Vor jeder Code-Modifikation MUSS eine OBLIGATORISCHE Analysephase durchgeführt werden. Diese Regel ist nicht verhandelbar und garantiert die Qualität des produzierten Codes.

---

## Grundprinzip

> "Erst denken, dann coden"

Jede Code-Intervention muss von einer methodischen Analyse

 begleitet werden, um:
- Den Kontext zu verstehen
- Auswirkungen zu identifizieren
- Probleme zu antizipieren
- Die beste Lösung zu wählen

---

## Phase 1: Verständnis des Bedarfs

### 1.1 Anforderungsklärung

**Zu stellende Fragen**:
- Was ist der genaue Benutzerbedarf?
- Welches Problem versuchen wir zu lösen?
- Was sind die Akzeptanzkriterien?
- Gibt es technische oder geschäftliche Einschränkungen?

**Aktionen**:
```typescript
// VOR dem Coden dokumentieren:
/**
 * BEDARF: [Klare Beschreibung des Bedarfs]
 * PROBLEM: [Zu lösendes Problem]
 * KRITERIEN: [Akzeptanzkriterien]
 * EINSCHRÄNKUNGEN: [Identifizierte Einschränkungen]
 */
```

### 1.2 Geschäftskontext-Analyse

**Verstehen**:
- Der betroffene Benutzerfluss
- Anwendbare Geschäftsregeln
- Auswirkungen auf die Benutzererfahrung
- Anwendungsfälle

**Beispiel**:
```typescript
// Feature: Hinzufügen eines Favoriten-Systems
//
// GESCHÄFTSKONTEXT:
// - Benutzer muss Artikel als Favoriten markieren können
// - Favoriten müssen offline zugänglich sein
// - Favoriten werden zwischen Geräten synchronisiert
// - Maximum 100 Favoriten pro Benutzer
//
// UX-AUSWIRKUNG:
// - Herz-Symbol bei jedem Artikel
// - Dedizierter Favoriten-Bildschirm
// - Sofortiges visuelles Feedback (optimistisches Update)
```

---

## Phase 2: Technische Analyse

### 2.1 Erkundung des bestehenden Codes

**Suchwerkzeuge verwenden**:

```bash
# Nach ähnlichen Mustern suchen
npx expo-search "similar-pattern"

# Nach bestehender Implementierung suchen
grep -r "relatedFeature" src/

# Abhängigkeiten identifizieren
grep -r "import.*TargetComponent" src/
```

**Erkundungs-Checkliste**:
- [ ] Wiederverwendbare bestehende Komponenten
- [ ] Verfügbare Custom Hooks
- [ ] Bereits implementierte API-Services
- [ ] Vorhandenes State Management
- [ ] Verwendete Navigationsmuster
- [ ] Konsistente Styles und Theme

### 2.2 Architektur-Analyse

**Architekturfragen**:
- Wo passt dieses Feature in die Architektur?
- Welche Schichten sind betroffen? (UI, Logik, Daten, Navigation)
- Gibt es ein etabliertes Muster, dem zu folgen ist?
- Soll ich ein neues Modul erstellen oder ein bestehendes erweitern?

**Analysebeispiel**:
```typescript
// Feature: Favoriten-System
//
// BETROFFENE SCHICHTEN:
//
// 1. DATENSCHICHT
//    - Neuer Store: stores/favorites.store.ts
//    - API-Service: services/api/favorites.service.ts
//    - Speicher: services/storage/favorites.storage.ts
//    - Typen: types/Favorite.types.ts
//
// 2. LOGIKSCHICHT
//    - Hook: hooks/useFavorites.ts
//    - Hook: hooks/useFavoriteToggle.ts
//    - Utilities: utils/favorites.utils.ts
//
// 3. UI-SCHICHT
//    - Komponente: components/FavoriteButton.tsx
//    - Bildschirm: screens/FavoritesScreen.tsx
//    - Symbol: components/ui/FavoriteIcon.tsx
//
// 4. NAVIGATION
//    - Route: app/(tabs)/favorites.tsx
//    - Deep Link: favorites/:id
```

### 2.3 Abhängigkeitsanalyse

**Identifizieren**:
- Erforderliche externe Bibliotheken
- Interne Abhängigkeiten (Module, Komponenten)
- Potenzielle zirkuläre Abhängigkeiten
- Kompatible Versionen

**Analysevorlage**:
```typescript
// ERFORDERLICHE ABHÄNGIGKEITEN:
//
// Neue Bibliotheken:
// - @react-native-async-storage/async-storage (Speicher)
// - react-query (API-Sync)
//
// Interne Module:
// - stores/user.store (für userId)
// - services/api/client (für API-Aufrufe)
// - hooks/useAuth (für Authentifizierung)
//
// Prüfungen:
// - Keine zirkuläre Abhängigkeit mit features/articles
// - Kompatibel mit bestehender Architektur
```

---

## Phase 3: Auswirkungsidentifikation

### 3.1 Auswirkung auf bestehenden Code

**Analysieren**:
- Welche Dateien werden modifiziert?
- Welche Komponenten werden betroffen sein?
- Gibt es Breaking Changes?
- Werden bestehende Tests betroffen sein?

**Auswirkungs-Checkliste**:
```typescript
// AUSWIRKUNG AUF BESTEHENDEN CODE:
//
// MODIFIKATIONEN:
// - screens/ArticleDetailScreen.tsx (FavoriteButton hinzufügen)
// - components/ArticleCard.tsx (Favoriten-Symbol hinzufügen)
// - navigation/TabNavigator.tsx (Favoriten-Tab hinzufügen)
//
// NEUE DATEIEN:
// - stores/favorites.store.ts
// - screens/FavoritesScreen.tsx
// - hooks/useFavorites.ts
//
// BREAKING CHANGES: Keine
//
// ZU MODIFIZIERENDE TESTS:
// - ArticleCard.test.tsx (neue Props)
// - ArticleDetailScreen.test.tsx (neue Schaltfläche)
```

### 3.2 Performance-Auswirkung

**Berücksichtigen**:
- Auswirkung auf Bundle-Größe
- Laufzeit-Performance (FPS, Speicher)
- Asset-Größe
- Zusätzliche Netzwerkanfragen
- Verwendeter Speicher

**Beispiel**:
```typescript
// PERFORMANCE-ANALYSE:
//
// BUNDLE-GRÖSSE:
// - React-query hinzufügen: +50kb (gzipped)
// - Neuer Bildschirm: ~15kb
// - GESAMT: +65kb (akzeptabel < 100kb)
//
// LAUFZEIT:
// - Favoriten-Liste rendern: FlatList mit optimierter windowSize
// - Speicher: MMKV (ultra schnell)
// - Netzwerk: Optimistische Updates (keine wahrgenommene Latenz)
//
// SPEICHER:
// - Max 100 Favoriten × 1kb = 100kb (vernachlässigbar)
```

### 3.3 UX/UI-Auswirkung

**Bewerten**:
- Konsistenz mit Design-System
- Barrierefreiheit
- Responsive (Tablet, Telefon)
- Animationen und Übergänge
- Benutzer-Feedback

**UX-Checkliste**:
```typescript
// UX/UI-ANALYSE:
//
// DESIGN-SYSTEM:
// - theme.colors.primary für aktives Symbol verwenden
// - Bestehende Button-Komponente verwenden
// - Animation: Skalierung + Haptisches Feedback
//
// BARRIEREFREIHEIT:
// - Label: "Zu Favoriten hinzufügen" / "Aus Favoriten entfernen"
// - Screenreader-kompatibel
// - Hit-Slop: 44x44 minimum
//
// RESPONSIVE:
// - Angepasstes Tablet-Symbol (größer)
// - Favoriten-Grid: 2 Spalten mobil, 3 Tablet
//
// FEEDBACK:
// - Haptisches Feedback beim Umschalten
// - Toast-Benachrichtigung bei Erfolg
// - Herz-Animation
```

---

## Phase 4: Lösungsentwurf

### 4.1 Ansatzauswahl

**Optionen vergleichen**:

```typescript
// ANSATZ 1: Local First mit Sync
// VORTEILE:
// - Funktioniert offline
// - Optimale Performance
// - Flüssige UX
// NACHTEILE:
// - Sync-Komplexität
// - Potenzielle Konflikte
//
// ANSATZ 2: Nur API
// VORTEILE:
// - Einfach
// - Keine Synchronisation
// - Einzelne Quelle der Wahrheit
// NACHTEILE:
// - Erfordert Verbindung
// - Latenz
//
// ENTSCHEIDUNG: Ansatz 1 (Local First)
// GRUND: Bessere UX, kritisches Offline-Feature
```

### 4.2 Zu verwendendes Design-Muster

**Geeignetes Muster identifizieren**:

```typescript
// ANWENDBARE MUSTER:
//
// 1. STATE MANAGEMENT: Zustand
//    - Globaler Store für Favoriten
//    - Persistieren mit MMKV
//
// 2. DATA FETCHING: React Query
//    - Favoriten mit Cache abfragen
//    - Mutation für Toggle
//    - Optimistische Updates
//
// 3. KOMPONENTEN-MUSTER: Compound Component
//    - FavoriteButton.Toggle
//    - FavoriteButton.Icon
//    - FavoriteButton.Count
//
// 4. HOOK-MUSTER: Custom Hook
//    - useFavorites() für Daten
//    - useFavoriteToggle() für Aktion
```

### 4.3 Datenstruktur

**Typen definieren**:

```typescript
// DEFINIERTE TYPEN:

// Favoriten-Entität
interface Favorite {
  id: string;
  userId: string;
  articleId: string;
  createdAt: Date;
  syncedAt?: Date;
  localOnly?: boolean; // Für noch nicht synchronisierte Favoriten
}

// API-Antwort
interface FavoritesResponse {
  favorites: Favorite[];
  total: number;
}

// Store-Status
interface FavoritesState {
  favorites: Favorite[];
  isLoading: boolean;
  error: string | null;

  // Aktionen
  addFavorite: (articleId: string) => Promise<void>;
  removeFavorite: (articleId: string) => Promise<void>;
  isFavorite: (articleId: string) => boolean;
  sync: () => Promise<void>;
}
```

---

## Phase 5: Implementierungsplan

### 5.1 Aufgabenaufteilung

**Detaillierten Plan erstellen**:

```typescript
// IMPLEMENTIERUNGSPLAN:
//
// SCHRITT 1: Typen & Schnittstellen
// - types/Favorite.types.ts erstellen
// - Schnittstellen definieren
// Dauer: 30min
//
// SCHRITT 2: Speicherschicht
// - favorites.storage.ts implementieren
// - Speicher-Tests
// Dauer: 1h
//
// SCHRITT 3: API-Service
// - favorites.service.ts implementieren
// - API-Antworten mocken
// Dauer: 1h
//
// SCHRITT 4: Store
// - favorites.store.ts erstellen
// - Aktionen implementieren
// - Store-Tests
// Dauer: 2h
//
// SCHRITT 5: Hooks
// - useFavorites erstellen
// - useFavoriteToggle erstellen
// - Hook-Tests
// Dauer: 1h30
//
// SCHRITT 6: UI-Komponenten
// - FavoriteButton
// - FavoriteIcon
// - Komponenten-Tests
// Dauer: 2h
//
// SCHRITT 7: Bildschirm
// - FavoritesScreen
// - Navigations-Setup
// - Bildschirm-Tests
// Dauer: 2h
//
// SCHRITT 8: Integration
// - In ArticleCard integrieren
// - In ArticleDetail integrieren
// - E2E-Tests
// Dauer: 2h
//
// GESAMT: ~12h
```

### 5.2 Implementierungsreihenfolge

**Regel**: Immer Bottom-up

```typescript
// IMPLEMENTIERUNGSREIHENFOLGE:
//
// 1. Grundlagen (Datenschicht)
//    ↓
// 2. Services & Speicher
//    ↓
// 3. State Management
//    ↓
// 4. Geschäftslogik (Hooks)
//    ↓
// 5. UI-Komponenten (dumm)
//    ↓
// 6. UI-Komponenten (smart)
//    ↓
// 7. Bildschirme
//    ↓
// 8. Navigation & Integration
//    ↓
// 9. E2E-Tests
```

### 5.3 Risikoidentifikation

**Probleme antizipieren**:

```typescript
// IDENTIFIZIERTE RISIKEN:
//
// RISIKO 1: Synchronisationskonflikte
// - Auswirkung: Hoch
// - Wahrscheinlichkeit: Mittel
// - Abschwächung: Zeitstempel-basierte Auflösung, Last-Write-Wins
//
// RISIKO 2: 100-Favoriten-Limit
// - Auswirkung: Mittel
// - Wahrscheinlichkeit: Niedrig
// - Abschwächung: Warnung-UI bei 90 Favoriten, älteste löschen
//
// RISIKO 3: Favoriten-Listen-Performance
// - Auswirkung: Mittel
// - Wahrscheinlichkeit: Niedrig
// - Abschwächung: Virtualisierte FlatList, Paginierung
//
// RISIKO 4: Speicherplatz
// - Auswirkung: Niedrig
// - Wahrscheinlichkeit: Sehr niedrig
// - Abschwächung: Alte synchronisierte Favoriten bereinigen
```

---

## Phase 6: Vor-Implementierungs-Validierung

### 6.1 Validierungs-Checkliste

**Vor dem Codieren verifizieren**:

```typescript
// VALIDIERUNGS-CHECKLISTE:
//
// ANALYSE:
// ✓ Bedarf klar verstanden
// ✓ Geschäftskontext analysiert
// ✓ Architektur studiert
// ✓ Abhängigkeiten identifiziert
// ✓ Auswirkungen bewertet
//
// DESIGN:
// ✓ Lösung gewählt und begründet
// ✓ Muster identifiziert
// ✓ Typen definiert
// ✓ Implementierungsplan erstellt
//
// RISIKEN:
// ✓ Risiken identifiziert
// ✓ Abschwächungen geplant
//
// QUALITÄT:
// ✓ Tests geplant
// ✓ Performance berücksichtigt
// ✓ Barrierefreiheit bereitgestellt
// ✓ Dokumentation vorbereitet
//
// BEREIT ZUM CODEN: JA ✓
```

### 6.2 Design Review

**Review-Punkte**:

```typescript
// REVIEW-FRAGEN:
//
// 1. Ist die Lösung KISS (Keep It Simple)?
//    → Ja, Standard React Query + Zustand-Muster
//
// 2. Respektiert sie DRY?
//    → Ja, wiederverwendbare Hooks
//
// 3. Folgt sie SOLID?
//    → Ja, getrennte Verantwortlichkeiten
//
// 4. Ist sie testbar?
//    → Ja, jede Schicht unabhängig
//
// 5. Ist sie performant?
//    → Ja, optimistische Updates, FlatList
//
// 6. Ist sie wartbar?
//    → Ja, klarer Code, gut getypt, dokumentiert
//
// 7. Respektiert sie die Architektur?
//    → Ja, folgt etablierten Mustern
//
// VALIDIERUNG: GENEHMIGT ✓
```

---

## Phase 7: Analyse-Dokumentation

### 7.1 Dokumentationsvorlage

**Ein ADR (Architecture Decision Record) erstellen**:

```markdown
# ADR-XXX: Favoriten-System

## Status
Vorgeschlagen

## Kontext
Benutzer müssen Artikel als Favoriten markieren können,
um schnell darauf zuzugreifen, auch offline.

## Entscheidung
Implementierung eines Favoriten-Systems mit:
- Local-first-Ansatz (MMKV-Speicher)
- Hintergrundsynchronisierung (React Query)
- Optimistische Updates (flüssige UX)
- Limit: 100 Favoriten pro Benutzer

## Konsequenzen

### Positiv
- Funktioniert offline
- Optimale Performance
- Flüssige UX
- Automatische Synchronisation

### Negativ
- Sync-Komplexität
- Konfliktmanagement
- Lokaler Speicher erforderlich

## Betrachtete Alternativen
1. Nur API: Abgelehnt (erfordert Verbindung)
2. AsyncStorage: Abgelehnt (Performance)

## Implementierungshinweise
- Store: Zustand mit MMKV-Persistierung
- API: React Query mit optimistischen Updates
- Limit: Warnung-UI bei 90 Favoriten
```

### 7.2 Inline-Dokumentation

**Im Code Entscheidungen dokumentieren**:

```typescript
/**
 * Favoriten-Store
 *
 * ENTSCHEIDUNGEN:
 * - Zustand für State Management (einfach, performant)
 * - MMKV für Persistierung (ultra schnell)
 * - Optimistische Updates (bessere UX)
 *
 * LIMITS:
 * - Max 100 Favoriten pro Benutzer
 * - Sync alle 5min im Hintergrund
 *
 * @see ADR-XXX für Architekturdetails
 */
export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      // Implementierung
    }),
    {
      name: 'favorites',
      storage: createMMKVStorage(),
    }
  )
);
```

---

## Vollständige Beispiele

### Beispiel 1: Hinzufügen eines komplexen Features

```typescript
// ========================================
// ANALYSE: Feature "Push-Benachrichtigungen"
// ========================================

// PHASE 1: VERSTÄNDNIS
// -----------------------
// BEDARF: Push-Benachrichtigungen für neue Artikel erhalten
// KRITERIEN:
// - Benachrichtigungen auf iOS und Android
// - Opt-in (Benutzererlaubnis)
// - Stille Benachrichtigungen für Datensynchronisation
// - Deep Links zu Artikeln

// PHASE 2: TECHNISCHE ANALYSE
// ---------------------------
// ERKUNDUNG:
// - Expo Notifications bereits installiert
// - Push-Service: FCM (Firebase Cloud Messaging)
// - Deep Linking: Expo Router kompatibel
//
// ARCHITEKTUR:
// - Service: services/notifications/push.service.ts
// - Store: stores/notifications.store.ts
// - Hook: hooks/useNotifications.ts
// - Provider: providers/NotificationsProvider.tsx

// PHASE 3: AUSWIRKUNGEN
// ----------------
// CODE:
// - Neues notifications/ Modul
// - App.tsx modifizieren (Provider)
// - app.json aktualisieren (Konfiguration)
//
// PERFORMANCE:
// - Bundle: +80kb (expo-notifications)
// - Hintergrund-Task: Minimale Auswirkung
//
// UX:
// - Erlaubnis-Prompt (iOS/Android)
// - Einstellungs-Bildschirm-Update
// - Toast für empfangene Benachrichtigungen

// PHASE 4: DESIGN
// -------------------
// ANSATZ: Native Expo Notifications
// MUSTER: Provider + Hook
// TYPEN:
interface PushNotification {
  id: string;
  title: string;
  body: string;
  data?: {
    type: 'article' | 'system';
    articleId?: string;
  };
}

// PHASE 5: PLAN
// -------------
// 1. Firebase einrichten (2h)
// 2. app.json konfigurieren (30min)
// 3. Notifications-Service (2h)
// 4. Store + Hook (1h30)
// 5. Provider (1h)
// 6. Einstellungen UI (2h)
// 7. Deep Links (1h)
// 8. Tests (2h)
// GESAMT: 12h

// PHASE 6: VALIDIERUNG
// -------------------
// ✓ Vollständige Analyse
// ✓ Lösung validiert
// ✓ Detaillierter Plan
// ✓ Risiken identifiziert
// → BEREIT ZUM CODEN
```

### Beispiel 2: Fehlerkorrektur

```typescript
// ========================================
// ANALYSE: Bug "Bilder nicht gecacht"
// ========================================

// PHASE 1: VERSTÄNDNIS
// -----------------------
// PROBLEM: Bilder werden bei jedem Besuch neu geladen
// SYMPTOME:
// - Flackern beim Scrollen
// - Hoher Datenverbrauch
// - Verschlechterte Performance
//
// REPRODUKTION:
// 1. Artikel-Liste scrollen
// 2. Woanders hin navigieren
// 3. Zur Liste zurückkehren
// 4. Bilder werden neu geladen

// PHASE 2: UNTERSUCHUNG
// ----------------------
// AKTUELLER CODE:
<Image source={{ uri: article.imageUrl }} />

// IDENTIFIZIERTES PROBLEM:
// - Kein Cache konfiguriert
// - React-native Image Standard-Cache schwach
//
// MÖGLICHE LÖSUNGEN:
// 1. expo-image (neu, performant)
// 2. react-native-fast-image (bewährt)
// 3. Manueller Cache mit FileSystem

// PHASE 3: AUSWIRKUNGEN
// ----------------
// ÄNDERUNG:
// - Image durch expo-image ersetzen
// - Migration ~50 Dateien
//
// PERFORMANCE:
// - Bundle: +40kb
// - Disk-Cache: ~100MB max
// - FPS-Verbesserung: +15-20%

// PHASE 4: ENTSCHEIDUNG
// -----------------
// WAHL: expo-image
// GRUND:
// - Native Expo-Integration
// - Automatischer Cache
// - Blurhash-Unterstützung
// - Bessere Performance

// PHASE 5: PLAN
// -------------
// 1. expo-image installieren (15min)
// 2. CachedImage-Komponente erstellen (30min)
// 3. Migration Image → CachedImage (2h)
// 4. Tests (1h)
// 5. Performance-Validierung (30min)
// GESAMT: 4h15

// PHASE 6: VALIDIERUNG
// -------------------
// ✓ Grundursache identifiziert
// ✓ Lösung getestet
// ✓ Klarer Migrationsplan
// → BEREIT ZUM BEHEBEN
```

---

## Zu vermeidende Anti-Patterns

### ❌ Codieren ohne Analyse

```typescript
// SCHLECHT: Direkt coden
const handleFavorite = () => {
  // Ich code ohne zu denken...
  fetch('/api/favorites', { ... });
};

// GUT: Analysieren dann coden
// 1. Analysieren: Offline-Sync erforderlich?
// 2. Design: React Query + optimistisches Update
// 3. Code:
const { mutate } = useMutation({
  mutationFn: addFavorite,
  onMutate: optimisticUpdate,
});
```

### ❌ Bestehenden Code ignorieren

```typescript
// SCHLECHT: Neu erstellen, was existiert
const MyCustomButton = () => { ... };

// GUT: Wiederverwenden
import { Button } from '@/components/ui/Button';
```

### ❌ Über-Engineering

```typescript
// SCHLECHT: Unnötige Komplexität
class FavoriteManager extends AbstractManager
  implements IFavoriteService, IObservable { ... }

// GUT: Einfach und effektiv
export function useFavorites() { ... }
```

---

## Finale Checkliste

**Vor jeder Code-Intervention**:

```typescript
// VOR-CODE-ANALYSE-CHECKLISTE
//
// □ Bedarf klar definiert
// □ Geschäftskontext verstanden
// □ Bestehender Code erkundet
// □ Architektur analysiert
// □ Abhängigkeiten identifiziert
// □ Auswirkungen bewertet
// □ Lösung entworfen
// □ Muster gewählt
// □ Typen definiert
// □ Detaillierter Plan erstellt
// □ Risiken identifiziert
// □ Tests geplant
// □ Dokumentation vorbereitet
//
// WENN ALLES GEPRÜFT → CODE
// SONST → ANALYSE FORTSETZEN
```

---

## Fazit

Vor-Code-Analyse ist KEINE Zeitverschwendung, sondern eine INVESTITION, die:

- **Kostspielige Fehler vermeidet**
- **Code-Qualität garantiert**
- **Entwicklung beschleunigt** (weniger Refactoring)
- **Wartung erleichtert**
- **Zusammenarbeit verbessert**

> "Stunden der Analyse sparen Tage des Debuggens"

---

**Goldene Regel**: Mindestens so viel Zeit mit Analysieren wie mit Codieren verbringen (1:1-Verhältnis minimum).
