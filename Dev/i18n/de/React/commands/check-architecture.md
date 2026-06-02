---
description: Architektur-Konformitätsprüfung
---

# Architektur-Konformitätsprüfung

Überprüfen, ob das Projekt den festgelegten Architekturmustern und Best Practices entspricht.

## Was dieser Befehl tut

1. **Architekturanalyse**
   - Ordnerstruktur überprüfen
   - Separation of Concerns prüfen
   - Komponentenorganisation validieren
   - Abhängigkeitsrichtungen prüfen
   - Entwurfsmuster überprüfen

2. **Überprüfungspunkte**
   - Feature-basierte Struktur
   - Komponentenhierarchie
   - State-Management
   - API-Layer-Trennung
   - Typdefinitionen

3. **Generierter Bericht**
   - Architekturverletzungen
   - Empfehlungen
   - Refactoring-Möglichkeiten
   - Konformitätspunktzahl

## Plan-Modus

> Der Plan-Modus wird automatisch aktiviert, wenn der Umfang mehrere Module umfasst oder eine modulübergreifende Untersuchung erfordert.

## Erwartete Architektur

### Ordnerstruktur

```
src/
├── app/                    # App-Konfiguration
│   ├── App.tsx
│   ├── routes.tsx
│   └── providers.tsx
│
├── features/              # Features (Geschäftslogik)
│   └── users/
│       ├── components/    # Feature-spezifische Komponenten
│       ├── hooks/         # Feature-spezifische Hooks
│       ├── services/      # API-Aufrufe
│       ├── stores/        # State-Management
│       ├── types/         # TypeScript-Typen
│       └── utils/         # Hilfsfunktionen
│
├── components/            # Gemeinsame Komponenten
│   ├── ui/               # UI-Primitive (Button, Input)
│   ├── layout/           # Layout-Komponenten
│   └── common/           # Gemeinsame Komponenten
│
├── hooks/                 # Gemeinsame Hooks
├── services/             # Gemeinsame Services
├── stores/               # Globaler State
├── types/                # Globale Typen
├── utils/                # Hilfsfunktionen
├── constants/            # Konstanten
└── config/               # Konfiguration
```

## Was zu prüfen ist

### 1. Komponentenorganisation

```typescript
// ❌ Schlecht - Alles in einer Datei
src/components/UserList.tsx (1000 Zeilen)

// ✅ Gut - Ordnungsgemäße Organisation
src/features/users/
  ├── components/
  │   ├── UserList/
  │   │   ├── UserList.tsx
  │   │   ├── UserList.test.tsx
  │   │   ├── UserListItem.tsx
  │   │   └── index.ts
  │   └── UserForm/
  │       ├── UserForm.tsx
  │       └── UserForm.test.tsx
  ├── hooks/
  │   └── useUsers.ts
  └── services/
      └── user.service.ts
```

### 2. Separation of Concerns

```typescript
// ❌ Schlecht - Gemischte Belange
export const UserList: FC = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(setUsers);
  }, []);

  return (
    <div>
      {users.map(user => (
        <div key={user.id}>
          <h3>{user.name}</h3>
          <p>{user.email}</p>
        </div>
      ))}
    </div>
  );
};

// ✅ Gut - Getrennte Belange
// hooks/useUsers.ts
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAll()
  });
};

// services/user.service.ts
export const userService = {
  getAll: () => apiClient.get<User[]>('/users')
};

// components/UserList.tsx
export const UserList: FC = () => {
  const { data: users, isLoading } = useUsers();

  if (isLoading) return <Spinner />;

  return (
    <ul>
      {users?.map(user => (
        <UserListItem key={user.id} user={user} />
      ))}
    </ul>
  );
};
```

### 3. Abhängigkeitsrichtung

```typescript
// ✅ Gut - Abhängigkeiten fließen nach innen
features/users/
  └── components/     → Kann hooks/ verwenden
      └── hooks/      → Kann services/ verwenden
          └── services/ → Kann utils/ verwenden

// ❌ Schlecht - Zirkuläre Abhängigkeiten
services/user.service.ts importiert aus components/
```

### 4. Komponententypen

```typescript
// Präsentationskomponenten (nur UI)
export const Button: FC<ButtonProps> = ({ children, ...props }) => {
  return <button {...props}>{children}</button>;
};

// Container-Komponenten (Logik)
export const UserListContainer: FC = () => {
  const { data: users } = useUsers();
  const deleteUser = useDeleteUser();

  return <UserListPresenter users={users} onDelete={deleteUser} />;
};

// Seitenkomponenten (Routing)
export const UsersPage: FC = () => {
  return (
    <MainLayout>
      <PageHeader title="Benutzer" />
      <UserListContainer />
    </MainLayout>
  );
};
```

