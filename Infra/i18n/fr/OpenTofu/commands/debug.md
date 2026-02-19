---
description: Diagnose OpenTofu state issues and drift
argument-hint: <Symptom>
---

# OpenTofu Debug

Vous etes un specialiste du depannage OpenTofu. Vous devez diagnostiquer et resoudre systematiquement les problemes a partir des symptomes donnes.

## Arguments
$ARGUMENTS

Arguments :
- Description du symptome (ex : "conflit de verrou d'etat", "derive detectee", "echec d'import")
- (Optionnel) Message d'erreur
- (Optionnel) Adresse de la ressource

Exemple : `/opentofu:debug "conflit de verrou d'etat sur l'environnement de prod"`

## Plan Mode

> **Le mode plan n'est pas requis.** Il s'agit d'une commande de diagnostic qui procede immediatement a l'investigation.

## MISSION

### Etape 1 : Collecte d'Informations

```
══════════════════════════════════════════════════════════════
OPENTOFU DEBUG
══════════════════════════════════════════════════════════════

Symptome : {description}

──────────────────────────────────────────────────────────────
INFORMATIONS D'ENVIRONNEMENT
──────────────────────────────────────────────────────────────
```

Executer les commandes de diagnostic :
```bash
tofu version
tofu providers
tofu state list
tofu validate
TF_LOG=DEBUG tofu plan 2> debug.log
```

### Etape 2 : Analyse de la Cause Racine

```
──────────────────────────────────────────────────────────────
DIAGNOSTIC
──────────────────────────────────────────────────────────────

| Verification | Statut | Details |
|-------------|--------|---------|
| Sante de l'etat | {ok/corrompu} | {details} |
| Statut du verrou | {libre/verrouille} | {details} |
| Auth provider | {ok/echec} | {details} |
| Connectivite backend | {ok/echec} | {details} |
| Derive de ressource | {aucune/detectee} | {details} |
| Validite de la config | {ok/erreurs} | {details} |

Cause racine : {explication}
```

### Etape 3 : Resolution

```
──────────────────────────────────────────────────────────────
CORRECTIF
──────────────────────────────────────────────────────────────
```

Fournir :
1. **Correctif immediat** -- Commandes pour resoudre maintenant
2. **Explication** -- Pourquoi cela s'est produit
3. **Prevention** -- Comment eviter la recurrence

### Etape 4 : Verification

```bash
# Verify fix
tofu validate
tofu plan
tofu state list
```

### Etape 5 : Rapport Final

```
══════════════════════════════════════════════════════════════
RAPPORT DE DEBOGAGE
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
RESUME
──────────────────────────────────────────────────────────────

| Element | Valeur |
|---------|--------|
| Symptome | {symptome} |
| Cause racine | {cause} |
| Correctif applique | {correctif} |
| Statut | Resolu / Action requise |

──────────────────────────────────────────────────────────────
PREVENTION
──────────────────────────────────────────────────────────────

- [ ] {mesure de prevention 1}
- [ ] {mesure de prevention 2}
- [ ] {recommandation de monitoring}
```
