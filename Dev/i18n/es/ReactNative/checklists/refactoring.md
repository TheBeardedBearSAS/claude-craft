# Checklist de Refactorización

Proceso seguro para refactorizar código existente.

---

## Fase 1: Preparación

### Comprensión

- [ ] Código actual comprendido
- [ ] Razón de refactorización clara
- [ ] Impacto evaluado
- [ ] Alcance definido (no demasiado amplio)

### Documentación

- [ ] Código actual documentado (si no se hizo ya)
- [ ] Comportamiento actual capturado
- [ ] Casos límite identificados
- [ ] Dependencias mapeadas

### Tests

- [ ] Todos los tests existentes pasando
- [ ] Baseline de cobertura establecido
- [ ] Tests adicionales agregados si necesario
- [ ] Tests E2E para comportamiento crítico

---

## Fase 2: Planificación

### Estrategia

- [ ] Enfoque definido (Big Bang vs Incremental)
- [ ] Patrón/arquitectura objetivo definido
- [ ] Path de migración planificado
- [ ] Estrategia de rollback preparada

### Evaluación de Riesgos

- [ ] Riesgos identificados
- [ ] Cambios de ruptura anticipados
- [ ] Impacto en dependencias evaluado
- [ ] Timeline estimado

---

## Fase 3: Refactorización

### Cambios Incrementales

- [ ] Commits atómicos pequeños
- [ ] Tests pasando después de cada commit
- [ ] Funcionalidad preservada
- [ ] Sin cambios de comportamiento

### Calidad del Código

- [ ] Código más simple (KISS)
- [ ] Duplicación eliminada (DRY)
- [ ] Principios SOLID respetados
- [ ] Nomenclatura mejorada
- [ ] Comentarios/JSDoc actualizados

### Tests

- [ ] Tests pasando continuamente
- [ ] Nuevos tests si patrones cambiaron
- [ ] Cobertura mantenida o mejorada
- [ ] Tests E2E validan comportamiento

---

## Fase 4: Validación

### Testing Automatizado

- [ ] Tests unitarios: Todos pasando
- [ ] Tests de componentes: Todos pasando
- [ ] Tests de integración: Todos pasando
- [ ] Tests E2E: Todos pasando
- [ ] Sin regresiones detectadas

### Testing Manual

- [ ] Funcionalidad probada manualmente
- [ ] Casos límite verificados
- [ ] Casos de error probados
- [ ] Rendimiento comparado

### Revisión de Código

- [ ] Auto-revisión completa
- [ ] Diff analizado línea por línea
- [ ] Sin cambios accidentales
- [ ] Documentación actualizada

---

## Fase 5: Deployment

### Pre-Deployment

- [ ] Tests de CI/CD pasando
- [ ] Código revisado y aprobado
- [ ] Changelog actualizado
- [ ] Plan de rollback listo

### Deployment

- [ ] Deploy a staging primero
- [ ] Smoke tests en staging
- [ ] Monitoreo de staging
- [ ] Deploy a producción (si OK)

### Post-Deployment

- [ ] Monitoreo de errores
- [ ] Verificación de métricas de rendimiento
- [ ] Feedback de usuarios
- [ ] Rollback si hay problemas

---

## Patrones de Refactorización

### Extract Method

**Antes**:
```typescript
const processUser = (user: User) => {
  // 50 líneas de código
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

**Después**:
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

- [ ] Funciones largas extraídas
- [ ] Responsabilidad única respetada
- [ ] Reusabilidad mejorada

---

### Extract Component

**Antes**:
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

**Después**:
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

- [ ] Componentes extraídos
- [ ] Reusabilidad mejorada
- [ ] Props claramente definidas

---

### Introduce Hook

**Antes**:
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

**Después**:
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

- [ ] Lógica extraída a hook
- [ ] Reusabilidad mejorada
- [ ] Componente simplificado

---

## Trampas Comunes

### ❌ Evitar

- [ ] Refactorización + nuevas funcionalidades juntas
- [ ] Refactorización sin tests
- [ ] Cambios de ruptura no comunicados
- [ ] Refactorización masiva en un commit
- [ ] Cambio de comportamiento sin documentar

### ✅ Hacer

- [ ] Refactorizar solo, separar funcionalidades
- [ ] Tests antes de refactorizar
- [ ] Commits atómicos
- [ ] Documentación clara
- [ ] Comportamiento preservado

---

## Checklist Final

- [ ] Código más simple que antes
- [ ] Sin duplicación
- [ ] Todos los tests pasando
- [ ] Rendimiento igual o mejor
- [ ] Funcionalidad idéntica
- [ ] Documentación actualizada
- [ ] Revisión de código OK
- [ ] Deploy exitoso

---

**Refactorización segura: Test → Refactorizar → Test → Commit → Repetir**
