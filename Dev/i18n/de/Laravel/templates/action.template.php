<?php

declare(strict_types=1);

namespace App\Application\{Module}\Actions;

use App\Application\{Module}\DTOs\{ActionName}Data;
use App\Domain\{Module}\Contracts\{ModelName}RepositoryInterface;
use App\Domain\{Module}\Models\{ModelName};
use Illuminate\Support\Facades\DB;

/**
 * {ActionDescription}
 *
 * Single-responsibility action class following Clean Architecture.
 */
final class {ActionName}Action
{
    public function __construct(
        private readonly {ModelName}RepositoryInterface $repository,
        // Add other dependencies as needed
    ) {}

    /**
     * Execute the action.
     *
     * @param {ActionName}Data $data The input data for the action
     * @return {ModelName} The resulting model
     *
     * @throws \App\Domain\{Module}\Exceptions\{ModelName}Exception
     */
    public function execute({ActionName}Data $data): {ModelName}
    {
        return DB::transaction(function () use ($data) {
            // 1. Validate business rules
            $this->validateBusinessRules($data);

            // 2. Perform the action
            ${modelName} = $this->performAction($data);

            // 3. Dispatch domain events if needed
            // event(new {ModelName}Created(${modelName}));

            return ${modelName};
        });
    }

    /**
     * Validate business rules before executing the action.
     */
    private function validateBusinessRules({ActionName}Data $data): void
    {
        // Add business rule validations
        // throw new BusinessRuleViolationException('...');
    }

    /**
     * Perform the main action logic.
     */
    private function performAction({ActionName}Data $data): {ModelName}
    {
        // Implementation depends on the action type:

        // For Create actions:
        // return {ModelName}::create([
        //     'field' => $data->field,
        // ]);

        // For Update actions:
        // ${modelName} = $this->repository->findOrFail($data->id);
        // ${modelName}->update([...]);
        // return ${modelName};

        // For Domain operations:
        // ${modelName} = $this->repository->findOrFail($data->id);
        // ${modelName}->performOperation();
        // return ${modelName};
    }
}
