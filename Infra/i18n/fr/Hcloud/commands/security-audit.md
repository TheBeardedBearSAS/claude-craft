---
description: Audit Hetzner Cloud security posture
argument-hint: [scope]
---

# Hcloud Security Audit

Vous etes un specialiste de la securite Hetzner Cloud. Vous devez realiser un audit de securite complet de l'infrastructure Hetzner Cloud.

## Arguments
$ARGUMENTS

Arguments :
- (Optionnel) Scope : firewall, ssh, network, tokens, certificates, full (defaut : full)

Exemple : `/hcloud:security-audit scope:full`

## Plan Mode

> **Le mode plan est conditionnel.** S'active automatiquement quand le scope est "full" pour presenter le plan d'audit avant de proceder.

## MISSION

### Etape 1 : Definition du scope

```
══════════════════════════════════════════════════════════════
HCLOUD SECURITY AUDIT
══════════════════════════════════════════════════════════════

Scope : {firewall, ssh, network, tokens, certificates, full}

──────────────────────────────────────────────────────────────
PERIMETRE DE L'AUDIT
──────────────────────────────────────────────────────────────

| Categorie | Inclus | Poids |
|-----------|--------|-------|
| Firewalls | {oui/non} | 25% |
| SSH et acces | {oui/non} | 20% |
| Isolation reseau | {oui/non} | 20% |
| Tokens API | {oui/non} | 20% |
| TLS et certificats | {oui/non} | 15% |
```

### Etape 2 : Audit des firewalls

```
──────────────────────────────────────────────────────────────
ANALYSE DES FIREWALLS
──────────────────────────────────────────────────────────────

| Verification | Statut | Details |
|--------------|--------|---------|
| Tous les serveurs ont des firewalls | {oui/non} | {serveurs non proteges} |
| SSH restreint aux IPs connues | {oui/non} | {ouvert a 0.0.0.0/0 ?} |
| Ports DB prives uniquement | {oui/non} | {ports exposes} |
| Label selectors utilises | {oui/non} | {statique vs dynamique} |
| Deny-by-default | {oui/non} | {regles trop permissives} |
| Regles IPv6 correspondant a IPv4 | {oui/non} | {regles manquantes} |
```

Scanner tous les firewalls, verifier les serveurs sans protection firewall et identifier les regles trop permissives.

### Etape 3 : Audit SSH et acces

```
──────────────────────────────────────────────────────────────
SECURITE SSH ET ACCES
──────────────────────────────────────────────────────────────

| Verification | Statut | Details |
|--------------|--------|---------|
| Algorithme de cle SSH | {ed25519/rsa} | {recommandation} |
| Auth par mot de passe desactivee | {oui/non} | {verification cloud-init} |
| fail2ban configure | {oui/non} | {sur quels serveurs} |
| Politique login root | {prohibit-password/yes/no} | {parametre} |
| Port SSH | {22/personnalise} | {protection firewall} |
| Rotation des cles | {planifiee/aucune} | {derniere rotation} |
```

### Etape 4 : Audit de l'isolation reseau

```
──────────────────────────────────────────────────────────────
ISOLATION RESEAU
──────────────────────────────────────────────────────────────

| Verification | Statut | Details |
|--------------|--------|---------|
| Reseau prive utilise | {oui/non} | {nom du reseau} |
| Segmentation par sous-reseau | {oui/non} | {tiers web/app/data} |
| DB sans IP publique | {oui/non} | {bases exposees} |
| Pattern bastion host | {oui/non} | {methode d'acces} |
| Inter-service via reseau prive | {oui/non} | {utilisation IP publique} |
```

### Etape 5 : Audit des tokens API

```
──────────────────────────────────────────────────────────────
SECURITE DES TOKENS API
──────────────────────────────────────────────────────────────

| Verification | Statut | Details |
|--------------|--------|---------|
| Tokens par environnement | {oui/non} | {tokens partages ?} |
| Tokens lecture seule pour CI | {oui/non} | {scope} |
| Token dans les secrets CI | {oui/non} | {methode de stockage} |
| Planification rotation tokens | {oui/non} | {frequence} |
| Pas de tokens dans le code | {oui/non} | {tokens fuites} |
```

### Etape 6 : Audit TLS et certificats

```
──────────────────────────────────────────────────────────────
TLS ET CERTIFICATS
──────────────────────────────────────────────────────────────

| Verification | Statut | Details |
|--------------|--------|---------|
| TLS sur le load balancer | {oui/non} | {protocole} |
| Certificats manages | {oui/non} | {renouvellement auto} |
| Redirection HTTP vers HTTPS | {oui/non} | {configure} |
| Expiration du certificat | {ok/attention} | {jours restants} |
| Trafic interne chiffre | {oui/non/reseau-prive} | {methode} |
```

### Etape 7 : Rapport final

```
══════════════════════════════════════════════════════════════
RAPPORT D'AUDIT DE SECURITE
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
SCORE
──────────────────────────────────────────────────────────────

| Categorie | Score | Statut |
|-----------|-------|--------|
| Firewalls | {x}/100 | {passe/attention/echec} |
| SSH et acces | {x}/100 | {passe/attention/echec} |
| Isolation reseau | {x}/100 | {passe/attention/echec} |
| Tokens API | {x}/100 | {passe/attention/echec} |
| TLS et certificats | {x}/100 | {passe/attention/echec} |
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
