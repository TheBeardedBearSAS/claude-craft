# Generación de Comando Symfony

Eres un desarrollador senior de Symfony. Debes generar un comando de consola Symfony completo con las mejores prácticas.

## Argumentos
$ARGUMENTS

Argumentos:
- Nombre del comando (ej: `app:users:import`, `app:cache:warmup`)
- (Opcional) Descripción corta

Ejemplo: `/symfony:generate-command app:users:import "Import users from CSV file"`

## MISIÓN

### Paso 1: Crear el Comando

#### Estructura del archivo

```
src/
└── Command/
    └── {CommandName}Command.php
```

#### Template de Comando

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
    description: '{Descripción del comando}',
)]
class {CommandName}Command extends Command
{
    public function __construct(
        // Inyectar las dependencias necesarias
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
                'Descripción del argumento'
            )
            ->addArgument(
                'arg2',
                InputArgument::OPTIONAL,
                'Argumento opcional',
                'valor_por_defecto'
            )
            ->addOption(
                'option1',
                'o',
                InputOption::VALUE_REQUIRED,
                'Descripción de la opción'
            )
            ->addOption(
                'dry-run',
                null,
                InputOption::VALUE_NONE,
                'Ejecutar sin modificar los datos'
            )
            ->addOption(
                'force',
                'f',
                InputOption::VALUE_NONE,
                'Forzar la ejecución sin confirmación'
            )
            ->setHelp(<<<'HELP'
El comando <info>%command.name%</info> permite {descripción detallada}.

Ejemplos de uso:

  <info>php %command.full_name% archivo.csv</info>
      Importa el archivo CSV

  <info>php %command.full_name% archivo.csv --dry-run</info>
      Simula la importación sin modificar los datos

  <info>php %command.full_name% archivo.csv -o valor --force</info>
      Importación forzada con opción
HELP
            );
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        // Recuperar argumentos y opciones
        $arg1 = $input->getArgument('arg1');
        $isDryRun = $input->getOption('dry-run');
        $force = $input->getOption('force');

        // Mostrar el header
        $io->title('{Command Name}');

        // Pedir confirmación si no --force
        if (!$force && !$io->confirm('¿Desea continuar?', false)) {
            $io->warning('Operación cancelada.');
            return Command::SUCCESS;
        }

        if ($isDryRun) {
            $io->note('Modo dry-run activado - no se efectuará ninguna modificación.');
        }

        try {
            // Lógica principal
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

            // Resumen
            $io->success(sprintf('%d elementos procesados con éxito.', $processed));

            if (!empty($errors)) {
                $io->warning(sprintf('%d errores encontrados.', count($errors)));
                $io->table(
                    ['Item', 'Error'],
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
        // Implementación según la necesidad
        return [];
    }
}
```

### Paso 2: Patrones Comunes

#### Importación CSV

```php
#[AsCommand(name: 'app:import:csv')]
class ImportCsvCommand extends Command
{
    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $filepath = $input->getArgument('file');

        if (!file_exists($filepath)) {
            $io->error("Archivo no encontrado: $filepath");
            return Command::FAILURE;
        }

        $handle = fopen($filepath, 'r');
        $headers = fgetcsv($handle);
        $rows = [];

        while (($row = fgetcsv($handle)) !== false) {
            $rows[] = array_combine($headers, $row);
        }
        fclose($handle);

        $io->success(sprintf('%d líneas importadas.', count($rows)));
        return Command::SUCCESS;
    }
}
```

#### Exportación de Datos

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
                throw new \InvalidArgumentException("Formato no soportado: $format");
        }

        file_put_contents($input->getArgument('output'), $content);
        $io->success('Exportación terminada.');
        return Command::SUCCESS;
    }
}
```

#### Cron / Mantenimiento

```php
#[AsCommand(name: 'app:maintenance:cleanup')]
class CleanupCommand extends Command
{
    protected function configure(): void
    {
        $this
            ->addOption('days', 'd', InputOption::VALUE_REQUIRED, 'Número de días a conservar', '30')
            ->addOption('dry-run', null, InputOption::VALUE_NONE, 'Simulación');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $days = (int) $input->getOption('days');
        $isDryRun = $input->getOption('dry-run');

        $cutoff = new \DateTimeImmutable("-{$days} days");
        $io->info("Eliminación de datos anteriores a " . $cutoff->format('Y-m-d'));

        $deleted = $this->repository->deleteOlderThan($cutoff, $isDryRun);

        $io->success("{$deleted} registros eliminados.");
        return Command::SUCCESS;
    }
}
```

### Paso 3: Test del Comando

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

### Paso 4: Resumen

```
══════════════════════════════════════════════════════════════
✅ COMANDO GENERADO - {command:name}
══════════════════════════════════════════════════════════════

📁 Archivo creado:
- src/Command/{CommandName}Command.php
- tests/Command/{CommandName}CommandTest.php

🔧 Uso:
docker compose exec php php bin/console {command:name} [args] [options]

📌 Opciones disponibles:
--dry-run    Simulación sin modificación
--force, -f  Ejecución sin confirmación
-v           Modo verboso
-vv          Modo muy verboso
-vvv         Modo debug

📖 Ayuda:
docker compose exec php php bin/console {command:name} --help
```
