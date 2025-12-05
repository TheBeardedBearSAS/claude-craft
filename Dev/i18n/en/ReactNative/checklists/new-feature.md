# New Feature Checklist

Complete workflow for developing a new feature.

---

## Phase 1: Analysis (MANDATORY)

See [01-workflow-analysis.md](../rules/01-workflow-analysis.md)

- [ ] Need clearly understood
- [ ] User stories defined
- [ ] Acceptance criteria listed
- [ ] Technical constraints identified
- [ ] Use cases documented

---

## Phase 2: Design

### Architecture

- [ ] Impacted layers identified (Data, Logic, UI)
- [ ] New files/folders planned
- [ ] External dependencies identified
- [ ] Impact on existing code evaluated
- [ ] Design pattern chosen (and justified)

### Data Modeling

- [ ] TypeScript types defined
- [ ] Interfaces created
- [ ] DTOs defined (if API)
- [ ] Validation schemas (Zod) created

### Technical Decisions

- [ ] State management chosen (Query/Zustand/State)
- [ ] Navigation strategy defined
- [ ] API endpoints defined
- [ ] Storage strategy defined
- [ ] Performance considered

---

## Phase 3: Setup

### Branch & Ticket

- [ ] Ticket/Issue created
- [ ] Branch created (`feature/feature-name`)
- [ ] Branch up to date with develop

### Dependencies

- [ ] New dependencies installed
- [ ] Compatible versions verified
- [ ] `npx expo install --fix` executed

---

## Phase 4: Implementation

### Bottom-Up Development

#### 1. Data Layer

- [ ] Types created in `types/`
- [ ] API service created in `services/api/`
- [ ] Storage service created (if needed)
- [ ] Repository created (if complex logic)
- [ ] Service tests written

#### 2. Logic Layer

- [ ] Custom hooks created in `hooks/`
- [ ] Store created (if global state)
- [ ] Business logic implemented
- [ ] Hook tests written

#### 3. UI Components

- [ ] Base UI components created
- [ ] Reusable components created
- [ ] Styles created (StyleSheet)
- [ ] Component tests written

#### 4. Screens

- [ ] Screen created in `app/` (Expo Router)
- [ ] Navigation configured
- [ ] Component integration
- [ ] Screen tests written

#### 5. Integration

- [ ] Feature integrated into app
- [ ] Navigation flows tested
- [ ] Deep links configured (if needed)
- [ ] E2E tests written

---

## Phase 5: Quality Assurance

### Code Quality

- [ ] ESLint: 0 errors, 0 warnings
- [ ] TypeScript: 0 errors (strict mode)
- [ ] Prettier: Code formatted
- [ ] Self code review done
- [ ] Refactoring applied if necessary

### Testing

- [ ] Unit tests: Coverage > 80%
- [ ] Component tests: All scenarios
- [ ] Integration tests: Happy path + errors
- [ ] E2E tests: Complete user flows
- [ ] Tests pass locally

### Performance

- [ ] Bundle size impact < 100kb
- [ ] Images optimized
- [ ] FlatLists optimized
- [ ] Animations 60 FPS
- [ ] Memory leaks checked
- [ ] Network calls optimized

### Security

- [ ] Input validation
- [ ] Sensitive data secured
- [ ] API calls secured
- [ ] No exposed secrets
- [ ] Dependencies audit clean

### Accessibility

- [ ] Accessibility labels added
- [ ] Screen reader tested
- [ ] Sufficient color contrast
- [ ] Touch targets 44x44+

---

## Phase 6: Documentation

- [ ] JSDoc for public functions
- [ ] Comments for complex logic
- [ ] README updated
- [ ] CHANGELOG updated
- [ ] ADR created (if important decision)

---

## Phase 7: Manual Testing

### Functional

- [ ] Happy path tested
- [ ] Edge cases tested
- [ ] Error cases tested
- [ ] Offline behavior tested (if applicable)

### Platforms

- [ ] iOS tested
- [ ] Android tested
- [ ] Tablet tested (if supported)
- [ ] Different screen sizes

### UX

- [ ] Smooth animations
- [ ] Clear loading states
- [ ] Helpful error messages
- [ ] Appropriate user feedback

---

## Phase 8: Code Review

- [ ] Pull Request created
- [ ] Clear description with screenshots
- [ ] Reviewers assigned
- [ ] CI/CD checks pass
- [ ] Feedback addressed
- [ ] Approved by at least 1 reviewer

---

## Phase 9: Merge & Deploy

- [ ] Branch merged into develop
- [ ] Tests pass on develop
- [ ] Deploy to staging
- [ ] Staging testing
- [ ] Production deploy (if approved)
- [ ] Post-deploy monitoring

---

## Phase 10: Cleanup

- [ ] Feature branch deleted
- [ ] Local branches cleaned
- [ ] Ticket/Issue closed
- [ ] Documentation finalized

---

## Post-Launch

- [ ] Metrics collected
- [ ] User feedback captured
- [ ] Bugs/Issues triaged
- [ ] Retrospective (if major feature)

---

**Complete workflow: Analysis → Design → Implementation → QA → Review → Deploy → Monitor**
