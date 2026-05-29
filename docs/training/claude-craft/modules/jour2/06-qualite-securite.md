# Module 6 : Qualité et Sécurité

## Objectifs

À la fin de ce module, vous serez capable de :
- Utiliser la pre-commit checklist
- Appliquer le TDD/BDD avec Claude
- Identifier et corriger les vulnérabilités OWASP
- Intégrer la qualité dans le workflow Git

---

## 1. Pre-commit Checklist

### Les 13 Sections de Validation

```
┌─────────────────────────────────────────────────────────────┐
│                   PRE-COMMIT CHECKLIST                       │
├─────────────────────────────────────────────────────────────┤
│  ☐ 1. Code compiles sans erreur                             │
│  ☐ 2. Tests unitaires passent                               │
│  ☐ 3. Tests d'intégration passent                           │
│  ☐ 4. Couverture >= 80%                                     │
│  ☐ 5. PHPStan level 8 sans erreur                           │
│  ☐ 6. PHP-CS-Fixer appliqué                                 │
│  ☐ 7. Pas de TODO/FIXME non documentés                      │
│  ☐ 8. Pas de code commenté                                  │
│  ☐ 9. Documentation à jour                                  │
│  ☐ 10. Pas de secrets/credentials                           │
│  ☐ 11. Validation sécurité OWASP                            │
│  ☐ 12. Conventional Commit message                          │
│  ☐ 13. PR template rempli                                   │
└─────────────────────────────────────────────────────────────┘
```

### Automatisation avec Git Hooks

```bash
# .husky/pre-commit ou .git/hooks/pre-commit
#!/bin/bash

echo "[?] Running pre-commit checks..."

# 1. PHPStan
vendor/bin/phpstan analyse --level=8
if [ $? -ne 0 ]; then
    echo "[KO] PHPStan failed"
    exit 1
fi

# 2. CS-Fixer
vendor/bin/php-cs-fixer fix --dry-run --diff
if [ $? -ne 0 ]; then
    echo "[KO] Code style issues found"
    exit 1
fi

# 3. Tests
vendor/bin/phpunit --testsuite=unit
if [ $? -ne 0 ]; then
    echo "[KO] Tests failed"
    exit 1
fi

echo "[OK] All checks passed!"
```

### Vérification manuelle avec Claude

```bash
/common:pre-commit-check

# Claude vérifie toutes les sections et génère un rapport
```

---

## 2. Tests TDD/BDD avec Claude

### Cycle TDD

```
     ┌─────────────────────────────────────┐
     │                                     │
     ▼                                     │
┌─────────┐    ┌─────────┐    ┌──────────┐│
│   RED   │───▶│  GREEN  │───▶│ REFACTOR ││
│  Test   │    │  Code   │    │ Améliorer││
│ échoue  │    │ passe   │    │          ││
└─────────┘    └─────────┘    └──────────┘│
                                   │      │
                                   └──────┘
```

### Demander les tests d'abord

```bash
@tdd-coach "Je dois implémenter un service de calcul de remise.
Règles:
- 10% si total > 100€
- 20% si total > 500€
- 5% supplémentaire si client fidèle
Écris les tests PHPUnit d'abord."

# Claude génère:
# - testNoDiscountUnder100()
# - testTenPercentOver100()
# - testTwentyPercentOver500()
# - testLoyaltyBonus()
# - testCombinedDiscounts()
```

### Implémenter pour passer les tests

```bash
"Maintenant implémente DiscountCalculator pour faire passer tous les tests"

# Claude implémente le minimum nécessaire
```

### Refactorer

```bash
"Refactore DiscountCalculator en appliquant le pattern Strategy pour les règles de remise"

# Claude améliore le code en gardant les tests verts
```

### BDD avec Behat

```bash
@tdd-coach "Écris les scénarios Gherkin pour le processus de commande"

# Claude génère:
# Feature: Order Process
#   Scenario: Customer places an order
#     Given I am a logged in customer
#     And I have items in my cart
#     When I proceed to checkout
#     Then I should see my order confirmation
```

---

## 3. Sécurité OWASP Top 10

### A01: Broken Access Control

```php
// [KO] MAUVAIS - Pas de vérification de propriété
public function editOrder(int $id): Response
{
    $order = $this->orderRepository->find($id);
    // N'importe qui peut modifier n'importe quelle commande !
}

// [OK] BON - Vérification du propriétaire
public function editOrder(int $id): Response
{
    $order = $this->orderRepository->find($id);
    if ($order->getCustomer() !== $this->getUser()) {
        throw new AccessDeniedException();
    }
}
```

### A03: Injection

```php
// [KO] MAUVAIS - SQL Injection
$query = "SELECT * FROM users WHERE email = '$email'";

// [OK] BON - Requête paramétrée
$query = $this->em->createQuery(
    'SELECT u FROM User u WHERE u.email = :email'
)->setParameter('email', $email);
```

### A07: XSS (Cross-Site Scripting)

```twig
{# [KO] MAUVAIS - XSS possible #}
{{ user.bio|raw }}

{# [OK] BON - Échappement automatique #}
{{ user.bio }}

{# [OK] BON - Échappement explicite si besoin de HTML #}
{{ user.bio|striptags('<p><br>')|raw }}
```

### Audit avec Claude

```bash
/symfony:check-security

# Identifie automatiquement les vulnérabilités
# Propose des corrections
```

### Correction assistée

```bash
"Corrige la vulnérabilité SQL Injection dans ProductRepository ligne 34"

# Claude analyse, corrige, et explique la correction
```

---

## 4. Git Workflow et Conventional Commits

### GitHub Flow

