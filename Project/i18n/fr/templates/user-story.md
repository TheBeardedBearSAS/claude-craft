# US-{ID}: {NOM}

## Métadonnées
- **ID**: US-{ID}
- **EPIC**: {EPIC_ID}
- **Sprint**: {SPRINT}
- **Statut**: suivi dans .bmad/sprint-status.yaml
- **Points**: {POINTS}
- **Persona**: {PERSONA_ID}
- **Créé le**: {DATE}
- **Mis à jour**: {DATE}

## Traçabilité
- **Implements**: {FR-001, FR-003} <!-- IDs des exigences PRD implémentées par cette story -->
- **Dépend de**: {US-xxx} <!-- Stories devant être complétées avant -->
- **Spec Technique**: {section_reference} <!-- Référence à la section de la spec technique -->

## User Story

**En tant que** {PERSONA},
**je veux** {ACTION},
**afin de** {BENEFICE}.

## Critères d'Acceptation

### CA-1: {TITRE_CA_1}
```gherkin
GIVEN {contexte initial}
WHEN {action utilisateur}
THEN {résultat attendu}
```

### CA-2: {TITRE_CA_2}
```gherkin
GIVEN {contexte initial}
WHEN {action utilisateur}
THEN {résultat attendu}
```

## Tasks

| ID | Type | Description | Estimation |
|----|------|-------------|------------|
| - | - | - | - |

_Les statuts des tasks sont suivis dans `.bmad/sprint-status.yaml`._

## Progression

0/0 tasks complétées (0%) <!-- dérivé de .bmad/sprint-status.yaml -->

## Definition of Done

- [ ] Tous les critères d'acceptation validés
- [ ] Code reviewé
- [ ] Tests unitaires passent
- [ ] Tests d'intégration passent
- [ ] Documentation mise à jour

---

## Notes

{NOTES}
