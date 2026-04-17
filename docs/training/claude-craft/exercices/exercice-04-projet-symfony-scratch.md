# Exercice 4 : Créer un Projet Symfony from Scratch

## Objectif

Créer un micro-projet Symfony complet "Gestion de Tâches" en utilisant Claude-Craft.

## Durée estimée

45 minutes

---

## Contexte

Vous devez créer une API REST pour gérer des tâches (TODO list) avec :
- Création de tâches
- Liste des tâches
- Marquage comme terminé
- Suppression

---

## Partie 1 : Setup du projet (10 min)

### Étape 1.1 : Créer le projet Symfony

```bash
# Créer le projet (Symfony 8.0 / PHP 8.5)
symfony new task-manager --webapp
cd task-manager

# OU avec Composer
composer create-project symfony/skeleton task-manager
cd task-manager
composer require webapp
```

### Étape 1.2 : Installer Claude-Craft

```bash
# Installation via npx
npx @the-bearded-bear/claude-craft install ~/task-manager --tech=symfony --lang=fr

# Retourner au projet
cd ~/task-manager
```

### Étape 1.3 : Configurer le contexte projet

```bash
# Lancer Claude
claude

# Configurer le contexte
/common:setup-project-context
```

Répondez aux questions :
- **Nom** : TaskManager
- **Stack** : Symfony 8.0, PHP 8.5, SQLite
- **Entités** : Task
- **Architecture** : Clean Architecture

**Ou éditez manuellement** `.claude/rules/00-project-context.md` :

```markdown
# TaskManager - Projet Symfony

## Project Context

- **Project Name**: TaskManager
- **Technology Stack**: Symfony 8.0, PHP 8.5, SQLite
- **Architecture**: Clean Architecture + Hexagonal

## Domain Entities

- Task (titre, description, statut, date d'échéance)

## API Endpoints

- POST /api/tasks - Créer une tâche
- GET /api/tasks - Lister les tâches
- PATCH /api/tasks/{id}/complete - Marquer comme terminé
- DELETE /api/tasks/{id} - Supprimer
```

**Validation :** [OK] Projet créé et Claude-Craft installé

---

## Partie 2 : Design de l'API (5 min)

### Étape 2.1 : Designer l'API avec l'agent

```bash
@api-designer "Conçois l'API REST pour une gestion de tâches :
- Créer une tâche (titre requis, description optionnelle, dueDate optionnelle)
- Lister toutes les tâches (avec filtre par statut)
- Marquer une tâche comme terminée
- Supprimer une tâche

Format JSON, codes HTTP standards."
```

**Notez le design proposé :**

| Method | Endpoint | Description | Body/Params |
|--------|----------|-------------|-------------|
| POST | | | |
| GET | | | |
| PATCH | | | |
| DELETE | | | |

### Étape 2.2 : Designer le schéma

```bash
@database-architect "Propose le schéma Doctrine pour l'entité Task avec :
- id (UUID)
- title (string, required, max 255)
- description (text, nullable)
- status (enum: pending, completed)
- dueDate (datetime, nullable)
- createdAt (datetime)
- completedAt (datetime, nullable)"
```

**Validation :** [OK] Design de l'API et du schéma validé

---

## Partie 3 : Génération de la feature (10 min)

### Étape 3.1 : Générer la structure complète

```bash
/symfony:generate-feature Task
```

**Vérifiez que ces fichiers sont générés :**

```
src/
├── Domain/
│   └── Model/
│       └── Task/
│           ├── Task.php
│           ├── TaskId.php
│           └── TaskStatus.php
├── Application/
│   ├── Command/
│   │   └── CreateTask/
│   │       ├── CreateTaskCommand.php
│   │       └── CreateTaskHandler.php
│   └── Query/
│       └── GetTasks/
│           ├── GetTasksQuery.php
│           └── GetTasksHandler.php
└── Infrastructure/
    └── Persistence/
        └── DoctrineTaskRepository.php
```

### Étape 3.2 : Ajouter les champs manquants

