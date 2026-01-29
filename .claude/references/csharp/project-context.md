# Project Context - MonProjet

## Overview

- **Project Name**: MonProjet
- **Technology Stack**: .NET 10 LTS, C# 14, Clean Architecture, CQRS, MediatR, Entity Framework Core, xUnit
- **Framework**: .NET 10 LTS (Long-Term Support)
- **Architecture**: Clean Architecture with CQRS

> **Note 2026**: .NET 10 LTS apporte C# 14 avec Extension Members, Null-Conditional Assignment, et améliorations Span<T>.

## Project Structure

```
MonProjet/
├── src/
│   ├── MonProjet.Domain/
│   │   ├── Entities/
│   │   ├── ValueObjects/
│   │   ├── Events/
│   │   ├── Exceptions/
│   │   └── Interfaces/
│   │
│   ├── MonProjet.Application/
│   │   ├── Common/
│   │   │   ├── Behaviors/
│   │   │   ├── Interfaces/
│   │   │   ├── Mappings/
│   │   │   └── Models/
│   │   └── Features/
│   │
│   ├── MonProjet.Infrastructure/
│   │   ├── Data/
│   │   ├── Identity/
│   │   └── Services/
│   │
│   └── MonProjet.WebAPI/
│       ├── Controllers/ or Endpoints/
│       ├── Middleware/
│       └── Program.cs
│
├── tests/
│   ├── MonProjet.Domain.UnitTests/
│   ├── MonProjet.Application.UnitTests/
│   ├── MonProjet.Infrastructure.IntegrationTests/
│   └── MonProjet.WebAPI.FunctionalTests/
│
└── docker-compose.yml
```

## Domain Entities

<!-- List your main domain entities here -->
- Entity1
- Entity2

## External Services

<!-- List external service integrations -->
- Database: PostgreSQL / SQL Server
- Cache: Redis
- Message Queue: RabbitMQ

## Environment Configuration

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=MonProjet;Username=...;Password=..."
  },
  "Jwt": {
    "Issuer": "MonProjet",
    "Audience": "MonProjet-api"
  }
}
```

## Development Commands

```bash
# Build
dotnet build

# Run tests
dotnet test

# Run API
dotnet run --project src/MonProjet.WebAPI

# Add migration
dotnet ef migrations add MigrationName --project src/MonProjet.Infrastructure --startup-project src/MonProjet.WebAPI

# Update database
dotnet ef database update --project src/MonProjet.Infrastructure --startup-project src/MonProjet.WebAPI
```

## Team Conventions

<!-- Add project-specific conventions here -->
- Branch naming: feature/, bugfix/, hotfix/
- Commit format: Conventional Commits
- PR review required before merge
