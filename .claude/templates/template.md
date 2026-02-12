# ADR-NNNN : [Titre Court de la Décision]

**Statut** : Proposed | Accepted | Deprecated | Superseded by [ADR-YYYY](YYYY-titre.md)

**Date** : YYYY-MM-DD

**Décideurs** : [Liste des personnes ayant pris la décision]

**Tags** : `tag1`, `tag2`, `tag3`

---

## Contexte et Problème

[Décrivez le contexte et le problème qui nécessite une décision architecturale. Utilisez 2-3 paragraphes pour expliquer :]
- Quelle est la situation actuelle ?
- Quel problème rencontrons-nous ?
- Quelles sont les contraintes (techniques, business, réglementaires) ?
- Pourquoi maintenant ? (urgence, opportunité)

## Options Considérées

**Important** : Minimum 2 options doivent être documentées pour démontrer qu'une analyse comparative a été faite.

### Option 1 : [Nom de l'option]

**Description** : [Courte description de l'option]

**Avantages** :
- ✅ [Avantage 1]
- ✅ [Avantage 2]
- ✅ [Avantage 3]

**Inconvénients** :
- ❌ [Inconvénient 1]
- ❌ [Inconvénient 2]
- ❌ [Inconvénient 3]

**Effort** : [Estimation : Faible / Moyen / Élevé]

---

### Option 2 : [Nom de l'option]

**Description** : [Courte description de l'option]

**Avantages** :
- ✅ [Avantage 1]
- ✅ [Avantage 2]

**Inconvénients** :
- ❌ [Inconvénient 1]
- ❌ [Inconvénient 2]

**Effort** : [Estimation : Faible / Moyen / Élevé]

---

### Option 3 : [Nom de l'option] (Optionnel)

**Description** : [Courte description de l'option]

**Avantages** :
- ✅ [Avantage 1]

**Inconvénients** :
- ❌ [Inconvénient 1]

**Effort** : [Estimation]

---

## Décision

**Option choisie** : [Nom de l'option choisie]

**Justification** :

[Expliquez POURQUOI cette option a été choisie. Utilisez 2-4 paragraphes couvrant :]
- Pourquoi cette option est supérieure aux autres ?
- Quels critères ont été déterminants ? (performance, maintenabilité, coût, conformité)
- Quelles hypothèses sous-tendent cette décision ?
- Comment cette décision s'aligne avec la vision/stratégie globale ?

**Critères de décision** :
1. [Critère 1 et son importance]
2. [Critère 2 et son importance]
3. [Critère 3 et son importance]

---

## Conséquences

### Positives ✅

- **[Conséquence positive 1]** : [Explication]
- **[Conséquence positive 2]** : [Explication]
- **[Conséquence positive 3]** : [Explication]

### Négatives ⚠️

**Soyez honnête** : Toute décision a des compromis. Documentez-les clairement.

- **[Conséquence négative 1]** : [Explication + mitigation si possible]
- **[Conséquence négative 2]** : [Explication + mitigation si possible]
- **[Conséquence négative 3]** : [Explication + mitigation si possible]

### Risques Identifiés 🔴

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| [Description risque 1] | Élevé/Moyen/Faible | Élevée/Moyenne/Faible | [Actions de mitigation] |
| [Description risque 2] | Élevé/Moyen/Faible | Élevée/Moyenne/Faible | [Actions de mitigation] |

---

## Implémentation

### Fichiers Affectés

**À créer** :
- `chemin/vers/fichier1.php` - [Description]
- `chemin/vers/fichier2.yaml` - [Description]

**À modifier** :
- `chemin/vers/fichier3.php` - [Ce qui change]
- `chemin/vers/fichier4.yaml` - [Ce qui change]

**À supprimer** :
- `chemin/vers/ancien-fichier.php` - [Raison]

### Dépendances

**Composer** :
```bash
composer require vendor/package:^version
```

**NPM** :
```bash
npm install package@version
```

**Configuration** :
- Variable d'environnement : `VARIABLE_NAME` (.env)
- Service Symfony à configurer
- Migration Doctrine à créer

### Exemple de Code

```php
<?php
// Exemple concret tiré du projet (PAS générique)
namespace App\Infrastructure\...;

class ExempleImplementation
{
    public function methodeExemple(): void
    {
        // Code concret montrant l'utilisation
    }
}
```

**Utilisation** :
```php
// Dans une entité, un service, etc.
$exemple = new ExempleImplementation();
$exemple->methodeExemple();
```

---

## Validation et Tests

### Critères d'Acceptation

- [ ] [Critère 1 testable]
- [ ] [Critère 2 testable]
- [ ] [Critère 3 testable]

### Tests Requis

**Tests unitaires** :
- `tests/Unit/...Test.php` - [Ce qui est testé]

**Tests d'intégration** :
- `tests/Integration/...Test.php` - [Ce qui est testé]

**Tests fonctionnels** :
- `tests/Functional/...Test.php` - [Ce qui est testé]

### Métriques de Succès

| Métrique | Avant | Cible | Comment mesurer |
|----------|-------|-------|-----------------|
| [Métrique 1] | [Valeur] | [Valeur] | [Outil/Command] |
| [Métrique 2] | [Valeur] | [Valeur] | [Outil/Command] |

---

## Références

### Règles Internes
- [Règle `.claude/rules/XX-nom.md`](./../rules/XX-nom.md) - [Description]
- [Template `.claude/templates/nom.md`](./../templates/nom.md) - [Description]

### Documentation Externe
- [Titre de la documentation](https://url.com) - [Description]
- [Article/Blog pertinent](https://url.com) - [Description]

### ADRs Liées
- [ADR-XXXX : Titre](XXXX-titre.md) - [Relation : dépend de / remplace / complète]

### Code Source
- Implémentation : `src/chemin/vers/fichier.php:ligne`
- Tests : `tests/chemin/vers/test.php:ligne`
- Configuration : `config/packages/package.yaml`

---

## Historique des Modifications

| Date | Auteur | Modification |
|------|--------|--------------|
| YYYY-MM-DD | [Nom] | Création initiale |
| YYYY-MM-DD | [Nom] | [Description modification] |

---

## Notes Complémentaires

[Section optionnelle pour informations additionnelles qui ne rentrent pas dans les sections précédentes :]
- Discussions importantes ayant mené à la décision
- Contexte historique additionnel
- Références à des POCs ou expérimentations
- Feedback post-implémentation (à ajouter après mise en prod)
