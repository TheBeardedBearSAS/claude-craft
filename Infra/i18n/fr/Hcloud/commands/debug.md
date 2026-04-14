---
description: Diagnose Hetzner Cloud infrastructure issues from symptoms
argument-hint: <Symptom> [resource]
---

# Hcloud Debug

> ⚠️ **Migration obligatoire avant 2026-07-01** : le paramètre `datacenter` est déprécié au profit de `location`. Provider Terraform Hetzner Cloud >= 1.58.0. Source : https://github.com/hetznercloud/terraform-provider-hcloud/releases

Vous etes un specialiste du troubleshooting Hetzner Cloud. Vous devez diagnostiquer et resoudre systematiquement les problemes d'infrastructure a partir des symptomes donnes.

## Arguments
$ARGUMENTS

Arguments :
- Description du symptome (ex. "serveur injoignable", "echec du health check du load balancer", "volume ne se montant pas")
- (Optionnel) Nom ou type de la ressource
- (Optionnel) Location

Exemple : `/hcloud:debug "Connexion SSH refusee sur web-01" resource:server`

## Plan Mode

> **Le mode plan n'est pas requis.** Il s'agit d'une commande de diagnostic qui procede immediatement a l'investigation.

## MISSION

### Etape 1 : Collecter les informations

```
══════════════════════════════════════════════════════════════
HCLOUD DEBUG
══════════════════════════════════════════════════════════════

Symptome : {description}
Ressource : {resource}
Localisation : {location}

──────────────────────────────────────────────────────────────
STATUT DE L'ENVIRONNEMENT
──────────────────────────────────────────────────────────────
```

Executer les commandes de diagnostic :
```bash
# Statut du serveur
hcloud server describe {resource}
hcloud server list-actions {resource}

# Statut reseau
hcloud server describe {resource} -o json | jq '.private_net'
hcloud network list

# Statut firewall
hcloud firewall list
hcloud server describe {resource} -o json | jq '.public_net.firewalls'

# Statut des volumes
hcloud volume list --server {resource}

# Statut du load balancer (si applicable)
hcloud load-balancer list
```

### Etape 2 : Analyse de la cause racine

```
──────────────────────────────────────────────────────────────
DIAGNOSTIC
──────────────────────────────────────────────────────────────

| Verification | Statut | Details |
|--------------|--------|---------|
| Statut serveur | {running/off/rebuilding} | {details} |
| IP publique | {assignee/manquante} | {adresse ip} |
| Regles firewall | {ok/bloquant} | {details} |
| Reseau prive | {attache/detache} | {details} |
| Montage volume | {ok/echoue} | {details} |
| Cloud-init | {termine/en cours/echoue} | {details} |
| Cle SSH | {deployee/manquante} | {details} |

──────────────────────────────────────────────────────────────
ARBRE DE DECISION
──────────────────────────────────────────────────────────────

Symptome : {symptome}
  ├── Probleme serveur ?
  │   ├── Non demarre → Verifier hcloud server describe, demarrer
  │   ├── Bloque en reconstruction → Attendre ou contacter le support
  │   └── Cloud-init echoue → Activer le rescue, verifier les logs
  ├── Probleme reseau ?
  │   ├── Pas d'IP publique → Verifier l'assignation de primary IP
  │   ├── Firewall bloquant → Revoir les regles avec hcloud firewall describe
  │   └── Reseau prive → Verifier l'attachement et le sous-reseau
  ├── Probleme volume ?
  │   ├── Non attache → hcloud volume attach
  │   ├── Echec de montage → Verifier le systeme de fichiers, /dev/disk/by-id/
  │   └── Mauvaise localisation → Le volume doit etre dans la meme location
  └── Probleme load balancer ?
      ├── Echec health check → Verifier le port, le chemin, les codes de statut
      ├── Pas de cibles → Verifier le label selector
      └── Erreur TLS → Verifier le certificat

Cause racine : {explication}
```

### Etape 3 : Resolution

```
──────────────────────────────────────────────────────────────
CORRECTIF
──────────────────────────────────────────────────────────────
```

Fournir :
1. **Correctif immediat** -- Commandes hcloud exactes ou modifications de configuration pour resoudre le probleme maintenant
2. **Explication** -- Pourquoi cela s'est produit, incluant les specificites Hetzner Cloud
3. **Prevention** -- Regles de firewall, scripts cloud-init ou monitoring pour empecher la recurrence

### Etape 4 : Verification

```bash
# Verifier que le serveur fonctionne
hcloud server describe {resource}

# Verifier la connectivite
ssh root@{server-ip} echo "OK"

# Verifier les health checks (si LB)
hcloud load-balancer describe {lb-name} -o json | jq '.targets[].health_status'
```

### Etape 5 : Rapport final

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
| Statut | Resolu / Action necessaire |

──────────────────────────────────────────────────────────────
PREVENTION
──────────────────────────────────────────────────────────────

- [ ] Ajouter du monitoring pour {condition}
- [ ] Mettre a jour cloud-init pour prevenir {probleme}
- [ ] Ajouter une verification CI pour {validation}
- [ ] Documenter le correctif dans le runbook pour reference @hcloud-debug
```
