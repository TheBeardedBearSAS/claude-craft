# Pre-Commit Checklist

## Code Quality

- [ ] Code formatted with `dart format`
- [ ] No `flutter analyze` warnings
- [ ] No compilation errors
- [ ] All imports organized
- [ ] No unnecessary commented code
- [ ] No forgotten `print()` or `debugPrint()`
- [ ] No TODO without associated ticket

## Tests

- [ ] Unit tests pass (`flutter test`)
- [ ] Widget tests pass
- [ ] Coverage > 80% for new files
- [ ] No skipped tests (`@Skip`)

## Documentation

- [ ] Dartdoc for new public classes
- [ ] README updated if necessary
- [ ] CHANGELOG updated
- [ ] Comments for complex code

## Git

- [ ] Commit message follows Conventional Commits
- [ ] No sensitive files (.env, secrets)
- [ ] .gitignore up to date
- [ ] Branch up to date with develop/main

## Architecture

- [ ] Clean Architecture respected
- [ ] Dependencies in correct direction
- [ ] No business logic in UI
- [ ] Reusable widgets extracted

## Performance

- [ ] const widgets used
- [ ] No unnecessary builds
- [ ] Images optimized
- [ ] Correct async/await usage

## Security

- [ ] No hardcoded sensitive data
- [ ] User input validation
- [ ] Appropriate permission handling