```
main (production-ready)
  │
  ├─> feature/add-discount-system
  │   │
  │   ├─ feat(order): add discount calculation
  │   ├─ test(order): add discount tests
  │   ├─ refactor(order): extract discount strategy
  │   │
  │   └─> Pull Request → Review → Merge
  │
  └─> main (updated)
```

### Format Conventional Commits

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types autorisés

| Type | Usage |
|------|-------|
| `feat` | Nouvelle fonctionnalité |
| `fix` | Correction de bug |
| `docs` | Documentation |
| `style` | Formatage (pas de changement de code) |
| `refactor` | Refactoring |
| `perf` | Amélioration de performance |
| `test` | Ajout/correction de tests |
| `build` | Changements de build |
| `ci` | Changements CI/CD |
| `chore` | Maintenance |

### Exemples

```bash
# Feature
feat(auth): add JWT refresh token endpoint

# Bug fix
fix(cart): correct total calculation with discounts

# Refactoring
refactor(order): extract payment logic to PaymentService

# Tests
test(discount): add edge cases for loyalty bonus
```

### Validation avec Commitlint

```json
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [2, 'always', ['auth', 'order', 'cart', 'user', 'product']]
  }
};
```

---

## 5. Exercice Pratique

### Objectif

Exécuter un audit qualité complet et corriger les 3 findings les plus critiques.

### Étapes

1. **Lancer l'audit**
   ```bash
   /symfony:check-compliance
   ```

2. **Identifier les issues critiques**
   - Sécurité (priorité 1)
   - Tests manquants (priorité 2)
   - Code quality (priorité 3)

3. **Corriger issue 1 : Sécurité**
   ```bash
   "Corrige [description de l'issue sécurité]"
   # Puis ajouter le test de non-régression
   ```

4. **Corriger issue 2 : Tests**
   ```bash
   @tdd-coach "Ajoute les tests manquants pour [composant]"
   ```

5. **Corriger issue 3 : Qualité**
   ```bash
   "Refactore [méthode/classe] pour réduire la complexité"
   ```

6. **Vérifier**
   ```bash
   /symfony:check-compliance
   # Vérifier que les scores ont augmenté
   ```

### Critères de succès

- [ ] 3 issues critiques corrigées
- [ ] Tests de non-régression ajoutés
- [ ] Score sécurité amélioré
- [ ] Score qualité amélioré

---

---

## 6. Securite Claude Code et MCP (v2.1.105)

### CVEs documentes

Claude Code a fait l'objet de plusieurs vulnerabilites corrigees. Il est important de maintenir une version a jour :

| CVE | Severite | Version corrigee | Impact |
|-----|----------|-----------------|--------|
| CVE-2025-59536 | 8.7/10 CVSS | v2.1.51 | Injection de commandes via inputs MCP |
| CVE-2026-21852 | 5.3/10 CVSS | v2.0.65 | Exfiltration de cles API via traversee de chemin |
| CVE-2026-35020 | High | v2.1.97 | Compound command bypass |
| CVE-2026-35021 | High | v2.1.97 | Network redirect bypass |
| CVE-2026-35022 | High | v2.1.98 | Env-var prefix injection |
| N/A | High | v2.1.101 | Command injection via POSIX `which` fallback |

> **Recommandation** : Toujours utiliser Claude Code **v2.1.154+** (version recommandee).

### Auto Mode (v2.1.94+)

Auto Mode est un classificateur de permissions propulse par l'IA qui remplace `--dangerously-skip-permissions` de maniere plus sure :

| Mode | Protection | Vitesse | Usage |
|------|-----------|---------|-------|
| Manuel | Maximale | Lente | Workflows audites, haute securite |
| Auto Mode | Elevee | Rapide | Workflows de dev de confiance |
| Skip Permissions | Minimale | Maximale | Projets locaux/personnels uniquement |

> **Securite progressive** : 3 blocages consecutifs = retour en mode manuel. 20+ blocages = revert complet.

### Sandboxing des sous-processus (v2.1.98+)

| Mecanisme | Description |
|-----------|-------------|
| Isolation PID namespace | Sous-processus isoles (Linux) |
| `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=1` | Supprime les credentials des sous-processus |
| `sandbox.failIfUnavailable` | Echoue si le sandbox ne peut pas etre initialise |

### Securite MCP : Checklist de vetting

Avant d'installer un serveur MCP tiers :

- [ ] Code source disponible et auditable
- [ ] Auteur/organisation verifiee
- [ ] Pas d'acces reseau non justifie
- [ ] Permissions minimales
- [ ] Version pinee (pas de `latest`)

### CLAUDE.md vs Hooks pour la securite

| Mecanisme | Force | Usage |
|-----------|-------|-------|
| **CLAUDE.md** | Suggestion | Guidelines, conventions |
| **Rules** | Suggestion forte | Regles detaillees |
| **Hooks** | Enforcement | Blocage effectif, validation automatique |

> **Regle** : CLAUDE.md = suggestions. Hooks = requirements. Pour les contraintes de securite critiques, utiliser des hooks.

---

## Points Clés à Retenir

1. **Pre-commit** : 13 sections à valider avant chaque commit
2. **TDD** : Tests d'abord, implémentation ensuite
3. **OWASP** : Les 10 principales vulnérabilités à connaître
4. **Conventional Commits** : Format standardisé pour l'historique Git
5. **Automatisation** : Hooks Git pour garantir la qualité
6. **CVEs** : 7 vulnerabilites documentees, toujours utiliser v2.1.154+
7. **Auto Mode** : Classificateur IA pour les permissions (v2.1.94+)
8. **Sandboxing** : Isolation des sous-processus (v2.1.98+)
9. **MCP Securite** : Auditer les serveurs MCP tiers avant installation

---

**Durée estimée :** 1h
**Prochain module :** Agents Spécialisés
