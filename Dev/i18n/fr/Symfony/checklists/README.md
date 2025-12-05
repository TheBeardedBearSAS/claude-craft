# Checklists Claude Code - Atoll Tourisme

> Checklists pour garantir la qualité et la sécurité du code

## Vue d'ensemble

Ce dossier contient 4 checklists essentielles pour le workflow de développement.

**Total:** 4 checklists | ~3700 lignes de procédures détaillées

---

## 📋 Liste des checklists

### 1. `pre-commit.md` - Avant chaque commit
**Temps estimé:** 2-5 minutes

**Utilisation:** AVANT chaque `git commit`

**Vérifications automatiques:**
- ✅ Tests passent (unitaires + intégration + Behat)
- ✅ PHPStan niveau 8 (0 erreurs)
- ✅ CS-Fixer (code formaté PSR-12)
- ✅ Hadolint (Dockerfile valide)
- ✅ Coverage ≥ 80%
- ✅ Message commit conforme (Conventional Commits)

**Commande rapide:**
```bash
make pre-commit && git commit
```

**Sections:**
1. Tests automatisés
2. Analyse statique (PHPStan)
3. Coding Standards (PHP CS Fixer)
4. Docker (Hadolint)
5. Coverage de tests
6. Message de commit (Conventional Commits)
7. Documentation (si applicable)
8. Sécurité & RGPD (si données perso)

**Quand l'utiliser:**
- ✅ Avant CHAQUE commit
- ✅ Validation continue
- ✅ Éviter les régressions

**Exemples de messages de commit:**
```bash
✅ feat(reservation): ajoute supplément single pour 1 participant
✅ fix(value-object): corrige arrondi dans Money::multiply
✅ refactor(reservation): extrait PrixCalculatorService
✅ test(reservation): ajoute tests calcul prix total

❌ "update code"  (trop vague)
❌ "fix bug"      (quel bug ?)
❌ "WIP"          (ne pas commit du WIP)
```

---

### 2. `new-feature.md` - Nouvelle fonctionnalité
**Temps estimé:** 2h30 (petite) à 10h (grande)

**Utilisation:** Workflow complet pour implémenter une nouvelle feature

**Phases TDD:**
```
1. ANALYSE (30 min)     → Template: .claude/templates/analysis.md
2. TDD RED (1h)         → Templates: test-*.md
3. TDD GREEN (2h)       → Templates: service.md, value-object.md, etc.
4. TDD REFACTOR (1h)    → Principes SOLID
5. VALIDATION (30 min)  → Checklist pre-commit
6. PULL REQUEST         → Template de PR
```

**Sections:**
1. **Phase 1:** Analyse pré-implémentation
2. **Phase 2:** TDD RED (tests qui échouent)
3. **Phase 3:** TDD GREEN (implémentation minimale)
4. **Phase 4:** TDD REFACTOR (amélioration SOLID)
5. **Phase 5:** Validation finale (qualité + tests)
6. **Phase 6:** Pull Request

**Quand l'utiliser:**
- ✅ Nouvelle feature métier
- ✅ Nouvelle API endpoint
- ✅ Nouveau use case

**Exemple complet:** Feature "Options payantes"
- Analyse: 30 min
- TDD RED: 1h (12 tests écrits)
- TDD GREEN: 2h (implémentation + migration BDD)
- TDD REFACTOR: 1h (Value Objects + services)
- Validation: 30 min (PHPStan + coverage)
- **Total:** 5h

**Temps par taille:**
| Taille | Fichiers | Temps total |
|--------|----------|-------------|
| Petite | 1 fichier | 2h30 |
| Moyenne | 3-5 fichiers | 5h |
| Grande | 10+ fichiers | 10h |

---

### 3. `refactoring.md` - Refactoring sécurisé
**Temps estimé:** 30 min à 4h

**Utilisation:** Améliorer le code sans casser le comportement

**Principe:** Filet de sécurité = Tests verts

**Phases:**
1. **Préparation:** État stable (tests verts)
2. **Analyse:** Identifier les code smells
3. **Refactoring:** Par petits pas (baby steps)
4. **Patterns:** Apply refactoring patterns
5. **Validation:** Tests toujours verts + performance OK
6. **Commit:** Documentation du refactoring

