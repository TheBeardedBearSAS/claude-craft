# Testing React Native

## Introduction

Les tests garantissent la qualité et la stabilité de l'application React Native.

---

## Types de Tests

### 1. Unit Tests (Jest)
### 2. Component Tests (React Native Testing Library)
### 3. Integration Tests
### 4. E2E Tests (Detox)

---

## Jest Configuration

### jest.config.js

```javascript
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
    '!src/**/*.test.{ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### jest.setup.js

```javascript
import '@testing-library/jest-native/extend-expect';

// Mock expo modules
jest.mock('expo-font');
jest.mock('expo-asset');

// Mock react-native modules
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
```

---

## Unit Tests

### Testing Utilities

```typescript
// utils/formatDate.test.ts
import { formatDate } from './formatDate';

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2024-01-15T10:30:00Z');
    expect(formatDate(date)).toBe('Jan 15, 2024');
  });

  it('should handle invalid date', () => {
    expect(() => formatDate(null as any)).toThrow();
  });
});
```

### Testing Services

```typescript
// services/api/users.service.test.ts
import { usersService } from './users.service';
import { apiClient } from '../client';

jest.mock('../client');

describe('UsersService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch users', async () => {
    const mockUsers = [{ id: '1', name: 'John' }];
    (apiClient.get as jest.Mock).mockResolvedValue({ data: mockUsers });

    const users = await usersService.getAll();

    expect(users).toEqual(mockUsers);
    expect(apiClient.get).toHaveBeenCalledWith('/users');
  });

  it('should handle errors', async () => {
    (apiClient.get as jest.Mock).mockRejectedValue(new Error('Network error'));

    await expect(usersService.getAll()).rejects.toThrow('Network error');
  });
});
```

---

## Component Tests

### Testing Library Setup

```bash
npm install --save-dev @testing-library/react-native @testing-library/jest-native
```

### Testing Presentational Components

```typescript
// components/Button/Button.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from './Button';

describe('Button', () => {
  it('should render correctly', () => {
    const { getByText } = render(<Button onPress={() => {}}>Click me</Button>);
    expect(getByText('Click me')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button onPress={onPress}>Click me</Button>);

    fireEvent.press(getByText('Click me'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button onPress={onPress} disabled>
        Click me
      </Button>
    );

    fireEvent.press(getByText('Click me'));

    expect(onPress).not.toHaveBeenCalled();
  });
});
```

### Testing Hooks

```typescript
// hooks/useCounter.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('should initialize with default value', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it('should increment count', () => {
    const { result } = renderHook(() => useCounter());

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });

  it('should decrement count', () => {
    const { result } = renderHook(() => useCounter(5));

    act(() => {
      result.current.decrement();
    });

    expect(result.current.count).toBe(4);
  });
});
```

### Testing with React Query

```typescript
// hooks/useUsers.test.tsx
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUsers } from './useUsers';
import { usersService } from '@/services/users.service';

jest.mock('@/services/users.service');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useUsers', () => {
  it('should fetch users successfully', async () => {
    const mockUsers = [{ id: '1', name: 'John' }];
    (usersService.getAll as jest.Mock).mockResolvedValue(mockUsers);

    const { result } = renderHook(() => useUsers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockUsers);
  });
});
```

---

## E2E Tests (Detox)

### Installation

```bash
npm install --save-dev detox jest
detox init
```

### detox.config.js

```javascript
module.exports = {
  testRunner: 'jest',
  runnerConfig: 'e2e/config.json',
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/MyApp.app',
      build: 'xcodebuild -workspace ios/MyApp.xcworkspace -scheme MyApp -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build',
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
    },
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 14',
      },
    },
    emulator: {
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_4_API_30',
      },
    },
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug',
    },
    'android.emu.debug': {
      device: 'emulator',
      app: 'android.debug',
    },
  },
};
```

### E2E Test Example

```typescript
// e2e/login.test.ts
describe('Login Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should show login screen', async () => {
    await expect(element(by.id('login-screen'))).toBeVisible();
  });

  it('should login successfully with valid credentials', async () => {
    await element(by.id('email-input')).typeText('user@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();

    await expect(element(by.id('home-screen'))).toBeVisible();
  });

  it('should show error with invalid credentials', async () => {
    await element(by.id('email-input')).typeText('wrong@example.com');
    await element(by.id('password-input')).typeText('wrongpassword');
    await element(by.id('login-button')).tap();

    await expect(element(by.text('Invalid credentials'))).toBeVisible();
  });
});
```

---

## Test Organization

```
__tests__/
├── unit/
│   ├── utils/
│   │   └── formatDate.test.ts
│   └── services/
│       └── users.service.test.ts
├── integration/
│   └── hooks/
│       └── useUsers.test.tsx
└── components/
    ├── Button.test.tsx
    └── UserCard.test.tsx

e2e/
├── login.test.ts
├── navigation.test.ts
└── profile.test.ts
```

---

## Coverage

```bash
# Run tests with coverage
npm test -- --coverage

# View coverage report
open coverage/lcov-report/index.html
```

---

## Best Practices

1. **Test behavior, not implementation**
2. **Use data-testid for E2E**
3. **Mock external dependencies**
4. **Keep tests isolated**
5. **Use descriptive test names**

---

## Checklist Testing

- [ ] Jest configuré
- [ ] Testing Library installé
- [ ] Tests unitaires pour utils
- [ ] Tests composants UI
- [ ] Tests hooks customs
- [ ] Tests integration (React Query)
- [ ] E2E Detox configuré
- [ ] Coverage > 80%

---

**Les tests ne sont pas optionnels, ils sont essentiels.**
