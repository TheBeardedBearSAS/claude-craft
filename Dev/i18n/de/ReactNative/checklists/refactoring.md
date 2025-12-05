# Refactoring-Checkliste

Sicherer Prozess für das Refactoring von bestehendem Code.

---

## Phase 1: Vorbereitung

### Verständnis

- [ ] Aktueller Code verstanden
- [ ] Refactoring-Grund klar
- [ ] Auswirkung bewertet
- [ ] Umfang definiert (nicht zu breit)

### Dokumentation

- [ ] Aktueller Code dokumentiert (falls noch nicht geschehen)
- [ ] Aktuelles Verhalten erfasst
- [ ] Edge Cases identifiziert
- [ ] Abhängigkeiten kartiert

### Tests

- [ ] Alle bestehenden Tests bestanden
- [ ] Coverage-Baseline erstellt
- [ ] Zusätzliche Tests hinzugefügt falls erforderlich
- [ ] E2E Tests für kritisches Verhalten

---

## Phase 2: Planung

### Strategie

- [ ] Ansatz definiert (Big Bang vs. Inkrementell)
- [ ] Ziel-Pattern/-Architektur definiert
- [ ] Migrationspfad geplant
- [ ] Rollback-Strategie vorbereitet

### Risikobewertung

- [ ] Risiken identifiziert
- [ ] Breaking Changes antizipiert
- [ ] Abhängigkeiten-Auswirkung bewertet
- [ ] Zeitplan geschätzt

---

## Phase 3: Refactoring

### Inkrementelle Änderungen

- [ ] Kleine atomare Commits
- [ ] Tests bestehen nach jedem Commit
- [ ] Funktionalität beibehalten
- [ ] Keine Verhaltensänderungen

### Code-Qualität

- [ ] Code einfacher (KISS)
- [ ] Duplizierung eliminiert (DRY)
- [ ] SOLID-Prinzipien respektiert
- [ ] Benennung verbessert
- [ ] Kommentare/JSDoc aktualisiert

### Tests

- [ ] Tests bestehen kontinuierlich
- [ ] Neue Tests falls Pattern geändert
- [ ] Coverage aufrechterhalten oder verbessert
- [ ] E2E Tests validieren Verhalten

---

## Phase 4: Validierung

### Automatisierte Tests

- [ ] Unit Tests: Alle bestanden
- [ ] Komponententests: Alle bestanden
- [ ] Integrationstests: Alle bestanden
- [ ] E2E Tests: Alle bestanden
- [ ] Keine Regressionen erkannt

### Manuelles Testen

- [ ] Feature manuell getestet
- [ ] Edge Cases überprüft
- [ ] Fehlerfälle getestet
- [ ] Performance verglichen

### Code Review

- [ ] Vollständiges Selbst-Review
- [ ] Diff Zeile für Zeile analysiert
- [ ] Keine versehentlichen Änderungen
- [ ] Dokumentation aktualisiert

---

## Phase 5: Deployment

### Pre-Deployment

- [ ] CI/CD Tests bestanden
- [ ] Code reviewed und genehmigt
- [ ] Changelog aktualisiert
- [ ] Rollback-Plan bereit

### Deployment

- [ ] Zuerst auf Staging deployen
- [ ] Smoke Tests auf Staging
- [ ] Staging überwachen
- [ ] Auf Produktion deployen (falls OK)

### Post-Deployment

- [ ] Fehler überwachen
- [ ] Performance-Metriken prüfen
- [ ] Benutzer-Feedback
- [ ] Rollback bei Problemen

---

## Refactoring-Patterns

### Extract Method

**Vorher**:
```typescript
const processUser = (user: User) => {
  // 50 Zeilen Code
  const validated = validateEmail(user.email) && validateAge(user.age);
  if (!validated) throw new Error('Invalid');
  const processed = {
    ...user,
    fullName: user.firstName + ' ' + user.lastName,
    initials: user.firstName[0] + user.lastName[0],
  };
  return processed;
};
```

**Nachher**:
```typescript
const validateUser = (user: User): boolean => {
  return validateEmail(user.email) && validateAge(user.age);
};

const formatUserName = (user: User) => ({
  fullName: `${user.firstName} ${user.lastName}`,
  initials: `${user.firstName[0]}${user.lastName[0]}`,
});

const processUser = (user: User) => {
  if (!validateUser(user)) throw new Error('Invalid');
  return { ...user, ...formatUserName(user) };
};
```

- [ ] Lange Funktionen extrahiert
- [ ] Single Responsibility respektiert
- [ ] Wiederverwendbarkeit verbessert

---

### Extract Component

**Vorher**:
```typescript
const UserProfile = () => {
  return (
    <View>
      <View style={styles.header}>
        <Image source={{ uri: user.avatar }} />
        <Text>{user.name}</Text>
        <Text>{user.email}</Text>
      </View>
      <View style={styles.stats}>
        <Text>Posts: {user.posts}</Text>
        <Text>Followers: {user.followers}</Text>
      </View>
    </View>
  );
};
```

**Nachher**:
```typescript
const UserHeader = ({ user }) => (
  <View style={styles.header}>
    <Image source={{ uri: user.avatar }} />
    <Text>{user.name}</Text>
    <Text>{user.email}</Text>
  </View>
);

const UserStats = ({ user }) => (
  <View style={styles.stats}>
    <Text>Posts: {user.posts}</Text>
    <Text>Followers: {user.followers}</Text>
  </View>
);

const UserProfile = () => (
  <View>
    <UserHeader user={user} />
    <UserStats user={user} />
  </View>
);
```

- [ ] Komponenten extrahiert
- [ ] Wiederverwendbarkeit verbessert
- [ ] Props klar definiert

---

### Introduce Hook

**Vorher**:
```typescript
const MyComponent = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('/api/data')
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return loading ? <Spinner /> : <DataView data={data} />;
};
```

**Nachher**:
```typescript
const useData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('/api/data')
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
};

const MyComponent = () => {
  const { data, loading } = useData();
  return loading ? <Spinner /> : <DataView data={data} />;
};
```

- [ ] Logik in Hook extrahiert
- [ ] Wiederverwendbarkeit verbessert
- [ ] Komponente vereinfacht

---

## Häufige Fallstricke

### ❌ Vermeiden

- [ ] Refactoring + neue Features zusammen
- [ ] Refactoring ohne Tests
- [ ] Unkommunizierte Breaking Changes
- [ ] Massives Refactoring in einem Commit
- [ ] Verhaltensänderung ohne Dokumentation

### ✅ Tun

- [ ] Refactoring allein, Features getrennt
- [ ] Tests vor Refactoring
- [ ] Atomare Commits
- [ ] Klare Dokumentation
- [ ] Verhalten beibehalten

---

## Abschließende Checkliste

- [ ] Code einfacher als vorher
- [ ] Keine Duplizierung
- [ ] Alle Tests bestanden
- [ ] Performance gleich oder besser
- [ ] Identische Funktionalität
- [ ] Dokumentation aktuell
- [ ] Code Review OK
- [ ] Erfolgreich deployed

---

**Sicheres Refactoring: Test → Refactor → Test → Commit → Wiederholen**