**Code Smells détectés:**
- ❌ Méthode trop longue (> 20 lignes)
- ❌ Duplication (DRY violation)
- ❌ Complexité cyclomatique élevée (> 5)
- ❌ Primitive Obsession
- ❌ God Class (> 300 lignes)

**Patterns de refactoring:**
1. Extract Method
2. Extract Class
3. Replace Conditional with Polymorphism
4. Introduce Parameter Object
5. Replace Magic Number with Constant

**Quand l'utiliser:**
- ✅ Code complexe à simplifier
- ✅ Duplication détectée
- ✅ Violation SOLID
- ✅ Dette technique à réduire

**Règle d'or:** Un seul changement à la fois + tests verts

**Workflow:**
```bash
# 1. État stable
git commit -m "chore: état stable avant refactoring"

# 2. Petit changement
vim src/Service/ReservationService.php
# Renommer variable

# 3. Tests
make test  # ✅ Verts

# 4. Commit
git commit -m "refactor: renomme variable data"

# 5. Répéter (baby steps)
```

---

### 4. `security-rgpd.md` - Sécurité & RGPD
**Temps estimé:** 1-2h (audit complet)

**Utilisation:** Avant chaque release + tous les 3 mois

**Sections:**

#### Sécurité (11 points)
1. Protection données personnelles (chiffrement BDD)
2. Validation des entrées utilisateur
3. Protection CSRF
4. Protection XSS
5. Protection SQL Injection
6. Security Headers (CSP, HSTS, etc.)
7. Authentification & Autorisation
8. Tests de sécurité

#### RGPD (4 points)
8. Consentement & Droits
9. Droit à l'oubli (anonymisation)
10. Portabilité des données (export JSON)
11. Durée de conservation (nettoyage auto)
12. Audit & Traçabilité (logs)

**Checklist finale:**

**Sécurité:**
- [ ] Données sensibles chiffrées (`doctrine-encrypt-bundle`)
- [ ] Validation stricte inputs (Symfony Forms + Constraints)
- [ ] CSRF activé
- [ ] XSS protection (Twig autoescape)
- [ ] SQL Injection impossible (Doctrine ORM)
- [ ] Security headers (CSP, HSTS, X-Frame-Options)
- [ ] HTTPS forcé
- [ ] Mots de passe hashés (Bcrypt/Argon2)
- [ ] Rate limiting sur login
- [ ] Pas de secrets committed

**RGPD:**
- [ ] Politique de confidentialité publiée
- [ ] Consentement explicite (checkbox)
- [ ] Traçabilité consentement (date, IP)
- [ ] Droit à l'oubli implémenté (commande CLI)
- [ ] Portabilité données (export JSON)
- [ ] Durée conservation définie (max 3 ans)
- [ ] Nettoyage automatique (cron)
- [ ] Logs actions sensibles
- [ ] Chiffrement données perso
- [ ] Procédure breach documentée

**Quand l'utiliser:**
- ✅ Avant release majeure
- ✅ Audit trimestriel (tous les 3 mois)
- ✅ Après incident de sécurité
- ✅ Nouvelle collecte de données

**Commandes d'audit:**
```bash
# Vulnérabilités composer
composer audit

# Security checker Symfony
symfony security:check

# Vérifier chiffrement BDD
docker compose exec db mysql -u root -p atoll
SELECT nom FROM participant LIMIT 1;
# Attendu: "enc:def502000..." (chiffré)

# Tester headers sécurité
curl -I https://atoll-tourisme.com
# Attendu: CSP, HSTS, X-Frame-Options, etc.
```

---

## 🎯 Workflow recommandé

### Développement quotidien

```bash
# 1. Nouvelle feature
# Utiliser: new-feature.md

# 2. Avant chaque commit
# Utiliser: pre-commit.md
make pre-commit && git commit

# 3. Refactoring si nécessaire
# Utiliser: refactoring.md

# 4. Audit sécurité/RGPD (trimestriel)
# Utiliser: security-rgpd.md
```

### Workflow complet feature

```bash
# Étape 1: Analyse (new-feature.md phase 1)
vim docs/analysis/2025-01-15-feature.md

# Étape 2: TDD RED (new-feature.md phase 2)
vim tests/Unit/Service/MyServiceTest.php
make test  # ❌ Failed (attendu)

# Étape 3: TDD GREEN (new-feature.md phase 3)
vim src/Service/MyService.php
make test  # ✅ Passed

# Étape 4: TDD REFACTOR (new-feature.md phase 4 + refactoring.md)
# Améliorer le code (SOLID, DRY)
make test  # ✅ Toujours passed

# Étape 5: Pre-commit (pre-commit.md)
make pre-commit  # ✅ Tout OK
git commit -m "feat(service): ajoute MyService"

# Étape 6: PR
git push origin feature/my-feature
# Créer PR
```