### 5. State-Management

```typescript
// ❌ Schlecht - State an mehreren Stellen
const [users, setUsers] = useState([]);
// Dieselben Daten in 5 verschiedenen Komponenten

// ✅ Gut - Zentralisierter State
// stores/userStore.ts
export const useUserStore = create<UserStore>((set) => ({
  users: [],
  setUsers: (users) => set({ users })
}));

// Oder React Query für Server-State
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAll()
  });
};
```

## Architekturmuster

### 1. Feature-basierte Struktur

```
src/features/
├── auth/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── stores/
├── users/
└── products/
```

### 2. Clean Architecture Layers

```
Präsentationsschicht (Komponenten)
    ↓
Geschäftslogikschicht (Hooks, Services)
    ↓
Datenschicht (API, Store)
```

### 3. Atomic Design

```
src/components/
├── atoms/        # Button, Input, Label
├── molecules/    # FormField, SearchBar
├── organisms/    # UserForm, Header
├── templates/    # PageLayout, DashboardLayout
└── pages/        # HomePage, UsersPage
```

## Validierungsregeln

### Regel 1: Keine Geschäftslogik in Komponenten

```typescript
// ❌ Schlecht
export const UserForm: FC = () => {
  const [email, setEmail] = useState('');

  const validate = () => {
    return email.includes('@') && email.length > 5;
  };

  // ... komplexe Validierungslogik
};

// ✅ Gut
export const UserForm: FC = () => {
  const form = useForm({
    resolver: zodResolver(userSchema)
  });

  // Validierung im Schema, Logik im Hook
};
```

### Regel 2: API-Aufrufe über Services

```typescript
// ❌ Schlecht - Direkter fetch in Komponente
const response = await fetch('/api/users');

// ✅ Gut - Über Service
const users = await userService.getAll();
```

### Regel 3: Typen sind zentralisiert

```typescript
// ✅ Gute Struktur
src/features/users/types/
  ├── user.types.ts
  ├── dto.types.ts
  └── index.ts
```

## Automatisierte Prüfungen

### ESLint-Regeln für Architektur

```json
// .eslintrc.json
{
  "rules": {
    "no-restricted-imports": [
      "error",
      {
        "patterns": [
          {
            "group": ["../**/features/*"],
            "message": "Features sollten nicht aus anderen Features importieren"
          },
          {
            "group": ["**/components/**/services/*"],
            "message": "Komponenten sollten Services nicht direkt importieren"
          }
        ]
      }
    ]
  }
}
```

### Benutzerdefiniertes Skript

```typescript
// scripts/check-architecture.ts
import { glob } from 'glob';
import { readFile } from 'fs/promises';

const checkImports = async () => {
  const files = await glob('src/**/*.{ts,tsx}');
  const violations = [];

  for (const file of files) {
    const content = await readFile(file, 'utf-8');

    // Auf Verletzungen prüfen
    if (file.includes('/components/') && content.includes('fetch(')) {
      violations.push({
        file,
        rule: 'Keine direkten API-Aufrufe in Komponenten',
        line: content.split('\n').findIndex(l => l.includes('fetch('))
      });
    }
  }

  return violations;
};
```

## Best Practices

1. **Feature-Isolation**: Jedes Feature ist in sich geschlossen
2. **Klare Grenzen**: Präsentations-, Logik- und Datenschichten
3. **Dependency Injection**: Services über Hooks/Context
4. **Type-Safety**: TypeScript überall
5. **Konsistente Benennung**: Konventionen befolgen
6. **Single Responsibility**: Eine Komponente, ein Zweck
7. **Komposition über Vererbung**: Komposition verwenden
8. **Dokumentation**: Architekturentscheidungen dokumentieren

## Häufige Verletzungen

### Verletzung 1: God-Komponenten

**Problem**: Komponente tut zu viel
**Lösung**: In kleinere Komponenten aufteilen

### Verletzung 2: Zirkuläre Abhängigkeiten

**Problem**: A importiert B, B importiert A
**Lösung**: Gemeinsamen Code extrahieren oder Struktur überdenken

### Verletzung 3: Prop-Drilling

**Problem**: Props durch viele Ebenen weitergeben
**Lösung**: Context oder State-Management verwenden

### Verletzung 4: Gemischte Belange

**Problem**: UI und Geschäftslogik gemischt
**Lösung**: In Presenter und Container trennen

## Tools

- ESLint mit benutzerdefinierten Regeln
- Dependency Cruiser
- Madge (Abhängigkeitsgraph)
- SonarQube
- Benutzerdefinierte Skripte

## Ressourcen

- [React Architecture Best Practices](https://react.dev/learn/thinking-in-react)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
