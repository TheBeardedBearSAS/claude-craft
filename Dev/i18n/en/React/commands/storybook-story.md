# Generate Storybook Story

Generate a Storybook story for an existing React component.

## What This Command Does

1. **Story Generation**
   - Create story file for component
   - Generate all component variants
   - Add interactive controls (args)
   - Configure story parameters
   - Add documentation

2. **Templates Used**
   - CSF 3.0 format (Component Story Format)
   - TypeScript types
   - Args and argTypes
   - Story variants

3. **Generated File**
   ```
   src/components/ComponentName/
   └── ComponentName.stories.tsx
   ```

## How to Use

```bash
# Generate story for existing component
npm run generate:story ComponentName

# With custom path
npm run generate:story features/users/components/UserCard
```

## Story Templates

### 1. Basic Story

```typescript
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger'],
      description: 'Button variant style',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Button size',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the button',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// Default story
export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'primary',
    size: 'md',
  },
};

// All variants
export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
  },
};

export const Danger: Story = {
  args: {
    children: 'Danger Button',
    variant: 'danger',
  },
};

// Size variants
export const Small: Story = {
  args: {
    children: 'Small Button',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    children: 'Large Button',
    size: 'lg',
  },
};

// State variants
export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
};

export const Loading: Story = {
  args: {
    children: 'Loading Button',
    isLoading: true,
  },
};
```

### 2. Form Component Story

```typescript
// Input.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Forms/Input',
  component: Input,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number'],
    },
    error: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    label: 'Email',
    placeholder: 'Enter your email',
  },
};

export const WithError: Story = {
  args: {
    label: 'Email',
    value: 'invalid-email',
    error: 'Invalid email format',
  },
};

export const Password: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter password',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Email',
    disabled: true,
    value: 'disabled@example.com',
  },
};
```

### 3. Complex Component with Actions

```typescript
// UserCard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { UserCard } from './UserCard';

const meta: Meta<typeof UserCard> = {
  title: 'Features/UserCard',
  component: UserCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '400px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof UserCard>;

const mockUser = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  avatar: 'https://i.pravatar.cc/150?img=1',
  role: 'admin' as const,
};

export const Default: Story = {
  args: {
    user: mockUser,
    onEdit: action('onEdit'),
    onDelete: action('onDelete'),
  },
};

export const WithoutAvatar: Story = {
  args: {
    user: { ...mockUser, avatar: undefined },
    onEdit: action('onEdit'),
    onDelete: action('onDelete'),
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};
```

### 4. Story with Multiple Compositions

```typescript
// Card.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    children: 'Card content',
  },
};

export const WithHeader: Story = {
  render: () => (
    <Card>
      <Card.Header>Card Title</Card.Header>
      <Card.Body>Card content goes here</Card.Body>
    </Card>
  ),
};

export const Complete: Story = {
  render: () => (
    <Card>
      <Card.Header>
        <h3>User Profile</h3>
      </Card.Header>
      <Card.Body>
        <p>Name: John Doe</p>
        <p>Email: john@example.com</p>
      </Card.Body>
      <Card.Footer>
        <button>Edit</button>
        <button>Delete</button>
      </Card.Footer>
    </Card>
  ),
};
```

### 5. Story with MSW (API Mocking)

```typescript
// UserList.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse } from 'msw';
import { UserList } from './UserList';

const meta: Meta<typeof UserList> = {
  title: 'Features/UserList',
  component: UserList,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof UserList>;

export const Default: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/users', () => {
          return HttpResponse.json([
            { id: '1', name: 'John Doe', email: 'john@example.com' },
            { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
          ]);
        }),
      ],
    },
  },
};

export const Empty: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/users', () => {
          return HttpResponse.json([]);
        }),
      ],
    },
  },
};

export const Error: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/users', () => {
          return new HttpResponse(null, { status: 500 });
        }),
      ],
    },
  },
};
```

## Story Configuration

### Global Parameters

```typescript
// .storybook/preview.ts
import type { Preview } from '@storybook/react';
import '../src/index.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#1a1a1a' },
      ],
    },
  },
};

export default preview;
```

### Decorators

