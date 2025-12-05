# Pre-Development Analysis Workflow

## Fundamental Principle

**GOLDEN RULE**: Before writing a single line of code, a thorough analysis phase is MANDATORY. This phase allows you to understand the context, implications, and best approaches to solve the problem.

## Phase 1: Understanding the Need

### 1.1 Request Analysis

**Questions to ask**:

1. **What is the real objective**?
   - What business value is being delivered?
   - Who are the end users?
   - What problem are we solving?

2. **What is the scope**?
   - What are the exact requested features?
   - Are there dependencies with other features?
   - What are the scope boundaries?

3. **What are the constraints**?
   - Technical constraints (performance, compatibility)
   - Business constraints (business rules)
   - Time constraints (deadlines)

### 1.2 Understanding Documentation

Create an analysis document containing:

```markdown
# Request Analysis: [TITLE]

## Context
[Business context description]

## Objective
[Main objective and secondary objectives]

## Concerned Users
- Persona 1: [Description]
- Persona 2: [Description]

## Expected Features
1. [Feature 1]
   - Acceptance criterion 1
   - Acceptance criterion 2
2. [Feature 2]
   - ...

## Constraints
- Technical: [List]
- Business: [List]
- Time: [Deadline]

## Out of Scope
[What is not included in this request]
```

## Phase 2: Technical Analysis

### 2.1 Existing Code Audit

**Mandatory steps**:

1. **Search for similar code**
   ```bash
   # Search for similar components or hooks
   grep -r "similar-pattern" src/

   # Identify reusable components
   find src/components -name "*.tsx"
   ```

2. **Dependencies analysis**
   - Which components will be affected?
   - Which existing hooks can be reused?
   - Which APIs are already available?

3. **Pattern identification**
   - What architectural pattern is used?
   - How are similar features implemented?
   - What conventions are in place?

### 2.2 Architecture Analysis

**Checks to perform**:

```typescript
// 1. Feature structure
// Check existing structure
src/features/
  └── existing-feature/
      ├── components/
      ├── hooks/
      ├── services/
      ├── types/
      └── utils/

// 2. State Management
// Identify the solution used
- React Query for server data?
- Zustand for global state?
- Context API for shared state?

// 3. Routing
// Understand route structure
- React Router?
- Next.js App Router?
- TanStack Router?

// 4. Styling
// Identify the styling solution
- Tailwind CSS?
- CSS Modules?
- styled-components?
```

### 2.3 Impact Analysis

**Impact matrix**:

| Component/Module | Impact | Risk | Required Action |
|------------------|--------|------|----------------|
| Component A | Modification | Medium | Tests to update |
| Hook B | None | Low | - |
| Service C | Creation | Low | New tests |
| Type D | Extension | Medium | Check compatibility |

## Phase 3: Solution Design

### 3.1 Architectural Choices

**Decisions to make**:

1. **Component structure**
   ```typescript
   // Option 1: Single component with integrated logic
   export const FeatureComponent: FC = () => {
     // Logic + UI
   };

   // Option 2: Container/Presenter separation
   export const FeatureContainer: FC = () => {
     // Logic only
     return <FeaturePresenter {...props} />;
   };

   export const FeaturePresenter: FC<Props> = (props) => {
     // UI only
   };

   // Option 3: Composition with hooks
   export const FeatureComponent: FC = () => {
     const logic = useFeatureLogic();
     return <FeatureUI {...logic} />;
   };
   ```

2. **State management**
   ```typescript
   // Option 1: Local state
   const [state, setState] = useState();

   // Option 2: Global state (Zustand)
   const state = useFeatureStore(state => state.value);

   // Option 3: Server state (React Query)
   const { data, isLoading } = useQuery({
     queryKey: ['feature'],
     queryFn: fetchFeature
   });

   // Option 4: Context API
   const context = useFeatureContext();
   ```

3. **API communication**
   ```typescript
   // Option 1: React Query
   const mutation = useMutation({
     mutationFn: updateFeature,
     onSuccess: () => queryClient.invalidateQueries(['feature'])
   });

   // Option 2: Custom service
   const featureService = useFeatureService();
   await featureService.update(data);
   ```

### 3.2 Interface Design

**Types and Interfaces**:

```typescript
// 1. Define business types
interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest'
}

// 2. Define component props
interface FeatureComponentProps {
  userId: string;
  onSuccess?: (user: User) => void;
  onError?: (error: Error) => void;
  className?: string;
}

// 3. Define hook returns
interface UseFeatureReturn {
  data: User | null;
  isLoading: boolean;
  error: Error | null;
  updateUser: (data: Partial<User>) => Promise<void>;
  deleteUser: () => Promise<void>;
}

// 4. Define services
interface FeatureService {
  getUser: (id: string) => Promise<User>;
  updateUser: (id: string, data: Partial<User>) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;
}
```

