---
description: Symfony-Befehl generieren
argument-hint: [arguments]
---

# Symfony-Befehl generieren

Du bist ein erfahrener Symfony-Entwickler. Du musst einen vollständigen Symfony-Konsolenbefehl mit Best Practices generieren.

## Argumente
$ARGUMENTS

Argumente:
- Name des Befehls (z.B. `app:users:import`, `app:cache:warmup`)
- (Optional) Kurzbeschreibung

Beispiel: `/symfony:generate-command app:users:import "Benutzer aus CSV-Datei importieren"`

## Plan-Modus

> **Der Plan-Modus ist obligatorisch.** Vor der Ausführung aktiviert Claude den Plan-Modus, um betroffenen Code zu analysieren, einen Implementierungsplan vorzuschlagen und auf Ihre Validierung zu warten, bevor Änderungen vorgenommen werden.

## MISSION

### Schritt 1: Befehl erstellen

#### Dateistruktur

```
src/
└── Command/
    └── {CommandName}Command.php
```

#### Befehlsvorlage

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
    description: '{Befehlsbeschreibung}',
)]
class {CommandName}Command extends Command
{
    public function __construct(
        // Erforderliche Abhängigkeiten injizieren
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
                'Beschreibung des Arguments'
            )
            ->addArgument(
                'arg2',
                InputArgument::OPTIONAL,
                'Optionales Argument',
                'default_value'
            )
            ->addOption(
                'option1',
                'o',
                InputOption::VALUE_REQUIRED,
                'Beschreibung der Option'
            )
            ->addOption(
                'dry-run',
                null,
                InputOption::VALUE_NONE,
                'Ohne Datenänderung ausführen'
            )
            ->addOption(
                'force',
                'f',
                InputOption::VALUE_NONE,
                'Ausführung ohne Bestätigung erzwingen'
            )
            ->setHelp(<<<'HELP'
Der Befehl <info>%command.name%</info> ermöglicht {detaillierte Beschreibung}.

Verwendungsbeispiele:

  <info>php %command.full_name% datei.csv</info>
      Importiert die CSV-Datei

  <info>php %command.full_name% datei.csv --dry-run</info>
      Simuliert den Import ohne Datenänderung

  <info>php %command.full_name% datei.csv -o wert --force</info>
      Erzwungener Import mit Option
HELP
            );
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        // Argumente und Optionen abrufen
        $arg1 = $input->getArgument('arg1');
        $isDryRun = $input->getOption('dry-run');
        $force = $input->getOption('force');

        // Header anzeigen
        $io->title('{Command Name}');

        // Bestätigung anfordern, wenn nicht --force
        if (!$force && !$io->confirm('Möchten Sie fortfahren?', false)) {
            $io->warning('Operation abgebrochen.');
            return Command::SUCCESS;
        }

        if ($isDryRun) {
            $io->note('Dry-Run-Modus aktiviert - es werden keine Änderungen vorgenommen.');
        }

        try {
            // Hauptlogik
            $items = $this->getItemsToProcess($arg1);

            // Fortschrittsbalken
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

            // Zusammenfassung
            $io->success(sprintf('%d Elemente erfolgreich verarbeitet.', $processed));

            if (!empty($errors)) {
                $io->warning(sprintf('%d Fehler aufgetreten.', count($errors)));
                $io->table(
                    ['Element', 'Fehler'],
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
        // Implementierung nach Bedarf
        return [];
    }
}
```

### Schritt 2: Häufige Muster

#### CSV-Import

```php
#[AsCommand(name: 'app:import:csv')]
class ImportCsvCommand extends Command
{
    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $filepath = $input->getArgument('file');

        if (!file_exists($filepath)) {
            $io->error("Datei nicht gefunden: $filepath");
            return Command::FAILURE;
        }

        $handle = fopen($filepath, 'r');
        $headers = fgetcsv($handle);
        $rows = [];

        while (($row = fgetcsv($handle)) !== false) {
            $rows[] = array_combine($headers, $row);
        }
        fclose($handle);

        $io->success(sprintf('%d Zeilen importiert.', count($rows)));
        return Command::SUCCESS;
    }
}
```

#### Daten exportieren

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
                throw new \InvalidArgumentException("Format nicht unterstützt: $format");
        }

        file_put_contents($input->getArgument('output'), $content);
        $io->success('Export abgeschlossen.');
        return Command::SUCCESS;
    }
}
```

#### Cron / Wartung

```php
#[AsCommand(name: 'app:maintenance:cleanup')]
class CleanupCommand extends Command
{
    protected function configure(): void
    {
        $this
            ->addOption('days', 'd', InputOption::VALUE_REQUIRED, 'Anzahl der zu behaltenden Tage', '30')
            ->addOption('dry-run', null, InputOption::VALUE_NONE, 'Simulation');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $days = (int) $input->getOption('days');
        $isDryRun = $input->getOption('dry-run');

        $cutoff = new \DateTimeImmutable("-{$days} days");
        $io->info("Lösche Daten älter als " . $cutoff->format('Y-m-d'));

        $deleted = $this->repository->deleteOlderThan($cutoff, $isDryRun);

        $io->success("{$deleted} Datensätze gelöscht.");
        return Command::SUCCESS;
    }
}
```

### Schritt 3: Befehl testen

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

### Schritt 4: Zusammenfassung

```
══════════════════════════════════════════════════════════════
✅ BEFEHL GENERIERT - {command:name}
══════════════════════════════════════════════════════════════

📁 Erstellte Dateien:
- src/Command/{CommandName}Command.php
- tests/Command/{CommandName}CommandTest.php

🔧 Verwendung:
docker compose exec php php bin/console {command:name} [args] [options]

📌 Verfügbare Optionen:
--dry-run    Simulation ohne Änderung
--force, -f  Ausführung ohne Bestätigung
-v           Verbose-Modus
-vv          Sehr verbose-Modus
-vvv         Debug-Modus

📖 Hilfe:
docker compose exec php php bin/console {command:name} --help
```
