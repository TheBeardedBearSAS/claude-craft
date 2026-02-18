---
description: Valider le Tech Spec contre le quality gate (≥90%)
argument-hint: [fichier-techspec]
---

# Valider le Tech Spec Gate

Valide une Spécification Technique contre le quality gate Tech Spec.
Le Tech Spec doit atteindre au moins 90% pour passer.

## Arguments

$ARGUMENTS (format: [fichier-techspec])
- **fichier-techspec** (optionnel) : Chemin vers le fichier Tech Spec. Défaut : `docs/tech-spec.md`

## Critères du Gate

| Critère | Poids | Requis | Description |
|---------|-------|--------|-------------|
| Vue d'ensemble Architecture | 12% | Oui | Description du design système |
| Diagramme Architecture | 10% | Oui | Représentation visuelle |
| Composants | 12% | Oui | Définitions modules/services |
| Modèle de données | 10% | Oui | Design base de données/entités |
| Contrats API | 10% | Oui | Spécifications endpoints |
| Sécurité | 12% | Oui | Auth et mesures de sécurité |
| Performance | 8% | Non | Exigences de performance |
| Gestion d'erreurs | 8% | Non | Stratégie d'erreurs |
| Stratégie de tests | 10% | Oui | Approche de test |
| Déploiement | 8% | Non | CI/CD et release |

**Seuil : 90%**

## Processus

### Étape 1 : Localiser le fichier Tech Spec

1. Utiliser le chemin fourni ou le défaut `docs/tech-spec.md`
2. Vérifier que le fichier existe
3. Charger le contenu pour analyse

### Étape 2 : Valider chaque critère

Pour chaque critère :
- Vérifier les sections et mots-clés pertinents
- Vérifier l'existence des diagrammes (mermaid, images)
- Valider la profondeur technique

### Étape 3 : Calculer le score

Score = somme des poids des critères validés

### Étape 4 : Générer le rapport

Afficher les résultats détaillés avec suggestions.

## Format de sortie

### Tech Spec validé

```
═══════════════════════════════════════════════════════
          Validation Quality Gate Tech Spec
═══════════════════════════════════════════════════════

Fichier : docs/tech-spec.md
Seuil : 90%

Résultats de validation :
──────────────────────────────────────────────────────
✅ Vue d'ensemble Architecture (12%)
   Trouvé : Clean Architecture avec 4 couches décrites

✅ Diagramme Architecture (10%)
   Trouvé : Diagramme Mermaid dans la section "System Design"

✅ Composants (12%)
   Trouvé : 6 composants avec responsabilités définies

✅ Modèle de données (10%)
   Trouvé : Définitions d'entités avec relations

✅ Contrats API (10%)
   Trouvé : Endpoints REST avec schémas requête/réponse

✅ Sécurité (12%)
   Trouvé : JWT auth, RBAC, chiffrement au repos

✅ Performance (8%)
   Trouvé : Objectifs de latence, stratégie de cache

✅ Gestion d'erreurs (8%)
   Trouvé : Codes d'erreur, politiques de retry

✅ Stratégie de tests (10%)
   Trouvé : Plans de tests unitaires, intégration, e2e

✅ Déploiement (8%)
   Trouvé : Pipeline CI/CD, déploiement blue-green

Score : 100/100 (100%)
──────────────────────────────────────────────────────

✅ TECH SPEC GATE VALIDÉ

Prêt à passer à la création du Backlog.
Suivant : /arch:handoff po
═══════════════════════════════════════════════════════
```

### Tech Spec non validé

```
═══════════════════════════════════════════════════════
          Validation Quality Gate Tech Spec
═══════════════════════════════════════════════════════

Fichier : docs/tech-spec.md
Seuil : 90%

Résultats de validation :
──────────────────────────────────────────────────────
✅ Vue d'ensemble Architecture (12%)
❌ Diagramme Architecture (10%)
   Manquant : Aucun diagramme trouvé (mermaid, PNG, SVG)
✅ Composants (12%)
✅ Modèle de données (10%)
⚠️ Contrats API (10%)
   Partiel : Endpoints listés mais pas de schémas
❌ Sécurité (12%)
   Manquant : Aucune auth/autorisation définie
✅ Performance (8%)
✅ Gestion d'erreurs (8%)
✅ Stratégie de tests (10%)
⚠️ Déploiement (8%)
   Partiel : CI mentionné mais pas de stratégie CD

Score : 68/100 (68%)
──────────────────────────────────────────────────────

❌ TECH SPEC GATE ÉCHOUÉ (besoin 90%, obtenu 68%)

Actions requises :
──────────────────────────────────────────────────────
1. Ajouter un diagramme d'architecture
   ```mermaid
   graph TB
     Client --> API[API Gateway]
     API --> Service[Business Logic]
     Service --> DB[(Database)]
   ```

2. Définir la stratégie de sécurité
   - Méthode d'authentification (JWT, OAuth2)
   - Modèle d'autorisation (RBAC, ABAC)
   - Approche de chiffrement des données

3. Compléter les contrats API avec schémas
   - Schémas JSON requête/réponse
   - Formats de réponses d'erreur
   - Stratégie de versioning

4. Ajouter stratégie de déploiement
   - Étapes du pipeline CI/CD
   - Promotion entre environnements
   - Procédures de rollback

Relancer après corrections : /gate:validate-techspec
═══════════════════════════════════════════════════════
```

## Exemple

```
/gate:validate-techspec
/gate:validate-techspec docs/auth-tech-spec.md
```

## Revue d'architecture

Considérez créer un ADR pour les décisions significatives :
```
/arch:adr "JWT vs authentification basée sur session"
```

Configuration du gate : `.bmad/gates/techspec-gate.yaml`

## Prochaine étape

```
╔══════════════════════════════════════════════════════════╗
║                   PROCHAINE ÉTAPE                        ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  Si PASS (≥ seuil) :                                     ║
║  → /gate:validate-backlog                                ║
║    Valider le backlog                                    ║
║                                                          ║
║  Si FAIL (< seuil) :                                     ║
║  → Corriger la spec technique                            ║
║  → /gate:validate-techspec (re-run après corrections)    ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```
