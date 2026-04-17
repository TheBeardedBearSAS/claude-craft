---
name: multitenant
description: Architecture multitenant avec approche tiered (Shared/Dedicated Schema/DB), RBAC/ABAC, field-level encryption. Use when working with multitenant applications, tenant isolation, data segregation.
triggers:
  files: ["**/TenantFilter.php", "**/TenantScope.php", "**/middleware/Tenant*"]
  keywords: ["multitenant", "multi-tenant", "tenant", "isolation", "tenant_id", "schema", "RBAC", "ABAC", "field-level encryption"]
auto_suggest: true
---

# Multitenant — Isolation et Sécurité

## Vue d'ensemble

L'architecture multitenant permet de servir plusieurs clients (tenants) avec une seule instance applicative. L'isolation et la sécurité sont **critiques**.

**Principes :**
- ✅ Isolation stricte des données entre tenants
- ✅ Choix du tier d'isolation selon le profil client
- ✅ RBAC/ABAC par tenant pour le contrôle d'accès fin
- ✅ Chiffrement field-level pour données sensibles
- ✅ Protection contre les fuites inter-tenants

---

## Table des matières

1. [Approche Tiered](#approche-tiered)
2. [Tier 1 : Shared Schema](#tier-1--shared-schema)
3. [Tier 2 : Dedicated Schema](#tier-2--dedicated-schema)
4. [Tier 3 : Dedicated Database](#tier-3--dedicated-database)
5. [RBAC/ABAC par tenant](#rbacabac-par-tenant)
6. [Field-Level Encryption](#field-level-encryption)
7. [Sécurité et validation](#sécurité-et-validation)
8. [Checklist](#checklist)

---

## Approche Tiered

> **Source :** [Multi-Tenant Architecture Guide](https://gainhq.com/blog/multi-tenant-architecture/)

Une approche tiered permet d'adapter le niveau d'isolation au profil du tenant (startup, SMB, enterprise).

| Tier | Isolation | Coût | Complexité | Cas d'usage |
|------|-----------|------|------------|-------------|
| **Tier 1** | Shared schema avec `tenant_id` | Faible | Faible | Startups, petits clients |
| **Tier 2** | Dedicated schema par tenant | Moyen | Moyen | SMB, clients sensibles |
| **Tier 3** | Dedicated DB par tenant | Élevé | Élevé | Enterprise, compliance stricte |

### Migration inter-tier

Les tenants peuvent migrer d'un tier à l'autre selon leur croissance :

```
Startup (Tier 1)
  ↓ Croissance
SMB (Tier 2)
  ↓ Enterprise
Enterprise (Tier 3)
```

**Stratégie :** Prévoir des scripts de migration automatisés entre tiers.

---

## Tier 1 : Shared Schema

### Principe

Tous les tenants partagent la même base de données et le même schéma. Isolation via colonne `tenant_id`.

### Avantages

- ✅ Faible coût (une seule DB)
- ✅ Maintenance simplifiée
- ✅ Scaling horizontal facile

### Inconvénients

- ❌ Risque de fuite de données (SQL injection, bugs)
- ❌ Performance partagée (un tenant peut impacter les autres)
- ❌ Compliance difficile (GDPR, HIPAA)

### Implémentation

**Symfony (Doctrine) :**

```php
// Utiliser un filtre global Doctrine
class TenantFilter extends SQLFilter
{
    public function addFilterConstraint(ClassMetadata $targetEntity, $targetTableAlias): string
    {
        if (!$targetEntity->reflClass->implementsInterface(TenantAwareInterface::class)) {
            return '';
        }

        return sprintf('%s.tenant_id = %s', $targetTableAlias, $this->getParameter('tenant_id'));
    }
}
```

**Laravel :**

```php
// Global scope
protected static function booted()
{
    static::addGlobalScope('tenant', function (Builder $builder) {
        $builder->where('tenant_id', auth()->user()->tenant_id);
    });
}
```

**Validation obligatoire :** Chaque requête SQL DOIT inclure `WHERE tenant_id = :current_tenant`.

---

## Tier 2 : Dedicated Schema

### Principe

Chaque tenant possède son propre schéma dans une base de données partagée.

**Exemple PostgreSQL :**

```
database: app_prod
  ├── schema: tenant_acme    (tables pour Acme Corp)
  ├── schema: tenant_beta    (tables pour Beta Inc)
  └── schema: tenant_gamma   (tables pour Gamma LLC)
```

### Avantages

- ✅ Meilleure isolation (pas de risque de fuite par `tenant_id`)
- ✅ Performance isolée par schéma
- ✅ Backup/restore par tenant possible

### Inconvénients

- ❌ Limite de schémas par DB (PostgreSQL : ~10 000 max)
- ❌ Migrations plus complexes (itérer sur tous les schémas)

### Implémentation

**Symfony (Doctrine) :**

```php
// Middleware pour switcher de schéma
class TenantSchemaMiddleware
{
    public function process(Request $request, RequestHandler $handler): Response
    {
        $tenantId = $this->resolveTenant($request);
        $schemaName = "tenant_{$tenantId}";

        $this->connection->executeStatement("SET search_path TO {$schemaName}");

        return $handler->handle($request);
    }
}
```

**Laravel :**

```php
// Dynamic connection
DB::purge('tenant');
Config::set('database.connections.tenant.schema', "tenant_{$tenantId}");
DB::reconnect('tenant');
```

---

## Tier 3 : Dedicated Database

### Principe

Chaque tenant possède sa propre base de données physique.

**Exemple :**

```
database: tenant_acme_prod
database: tenant_beta_prod
database: tenant_gamma_prod
```

### Avantages

- ✅ Isolation maximale (compliance GDPR, HIPAA)
- ✅ Scaling indépendant par tenant
- ✅ Backup/restore/migration par tenant

### Inconvénients

- ❌ Coût élevé (serveurs DB multiples)
- ❌ Maintenance complexe (migrations, monitoring)

### Implémentation

**Symfony (Doctrine) :**

```php
// Connection pooling
class TenantConnectionFactory
{
    public function getConnection(string $tenantId): Connection
    {
        $config = [
            'dbname' => "tenant_{$tenantId}_prod",
            'user' => 'app_user',
            'password' => getenv('DB_PASSWORD'),
            'host' => "tenant-{$tenantId}.db.example.com",
        ];

        return DriverManager::getConnection($config);
    }
}
```

**Laravel :**

```php
// Multi-database config
Config::set("database.connections.tenant_{$tenantId}", [
    'driver' => 'pgsql',
    'host' => "tenant-{$tenantId}.db.example.com",
    'database' => "tenant_{$tenantId}_prod",
]);

DB::connection("tenant_{$tenantId}");
```

---

## RBAC/ABAC par tenant

### Principe

Au-delà de l'isolation par `tenant_id`, implémenter un contrôle d'accès fin (Role-Based / Attribute-Based).

| Modèle | Description | Exemple |
|--------|-------------|---------|
| **RBAC** | Permissions par rôle | `admin`, `editor`, `viewer` |
| **ABAC** | Permissions par attributs | `can_edit_if_owner`, `can_view_if_same_department` |

### Implémentation RBAC

**Symfony :**

```php
// Voter personnalisé
class DocumentVoter extends Voter
{
    protected function voteOnAttribute(string $attribute, $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();

        // Vérifier tenant_id
        if ($subject->getTenantId() !== $user->getTenantId()) {
            return false;
        }

        // Vérifier rôle
        return match ($attribute) {
            'DOCUMENT_EDIT' => in_array('ROLE_EDITOR', $user->getRoles()),
            'DOCUMENT_DELETE' => in_array('ROLE_ADMIN', $user->getRoles()),
            default => false,
        };
    }
}
```

**Laravel (Spatie Permission) :**

```php
// Permissions scope par tenant
$user->givePermissionTo('edit-documents', 'tenant', $tenantId);

if ($user->hasPermissionTo('edit-documents', 'tenant', $tenantId)) {
    // Autoriser
}
```

---

## Field-Level Encryption

### Principe

Chiffrer les champs sensibles (numéro de carte bancaire, données médicales) pour protéger contre les fuites DB.

**Règle :** Même si un attaquant accède à la DB, les données sensibles restent illisibles.

### Implémentation

**Symfony (ParagonIE Halite) :**

```php
use ParagonIE\Halite\Symmetric\Crypto;
use ParagonIE\Halite\KeyFactory;

class EncryptedField
{
    private EncryptionKey $key;

    public function __construct()
    {
        $this->key = KeyFactory::loadEncryptionKey('/secure/path/tenant.key');
    }

    public function encrypt(string $plaintext): string
    {
        return Crypto::encrypt(new HiddenString($plaintext), $this->key);
    }

    public function decrypt(string $ciphertext): string
    {
        return Crypto::decrypt($ciphertext, $this->key)->getString();
    }
}
```

**Laravel (Eloquent Casting) :**

```php
// Model
protected $casts = [
    'credit_card' => Encrypted::class,
];

// Automatiquement chiffré/déchiffré
$user->credit_card = '1234-5678-9012-3456';  // Chiffré en DB
echo $user->credit_card;  // Déchiffré automatiquement
```

**Rotation des clés :** Prévoir une stratégie de rotation annuelle des clés de chiffrement.

---

## Sécurité et validation

### Checklist sécurité multitenant

- [ ] **Résolution tenant** : Valider le tenant à chaque requête (header, sous-domaine, JWT claim)
- [ ] **Isolation SQL** : Tous les SELECT incluent `tenant_id` ou schéma dédié
- [ ] **Tests d'isolation** : Test unitaire vérifiant qu'un tenant ne peut pas accéder aux données d'un autre
- [ ] **Audit logs** : Logger tous les accès inter-tenants suspects
- [ ] **Rate limiting** : Par tenant (éviter qu'un tenant consomme toutes les ressources)
- [ ] **RBAC/ABAC** : Permissions fines au-delà de `tenant_id`
- [ ] **Chiffrement** : Field-level pour données sensibles

### Tests d'isolation

**Exemple :**

```php
// Test Symfony
public function testTenantIsolation(): void
{
    $tenantA = $this->createTenant('acme');
    $tenantB = $this->createTenant('beta');

    $documentA = $this->createDocument($tenantA, 'Secret Acme');
    $documentB = $this->createDocument($tenantB, 'Secret Beta');

    // User de tenantA ne peut pas voir documentB
    $this->loginAs($tenantA->getUser());
    $response = $this->get("/documents/{$documentB->getId()}");
    $this->assertResponseStatusCodeSame(403);
}
```

---

## Checklist

### Nouveau projet multitenant

- [ ] Choisir le tier d'isolation par défaut (Tier 1 pour MVP)
- [ ] Configurer résolution tenant (header `X-Tenant-ID`, sous-domaine, JWT)
- [ ] Implémenter filtre global SQL (`tenant_id`)
- [ ] Tests d'isolation (un tenant ne voit pas les données d'un autre)
- [ ] RBAC/ABAC par tenant
- [ ] Field-level encryption pour données sensibles
- [ ] Migration script Tier 1 → Tier 2 → Tier 3

### Migration vers Tier supérieur

- [ ] Script de migration des données
- [ ] Tests de non-régression
- [ ] Backup avant migration
- [ ] Rollback plan

---

## Ressources

- **Multi-Tenant Architecture Guide :** [gainhq.com/blog/multi-tenant-architecture](https://gainhq.com/blog/multi-tenant-architecture/)
- **OWASP Multitenant :** [owasp.org/www-project-web-security-testing-guide](https://owasp.org/www-project-web-security-testing-guide/)
- **Symfony Multi-Tenancy :** [symfony.com/doc/current/doctrine.html#multiple-entity-managers](https://symfony.com/doc/current/doctrine.html#multiple-entity-managers)
- **Laravel Multi-Tenancy :** [tenancyforlaravel.com](https://tenancyforlaravel.com/)

---

**Date de dernière mise à jour :** 2026-04
**Version :** 1.0.0
**Auteur :** The Bearded CTO
