<?php

declare(strict_types=1);

use App\Models\{ModelName};
use App\Models\User;

describe('{ModelName}Controller', function () {
    // =========================================================================
    // INDEX
    // =========================================================================

    describe('GET /api/{modelNames}', function () {
        it('returns paginated list for authenticated user', function () {
            $user = User::factory()->create();
            {ModelName}::factory()->for($user)->count(3)->create();
            {ModelName}::factory()->count(2)->create(); // Other users

            $response = $this->actingAs($user)
                ->getJson('/api/{modelNames}');

            $response->assertOk()
                ->assertJsonCount(3, 'data')
                ->assertJsonStructure([
                    'data' => [
                        '*' => ['id', 'name', 'status', 'created_at'],
                    ],
                    'meta' => ['current_page', 'per_page', 'total'],
                    'links',
                ]);
        });

        it('requires authentication', function () {
            $this->getJson('/api/{modelNames}')
                ->assertUnauthorized();
        });

        it('supports pagination parameters', function () {
            $user = User::factory()->create();
            {ModelName}::factory()->for($user)->count(25)->create();

            $response = $this->actingAs($user)
                ->getJson('/api/{modelNames}?per_page=10&page=2');

            $response->assertOk()
                ->assertJsonCount(10, 'data')
                ->assertJsonPath('meta.current_page', 2);
        });
    });

    // =========================================================================
    // STORE
    // =========================================================================

    describe('POST /api/{modelNames}', function () {
        it('creates resource with valid data', function () {
            $user = User::factory()->create();

            $response = $this->actingAs($user)
                ->postJson('/api/{modelNames}', [
                    'name' => 'Test {ModelName}',
                    'description' => 'Test description',
                ]);

            $response->assertCreated()
                ->assertJson([
                    'data' => [
                        'name' => 'Test {ModelName}',
                        'status' => 'draft',
                    ],
                ]);

            $this->assertDatabaseHas('{modelNames}', [
                'user_id' => $user->id,
                'name' => 'Test {ModelName}',
            ]);
        });

        it('validates required fields', function () {
            $user = User::factory()->create();

            $this->actingAs($user)
                ->postJson('/api/{modelNames}', [])
                ->assertUnprocessable()
                ->assertJsonValidationErrors(['name']);
        });

        it('validates field constraints', function () {
            $user = User::factory()->create();

            $this->actingAs($user)
                ->postJson('/api/{modelNames}', [
                    'name' => str_repeat('a', 256), // Too long
                ])
                ->assertUnprocessable()
                ->assertJsonValidationErrors(['name']);
        });
    });

    // =========================================================================
    // SHOW
    // =========================================================================

    describe('GET /api/{modelNames}/{id}', function () {
        it('returns resource for owner', function () {
            $user = User::factory()->create();
            ${modelName} = {ModelName}::factory()->for($user)->create();

            $response = $this->actingAs($user)
                ->getJson("/api/{modelNames}/{${modelName}->id}");

            $response->assertOk()
                ->assertJson([
                    'data' => [
                        'id' => ${modelName}->id,
                        'name' => ${modelName}->name,
                    ],
                ]);
        });

        it('returns 403 for non-owner', function () {
            $user = User::factory()->create();
            $other = User::factory()->create();
            ${modelName} = {ModelName}::factory()->for($other)->create();

            $this->actingAs($user)
                ->getJson("/api/{modelNames}/{${modelName}->id}")
                ->assertForbidden();
        });

        it('returns 404 for non-existent resource', function () {
            $user = User::factory()->create();

            $this->actingAs($user)
                ->getJson('/api/{modelNames}/99999')
                ->assertNotFound();
        });
    });

    // =========================================================================
    // UPDATE
    // =========================================================================

    describe('PUT /api/{modelNames}/{id}', function () {
        it('updates resource with valid data', function () {
            $user = User::factory()->create();
            ${modelName} = {ModelName}::factory()->for($user)->create();

            $response = $this->actingAs($user)
                ->putJson("/api/{modelNames}/{${modelName}->id}", [
                    'name' => 'Updated Name',
                ]);

            $response->assertOk()
                ->assertJson([
                    'data' => ['name' => 'Updated Name'],
                ]);

            expect(${modelName}->fresh()->name)->toBe('Updated Name');
        });

        it('returns 403 for non-owner', function () {
            $user = User::factory()->create();
            $other = User::factory()->create();
            ${modelName} = {ModelName}::factory()->for($other)->create();

            $this->actingAs($user)
                ->putJson("/api/{modelNames}/{${modelName}->id}", [
                    'name' => 'Hacked',
                ])
                ->assertForbidden();
        });

        it('validates update data', function () {
            $user = User::factory()->create();
            ${modelName} = {ModelName}::factory()->for($user)->create();

            $this->actingAs($user)
                ->putJson("/api/{modelNames}/{${modelName}->id}", [
                    'name' => '',
                ])
                ->assertUnprocessable()
                ->assertJsonValidationErrors(['name']);
        });
    });

    // =========================================================================
    // DESTROY
    // =========================================================================

    describe('DELETE /api/{modelNames}/{id}', function () {
        it('deletes resource for owner', function () {
            $user = User::factory()->create();
            ${modelName} = {ModelName}::factory()->for($user)->create();

            $this->actingAs($user)
                ->deleteJson("/api/{modelNames}/{${modelName}->id}")
                ->assertNoContent();

            $this->assertSoftDeleted('{modelNames}', ['id' => ${modelName}->id]);
        });

        it('returns 403 for non-owner', function () {
            $user = User::factory()->create();
            $other = User::factory()->create();
            ${modelName} = {ModelName}::factory()->for($other)->create();

            $this->actingAs($user)
                ->deleteJson("/api/{modelNames}/{${modelName}->id}")
                ->assertForbidden();
        });
    });
});

// =========================================================================
// MODEL UNIT TESTS
// =========================================================================

describe('{ModelName} Model', function () {
    it('creates with draft status by default', function () {
        ${modelName} = {ModelName}::factory()->create();

        expect(${modelName}->status)->toBe({ModelName}Status::Draft);
    });

    it('can be activated when valid', function () {
        ${modelName} = {ModelName}::factory()->draft()->create([
            'name' => 'Valid Name',
        ]);

        ${modelName}->activate();

        expect(${modelName}->status)->toBe({ModelName}Status::Active);
    });

    it('cannot be activated when already active', function () {
        ${modelName} = {ModelName}::factory()->active()->create();

        expect(fn () => ${modelName}->activate())
            ->toThrow({ModelName}Exception::class);
    });

    it('can be deactivated', function () {
        ${modelName} = {ModelName}::factory()->active()->create();

        ${modelName}->deactivate();

        expect(${modelName}->status)->toBe({ModelName}Status::Inactive);
    });

    it('dispatches event when created', function () {
        Event::fake([{ModelName}Created::class]);

        ${modelName} = {ModelName}::createNew([
            'user_id' => User::factory()->create()->id,
            'name' => 'Test',
        ]);

        Event::assertDispatched({ModelName}Created::class, function ($event) use (${modelName}) {
            return $event->{modelName}->id === ${modelName}->id;
        });
    });
});
