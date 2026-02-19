---
description: Optimize Ansible performance and playbook quality
argument-hint: [target]
---

# Ansible Optimize

Vous etes un specialiste de l'optimisation Ansible. Vous devez analyser les performances des playbooks et fournir des recommandations actionnables pour ameliorer la vitesse, la qualite et la maintenabilite.

## Arguments
$ARGUMENTS

Arguments :
- (Optionnel) Cible : performance, quality, both (defaut : both)

Exemple : `/ansible:optimize target:performance`

## Plan Mode

> **Le plan mode est recommande.** Claude analyse la structure actuelle des playbooks et les patterns d'execution avant de proposer des optimisations.

## MISSION

### Etape 1 : Analyse de Performance

```
══════════════════════════════════════════════════════════════
OPTIMISATION ANSIBLE
══════════════════════════════════════════════════════════════

Cible : {performance/quality/both}

──────────────────────────────────────────────────────────────
PROFIL DE PERFORMANCE ACTUEL
──────────────────────────────────────────────────────────────

| Parametre | Actuel | Recommande | Impact |
|-----------|--------|------------|--------|
| forks | {valeur} | 20-50 | Parallelisme |
| pipelining | {active/desactive} | active | Allers-retours SSH |
| fact_caching | {none/jsonfile/redis} | jsonfile/redis | Collecte de facts |
| gather_facts | {yes/no/smart} | smart | Temps de demarrage |
| strategy | {linear/free/host_pinned} | free (si sur) | Ordre d'execution |
| SSH multiplexing | {active/desactive} | active | Reutilisation de connexion |
```

Profiler avec `ANSIBLE_CALLBACKS_ENABLED=timer,profile_tasks` et mesurer la surcharge de connexion avec `ansible.builtin.ping`.

### Etape 2 : Optimisation de Connexion

```
──────────────────────────────────────────────────────────────
AJUSTEMENT DE CONNEXION
──────────────────────────────────────────────────────────────
```

Generer les parametres de connexion optimises dans `ansible.cfg` :

```ini
[defaults]
forks = 25
gathering = smart
fact_caching = jsonfile
fact_caching_connection = /tmp/ansible_facts_cache
fact_caching_timeout = 86400
callbacks_enabled = timer, profile_tasks

[ssh_connection]
pipelining = True
ssh_args = -o ControlMaster=auto -o ControlPersist=60s
control_path_dir = ~/.ansible/cp
```

| Optimisation | Avant | Apres | Amelioration |
|-------------|-------|-------|--------------|
| Pipelining | desactive | active | ~2x plus rapide par tache |
| ControlMaster | desactive | auto | Reutilisation des connexions SSH |
| Mise en cache des facts | aucune | jsonfile | Sauter gather_facts |
| Forks | 5 | 25 | 5x parallelisme |

### Etape 3 : Optimisation des Playbooks

```
──────────────────────────────────────────────────────────────
AJUSTEMENT DES PLAYBOOKS
──────────────────────────────────────────────────────────────

| Pattern | Actuel | Recommandation | Impact |
|---------|--------|----------------|--------|
| gather_facts | toujours | smart / par play | Reduire le demarrage |
| import vs include | {mixte} | import pour statique, include pour dynamique | Previsibilite |
| Batching serial | {valeur} | serial: "30%" pour rolling | Disponibilite |
| Taches async | {nombre} | Utiliser pour les taches longues (>30s) | Parallelisme |
| Strategie free | {utilise/non} | Utiliser pour les taches independantes | Temps d'execution |
| Tags | {utilise/non} | Taguer toutes les taches pour les executions selectives | Flexibilite |
```

Patterns d'optimisation cles :
- **Async** pour les taches >30s : `async: 300, poll: 10`
- **Strategie free** pour les hotes independants : `strategy: free`
- **Facts selectifs** : `gather_subset: [network]` au lieu d'une collecte complete
- **Appels de modules par lots** : passer une liste a `ansible.builtin.apt name:` au lieu de boucler

### Etape 4 : Analyse de Qualite

```
──────────────────────────────────────────────────────────────
AUDIT DE QUALITE
──────────────────────────────────────────────────────────────

| Verification | Score | Details |
|--------------|-------|---------|
| Conformite ansible-lint | {x}/100 | {nombre de violations} |
| Utilisation FQCN | {x}% | {taches non-FQCN} |
| Idempotence | {reussi/echec} | {taches non idempotentes} |
| Conception des roles | {bon/a ameliorer} | {roles monolithiques} |
| Nommage des variables | {coherent/incoherent} | {violations de convention} |
| Utilisation des handlers | {correcte/manquante} | {redemarrage sans handler} |
| Couverture des tags | {x}% | {taches non taguees} |
| Couverture Molecule | {x}% | {roles non testes} |
```

Executer `ansible-lint`, verifier les taches shell/command non idempotentes manquant `changed_when`/`creates`/`removes`, et verifier la conformite FQCN.

### Etape 5 : Rapport Final

```
══════════════════════════════════════════════════════════════
RAPPORT D'OPTIMISATION
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
RESUME
──────────────────────────────────────────────────────────────

| Optimisation | Impact | Effort | Priorite |
|-------------|--------|--------|----------|
| Activer le pipelining | Eleve | Faible | 1 |
| Activer la mise en cache des facts | Eleve | Faible | 2 |
| Augmenter les forks | Moyen | Faible | 3 |
| Optimiser les boucles | Moyen | Moyen | 4 |
| Ajouter async pour les taches longues | Moyen | Moyen | 5 |
| Corriger les violations ansible-lint | Moyen | Moyen | 6 |
| Ajouter les tests Molecule | Eleve | Eleve | 7 |

──────────────────────────────────────────────────────────────
FICHIERS GENERES
──────────────────────────────────────────────────────────────

| Fichier | Description |
|---------|-------------|
| ansible.cfg | Configuration Ansible optimisee |
| .ansible-lint | Configuration lint mise a jour |
| {playbook} | Playbook refactorise avec optimisations |

──────────────────────────────────────────────────────────────
PROCHAINES ETAPES
──────────────────────────────────────────────────────────────

1. [ ] Appliquer l'ajustement ansible.cfg a tous les environnements
2. [ ] Executer les tests molecule pour valider l'absence de regressions
3. [ ] Configurer le pipeline CI avec /ansible:deploy-setup
4. [ ] Auditer la posture de securite avec /ansible:security-audit
5. [ ] Surveiller les temps d'execution avec le profilage par callback
```
