---
description: Generate a Laravel controller following best practices
argument-hint: <ControllerName> [--api] [--resource] [--model=ModelName]
---

# Generate Laravel Controller

You are a Laravel expert. Your mission is to generate a controller following Laravel best practices.

## Arguments

$ARGUMENTS

- `ControllerName`: Name of the controller (e.g., OrderController)
- `--api`: Generate API controller (JSON responses)
- `--resource`: Generate resourceful controller with all CRUD methods
- `--model=ModelName`: Associated model for route model binding

## Plan Mode

> **Plan mode is mandatory.** Before executing, Claude activates plan mode to analyze impacted code, propose an implementation plan, and wait for your validation before making any changes.

## Generation Process

### 1. Analyze Requirements

Determine controller type:
- **API Resource Controller**: Full CRUD for API
- **Single Action Controller**: One specific action
- **Web Controller**: Traditional web with views

### 2. Generate Controller

#### API Resource Controller

```php
<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\{ModelName}\Store{ModelName}Request;
use App\Http\Requests\{ModelName}\Update{ModelName}Request;
use App\Http\Resources\{ModelName}Resource;
use App\Models\{ModelName};
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

final class {ModelName}Controller extends Controller
{
    public function __construct()
    {
        $this->authorizeResource({ModelName}::class, '{modelName}');
    }

    /**
     * Display a listing of the resource.
     */
    public function index(): AnonymousResourceCollection
    {
        ${modelNames} = {ModelName}::query()
            ->with(['relationship']) // Add eager loading
            ->latest()
            ->paginate();

        return {ModelName}Resource::collection(${modelNames});
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Store{ModelName}Request $request): JsonResponse
    {
        ${modelName} = {ModelName}::create($request->validated());

        return {ModelName}Resource::make(${modelName})
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display the specified resource.
     */
    public function show({ModelName} ${modelName}): {ModelName}Resource
    {
        ${modelName}->load(['relationship']); // Add eager loading

        return {ModelName}Resource::make(${modelName});
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(
        Update{ModelName}Request $request,
        {ModelName} ${modelName}
    ): {ModelName}Resource {
        ${modelName}->update($request->validated());

        return {ModelName}Resource::make(${modelName});
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy({ModelName} ${modelName}): JsonResponse
    {
        ${modelName}->delete();

        return response()->json(null, 204);
    }
}
```

#### Single Action Controller

```php
<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\{ActionName}Request;
use App\Http\Resources\{ModelName}Resource;
use App\Models\{ModelName};
use Illuminate\Http\JsonResponse;

final class {ActionName}Controller extends Controller
{
    public function __invoke(
        {ActionName}Request $request,
        {ModelName} ${modelName}
    ): JsonResponse {
        $this->authorize('{action}', ${modelName});

        // Perform action
        ${modelName}->{action}();

        return response()->json([
            'message' => '{Action} successful',
            'data' => {ModelName}Resource::make(${modelName}),
        ]);
    }
}
```

### 3. Generate Form Requests

#### Store Request

```php
<?php

declare(strict_types=1);

namespace App\Http\Requests\{ModelName};

use Illuminate\Foundation\Http\FormRequest;

final class Store{ModelName}Request extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Authorization handled in controller
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            // Add more validation rules
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'The name is required.',
        ];
    }
}
```

#### Update Request

```php
<?php

declare(strict_types=1);

namespace App\Http\Requests\{ModelName};

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class Update{ModelName}Request extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
```

### 4. Generate API Resource

```php
<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class {ModelName}Resource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'relationship' => RelationshipResource::make($this->whenLoaded('relationship')),
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
```

### 5. Generate Policy

```php
<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\{ModelName};
use App\Models\User;

final class {ModelName}Policy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, {ModelName} ${modelName}): bool
    {
        return $user->id === ${modelName}->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, {ModelName} ${modelName}): bool
    {
        return $user->id === ${modelName}->user_id;
    }

    public function delete(User $user, {ModelName} ${modelName}): bool
    {
        return $user->id === ${modelName}->user_id;
    }
}
```

### 6. Generate Routes

```php
// routes/api.php

use App\Http\Controllers\Api\{ModelName}Controller;

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('{modelNames}', {ModelName}Controller::class);
});
```

### 7. Generate Tests

```php
<?php
// tests/Feature/Http/Controllers/{ModelName}ControllerTest.php

use App\Models\{ModelName};
use App\Models\User;

describe('{ModelName}Controller', function () {
    describe('GET /api/{modelNames}', function () {
        it('returns paginated list for authenticated user', function () {
            $user = User::factory()->create();
            {ModelName}::factory()->for($user)->count(3)->create();

            $response = $this->actingAs($user)
                ->getJson('/api/{modelNames}');

            $response->assertOk()
                ->assertJsonCount(3, 'data')
                ->assertJsonStructure([
                    'data' => [
                        '*' => ['id', 'name', 'created_at'],
                    ],
                    'meta' => ['current_page', 'total'],
                ]);
        });

        it('requires authentication', function () {
            $this->getJson('/api/{modelNames}')
                ->assertUnauthorized();
        });
    });

    describe('POST /api/{modelNames}', function () {
        it('creates resource with valid data', function () {
            $user = User::factory()->create();

            $response = $this->actingAs($user)
                ->postJson('/api/{modelNames}', [
                    'name' => 'Test Name',
                ]);

            $response->assertCreated()
                ->assertJson([
                    'data' => ['name' => 'Test Name'],
                ]);
        });

        it('validates required fields', function () {
            $user = User::factory()->create();

            $this->actingAs($user)
                ->postJson('/api/{modelNames}', [])
                ->assertUnprocessable()
                ->assertJsonValidationErrors(['name']);
        });
    });

    // Add more tests for show, update, destroy
});
```

## Files Generated

After running, you should have:

```
app/
├── Http/
│   ├── Controllers/Api/
│   │   └── {ModelName}Controller.php
│   ├── Requests/{ModelName}/
│   │   ├── Store{ModelName}Request.php
│   │   └── Update{ModelName}Request.php
│   └── Resources/
│       └── {ModelName}Resource.php
├── Policies/
│   └── {ModelName}Policy.php
routes/
└── api.php (updated)
tests/
└── Feature/Http/Controllers/
    └── {ModelName}ControllerTest.php
```

## Post-Generation Checklist

- [ ] Review and customize validation rules
- [ ] Add proper relationships to Resource
- [ ] Customize Policy authorization logic
- [ ] Register Policy in AuthServiceProvider
- [ ] Run tests to verify functionality
- [ ] Add rate limiting if needed
