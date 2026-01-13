<?php

declare(strict_types=1);

namespace App\Domain\{Module}\Models;

use App\Domain\{Module}\Events\{ModelName}Created;
use App\Domain\{Module}\Events\{ModelName}Updated;
use App\Domain\{Module}\Exceptions\{ModelName}Exception;
use App\Domain\{Module}\{ModelName}Status;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;

/**
 * {ModelName} Domain Model
 *
 * Represents a {modelDescription} in the system.
 *
 * @property int $id
 * @property int $user_id
 * @property {ModelName}Status $status
 * @property string $name
 * @property string|null $description
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * @property \Carbon\Carbon|null $deleted_at
 *
 * @property-read \App\Models\User $user
 * @property-read \Illuminate\Database\Eloquent\Collection<{RelatedModel}> ${relatedModels}
 */
class {ModelName} extends Model
{
    use HasFactory;
    use SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'status',
        'name',
        'description',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'status' => {ModelName}Status::class,
        'metadata' => 'array',
    ];

    /**
     * The default attributes.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'status' => 'draft',
    ];

    // =========================================================================
    // RELATIONSHIPS
    // =========================================================================

    /**
     * Get the user that owns the {modelName}.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the {relatedModels} for the {modelName}.
     */
    public function {relatedModels}(): HasMany
    {
        return $this->hasMany({RelatedModel}::class);
    }

    // =========================================================================
    // SCOPES
    // =========================================================================

    /**
     * Scope a query to only include {modelNames} for a specific user.
     */
    public function scopeForUser(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope a query to only include {modelNames} with a specific status.
     */
    public function scopeWithStatus(Builder $query, {ModelName}Status $status): Builder
    {
        return $query->where('status', $status);
    }

    /**
     * Scope a query to only include active {modelNames}.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', {ModelName}Status::Active);
    }

    // =========================================================================
    // ACCESSORS & MUTATORS
    // =========================================================================

    /**
     * Get the formatted name.
     */
    protected function formattedName(): Attribute
    {
        return Attribute::get(
            fn () => ucfirst($this->name)
        );
    }

    // =========================================================================
    // DOMAIN METHODS
    // =========================================================================

    /**
     * Create a new {modelName}.
     *
     * @param array<string, mixed> $attributes
     */
    public static function createNew(array $attributes): static
    {
        $model = new static($attributes);
        $model->status = {ModelName}Status::Draft;
        $model->save();

        event(new {ModelName}Created($model));

        return $model;
    }

    /**
     * Activate the {modelName}.
     *
     * @throws {ModelName}Exception
     */
    public function activate(): void
    {
        if (!$this->canBeActivated()) {
            throw {ModelName}Exception::cannotBeActivated($this);
        }

        $this->status = {ModelName}Status::Active;
        $this->save();

        event(new {ModelName}Updated($this));
    }

    /**
     * Deactivate the {modelName}.
     */
    public function deactivate(): void
    {
        $this->status = {ModelName}Status::Inactive;
        $this->save();

        event(new {ModelName}Updated($this));
    }

    /**
     * Check if the {modelName} can be activated.
     */
    public function canBeActivated(): bool
    {
        return $this->status === {ModelName}Status::Draft
            && $this->isValid();
    }

    /**
     * Check if the {modelName} is valid.
     */
    public function isValid(): bool
    {
        return !empty($this->name);
    }

    /**
     * Check if the {modelName} is active.
     */
    public function isActive(): bool
    {
        return $this->status === {ModelName}Status::Active;
    }
}