```bash
"Ajoute à l'entité Task les champs :
- description (text, nullable)
- dueDate (DateTimeImmutable, nullable)
- completedAt (DateTimeImmutable, nullable)

Et les méthodes :
- complete() : marque la tâche comme terminée
- isOverdue() : retourne true si dueDate < now et status = pending"
```

### Étape 3.3 : Générer les handlers manquants

```bash
"Génère les handlers CQRS manquants :
- CompleteTaskHandler (marque une tâche comme terminée)
- DeleteTaskHandler (supprime une tâche)
- GetTaskByIdHandler (récupère une tâche par ID)"
```

**Validation :** [OK] Structure Domain/Application générée

---

## Partie 4 : Tests TDD (15 min)

### Étape 4.1 : Tests de l'entité Task

```bash
@tdd-coach "Écris les tests unitaires pour l'entité Task :
- Création avec titre valide
- Création échoue si titre vide
- complete() change le statut et set completedAt
- isOverdue() retourne true/false selon les conditions"
```

**Créez le fichier** `tests/Unit/Domain/Model/TaskTest.php` avec le contenu généré.

### Étape 4.2 : Tests du handler CreateTask

```bash
@tdd-coach "Écris les tests pour CreateTaskHandler :
- Création réussie avec données valides
- Échec si titre vide
- Le repository.save() est appelé
- L'ID est retourné"
```

**Créez le fichier** `tests/Unit/Application/CreateTaskHandlerTest.php`.

### Étape 4.3 : Tests du handler CompleteTask

```bash
@tdd-coach "Écris les tests pour CompleteTaskHandler :
- Succès si tâche existe et est pending
- Échec si tâche non trouvée
- Échec si tâche déjà complétée"
```

### Étape 4.4 : Exécuter les tests

```bash
# Quitter Claude temporairement
/exit

# Lancer les tests via Docker
docker compose exec app ./vendor/bin/phpunit tests/Unit/

# Relancer Claude
claude
```

