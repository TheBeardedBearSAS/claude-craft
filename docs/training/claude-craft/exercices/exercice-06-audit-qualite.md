# Exercice 6 : Audit Qualité et Sécurité

## Objectif

Exécuter un audit qualité et sécurité complet, puis corriger les findings critiques.

## Durée estimée

20 minutes

---

## Contexte

Vous avez hérité d'un projet avec du code de qualité variable. Votre mission est d'identifier les problèmes et de corriger les plus critiques.

---

## Partie 1 : Préparation du code à auditer (5 min)

### Créer des fichiers avec des problèmes

```bash
mkdir -p ~/audit-demo/src/Controller ~/audit-demo/src/Service ~/audit-demo/src/Repository
cd ~/audit-demo
git init

# Installer Claude-Craft
cd ~/claude-craft
make install-symfony TARGET=~/audit-demo LANG=fr
cd ~/audit-demo
```

### Fichier 1 : Controller avec problèmes

```bash
cat > src/Controller/UserController.php << 'EOF'
<?php

namespace App\Controller;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;

class UserController
{
    private $em;

    public function __construct(EntityManagerInterface $em)
    {
        $this->em = $em;
    }

    // PROBLÈME 1: Logique métier dans le controller
    // PROBLÈME 2: Pas de validation
    // PROBLÈME 3: SQL Injection potentielle
    public function search(Request $request): JsonResponse
    {
        $name = $request->query->get('name');

        // SQL Injection!
        $sql = "SELECT * FROM users WHERE name LIKE '%" . $name . "%'";
        $conn = $this->em->getConnection();
        $users = $conn->executeQuery($sql)->fetchAllAssociative();

        // Pas de pagination
        // Pas de limite
        return new JsonResponse($users);
    }

    // PROBLÈME 4: Méthode trop longue
    // PROBLÈME 5: Complexité cyclomatique élevée
    public function register(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        // Validation inline
        if (!isset($data['email'])) {
            return new JsonResponse(['error' => 'Email required'], 400);
        }
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            return new JsonResponse(['error' => 'Invalid email'], 400);
        }
        if (!isset($data['password'])) {
            return new JsonResponse(['error' => 'Password required'], 400);
        }
        if (strlen($data['password']) < 8) {
            return new JsonResponse(['error' => 'Password too short'], 400);
        }
        if (!isset($data['name'])) {
            return new JsonResponse(['error' => 'Name required'], 400);
        }
        if (strlen($data['name']) < 2) {
            return new JsonResponse(['error' => 'Name too short'], 400);
        }
        if (strlen($data['name']) > 100) {
            return new JsonResponse(['error' => 'Name too long'], 400);
        }

        // Vérifier si email existe
        $existing = $this->em->getRepository('App:User')
            ->findOneBy(['email' => $data['email']]);
        if ($existing) {
            return new JsonResponse(['error' => 'Email already exists'], 400);
        }

        // Créer l'utilisateur
        $user = new \App\Entity\User();
        $user->setEmail($data['email']);
        // PROBLÈME 6: Password en clair!
        $user->setPassword($data['password']);
        $user->setName($data['name']);
        $user->setCreatedAt(new \DateTime());

        $this->em->persist($user);
        $this->em->flush();

        // PROBLÈME 7: Retourne le password!
        return new JsonResponse([
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'password' => $user->getPassword(),
            'name' => $user->getName()
        ], 201);
    }

    // PROBLÈME 8: Pas de vérification d'autorisation
    public function delete(int $id): JsonResponse
    {
        $user = $this->em->find('App:User', $id);
        if ($user) {
            $this->em->remove($user);
            $this->em->flush();
        }
        return new JsonResponse(null, 204);
    }
}
EOF
```

### Fichier 2 : Service avec problèmes

```bash
cat > src/Service/ReportService.php << 'EOF'
<?php

namespace App\Service;

use Doctrine\ORM\EntityManagerInterface;

class ReportService
{
    private $em;
    private $mailer;
    private $logger;
    private $cache;
    private $filesystem;

    // PROBLÈME 9: Trop de dépendances (God class)
    public function __construct(
        EntityManagerInterface $em,
        $mailer,
        $logger,
        $cache,
        $filesystem
    ) {
        $this->em = $em;
        $this->mailer = $mailer;
        $this->logger = $logger;
        $this->cache = $cache;
        $this->filesystem = $filesystem;
    }

    // PROBLÈME 10: Méthode fait trop de choses (SRP violation)
    public function generateAndSendReport($userId, $type, $format)
    {
        // Récupérer les données
        $user = $this->em->find('App:User', $userId);
        if (!$user) {
            throw new \Exception('User not found');
        }

        // Générer le rapport selon le type
        $data = [];
        if ($type === 'sales') {
            $data = $this->em->createQuery(
                "SELECT o FROM App:Order o WHERE o.user = '$userId'"
            )->getResult();
        } elseif ($type === 'activity') {
            $data = $this->em->createQuery(
                "SELECT a FROM App:Activity a WHERE a.user = '$userId'"
            )->getResult();
        } elseif ($type === 'full') {
            // ... 50 lignes de plus
        }

        // Formater selon le format
        $content = '';
        if ($format === 'csv') {
            foreach ($data as $item) {
                $content .= implode(',', (array)$item) . "\n";
            }
        } elseif ($format === 'json') {
            $content = json_encode($data);
        } elseif ($format === 'pdf') {
            // ... génération PDF complexe
        }

        // Sauvegarder
        $filename = "/tmp/report_{$userId}_{$type}.{$format}";
        file_put_contents($filename, $content);

        // Envoyer par email
        $this->mailer->send($user->getEmail(), 'Your report', $content);

        // Logger
        $this->logger->info("Report sent to {$user->getEmail()}");

        // Mettre en cache
        $this->cache->set("report_{$userId}_{$type}", $content, 3600);

        return $filename;
    }
}
EOF
```

