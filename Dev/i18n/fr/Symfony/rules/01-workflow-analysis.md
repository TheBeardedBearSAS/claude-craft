# Workflow d'Analyse Obligatoire

## Principe Fondamental

**AVANT toute modification de code (feature, bugfix, refactoring), une phase d'analyse approfondie est OBLIGATOIRE.**

Cette regle est CRITIQUE et NON NEGOCIABLE. Elle evite :
- Les regressions
- Les effets de bord inattendus
- La dette technique
- Les bugs en production

## Processus en 4 Etapes

### Etape 1 : Comprendre la Demande

**Questions a se poser :**
1. Quel est l'objectif precis ?
2. Quels sont les criteres d'acceptation ?
3. Y a-t-il des contraintes (performance, securite, RGPD) ?
4. Quel est l'impact utilisateur ?

**Actions :**
- Reformuler la demande pour validation
- Identifier les use cases concernes
- Verifier alignement avec objectifs business (voir `.claude/rules/00-project-context.md`)

### Etape 2 : Analyser le Code Existant

**Fichiers a lire OBLIGATOIREMENT :**
1. Les fichiers directement concernes par la modification
2. Les fichiers dependants (qui utilisent le code modifie)
3. Les tests existants (pour comprendre le comportement attendu)
4. Les migrations Doctrine (si impact sur schema DB)

**Outils :**
```bash
# Rechercher usages d'une classe/methode
make console CMD="debug:container NomClasse"

# Analyser dependances
make phpstan
make deptrac

# Voir tests existants
make test-coverage
```

**Points de vigilance :**
- Y a-t-il des tests qui vont casser ?
- Y a-t-il d'autres classes qui dependent de ce code ?
- Le code respecte-t-il l'architecture Clean Architecture + DDD ?
- Y a-t-il des donnees sensibles (RGPD) ?

### Etape 3 : Documenter l'Analyse

**Utiliser le template** : `.claude/templates/analysis.md`

**Contenu obligatoire :**
1. **Objectif** : Description claire de la modification
2. **Fichiers impactes** : Liste exhaustive avec justification
3. **Impacts** :
   - Breaking changes : oui/non
   - Migration DB necessaire : oui/non
   - Impact performance : oui/non
   - Donnees sensibles : oui/non
4. **Risques** : Liste + mitigations
5. **Approche** : Strategie implementation (TDD, refactoring progressif, etc.)
6. **Tests TDD** : Liste des tests a ecrire AVANT implementation

**Exemple :**
```markdown
## Analyse : Chiffrement allergies et traitements medicaux (RGPD)

### Objectif
Chiffrer les champs `allergies` et `medicalTreatments` de l'entite Participant
pour conformite RGPD.

### Fichiers impactes
- `src/Entity/Participant.php` (ajout annotations chiffrement)
- `config/packages/doctrine.yaml` (config Gedmo)
- `src/Repository/ParticipantRepository.php` (queries avec champs chiffres)
- Migration Doctrine (pas de changement schema, chiffrement transparent)

### Impacts
- Breaking change : NON (chiffrement transparent)
- Migration DB : NON (Doctrine gere automatiquement)
- Performance : Impact leger (chiffrement/dechiffrement) < 50ms
- Donnees sensibles : OUI (raison du chiffrement)

### Risques
1. Perte cle chiffrement → Mitigation : backup cle dans vault securise
2. Performance queries LIKE sur champs chiffres → Mitigation : pas de LIKE sur allergies

### Approche
1. Installer gedmo/doctrine-extensions
2. Configurer doctrine_encryption dans services.yaml
3. TDD : ecrire tests avec donnees sensibles
4. Implanter annotations sur entite
5. Tester chiffrement/dechiffrement
6. Verifier perfs (< 50ms)

### Tests TDD
1. test_should_encrypt_allergies_when_saved()
2. test_should_decrypt_allergies_when_loaded()
3. test_should_encrypt_medical_treatments()
4. test_should_find_participant_by_encrypted_field()
```

### Etape 4 : Validation

**Criteres de decision :**

| Impact | Action |
|--------|--------|
| **Faible** (1 fichier, pas de breaking change, < 1h) | Proceeder directement |
| **Moyen** (2-5 fichiers, migration DB, < 4h) | Valider avec utilisateur |
| **Fort** (> 5 fichiers, breaking changes, refactoring archi) | Planification detaillee + validation obligatoire |

**Questions de validation :**
- L'approche respecte-t-elle Clean Architecture + DDD ?
- Les tests TDD sont-ils suffisants ?
- Y a-t-il une alternative plus simple (KISS) ?
- Les risques sont-ils acceptables ?

## Anti-Patterns a Eviter

### ❌ Coder sans lire le code existant
```php
// MAUVAIS : modification sans comprendre impact
class ReservationController {
    public function create() {
        // Je change directement sans lire le code existant
        $reservation->setStatus('confirmed'); // ⚠️ Impact ?
    }
}
```

### ❌ Ignorer les dependances
```php
// MAUVAIS : modification sans verifier qui utilise cette methode
class Sejour {
    public function getPrice(): float {
        // Je change le comportement sans verifier impacts
        return $this->price * 0.8; // ⚠️ Qui appelle getPrice() ?
    }
}
```

### ❌ Oublier les tests
```php
// MAUVAIS : pas de verification tests existants
// Si je modifie Participant, quels tests vont casser ?
```

### ❌ Ignorer RGPD
```php
// MAUVAIS : ajouter champ sensible sans chiffrement
class Participant {
    private string $socialSecurityNumber; // ⚠️ RGPD !
}
```

## Checklist Rapide

Avant toute modification :

- [ ] J'ai lu et compris la demande
- [ ] J'ai lu les fichiers concernes
- [ ] J'ai identifie les dependances
- [ ] J'ai documente l'analyse
- [ ] J'ai evalue les risques
- [ ] J'ai defini les tests TDD
- [ ] J'ai valide l'approche (si impact moyen/fort)
- [ ] J'ai verifie conformite Clean Architecture + SOLID
- [ ] J'ai verifie securite + RGPD si donnees sensibles

## Templates Associes

- `.claude/templates/analysis.md` - Template analyse detaillee
- `.claude/checklists/new-feature.md` - Checklist nouvelle feature
- `.claude/checklists/refactoring.md` - Checklist refactoring
