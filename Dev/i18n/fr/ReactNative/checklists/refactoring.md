# Checklist Refactoring

Processus sécurisé pour refactorer du code existant.

---

## Phase 1: Preparation

### Compréhension

- [ ] Code actuel compris
- [ ] Raison du refactoring claire
- [ ] Impact évalué
- [ ] Scope défini (pas trop large)

### Documentation

- [ ] Code actuel documenté (si pas déjà fait)
- [ ] Comportement actuel capturé
- [ ] Edge cases identifiés
- [ ] Dependencies mappées

### Tests

- [ ] Tests existants passent tous
- [ ] Coverage baseline établi
- [ ] Tests additionnels ajoutés si besoin
- [ ] Tests E2E pour comportement critique

---

## Phase 2: Planning

### Strategy

- [ ] Approche définie (Big Bang vs Incremental)
- [ ] Pattern/Architecture cible défini
- [ ] Migration path planifié
- [ ] Rollback strategy préparée

### Risk Assessment

- [ ] Risques identifiés
- [ ] Breaking changes anticipés
- [ ] Dependencies impact évalué
- [ ] Timeline estimé

---

## Phase 3: Refactoring

### Incremental Changes

- [ ] Petits commits atomiques
- [ ] Tests passent après chaque commit
- [ ] Fonctionnalité préservée
- [ ] Pas de changements comportement

### Code Quality

- [ ] Code plus simple (KISS)
- [ ] Duplication éliminée (DRY)
- [ ] SOLID principles respectés
- [ ] Naming amélioré
- [ ] Comments/JSDoc mis à jour

### Tests

- [ ] Tests passent continuellement
- [ ] Nouveaux tests si patterns changés
- [ ] Coverage maintenu ou amélioré
- [ ] Tests E2E valident comportement

---

## Phase 4: Validation

### Automated Testing

- [ ] Unit tests: All pass
- [ ] Component tests: All pass
- [ ] Integration tests: All pass
- [ ] E2E tests: All pass
- [ ] No regressions détectées

### Manual Testing

- [ ] Fonctionnalité testée manuellement
- [ ] Edge cases vérifiés
- [ ] Error cases testés
- [ ] Performance comparée

### Code Review

- [ ] Self-review complet
- [ ] Diff analysé ligne par ligne
- [ ] No accidental changes
- [ ] Documentation mise à jour

---

## Phase 5: Deployment

### Pre-Deployment

- [ ] Tests CI/CD passent
- [ ] Code reviewed et approved
- [ ] Changelog mis à jour
- [ ] Rollback plan ready

### Deployment

- [ ] Deploy staging first
- [ ] Smoke tests staging
- [ ] Monitor staging
- [ ] Deploy production (si OK)

### Post-Deployment

- [ ] Monitor errors
- [ ] Check performance metrics
- [ ] User feedback
- [ ] Rollback si problème

---

## Refactoring Patterns

### Extract Method

**Avant**:
```typescript
const processUser = (user: User) => {
  // 50 lines of code
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

**Après**:
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

- [ ] Long functions extracted
- [ ] Single responsibility respected
- [ ] Reusability improved

---

### Extract Component

**Avant**:
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

**Après**:
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

- [ ] Components extracted
- [ ] Reusability improved
- [ ] Props clearly defined

---

### Introduce Hook

**Avant**:
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

**Après**:
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

- [ ] Logic extracted to hook
- [ ] Reusability improved
- [ ] Component simplified

---

## Common Pitfalls

### ❌ Avoid

- [ ] Refactoring + new features ensemble
- [ ] Refactoring sans tests
- [ ] Breaking changes non communiqués
- [ ] Refactoring massif en un commit
- [ ] Changer comportement sans documenter

### ✅ Do

- [ ] Refactor seul, features séparées
- [ ] Tests avant refactoring
- [ ] Commits atomiques
- [ ] Documentation claire
- [ ] Comportement préservé

---

## Checklist Final

- [ ] Code plus simple qu'avant
- [ ] Pas de duplication
- [ ] Tests tous passent
- [ ] Performance égale ou meilleure
- [ ] Fonctionnalité identique
- [ ] Documentation à jour
- [ ] Code review OK
- [ ] Deployed successfully

---

**Refactoring safe: Test → Refactor → Test → Commit → Repeat**
