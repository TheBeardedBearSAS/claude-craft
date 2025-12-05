# Checklist Pre-Commit

## Code Quality

- [ ] Code formaté avec `dart format`
- [ ] Aucun warning `flutter analyze`
- [ ] Aucune erreur de compilation
- [ ] Tous les imports organisés
- [ ] Pas de code commenté inutile
- [ ] Pas de `print()` ou `debugPrint()` oubliés
- [ ] Pas de TODO sans ticket associé

## Tests

- [ ] Tests unitaires passent (`flutter test`)
- [ ] Tests de widgets passent
- [ ] Coverage > 80% pour nouveaux fichiers
- [ ] Pas de tests ignorés (`@Skip`)

## Documentation

- [ ] Dartdoc pour nouvelles classes publiques
- [ ] README mis à jour si nécessaire
- [ ] CHANGELOG mis à jour
- [ ] Commentaires pour code complexe

## Git

- [ ] Message de commit suit Conventional Commits
- [ ] Pas de fichiers sensibles (.env, secrets)
- [ ] .gitignore à jour
- [ ] Branche à jour avec develop/main

## Architecture

- [ ] Respect de Clean Architecture
- [ ] Dépendances dans le bon sens
- [ ] Pas de logique métier dans l'UI
- [ ] Widgets réutilisables extraits

## Performance

- [ ] const widgets utilisés
- [ ] Pas de builds inutiles
- [ ] Images optimisées
- [ ] Async/await correct

## Sécurité

- [ ] Pas de données sensibles en dur
- [ ] Validation des entrées utilisateur
- [ ] Gestion des permissions appropriée
