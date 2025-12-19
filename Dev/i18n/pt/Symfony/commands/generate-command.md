---
description: Génération Commande Symfony
argument-hint: [arguments]
---

# Génération Commande Symfony

Tu es un développeur Symfony senior. Tu dois générer une commande console Symfony complète avec les bonnes pratiques.

## Arguments
$ARGUMENTS

Arguments :
- Nom de the command (ex: `app:users:import`, `app:cache:warmup`)
- (Optionnel) Description courte

Exemple : `/symfony:generate-command app:users:import "Import users from CSV file"`

## MISSION

### Step 1 : Créer la Commande

#### Structure du fichier

```
src/
└── Command/
    └── {CommandName}Command.php
```

#### Template de Commande

```php
<?php

declare(strict_types=1);

namespace App\Command;

use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Console\Helper\ProgressBar;

#[AsCommand(
    name: '{command:name}',
    description: '{Description de la commande}',
)]
class {CommandName}Command extends Command
{
    public function __construct(
        // Injecter les dépendances nécessaires
        private readonly SomeService $service,
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addArgument(
                'arg1',
                InputArgument::REQUIRED,
                'Description de l\'argument'
            )
            ->addArgument(
                'arg2',
                InputArgument::OPTIONAL,
                'Argument optionnel',
                'valeur_defaut'
            )
            ->addOption(
                'option1',
                'o',
                InputOption::VALUE_REQUIRED,
                'Description de l\'option'
            )
            ->addOption(
                'dry-run',
                null,
                InputOption::VALUE_NONE,
                'Exécuter sans modifier les données'
            )
            ->addOption(
                'force',
                'f',
                InputOption::VALUE_NONE,
                'Forcer l\'exécution sans confirmation'
            )
            ->setHelp(<<<'HELP'
La commande <info>%command.name%</info> permet de {description détaillée}.

Exemples d'utilisation :

  <info>php %command.full_name% fichier.csv</info>
      Import le fichier CSV

  <info>php %command.full_name% fichier.csv --dry-run</info>
      Simule l'import sans modifier les données

  <info>php %command.full_name% fichier.csv -o valeur --force</info>
      Import forcé avec option
HELP
            );
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        // Récupérer les arguments et options
        $arg1 = $input->getArgument('arg1');
        $isDryRun = $input->getOption('dry-run');
        $force = $input->getOption('force');

        // Afficher le header
        $io->title('{Command Name}');

        // Demander confirmation si pas --force
        if (!$force && !$io->confirm('Voulez-vous continuer ?', false)) {
            $io->warning('Opération annulée.');
            return Command::SUCCESS;
        }

        if ($isDryRun) {
            $io->note('Mode dry-run activé - aucune modification ne sera effectuée.');
        }

        try {
            // Logique principale
            $items = $this->getItemsToProcess($arg1);

            // Progress bar
            $progressBar = new ProgressBar($output, count($items));
            $progressBar->setFormat('debug');
            $progressBar->start();

            $processed = 0;
            $errors = [];

            foreach ($items as $item) {
                try {
                    if (!$isDryRun) {
                        $this->service->process($item);
                    }
                    $processed++;
                } catch (\Exception $e) {
                    $errors[] = ['item' => $item, 'error' => $e->getMessage()];
                }
                $progressBar->advance();
            }

            $progressBar->finish();
            $io->newLine(2);

            // Résumé
            $io->success(sprintf('%d éléments traités avec succès.', $processed));

            if (!empty($errors)) {
                $io->warning(sprintf('%d erreurs rencontrées.', count($errors)));
                $io->table(
                    ['Item', 'Erreur'],
                    array_map(fn($e) => [$e['item'], $e['error']], $errors)
                );
            }

            return Command::SUCCESS;

        } catch (\Exception $e) {
            $io->error($e->getMessage());
            return Command::FAILURE;
        }
    }

    private function getItemsToProcess(string $source): array
    {
        // Implémentation selon le besoin
        return [];
    }
}
```

