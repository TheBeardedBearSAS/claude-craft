# Project Context

## Project Information

- **Name**: {{PROJECT_NAME}}
- **Type**: Angular Application
- **Angular Version**: {{ANGULAR_VERSION}}
- **Description**: {{PROJECT_DESCRIPTION}}

## Tech Stack

- **Framework**: Angular {{ANGULAR_VERSION}}
- **Language**: TypeScript 5.x
- **Styling**: {{STYLING}} (SCSS/Tailwind/Angular Material)
- **State Management**: {{STATE_MANAGEMENT}} (Signals/NgRx/NGXS)
- **Testing**: {{TESTING}} (Vitest/Jest + Cypress)
- **Build Tool**: Angular CLI / Vite

## Architecture

- **Pattern**: Standalone Components + Domain-Driven Design
- **Structure**: Feature-based folders
- **State**: {{STATE_PATTERN}} (Signal Store/NgRx Store)

## Conventions

### File Naming

- Components: `kebab-case.component.ts`
- Services: `kebab-case.service.ts`
- Guards: `kebab-case.guard.ts`
- Pipes: `kebab-case.pipe.ts`
- Models: `kebab-case.model.ts`

### Component Structure

```typescript
@Component({
  selector: 'app-{{component-name}}',
  standalone: true,
  imports: [...],
  templateUrl: './{{component-name}}.component.html',
  styleUrl: './{{component-name}}.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

### Import Order

1. Angular core imports
2. Angular common/forms/router
3. Third-party libraries
4. Internal absolute imports (@app/*, @core/*, @shared/*)
5. Relative imports
6. Type imports

## Development Commands

```bash
# Start development server
ng serve

# Build for production
ng build --configuration=production

# Run tests
npm run test

# Run linting
ng lint

# Generate component
ng generate component features/{{feature}}/components/{{name}} --standalone
```

## Project-Specific Rules

{{CUSTOM_RULES}}