---

## 📚 Références croisées

### Templates associés
`.claude/templates/`:
- `analysis.md` → Utilisé dans `new-feature.md` phase 1
- `test-*.md` → Utilisés dans `new-feature.md` phases 2-3
- `service.md`, `value-object.md`, etc. → Utilisés dans `new-feature.md` phase 3

### Rules associées
`.claude/rules/`:
- `01-architecture-ddd.md` → Architecture DDD
- `03-coding-standards.md` → Standards de code
- `04-testing-tdd.md` → Stratégie TDD
- `07-security-rgpd.md` → Sécurité et RGPD

---

## 💡 Conseils d'utilisation

### 1. Pre-commit: Automatisation

Créer un hook Git:
```bash
# .git/hooks/pre-commit
#!/bin/bash
make pre-commit || exit 1
```

Ou utiliser Husky (npm):
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "make pre-commit"
    }
  }
}
```

### 2. New-feature: Respect du TDD

**NE PAS** coder avant les tests:
```bash
# ❌ MAUVAIS
vim src/Service/MyService.php  # Code d'abord
vim tests/Unit/Service/MyServiceTest.php  # Tests après

# ✅ BON
vim tests/Unit/Service/MyServiceTest.php  # Tests d'abord (RED)
make test  # ❌ Failed
vim src/Service/MyService.php  # Code après (GREEN)
make test  # ✅ Passed
```

### 3. Refactoring: Baby Steps

**NE PAS** tout refactorer d'un coup:
```bash
# ❌ MAUVAIS (Big Bang)
# 3 jours de refactoring
git commit -m "refactor: améliore tout"  # 50 fichiers

# ✅ BON (Baby Steps)
git commit -m "refactor: renomme variable"  # 1 fichier
git commit -m "refactor: extrait méthode"   # 1 fichier
git commit -m "refactor: déplace classe"    # 2 fichiers
```

### 4. Security-RGPD: Automatisation

Créer un cron pour nettoyage RGPD:
```bash
# crontab -e
# Nettoyage RGPD tous les jours à 2h
0 2 * * * cd /path/to/project && docker compose exec php bin/console app:gdpr:cleanup
```

---

## 📊 Statistiques

| Checklist | Lignes | Temps estimé | Fréquence |
|-----------|--------|--------------|-----------|
| pre-commit.md | 527 | 2-5 min | Chaque commit |
| new-feature.md | 765 | 2h30-10h | Chaque feature |
| refactoring.md | 975 | 30min-4h | Au besoin |
| security-rgpd.md | 920 | 1-2h | Trimestriel |

**Total:** ~3700 lignes de procédures détaillées

---

## ⚠️ Points d'attention

### Ne JAMAIS
- ❌ Commit sans `pre-commit.md` validé
- ❌ Feature sans analyse (`new-feature.md` phase 1)
- ❌ Refactoring sans tests verts
- ❌ Release sans audit sécurité/RGPD

### TOUJOURS
- ✅ Lancer les tests avant commit
- ✅ PHPStan niveau 8 sans erreur
- ✅ Coverage ≥ 80%
- ✅ Message commit conforme (Conventional Commits)

---

## 🚀 Raccourcis Makefile

Ajouter au `Makefile`:

```makefile
.PHONY: pre-commit
pre-commit: ## Checklist avant commit
	@echo "🔍 Validation pré-commit..."
	@$(MAKE) phpstan
	@$(MAKE) cs-fix
	@$(MAKE) test
	@$(MAKE) test-coverage
	@echo "✅ Prêt à commit!"

.PHONY: security-audit
security-audit: ## Audit sécurité/RGPD
	@echo "🔒 Audit sécurité..."
	composer audit
	symfony security:check
	@echo "📋 Voir checklist: .claude/checklists/security-rgpd.md"
```

Utilisation:
```bash
make pre-commit       # Avant chaque commit
make security-audit   # Audit sécurité trimestriel
```

---

**Dernière mise à jour:** 2025-11-26
**Responsable:** Lead Dev
**Fréquence de révision:** Mensuelle
