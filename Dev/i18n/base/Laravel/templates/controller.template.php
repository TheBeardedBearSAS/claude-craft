<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Application\{Module}\Actions\Create{ModelName}Action;
use App\Application\{Module}\Actions\Update{ModelName}Action;
use App\Application\{Module}\DTOs\Create{ModelName}Data;
use App\Application\{Module}\DTOs\Update{ModelName}Data;
use App\Domain\{Module}\Contracts\{ModelName}RepositoryInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\{ModelName}\Store{ModelName}Request;
use App\Http\Requests\{ModelName}\Update{ModelName}Request;
use App\Http\Resources\{ModelName}Resource;
use App\Models\{ModelName};
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * {ModelName} API Controller
 *
 * Handles HTTP requests for {ModelName} resources.
 * Follows thin controller pattern - delegates logic to Actions.
 */
final class {ModelName}Controller extends Controller
{
    public function __construct(
        private readonly {ModelName}RepositoryInterface $repository,
        private readonly Create{ModelName}Action $createAction,
        private readonly Update{ModelName}Action $updateAction,
    ) {
        $this->authorizeResource({ModelName}::class, '{modelName}');
    }

    /**
     * Display a listing of {modelNames}.
     *
     * @return AnonymousResourceCollection<{ModelName}Resource>
     */
    public function index(): AnonymousResourceCollection
    {
        ${modelNames} = $this->repository->paginateForUser(
            userId: auth()->id(),
            perPage: request()->integer('per_page', 15),
        );

        return {ModelName}Resource::collection(${modelNames});
    }

    /**
     * Store a newly created {modelName}.
     */
    public function store(Store{ModelName}Request $request): JsonResponse
    {
        ${modelName} = $this->createAction->execute(
            Create{ModelName}Data::from($request->validated())
        );

        return {ModelName}Resource::make(${modelName})
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display the specified {modelName}.
     */
    public function show({ModelName} ${modelName}): {ModelName}Resource
    {
        ${modelName}->load(['relationship1', 'relationship2']);

        return {ModelName}Resource::make(${modelName});
    }

    /**
     * Update the specified {modelName}.
     */
    public function update(
        Update{ModelName}Request $request,
        {ModelName} ${modelName}
    ): {ModelName}Resource {
        ${modelName} = $this->updateAction->execute(
            ${modelName},
            Update{ModelName}Data::from($request->validated())
        );

        return {ModelName}Resource::make(${modelName});
    }

    /**
     * Remove the specified {modelName}.
     */
    public function destroy({ModelName} ${modelName}): JsonResponse
    {
        ${modelName}->delete();

        return response()->json(null, 204);
    }
}
