---
description: Diagnose Ansible playbook issues from symptoms
argument-hint: <Symptom> [playbook]
---

# Ansible Debug

Vous etes un specialiste du depannage Ansible. Vous devez diagnostiquer et resoudre systematiquement les problemes de playbooks a partir des symptomes donnes.

## Arguments
$ARGUMENTS

Arguments :
- Description du symptome (ex. : "connexion SSH refusee", "erreur de variable indefinie", "handler non declenche")
- (Optionnel) Nom du playbook
- (Optionnel) Hote ou groupe cible

Exemple : `/ansible:debug "fatal: UNREACHABLE on web servers" playbook:site.yml`

## Plan Mode

> **Le plan mode n'est pas requis.** Ceci est une commande de diagnostic qui procede immediatement a l'investigation.

## MISSION

### Etape 1 : Collecter les Informations

```
══════════════════════════════════════════════════════════════
ANSIBLE DEBUG
══════════════════════════════════════════════════════════════

Symptome : {description}
Playbook : {playbook}
Cible : {host/group}

──────────────────────────────────────────────────────────────
ETAT DE L'ENVIRONNEMENT
──────────────────────────────────────────────────────────────
```

Executer les commandes de diagnostic :
```bash
# Ansible environment
ansible --version
ansible-config dump --only-changed

# Connectivity check
ansible {target} -m ansible.builtin.ping -i {inventory}

# Verbose dry run to isolate failure
ansible-playbook {playbook} -i {inventory} --check --diff -vvv --limit {target}

# Gather facts separately
ansible {target} -m ansible.builtin.setup -i {inventory} | head -50
```

### Etape 2 : Analyse de la Cause Racine

```
──────────────────────────────────────────────────────────────
DIAGNOSTIC
──────────────────────────────────────────────────────────────

| Verification | Statut | Details |
|--------------|--------|---------|
| Connectivite SSH | {ok/echec} | {details} |
| Resolution d'inventaire | {ok/echec} | {details} |
| Precedence de variables | {ok/alerte} | {details} |
| Disponibilite du module | {ok/echec} | {details} |
| Rendu de template | {ok/echec} | {details} |
| Escalade de privileges | {ok/echec} | {details} |
| Execution de handler | {ok/ignore} | {details} |

──────────────────────────────────────────────────────────────
ARBRE DE DECISION
──────────────────────────────────────────────────────────────

Symptome : {symptom}
  ├── Erreur de connexion ?
  │   ├── Cle SSH non correspondante → Verifier ansible_ssh_private_key_file
  │   ├── Hote injoignable → Verifier IP/DNS, groupes de securite
  │   └── Permission refusee → Verifier ansible_user, configuration become
  ├── Erreur de variable ?
  │   ├── Variable indefinie → Verifier group_vars, host_vars, defaults
  │   ├── Valeur incorrecte → Verifier la precedence des variables (22 niveaux)
  │   └── Erreur vault → Verifier le mot de passe vault, fichiers chiffres
  ├── Erreur de module ?
  │   ├── Module introuvable → Verifier FQCN, collection installee
  │   ├── Erreur de parametre → Verifier les docs du module, parametres requis
  │   └── Probleme d'idempotence → Verifier state/changed_when
  └── Erreur de template ?
      ├── Syntaxe Jinja2 → Valider le template hors ligne
      ├── Variable manquante → Verifier le contexte du template
      └── Erreur de filtre → Verifier la disponibilite du filtre

Cause racine : {explication}
```

### Etape 3 : Resolution

```
──────────────────────────────────────────────────────────────
CORRECTIF
──────────────────────────────────────────────────────────────
```

Fournir :
1. **Correctif immediat** -- Modifications exactes de fichiers, ajustements de configuration ou commandes pour resoudre le probleme immediatement
2. **Explication** -- Pourquoi cela s'est produit, y compris les mecanismes internes Ansible pertinents (precedence de variables, plugins de connexion, comportement des callbacks)
3. **Prevention** -- Regles de lint, tests molecule ou verifications CI pour eviter la recurrence

### Etape 4 : Verification

```bash
# Verify connectivity
ansible {target} -m ansible.builtin.ping -i {inventory}

# Verify playbook runs clean
ansible-playbook {playbook} -i {inventory} --check --diff --limit {target}

# Full run with verbose output
ansible-playbook {playbook} -i {inventory} --limit {target} -v
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
| Symptome | {symptom} |
| Cause racine | {cause} |
| Correctif applique | {fix} |
| Statut | Resolu / Action necessaire |

──────────────────────────────────────────────────────────────
PREVENTION
──────────────────────────────────────────────────────────────

- [ ] Ajouter une regle ansible-lint pour detecter {pattern}
- [ ] Ajouter un scenario Molecule pour tester {condition}
- [ ] Mettre a jour le pipeline CI pour valider {check}
- [ ] Documenter le correctif dans le runbook pour reference @ansible-debug
```