**Validation :** [OK] Tests écrits (ils échouent car pas d'implémentation)

---

## Partie 5 : Implémentation (10 min)

### Étape 5.1 : Implémenter l'entité Task

```bash
"Implémente l'entité Task pour faire passer les tests TaskTest.php"
```

### Étape 5.2 : Implémenter CreateTaskHandler

```bash
"Implémente CreateTaskHandler pour faire passer les tests"
```

### Étape 5.3 : Implémenter CompleteTaskHandler

```bash
"Implémente CompleteTaskHandler pour faire passer les tests"
```

### Étape 5.4 : Vérifier les tests

```bash
/exit

# Lancer les tests via Docker
docker compose exec app ./vendor/bin/phpunit tests/Unit/
# Tous les tests doivent passer

claude
```

**Validation :** [OK] Tests passent (GREEN)

---

## Partie 6 : API Controller (5 min)

### Étape 6.1 : Générer le controller

```bash
"Génère TaskController avec les endpoints :
- POST /api/tasks -> CreateTaskHandler
- GET /api/tasks -> GetTasksHandler
- PATCH /api/tasks/{id}/complete -> CompleteTaskHandler
- DELETE /api/tasks/{id} -> DeleteTaskHandler

Utilise les DTOs pour la validation."
```

### Étape 6.2 : Configurer les routes

Vérifiez que les routes sont correctement définies dans `config/routes.yaml` ou via attributs.

**Validation :** [OK] Controller créé avec endpoints

---

## Partie 7 : Vérification finale (5 min)

### Étape 7.1 : Audit de conformité

```bash
/symfony:check-compliance
```

### Étape 7.2 : Vérifier la qualité

```bash
/symfony:check-code-quality
```

### Étape 7.3 : Outils qualité via Docker

```bash
/exit

# PHPStan
docker compose exec app php vendor/bin/phpstan analyse --level=8

# PHP-CS-Fixer
docker compose exec app php vendor/bin/php-cs-fixer fix --dry-run --diff

# Tests complets
docker compose exec app ./vendor/bin/phpunit

claude
```

### Étape 7.4 : Tester l'API (optionnel)

```bash
/exit

# Lancer le serveur via Docker
docker compose up -d

# Tester avec curl
curl -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Ma première tâche"}'
```

---

## Livrables

À la fin de l'exercice, vous devez avoir :

```
task-manager/
├── .claude/                          # Claude-Craft configuré
├── src/
│   ├── Domain/
│   │   └── Model/
│   │       └── Task/
│   │           ├── Task.php          # Entité avec logique métier
│   │           ├── TaskId.php        # Value Object
│   │           └── TaskStatus.php    # Enum
│   ├── Application/
│   │   ├── Command/
│   │   │   ├── CreateTask/
│   │   │   ├── CompleteTask/
│   │   │   └── DeleteTask/
│   │   └── Query/
│   │       ├── GetTasks/
│   │       └── GetTaskById/
│   ├── Infrastructure/
│   │   └── Persistence/
│   │       └── DoctrineTaskRepository.php
│   └── UserInterface/
│       └── Api/
│           └── TaskController.php
└── tests/
    └── Unit/
        ├── Domain/
        │   └── Model/
        │       └── TaskTest.php
        └── Application/
            ├── CreateTaskHandlerTest.php
            └── CompleteTaskHandlerTest.php
```

---

## Critères de réussite

- [ ] Projet Symfony 8.0 créé et fonctionnel
- [ ] Claude-Craft installé et configuré
- [ ] Architecture Clean respectée (Domain → Application → Infrastructure)
- [ ] Au moins 5 tests unitaires qui passent
- [ ] 4 endpoints API créés
- [ ] Audit de conformité sans erreurs critiques

---

## Bonus

1. **Ajouter la pagination** sur GET /api/tasks
2. **Ajouter un filtre** par statut : GET /api/tasks?status=pending
3. **Ajouter des tests d'intégration** pour le repository
4. **Documenter l'API** avec OpenAPI/Swagger

---

## Solution de référence

### Task.php (simplifié)

```php
<?php

namespace App\Domain\Model\Task;

final class Task
{
    private TaskId $id;
    private string $title;
    private ?string $description;
    private TaskStatus $status;
    private ?\DateTimeImmutable $dueDate;
    private \DateTimeImmutable $createdAt;
    private ?\DateTimeImmutable $completedAt;

    private function __construct(
        TaskId $id,
        string $title,
        ?string $description,
        ?\DateTimeImmutable $dueDate
    ) {
        if (empty(trim($title))) {
            throw new \InvalidArgumentException('Title cannot be empty');
        }

        $this->id = $id;
        $this->title = $title;
        $this->description = $description;
        $this->status = TaskStatus::PENDING;
        $this->dueDate = $dueDate;
        $this->createdAt = new \DateTimeImmutable();
        $this->completedAt = null;
    }

    public static function create(
        string $title,
        ?string $description = null,
        ?\DateTimeImmutable $dueDate = null
    ): self {
        return new self(TaskId::generate(), $title, $description, $dueDate);
    }

    public function complete(): void
    {
        if ($this->status === TaskStatus::COMPLETED) {
            throw new \DomainException('Task is already completed');
        }

        $this->status = TaskStatus::COMPLETED;
        $this->completedAt = new \DateTimeImmutable();
    }

    public function isOverdue(): bool
    {
        if ($this->status === TaskStatus::COMPLETED) {
            return false;
        }

        if ($this->dueDate === null) {
            return false;
        }

        return $this->dueDate < new \DateTimeImmutable();
    }

    // Getters...
}
```

---

## Points clés appris

1. **Setup rapide** avec Claude-Craft
2. **Design first** avec les agents @api-designer et @database-architect
3. **TDD** : Tests avant implémentation
4. **Clean Architecture** : Séparation claire des couches
5. **Génération** : Les commandes accélèrent le scaffolding
6. **Docker** : Toujours utiliser `docker compose exec app` pour les commandes

---

**Prochain exercice :** Audit d'un projet existant