### 3.3 Test Plan

**Testing strategy**:

```typescript
// 1. Component unit tests
describe('FeatureComponent', () => {
  it('should render loading state', () => {});
  it('should render data when loaded', () => {});
  it('should handle errors', () => {});
  it('should call callbacks on success', () => {});
});

// 2. Hook tests
describe('useFeature', () => {
  it('should fetch data on mount', () => {});
  it('should handle mutations', () => {});
  it('should update cache on success', () => {});
});

// 3. Integration tests
describe('Feature Integration', () => {
  it('should complete full user flow', () => {});
  it('should handle API errors gracefully', () => {});
});

// 4. E2E tests
describe('Feature E2E', () => {
  it('should complete full user journey', () => {});
});
```

## Phase 4: Planning

### 4.1 Task Breakdown

**Fine decomposition**:

```markdown
# Epic: [Main Feature]

## Story 1: [Sub-feature 1]
- [ ] Task 1.1: Create TypeScript types
- [ ] Task 1.2: Create API service
- [ ] Task 1.3: Create custom hook
- [ ] Task 1.4: Write hook tests
- [ ] Task 1.5: Create UI component
- [ ] Task 1.6: Write component tests
- [ ] Task 1.7: Integrate into feature

## Story 2: [Sub-feature 2]
- [ ] Task 2.1: ...
```

### 4.2 Effort Estimation

**Complexity points**:

| Task | Complexity | Estimated Time | Dependencies |
|------|------------|---------------|-------------|
| Create types | 1 | 30min | - |
| API Service | 2 | 1h | Types |
| Custom hook | 3 | 2h | Service |
| Hook tests | 2 | 1h | Hook |
| UI Component | 5 | 3h | Hook |
| Component tests | 3 | 1.5h | Component |
| Integration | 2 | 1h | All |
| **TOTAL** | **18** | **10h** | - |

### 4.3 Risk Identification

**Risk analysis**:

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| API unavailable | Low | High | Use MSW for mocking |
| Spec change | Medium | Medium | Flexible design |
| Performance | Low | High | Optimization with memo/useMemo |
| Regression | Medium | High | Exhaustive tests |

## Phase 5: Pre-Coding Validation

### 5.1 Validation Checklist

**Mandatory checks**:

- [ ] The need is clearly understood and documented
- [ ] Acceptance criteria are defined
- [ ] Existing architecture has been analyzed
- [ ] Project patterns are identified
- [ ] Technical solution is designed
- [ ] TypeScript types are defined
- [ ] Test plan is established
- [ ] Tasks are broken down and estimated
- [ ] Risks are identified
- [ ] Dependencies are managed
- [ ] Reusable existing code is identified
- [ ] Impacts on existing code are analyzed

### 5.2 Analysis Review

**Points to validate with the team**:

1. **Technical validation**
   - Is the chosen approach the right one?
   - Are there better alternatives?
   - Are the patterns used consistent?

2. **Business validation**
   - Does the solution meet the need?
   - Are edge cases covered?
   - Is the UX optimal?

3. **Quality validation**
   - Are the tests sufficient?
   - Is performance taken into account?
   - Is security ensured?

## Phase 6: Analysis Documentation

### 6.1 Technical Analysis Template

```markdown
# Technical Analysis: [FEATURE_NAME]

## 1. Summary
[Short feature description]

## 2. Need Analysis
### 2.1 Context
[Business context]

### 2.2 Objectives
- Main objective: [...]
- Secondary objectives: [...]

### 2.3 Acceptance Criteria
1. [Criterion 1]
2. [Criterion 2]

## 3. Technical Solution
### 3.1 Architecture
[Architecture diagram or description]

### 3.2 Components
- **FeatureComponent**: Main component
- **useFeature**: Logic management hook
- **featureService**: API service

### 3.3 TypeScript Types
```typescript
// Main types
```

### 3.4 Data Flow
[Flow description]

## 4. Impacts
### 4.1 Existing Code
- Modified components: [List]
- New files: [List]

### 4.2 Tests
- Tests to create: [List]
- Tests to modify: [List]

## 5. Implementation Plan
### 5.1 Tasks
1. [Task 1]
2. [Task 2]

### 5.2 Estimation
- Total time: [X hours]
- Complexity: [Low/Medium/High]

## 6. Risks and Mitigation
| Risk | Mitigation |
|------|------------|
| [Risk 1] | [Solution] |

## 7. Considered Alternatives
### Alternative 1
- Advantages: [...]
- Disadvantages: [...]
- Reason for rejection: [...]

## 8. Decisions Made
1. [Decision 1]: [Justification]
2. [Decision 2]: [Justification]
```

## Analysis Tools

### Search Tools

