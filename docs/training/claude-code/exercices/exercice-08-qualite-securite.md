# Exercice 8 : Qualite et Securite (TDD)

**Module :** 8 - Qualite et Securite
**Duree :** 15 minutes
**Niveau :** Intermediaire / Avance

---

## Objectifs

A la fin de cet exercice, vous serez capable de :

- Realiser un cycle TDD complet (Red-Green-Refactor) avec Claude Code
- Appliquer le pattern Strategy pour un code extensible
- Verifier que le refactoring ne casse aucun test

---

## Prerequis

- [ ] Claude Code installe et fonctionnel
- [ ] Un projet avec un framework de test configure (Vitest, Jest, PHPUnit, pytest, etc.)
- [ ] Modules 1 a 7 completes

---

## Etape 1 : RED - Ecrire les tests (5 min)

Demandez a Claude de generer les tests pour un service de validation de mot de passe :

```bash
claude

> Ecris les tests pour un PasswordValidatorService.
>
> Regles de validation :
> - Minimum 12 caracteres
> - Au moins 1 majuscule
> - Au moins 1 minuscule
> - Au moins 1 chiffre
> - Au moins 1 caractere special (!@#$%^&*)
> - Pas dans une liste de mots de passe courants (password, 123456, qwerty, etc.)
> - Pas de sequences repetitives (aaa, 111, etc.)
>
> Ecris UNIQUEMENT les tests, pas l'implementation.
> Chaque test doit avoir un nom descriptif.
```

### Verification RED

```bash
> Lance les tests. Ils doivent TOUS echouer.
```

**Resultat attendu :** Tous les tests sont en rouge (echec) car le service n'existe pas encore.

---

## Etape 2 : GREEN - Implementer le code minimal (5 min)

```bash
> Implemente le PasswordValidatorService pour faire passer
> TOUS les tests. Code minimal uniquement :
> - Pas d'optimisation
> - Pas de pattern avance
> - Le code le plus simple qui fait passer les tests
```

### Verification GREEN

```bash
> Lance les tests. Ils doivent TOUS passer.
```

**Resultat attendu :** Tous les tests passent (vert). Le code est simple mais fonctionnel.

---

## Etape 3 : REFACTOR - Pattern Strategy (5 min)

```bash
> Refactorise le PasswordValidatorService en appliquant
> le pattern Strategy :
>
> - Cree une interface PasswordRule
> - Chaque regle de validation = une classe separee :
>   - MinLengthRule (12 caracteres)
>   - UppercaseRule (1 majuscule)
>   - LowercaseRule (1 minuscule)
>   - DigitRule (1 chiffre)
>   - SpecialCharRule (1 caractere special)
>   - CommonPasswordRule (liste noire)
>   - RepetitiveSequenceRule (pas de repetitions)
>
> - Le PasswordValidatorService itere sur les regles injectees
> - Les tests existants doivent TOUJOURS passer
```

### Verification REFACTOR

```bash
> Lance les tests. Ils doivent TOUJOURS passer apres le refactoring.
```

**Resultat attendu :**
- Le code est restructure avec le pattern Strategy
- Chaque regle est dans sa propre classe (SRP)
- On peut ajouter de nouvelles regles sans modifier le service (OCP)
- Tous les tests passent toujours

---

## Verification

- [ ] Les tests sont ecrits AVANT le code (RED)
- [ ] Tous les tests echouent avant l'implementation
- [ ] Tous les tests passent apres l'implementation (GREEN)
- [ ] Le refactoring ne casse aucun test (REFACTOR)
- [ ] Le pattern Strategy est correctement applique
- [ ] Chaque regle de validation est dans sa propre classe
- [ ] On peut ajouter une nouvelle regle sans modifier le service

---

## Bonus

Si vous avez termine en avance :

1. **Ajoutez une nouvelle regle** sans modifier le code existant :
   ```bash
   > Ajoute une regle "pas de caracteres consecutifs identiques"
   > (ex: "aab" est OK, "aaa" est KO).
   > N'ajoute que la nouvelle classe et son test.
   > Le service existant ne doit PAS etre modifie.
   ```

2. **Demandez un audit de securite** du PasswordValidatorService :
   ```bash
   > Effectue un audit OWASP du PasswordValidatorService.
   > Verifie : timing attacks, logging de mots de passe,
   > injection, stockage en memoire.
   ```

3. **Generez un scenario BDD** (Gherkin) pour la validation de mot de passe :
   ```bash
   > Ecris les scenarios BDD au format Gherkin pour
   > la fonctionnalite de validation de mot de passe.
   ```