---

## Partie 2 : Audit avec Claude-Craft (10 min)

### Étape 2.1 : Lancer Claude

```bash
cd ~/audit-demo
claude
```

### Étape 2.2 : Audit de conformité global

```bash
/symfony:check-compliance
```

**Notez le score global :** ___/100

### Étape 2.3 : Audit qualité code

```bash
/symfony:check-code-quality
```

**Remplissez le tableau :**

| Métrique | Valeur | Cible |
|----------|--------|-------|
| Complexité max | | < 10 |
| Lignes max/méthode | | < 20 |
| Dépendances/classe | | < 5 |
| Code dupliqué | | 0% |

### Étape 2.4 : Audit sécurité

```bash
/symfony:check-security
```

**Listez les vulnérabilités trouvées :**

| Sévérité | Issue | Fichier:ligne |
|----------|-------|---------------|
| [CRIT] Critique | | |
| [CRIT] Critique | | |
| [HIGH] Élevé | | |
| [HIGH] Élevé | | |
| [MED] Moyen | | |

---

## Partie 3 : Correction des issues critiques (10 min)

### Étape 3.1 : Corriger la SQL Injection (search)

```bash
"Corrige la vulnérabilité SQL Injection dans UserController::search()
en utilisant une requête paramétrée Doctrine"
```

**Avant :**
```php
$sql = "SELECT * FROM users WHERE name LIKE '%" . $name . "%'";
```

**Après (copiez la correction) :**
```php

```

### Étape 3.2 : Corriger le password en clair

```bash
"Corrige UserController::register() pour :
1. Hasher le password avec password_hash()
2. Ne pas retourner le password dans la réponse"
```

**Copiez la correction :**

### Étape 3.3 : Ajouter le contrôle d'accès

```bash
"Ajoute une vérification d'autorisation dans UserController::delete()
L'utilisateur ne peut supprimer que son propre compte ou être admin"
```

**Copiez la correction :**

### Étape 3.4 : Relancer l'audit

```bash
/symfony:check-security
```

**Nouveau score sécurité :** ___/100

**Amélioration :** +___ points

---

## Partie 4 : Correction qualité (bonus)

### Étape 4.1 : Extraire la validation

```bash
"Refactore UserController::register() en extrayant la validation
dans une classe RegisterUserValidator séparée"
```

### Étape 4.2 : Découper ReportService

```bash
"Refactore ReportService en appliquant SRP :
- ReportDataFetcher (récupère les données)
- ReportFormatter (formate selon le format)
- ReportSender (envoie par email)
- ReportService (orchestre les 3)"
```

### Étape 4.3 : Audit final

```bash
/symfony:check-code-quality
```

---

## Livrables

1. **Rapport d'audit initial** avec scores et issues
2. **3 corrections de sécurité** appliquées
3. **Rapport d'audit final** montrant l'amélioration
4. (Bonus) Refactoring qualité

---

## Critères de réussite

- [ ] Audit complet exécuté
- [ ] SQL Injection corrigée (requête paramétrée)
- [ ] Password hashé (pas en clair)
- [ ] Password non retourné dans la réponse
- [ ] Score sécurité amélioré d'au moins 20 points

---

## Récapitulatif des problèmes à trouver

| # | Type | Description | Sévérité |
|---|------|-------------|----------|
| 1 | Architecture | Logique métier dans controller | Moyen |
| 2 | Qualité | Pas de validation séparée | Moyen |
| 3 | Sécurité | SQL Injection (search) | Critique |
| 4 | Qualité | Méthode trop longue | Moyen |
| 5 | Qualité | Complexité cyclomatique | Moyen |
| 6 | Sécurité | Password en clair | Critique |
| 7 | Sécurité | Password exposé en réponse | Élevé |
| 8 | Sécurité | Pas de contrôle d'accès | Élevé |
| 9 | Architecture | God class (trop de deps) | Moyen |
| 10 | Architecture | SRP violation | Moyen |

---

## Points clés appris

1. Les audits identifient rapidement les problèmes
2. Prioriser : Sécurité critique d'abord
3. Les corrections de sécurité sont souvent simples
4. La qualité s'améliore progressivement

---

**Prochain exercice :** Code Review avec Agent
