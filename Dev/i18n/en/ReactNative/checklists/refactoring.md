# Refactoring Checklist

Safe process for refactoring existing code.

---

## Phase 1: Preparation

### Understanding

- [ ] Current code understood
- [ ] Refactoring reason clear
- [ ] Impact evaluated
- [ ] Scope defined (not too broad)

### Documentation

- [ ] Current code documented (if not already done)
- [ ] Current behavior captured
- [ ] Edge cases identified
- [ ] Dependencies mapped

### Tests

- [ ] All existing tests pass
- [ ] Coverage baseline established
- [ ] Additional tests added if needed
- [ ] E2E tests for critical behavior

---

## Phase 2: Planning

### Strategy

- [ ] Approach defined (Big Bang vs Incremental)
- [ ] Target pattern/architecture defined
- [ ] Migration path planned
- [ ] Rollback strategy prepared

### Risk Assessment

- [ ] Risks identified
- [ ] Breaking changes anticipated
- [ ] Dependencies impact evaluated
- [ ] Timeline estimated

---

## Phase 3: Refactoring

### Incremental Changes

- [ ] Small atomic commits
- [ ] Tests pass after each commit
- [ ] Functionality preserved
- [ ] No behavior changes

### Code Quality

- [ ] Code simpler (KISS)
- [ ] Duplication eliminated (DRY)
- [ ] SOLID principles respected
- [ ] Naming improved
- [ ] Comments/JSDoc updated

### Tests

- [ ] Tests pass continuously
- [ ] New tests if patterns changed
- [ ] Coverage maintained or improved
- [ ] E2E tests validate behavior

---

## Phase 4: Validation

### Automated Testing

- [ ] Unit tests: All pass
- [ ] Component tests: All pass
- [ ] Integration tests: All pass
- [ ] E2E tests: All pass
- [ ] No regressions detected

### Manual Testing

- [ ] Feature tested manually
- [ ] Edge cases verified
- [ ] Error cases tested
- [ ] Performance compared

### Code Review

- [ ] Complete self-review
- [ ] Diff analyzed line by line
- [ ] No accidental changes
- [ ] Documentation updated

---

## Phase 5: Deployment

### Pre-Deployment

- [ ] CI/CD tests pass
- [ ] Code reviewed and approved
- [ ] Changelog updated
- [ ] Rollback plan ready

### Deployment

- [ ] Deploy staging first
- [ ] Smoke tests staging
- [ ] Monitor staging
- [ ] Deploy production (if OK)

### Post-Deployment

- [ ] Monitor errors
- [ ] Check performance metrics
- [ ] User feedback
- [ ] Rollback if issues

---

## Refactoring Patterns

### Extract Method

**Before**:
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

**After**:
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

**Before**:
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

**After**:
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

**Before**:
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

**After**:
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

- [ ] Refactoring + new features together
- [ ] Refactoring without tests
- [ ] Uncommunicated breaking changes
- [ ] Massive refactoring in one commit
- [ ] Changing behavior without documenting

### ✅ Do

- [ ] Refactor alone, separate features
- [ ] Tests before refactoring
- [ ] Atomic commits
- [ ] Clear documentation
- [ ] Behavior preserved

---

## Final Checklist

- [ ] Code simpler than before
- [ ] No duplication
- [ ] All tests pass
- [ ] Performance equal or better
- [ ] Identical functionality
- [ ] Documentation up to date
- [ ] Code review OK
- [ ] Deployed successfully

---

**Safe refactoring: Test → Refactor → Test → Commit → Repeat**
