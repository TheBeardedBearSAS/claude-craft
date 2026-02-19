---
description: Audit OpenTofu security posture
argument-hint: [Scope]
---

# OpenTofu Security Audit

Vous etes un specialiste de la securite OpenTofu. Vous devez realiser un audit de securite complet de la configuration IaC.

## Arguments
$ARGUMENTS

Arguments :
- (Optionnel) Perimetre : encryption, secrets, iam, policies, full (par defaut : full)
- (Optionnel) Chemin vers le repertoire de configuration

Exemple : `/opentofu:security-audit scope:full path:infra/`

## Plan Mode

> **Le mode plan est conditionnel.** S'active automatiquement lorsque le perimetre est "full" ou couvre plusieurs environnements.

## MISSION

### Etape 1 : Definition du Perimetre

```
══════════════════════════════════════════════════════════════
AUDIT DE SECURITE OPENTOFU
══════════════════════════════════════════════════════════════

Perimetre : {full / encryption / secrets / iam / policies}
Chemin : {chemin de configuration}

──────────────────────────────────────────────────────────────
PERIMETRE DE L'AUDIT
──────────────────────────────────────────────────────────────
```

### Etape 2 : Audit du Chiffrement de l'Etat

```
──────────────────────────────────────────────────────────────
CHIFFREMENT DE L'ETAT
──────────────────────────────────────────────────────────────

| Verification | Statut | Details |
|-------------|--------|---------|
| Chiffrement natif (v1.7+) | {active/desactive} | {methode} |
| Chiffrement du backend | {active/desactive} | {type} |
| Chiffrement du plan | {active/desactive} | {details} |
| Gestion des cles | {KMS/PBKDF2/aucun} | {details} |
```

### Etape 3 : Audit des Secrets

```
──────────────────────────────────────────────────────────────
GESTION DES SECRETS
──────────────────────────────────────────────────────────────

| Verification | Statut | Details |
|-------------|--------|---------|
| Secrets en dur | {nombre} | {fichiers} |
| Variables sensibles | {%} | {liste manquante} |
| Valeurs ephemeres | {utilise/non} | {v1.11+} |
| .tfvars dans le VCS | {oui/non} | {fichiers} |
| Identifiants CI/CD | {OIDC/statique} | {details} |
```

### Etape 4 : Audit IAM et Acces

```
──────────────────────────────────────────────────────────────
CONTROLE D'ACCES
──────────────────────────────────────────────────────────────

| Verification | Statut | Details |
|-------------|--------|---------|
| Moindre privilege IAM | {oui/non} | {politiques trop larges} |
| ACL du backend d'etat | {restreint/ouvert} | {details} |
| Separation CI/CD | {roles plan/apply} | {details} |
| Apply manuel desactive | {oui/non} | {details} |
```

### Etape 5 : Audit Politiques et Conformite

```
──────────────────────────────────────────────────────────────
APPLICATION DES POLITIQUES
──────────────────────────────────────────────────────────────

| Verification | Statut | Details |
|-------------|--------|---------|
| tfsec/checkov | {integre/non} | {constats} |
| Politiques OPA | {oui/non} | {nombre} |
| Fichier de verrouillage des providers | {commite/manquant} | {details} |
| Conformite des tags | {imposee/non} | {details} |
```

### Etape 6 : Rapport Final

```
══════════════════════════════════════════════════════════════
RAPPORT D'AUDIT DE SECURITE
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
SCORE
──────────────────────────────────────────────────────────────

| Categorie | Score | Statut |
|-----------|-------|--------|
| Chiffrement de l'Etat | {x}/100 | {passe/attention/echec} |
| Gestion des Secrets | {x}/100 | {passe/attention/echec} |
| Controle d'Acces | {x}/100 | {passe/attention/echec} |
| Application des Politiques | {x}/100 | {passe/attention/echec} |
| **Global** | **{x}/100** | **{statut}** |

──────────────────────────────────────────────────────────────
CONSTATS CRITIQUES
──────────────────────────────────────────────────────────────

1. [ ] {constat critique 1}
2. [ ] {constat critique 2}

──────────────────────────────────────────────────────────────
RECOMMANDATIONS
──────────────────────────────────────────────────────────────

Priorite 1 (Immediat) :
- [ ] {recommandation}

Priorite 2 (Ce sprint) :
- [ ] {recommandation}

Priorite 3 (Prochain trimestre) :
- [ ] {recommandation}
```
