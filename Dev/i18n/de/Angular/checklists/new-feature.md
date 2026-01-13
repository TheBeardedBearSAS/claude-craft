# Angular New Feature Checklist

## Before Starting

- [ ] Requirements are clear and documented
- [ ] Feature scope is defined
- [ ] Design/mockups available (if UI)
- [ ] API contract defined (if backend integration)

## Architecture

- [ ] Feature folder created: `src/app/features/{feature}/`
- [ ] Correct folder structure:
  ```
  features/{feature}/
  ├── components/
  ├── services/
  ├── store/
  └── {feature}.routes.ts
  ```
- [ ] No cross-feature dependencies

## Components

- [ ] All components are standalone
- [ ] All components use OnPush
- [ ] Smart/Dumb pattern followed
- [ ] Signal inputs used (`input()`, `input.required()`)
- [ ] Signals used for local state
- [ ] Computed signals for derived state

## State Management

- [ ] Store service created if needed
- [ ] State is immutable
- [ ] Selectors are computed signals
- [ ] Actions update state correctly

## Routing

- [ ] Routes lazy loaded
- [ ] Guards added if protected
- [ ] Route params handled correctly

## Forms

- [ ] Typed reactive forms used
- [ ] Validation implemented
- [ ] Error messages displayed
- [ ] Form accessibility (labels, ARIA)

## API Integration

- [ ] API service created
- [ ] Error handling implemented
- [ ] Loading states managed
- [ ] Retry logic if needed

## Testing

- [ ] Unit tests for components
- [ ] Unit tests for services
- [ ] Unit tests for store
- [ ] Integration tests if complex
- [ ] Coverage > 80%

## Accessibility

- [ ] Semantic HTML used
- [ ] ARIA labels where needed
- [ ] Keyboard navigation works
- [ ] Focus management correct
- [ ] Color contrast sufficient

## Performance

- [ ] trackBy on all @for loops
- [ ] Lazy loading used
- [ ] No unnecessary re-renders
- [ ] Bundle size checked

## Documentation

- [ ] README updated if public API
- [ ] Complex logic documented
- [ ] Component inputs/outputs documented

## Code Quality

- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Code formatted
- [ ] No console.log in final code

## Before PR

- [ ] All tests pass
- [ ] Build succeeds
- [ ] No security issues
- [ ] Code reviewed by self
- [ ] PR description written

## PR Description Template

```markdown
## Summary
Brief description of the feature

## Changes
- Component A: Added user profile display
- Service B: Created API integration
- Store C: Added state management

## Testing
- [ ] Unit tests added
- [ ] Manual testing completed

## Screenshots
(if UI changes)

## Checklist
- [ ] Tests pass
- [ ] Build succeeds
- [ ] Documentation updated
```