### Step 2 : Patterns Courants

#### Import CSV

```php
#[AsCommand(name: 'app:import:csv')]
class ImportCsvCommand extends Command
{
    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $filepath = $input->getArgument('file');

        if (!file_exists($filepath)) {
            $io->error("Fichier non trouvé : $filepath");
            return Command::FAILURE;
        }

        $handle = fopen($filepath, 'r');
        $headers = fgetcsv($handle);
        $rows = [];

        while (($row = fgetcsv($handle)) !== false) {
            $rows[] = array_combine($headers, $row);
        }
        fclose($handle);

        $io->success(sprintf('%d lignes importées.', count($rows)));
        return Command::SUCCESS;
    }
}
```

#### Export Data

```php
#[AsCommand(name: 'app:export:users')]
class ExportUsersCommand extends Command
{
    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $format = $input->getOption('format');

        $users = $this->userRepository->findAll();

        switch ($format) {
            case 'json':
                $content = json_encode($users, JSON_PRETTY_PRINT);
                break;
            case 'csv':
                $content = $this->toCsv($users);
                break;
            default:
                throw new \InvalidArgumentException("Format non supporté : $format");
        }

        file_put_contents($input->getArgument('output'), $content);
        $io->success('Export terminé.');
        return Command::SUCCESS;
    }
}
```

#### Cron / Maintenance

```php
#[AsCommand(name: 'app:maintenance:cleanup')]
class CleanupCommand extends Command
{
    protected function configure(): void
    {
        $this
            ->addOption('days', 'd', InputOption::VALUE_REQUIRED, 'Nombre de jours à conserver', '30')
            ->addOption('dry-run', null, InputOption::VALUE_NONE, 'Simulation');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $days = (int) $input->getOption('days');
        $isDryRun = $input->getOption('dry-run');

        $cutoff = new \DateTimeImmutable("-{$days} days");
        $io->info("Suppression des données antérieures à " . $cutoff->format('Y-m-d'));

        $deleted = $this->repository->deleteOlderThan($cutoff, $isDryRun);

        $io->success("{$deleted} enregistrements supprimés.");
        return Command::SUCCESS;
    }
}
```

### Step 3 : Test de la Commande

```php
<?php

declare(strict_types=1);

namespace App\Tests\Command;

use Symfony\Bundle\FrameworkBundle\Console\Application;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\Console\Tester\CommandTester;

class {CommandName}CommandTest extends KernelTestCase
{
    private CommandTester $commandTester;

    protected function setUp(): void
    {
        $kernel = self::bootKernel();
        $application = new Application($kernel);

        $command = $application->find('{command:name}');
        $this->commandTester = new CommandTester($command);
    }

    public function testExecuteWithDryRun(): void
    {
        $this->commandTester->execute([
            'arg1' => 'value',
            '--dry-run' => true,
        ]);

        $this->commandTester->assertCommandIsSuccessful();
        $output = $this->commandTester->getDisplay();
        $this->assertStringContainsString('dry-run', $output);
    }

    public function testExecuteWithMissingArgument(): void
    {
        $this->expectException(\RuntimeException::class);
        $this->commandTester->execute([]);
    }
}
```

### Step 4 : Résumé

```
══════════════════════════════════════════════════════════════
✅ COMMANDE GÉNÉRÉE - {command:name}
══════════════════════════════════════════════════════════════

📁 Fichier créé :
- src/Command/{CommandName}Command.php
- tests/Command/{CommandName}CommandTest.php

🔧 Utilisation :
docker compose exec php php bin/console {command:name} [args] [options]

📌 Options disponibles :
--dry-run    Simulation sans modification
--force, -f  Exécution sans confirmation
-v           Mode verbeux
-vv          Mode très verbeux
-vvv         Mode debug

📖 Aide :
docker compose exec php php bin/console {command:name} --help
```
