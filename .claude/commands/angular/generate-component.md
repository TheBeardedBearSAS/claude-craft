---
description: Generate Angular standalone component with tests
argument-hint: <component-name> [feature]
---

# Generate Angular Component

Generate a complete Angular standalone component with tests and proper structure.

## Arguments

$ARGUMENTS

- `component-name`: Name of the component (e.g., "user-card", "data-table")
- `feature` (optional): Feature folder (e.g., "users", "dashboard")

## What This Command Generates

1. **Component file** (`{name}.component.ts`)
2. **Template file** (`{name}.component.html`)
3. **Styles file** (`{name}.component.scss`)
4. **Test file** (`{name}.component.spec.ts`)
5. **Index file** (`index.ts`)

## Generated Structure

```
src/app/features/{feature}/components/{name}/
├── {name}.component.ts
├── {name}.component.html
├── {name}.component.scss
├── {name}.component.spec.ts
└── index.ts
```

## Component Template

```typescript
// {name}.component.ts
import {
  Component,
  input,
  output,
  computed,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-{name}',
  imports: [CommonModule],
  templateUrl: './{name}.component.html',
  styleUrl: './{name}.component.scss'
})
export class {PascalName}Component {
  // Inputs
  // data = input.required<DataType>();
  // optional = input<string>('default');

  // Outputs
  // action = output<void>();

  // Internal state
  // loading = signal(false);

  // Computed
  // derived = computed(() => this.data().property);

  // Event handlers
  // onAction(): void {
  //   this.action.emit();
  // }
}
```

## Template File

```html
<!-- {name}.component.html -->
<div class="{name}">
  <!-- Component content -->
</div>
```

## Styles File

```scss
// {name}.component.scss
.{name} {
  // Component styles
}
```

## Test Template

```typescript
// {name}.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { {PascalName}Component } from './{name}.component';

describe('{PascalName}Component', () => {
  let component: {PascalName}Component;
  let fixture: ComponentFixture<{PascalName}Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [{PascalName}Component]
    }).compileComponents();

    fixture = TestBed.createComponent({PascalName}Component);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('rendering', () => {
    it('should render component', () => {
      fixture.detectChanges();
      const element = fixture.nativeElement;
      expect(element.querySelector('.{name}')).toBeTruthy();
    });
  });

  describe('inputs', () => {
    // Add input tests here
  });

  describe('outputs', () => {
    // Add output tests here
  });

  describe('interactions', () => {
    // Add interaction tests here
  });
});
```

## Index File

```typescript
// index.ts
export { {PascalName}Component } from './{name}.component';
```

## Usage Examples

```bash
# Generate in shared components
/angular:generate-component button

# Generate in feature
/angular:generate-component user-card users

# Generate in nested feature
/angular:generate-component order-item orders/checkout
```

## Component Types

### Presentational (Dumb) Component

```typescript
@Component({
  selector: 'app-user-card',
  template: `
    <div class="user-card">
      <img [src]="user().avatar" [alt]="user().name" />
      <h3>{{ user().name }}</h3>
      <button (click)="selected.emit(user().id)">Select</button>
    </div>
  `
})
export class UserCardComponent {
  user = input.required<User>();
  selected = output<string>();
}
```

### Container (Smart) Component

```typescript
@Component({
  selector: 'app-user-list-container',
  imports: [UserListComponent],
  template: `
    <app-user-list
      [users]="users()"
      [loading]="loading()"
      (userSelected)="onUserSelect($event)"
    />
  `
})
export class UserListContainerComponent {
  private usersService = inject(UsersService);

  users = this.usersService.users;
  loading = this.usersService.loading;

  onUserSelect(userId: string): void {
    this.usersService.selectUser(userId);
  }
}
```

## Best Practices

1. **Standalone is the default** (since Angular 19): do not write `standalone: true`
2. **OnPush is the default since Angular 22.0.0**: omit `changeDetection` (use `ChangeDetectionStrategy.Eager` only to opt out, with justification)
3. **Prefer signal inputs**: `input()` and `input.required()`
4. **Use computed for derived state**: `computed(() => ...)`
5. **Small, focused components**: Single responsibility
6. **Test all inputs/outputs**: Comprehensive test coverage