```typescript
// Global decorator
export const decorators = [
  (Story) => (
    <div style={{ padding: '3rem' }}>
      <Story />
    </div>
  ),
];

// Story-specific decorator
export const WithPadding: Story = {
  decorators: [
    (Story) => (
      <div style={{ padding: '2rem', backgroundColor: '#f0f0f0' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    children: 'Padded content',
  },
};
```

## Interactive Controls

### ArgTypes Configuration

```typescript
const meta: Meta<typeof Component> = {
  argTypes: {
    // Select
    variant: {
      control: 'select',
      options: ['primary', 'secondary'],
      description: 'Component variant',
      table: {
        defaultValue: { summary: 'primary' },
      },
    },

    // Radio
    size: {
      control: 'radio',
      options: ['sm', 'md', 'lg'],
    },

    // Boolean
    disabled: {
      control: 'boolean',
    },

    // Number
    count: {
      control: { type: 'number', min: 0, max: 100, step: 1 },
    },

    // Range
    opacity: {
      control: { type: 'range', min: 0, max: 1, step: 0.1 },
    },

    // Color
    color: {
      control: 'color',
    },

    // Date
    date: {
      control: 'date',
    },

    // Text
    label: {
      control: 'text',
    },

    // Object
    user: {
      control: 'object',
    },

    // Function (disable control)
    onClick: {
      action: 'clicked',
      table: {
        category: 'Events',
      },
    },
  },
};
```

## Documentation

### MDX Documentation

```mdx
<!-- Button.stories.mdx -->
import { Canvas, Meta, Story } from '@storybook/blocks';
import * as ButtonStories from './Button.stories';

<Meta of={ButtonStories} />

# Button

Button component with multiple variants and sizes.

## Usage

```tsx
import { Button } from '@/components/Button';

<Button variant="primary" onClick={handleClick}>
  Click me
</Button>
```

## Variants

<Canvas of={ButtonStories.Primary} />
<Canvas of={ButtonStories.Secondary} />
<Canvas of={ButtonStories.Danger} />

## Sizes

<Canvas of={ButtonStories.Small} />
<Canvas of={ButtonStories.Large} />
```

## Best Practices

1. **Story Naming**: Use descriptive names (Default, Primary, WithError)
2. **Args**: Provide sensible defaults
3. **ArgTypes**: Document all props
4. **Actions**: Use for event handlers
5. **Decorators**: Add context when needed
6. **MSW**: Mock API calls
7. **Accessibility**: Test with a11y addon
8. **Documentation**: Add MDX for complex components
9. **Variants**: Cover all visual states
10. **Edge Cases**: Include error, loading, empty states

## Testing with Storybook

### Interaction Testing

```typescript
// Button.stories.tsx
import { expect } from '@storybook/jest';
import { userEvent, within } from '@storybook/testing-library';

export const ClickTest: Story = {
  args: {
    children: 'Click me',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    await userEvent.click(button);
    await expect(button).toHaveAttribute('aria-pressed', 'true');
  },
};
```

### Visual Testing

```typescript
// Configure Chromatic
export const parameters = {
  chromatic: {
    viewports: [320, 768, 1200],
    delay: 300,
  },
};
```

## Generator Script

```typescript
// scripts/generate-story.ts
import fs from 'fs/promises';
import path from 'path';

async function generateStory(componentName: string, componentPath: string) {
  const storyPath = path.join(componentPath, `${componentName}.stories.tsx`);

  await fs.writeFile(storyPath, getStoryTemplate(componentName));

  console.log(`✅ Story created: ${storyPath}`);
}

// Run
const [,, name, pathArg] = process.argv;
generateStory(name, pathArg || `src/components/${name}`);
```

## Storybook Addons

Essential addons to install:

```bash
npm install -D @storybook/addon-essentials
npm install -D @storybook/addon-interactions
npm install -D @storybook/addon-a11y
npm install -D msw-storybook-addon
```

## Resources

- [Storybook Documentation](https://storybook.js.org/docs/react/get-started/introduction)
- [CSF 3.0](https://storybook.js.org/docs/react/api/csf)
- [Interaction Testing](https://storybook.js.org/docs/react/writing-tests/interaction-testing)
- [MSW Addon](https://storybook.js.org/addons/msw-storybook-addon)
