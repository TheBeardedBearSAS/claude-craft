# ERD — Atlas

## Entités principales

### Account

| Colonne | Type | Contrainte |
|---------|------|-----------|
| `id` | UUID | PK |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL |
| `password_hash` | VARCHAR(255) | nullable (OAuth) |
| `provider` | ENUM('email','oauth') | NOT NULL |
| `created_at` | TIMESTAMPTZ | NOT NULL |

### Subscription

| Colonne | Type | Contrainte |
|---------|------|-----------|
| `id` | UUID | PK |
| `account_id` | UUID | FK → Account, NOT NULL |
| `plan` | ENUM('free','premium') | NOT NULL |
| `status` | ENUM('active','cancelled','expired') | NOT NULL |
| `renews_at` | TIMESTAMPTZ | nullable |
| `external_id` | VARCHAR(255) | référence PaymentProvider |

### Item (Itinéraire)

| Colonne | Type | Contrainte |
|---------|------|-----------|
| `id` | UUID | PK |
| `account_id` | UUID | FK → Account |
| `title` | VARCHAR(255) | NOT NULL |
| `steps` | JSONB | NOT NULL |
| `duration_min` | INT | NOT NULL |
| `is_public` | BOOLEAN | DEFAULT false |
| `created_at` | TIMESTAMPTZ | NOT NULL |

### Activity (Complétion)

| Colonne | Type | Contrainte |
|---------|------|-----------|
| `id` | UUID | PK |
| `account_id` | UUID | FK → Account |
| `item_id` | UUID | FK → Item |
| `completed_at` | TIMESTAMPTZ | NOT NULL |
| `points_earned` | INT | NOT NULL |

### Badge

| Colonne | Type | Contrainte |
|---------|------|-----------|
| `id` | UUID | PK |
| `account_id` | UUID | FK → Account |
| `badge_type` | VARCHAR(100) | NOT NULL |
| `unlocked_at` | TIMESTAMPTZ | NOT NULL |

## Relations

`Account` 1→N `Subscription` | `Account` 1→N `Item` | `Account` 1→N `Activity` | `Item` 1→N `Activity` | `Account` 1→N `Badge`