```bash
# Search for similar patterns
grep -r "useQuery" src/features/
grep -r "useMutation" src/features/

# Analyze imports
grep -r "import.*from '@/components" src/

# Find components
find src -name "*.tsx" -type f

# Analyze types
grep -r "interface.*Props" src/

# Check tests
find src -name "*.test.tsx" -type f
```

### Visualization Tools

```typescript
// Analyze structure with ts-morph
import { Project } from "ts-morph";

const project = new Project();
project.addSourceFilesAtPaths("src/**/*.tsx");

// Analyze dependencies
const sourceFile = project.getSourceFile("Component.tsx");
const imports = sourceFile?.getImportDeclarations();
```

## Anti-Patterns to Avoid

### What NOT to do

1. **Start coding without analysis**
   ```typescript
   // WRONG
   // Start directly without understanding the existing code
   export const NewFeature = () => {
     // Code written without prior analysis
   };
   ```

2. **Ignore existing code**
   ```typescript
   // WRONG
   // Create a new hook when a similar one exists
   const useNewFeature = () => {
     // Duplication of useExistingFeature
   };
   ```

3. **Don't document decisions**
   ```typescript
   // WRONG
   // Choose an approach without documenting why
   ```

4. **Underestimate complexity**
   ```markdown
   WRONG
   Task: Add the feature
   Time: 1h
   (Without breakdown or analysis)
   ```

### What to DO

1. **Analyze before coding**
   ```typescript
   // GOOD
   // 1. Analyze existing
   // 2. Understand patterns
   // 3. Design solution
   // 4. Document decisions
   // 5. Code with confidence
   ```

2. **Reuse and extend**
   ```typescript
   // GOOD
   // Extend an existing hook
   const useEnhancedFeature = () => {
     const baseFeature = useExistingFeature();
     // Add specific logic
     return { ...baseFeature, newLogic };
   };
   ```

3. **Document systematically**
   ```typescript
   /**
    * Custom hook to manage feature X
    *
    * @remarks
    * This hook was created to centralize X logic because:
    * - Reason 1
    * - Reason 2
    *
    * @example
    * ```tsx
    * const { data, update } = useFeature();
    * ```
    */
   ```

4. **Fine breakdown**
   ```markdown
   GOOD
   Epic: Feature X
   - Story 1: Types and interfaces (30min)
   - Story 2: API Service (1h)
   - Story 3: Custom hook (2h)
   - Story 4: Tests (1.5h)
   - Story 5: UI (3h)
   ```

## Concrete Examples

### Example 1: Adding a Login Form

```markdown
# Analysis: Login Form

## 1. Existing Code Audit
- Registration form exists (src/features/auth/components/RegisterForm.tsx)
- useAuth hook exists (src/hooks/useAuth.ts)
- authService exists (src/services/auth.service.ts)
- Zod validation used in the project

## 2. Architectural Decisions
- Reuse the RegisterForm pattern
- Use Zod for validation
- Use React Hook Form for form management
- Use existing useAuth hook

## 3. Implementation Plan
1. Create Zod schema (types/auth.schema.ts)
2. Create LoginForm component (features/auth/components/LoginForm.tsx)
3. Add tests (LoginForm.test.tsx)
4. Integrate into LoginPage
5. Test complete flow

## 4. Reused Code
- useAuth hook
- authService.login()
- FormInput component
- Button component
```

### Example 2: User Dashboard

```markdown
# Analysis: User Dashboard

## 1. Existing Code Audit
- useUser hook exists
- No Dashboard component
- React Query used for caching
- Recharts used for charts

## 2. Proposed Architecture
```
features/dashboard/
├── components/
│   ├── DashboardLayout.tsx       # Main layout
│   ├── StatsCard.tsx             # Stats card
│   ├── UserChart.tsx             # User chart
│   └── ActivityFeed.tsx          # Activity feed
├── hooks/
│   ├── useDashboardData.ts       # Data fetching logic
│   └── useStatsCalculation.ts    # Statistical calculations
├── types/
│   └── dashboard.types.ts        # TypeScript types
└── utils/
    └── statsHelpers.ts           # Utilities
```

## 3. Types to Create
```typescript
interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  revenue: number;
  growth: number;
}

interface ActivityItem {
  id: string;
  type: 'login' | 'purchase' | 'update';
  timestamp: Date;
  user: User;
}
```

## 4. Estimation
- Total: 12h
- Complexity: Medium-High
```

## Conclusion

Prior analysis is **NON-NEGOTIABLE**. It allows you to:

1. Save time in the long run
2. Avoid rewrites
3. Maintain code consistency
4. Reduce bugs
5. Facilitate reviews
6. Improve maintainability

**Recommended analysis time**: 20-30% of total project time

**Motto**: "An hour of analysis saves ten hours of development"
