---
description: Audit Ansible security posture
argument-hint: [scope]
---

# Ansible Security Audit

Vous etes un specialiste de la securite Ansible. Vous devez realiser un audit de securite complet du projet Ansible.

## Arguments
$ARGUMENTS

Arguments :
- (Optionnel) Perimetre : vault, ssh, become, secrets, lint, full (defaut : full)

Exemple : `/ansible:security-audit scope:full`

## Plan Mode

> **Le plan mode est conditionnel.** S'active automatiquement lorsque le perimetre est "full" pour presenter le plan d'audit avant de proceder.

## MISSION

### Etape 1 : Definition du Perimetre

```
══════════════════════════════════════════════════════════════
AUDIT DE SECURITE ANSIBLE
══════════════════════════════════════════════════════════════

Perimetre : {vault, ssh, become, secrets, lint, full}

──────────────────────────────────────────────────────────────
PERIMETRE DE L'AUDIT
──────────────────────────────────────────────────────────────

| Categorie | Incluse | Poids |
|-----------|---------|-------|
| Vault | {oui/non} | 25% |
| SSH | {oui/non} | 20% |
| Escalade de privileges | {oui/non} | 20% |
| Gestion des secrets | {oui/non} | 20% |
| Lint securite | {oui/non} | 15% |
```

### Etape 2 : Audit Vault

```
──────────────────────────────────────────────────────────────
ANALYSE VAULT
──────────────────────────────────────────────────────────────

| Verification | Statut | Details |
|--------------|--------|---------|
| Fichiers vault chiffres | {oui/non/partiel} | {fichiers trouves} |
| Strategie vault ID | {unique/multi/aucune} | {vault-ids} |
| Gestion du mot de passe | {fichier/env/prompt} | {methode} |
| Fichier de mot de passe dans .gitignore | {oui/non} | {chemin} |
| Secrets en clair dans les variables | {nombre} | {fichiers} |
| Calendrier de rekey ansible-vault | {oui/non} | {frequence} |
```

Scanner les secrets non chiffres, verifier le chiffrement vault sur les fichiers attendus et verifier les parametres vault dans ansible.cfg.

### Etape 3 : Audit SSH

```
──────────────────────────────────────────────────────────────
SECURITE SSH
──────────────────────────────────────────────────────────────

| Verification | Statut | Details |
|--------------|--------|---------|
| Type de cle SSH | {ed25519/rsa/dsa} | {recommandation} |
| Verification des cles d'hote | {active/desactive} | {parametre ansible.cfg} |
| ControlMaster | {active/desactive} | {configuration multiplexage} |
| Pipelining | {active/desactive} | {parametre ansible.cfg} |
| Agent forwarding SSH | {active/desactive} | {evaluation du risque} |
| ansible_ssh_common_args | {defini/non defini} | {valeur} |
```

### Etape 4 : Audit Escalade de Privileges

```
──────────────────────────────────────────────────────────────
ESCALADE DE PRIVILEGES
──────────────────────────────────────────────────────────────

| Verification | Statut | Details |
|--------------|--------|---------|
| Pattern d'utilisation become | {play/tache/les deux} | {perimetre} |
| become_method | {sudo/su/autre} | {methode} |
| Perimetre become_user | {root/specifique} | {utilisateurs} |
| Sudoers NOPASSWD | {oui/non} | {niveau de risque} |
| become au niveau tache | {nombre} | {taches avec become: true} |
| Principe du moindre privilege | {oui/non} | {taches sur-privilegiees} |
```

Scanner le become au niveau du play (perimetre large) et identifier les taches qui pourraient s'executer sans root.

### Etape 5 : Audit Gestion des Secrets

```
──────────────────────────────────────────────────────────────
GESTION DES SECRETS
──────────────────────────────────────────────────────────────

| Verification | Statut | Details |
|--------------|--------|---------|
| Integration secrets externes | {oui/non} | {outil : HashiCorp Vault, AWS SM} |
| Utilisation no_log | {adequate/manquante} | {taches exposant des secrets} |
| Nommage des variables sensibles | {coherent/incoherent} | {convention} |
| Couverture .gitignore | {complete/partielle} | {patterns manquants} |
| Stockage secrets CI | {securise/expose} | {methode} |
| Rotation des secrets | {automatisee/manuelle/aucune} | {politique} |
```

Trouver les taches susceptibles de fuiter des secrets sans `no_log` et verifier les secrets codes en dur en dehors des fichiers vault.

### Etape 6 : Audit Lint Securite

```
──────────────────────────────────────────────────────────────
LINT SECURITE
──────────────────────────────────────────────────────────────

| Verification | Statut | Details |
|--------------|--------|---------|
| Profil safety ansible-lint | {active/desactive} | {niveau de profil} |
| Utilisation FQCN | {complete/partielle} | {% conformite} |
| Surutilisation shell/command | {nombre} | {taches utilisant shell} |
| changed_when sur command | {defini/manquant} | {taches manquantes} |
| Epinglage de paquets | {oui/non} | {paquets non epingles} |
| Permissions de fichiers | {explicite/defaut} | {taches sans mode} |
```

Executer `ansible-lint -p safety` et verifier les taches shell/command sans `changed_when`.

### Etape 7 : Rapport Final

```
══════════════════════════════════════════════════════════════
RAPPORT D'AUDIT DE SECURITE
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
SCORE
──────────────────────────────────────────────────────────────

| Categorie | Score | Statut |
|-----------|-------|--------|
| Vault | {x}/100 | {reussi/alerte/echec} |
| SSH | {x}/100 | {reussi/alerte/echec} |
| Escalade de privileges | {x}/100 | {reussi/alerte/echec} |
| Gestion des secrets | {x}/100 | {reussi/alerte/echec} |
| Lint securite | {x}/100 | {reussi/alerte/echec} |
| **Global** | **{x}/100** | **{statut}** |

──────────────────────────────────────────────────────────────
RESULTATS CRITIQUES
──────────────────────────────────────────────────────────────

1. [ ] {resultat critique 1}
2. [ ] {resultat critique 2}

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
