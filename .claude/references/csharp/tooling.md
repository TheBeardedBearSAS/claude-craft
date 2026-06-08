# C#/.NET Tooling and Development Environment

## Essential Tools

### .NET CLI

```bash
# Project management
dotnet new sln -n MySolution
dotnet new webapi -n MyApi
dotnet sln add src/MyApi/MyApi.csproj

# Build and run
dotnet build
dotnet run --project src/MyApi
dotnet watch run --project src/MyApi  # Hot reload

# Package management
dotnet add package MediatR
dotnet add package FluentValidation
dotnet list package --outdated

# Database migrations (EF Core)
dotnet ef migrations add InitialCreate --project src/Infrastructure --startup-project src/WebAPI
dotnet ef database update --project src/Infrastructure --startup-project src/WebAPI

# Testing
dotnet test
dotnet test --filter "Category=Unit"
dotnet test --collect:"XPlat Code Coverage"

# Publishing
dotnet publish -c Release -o ./publish
dotnet publish -c Release --self-contained -r linux-x64
```

### Essential NuGet Packages

```xml
<!-- Clean Architecture essentials -->
<ItemGroup>
  <!-- CQRS & Mediator
       MediatR 13+ is commercial (RPL-1.5, Lucky Penny Software, July 2025).
       Community Edition free for <$5M revenue; commercial license required otherwise.
       Open-source alternatives: Wolverine (source generators, high-perf), Brighter, ConduitR, LiteBus.
       Current stable: MediatR 14.x -->
  <PackageReference Include="MediatR" Version="14.*" />

  <!-- Validation (FluentValidation 12.x requires .NET 8+, drops netstandard2.0) -->
  <PackageReference Include="FluentValidation" Version="12.*" />
  <PackageReference Include="FluentValidation.DependencyInjectionExtensions" Version="12.*" />

  <!-- Object mapping
       AutoMapper v15+ is commercial (RPL-1.5, Lucky Penny Software, July 2025). Current: 16.1.1.
       v13.0.1 is the last MIT-licensed release — pin to 13.* only if you require MIT compatibility.
       Recommended open-source alternatives: Riok.Mapperly (source generator, Apache-2.0, adopted by ABP)
       or Mapster (MIT). Mapperly generates zero-reflection code at build time with superior performance.
       Pin below uses v13 for MIT compatibility; replace with Riok.Mapperly for new projects. -->
  <PackageReference Include="AutoMapper" Version="13.*" />
  <PackageReference Include="AutoMapper.Extensions.Microsoft.DependencyInjection" Version="12.*" />
  <!-- Preferred open-source alternative (uncomment to use instead of AutoMapper): -->
  <!-- <PackageReference Include="Riok.Mapperly" Version="3.*" /> -->

  <!-- Guard clauses -->
  <PackageReference Include="Ardalis.GuardClauses" Version="4.*" />
</ItemGroup>

<!-- Entity Framework Core 10 (LTS, nov. 2025)
     Nouveautés EF 10 : LeftJoin/RightJoin LINQ natifs, JSON amélioré (filtrage + ExecuteUpdate),
     bulk ExecuteUpdate/ExecuteDelete avec delegate setters, vector search (SQL Server 2025 / Azure SQL).
     Native AOT : expérimental — voir architecture.md § Native AOT. -->
<ItemGroup>
  <PackageReference Include="Microsoft.EntityFrameworkCore" Version="10.*" />
  <PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="10.*" />
  <PackageReference Include="Microsoft.EntityFrameworkCore.Tools" Version="10.*">
    <PrivateAssets>all</PrivateAssets>
    <IncludeAssets>runtime; build; native; contentfiles; analyzers</IncludeAssets>
  </PackageReference>
  <PackageReference Include="Npgsql.EntityFrameworkCore.PostgreSQL" Version="10.*" />
  <!-- Vector search PostgreSQL (pgvector) -->
  <!-- <PackageReference Include="Pgvector.EntityFrameworkCore" Version="0.*" /> -->
</ItemGroup>

<!-- Testing -->
<ItemGroup>
  <!-- xUnit v3 (3.x) is the recommended runner for .NET 10; v2 is legacy -->
  <PackageReference Include="xunit.v3" Version="3.*" />
  <PackageReference Include="xunit.runner.visualstudio" Version="3.*">
    <PrivateAssets>all</PrivateAssets>
  </PackageReference>
  <PackageReference Include="Moq" Version="4.*" />
  <!-- FluentAssertions 8.x requires a COMMERCIAL license for commercial use (~$130/dev/yr).
       Apache-2.0 alternative: AwesomeAssertions (drop-in fork). v7 remains Apache-2.0. -->
  <PackageReference Include="FluentAssertions" Version="8.*" />
  <PackageReference Include="Bogus" Version="35.*" />
  <PackageReference Include="Testcontainers" Version="4.*" />
</ItemGroup>

<!-- API Documentation (.NET 10 : OpenAPI natif + Scalar UI) -->
<ItemGroup>
  <PackageReference Include="Microsoft.AspNetCore.OpenApi" Version="10.*" />
  <PackageReference Include="Scalar.AspNetCore" Version="2.*" />
</ItemGroup>

<!-- Resilience & Observability -->
<ItemGroup>
  <PackageReference Include="Polly" Version="8.*" />
  <PackageReference Include="Serilog.AspNetCore" Version="8.*" />
  <PackageReference Include="OpenTelemetry.Extensions.Hosting" Version="1.*" />
  <PackageReference Include="OpenTelemetry.Instrumentation.AspNetCore" Version="1.*" />
</ItemGroup>
```

## Code Quality Tools

### .editorconfig

```ini
# EditorConfig - place at solution root
root = true

[*]
indent_style = space
indent_size = 4
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.cs]
# Namespace preferences
csharp_style_namespace_declarations = file_scoped:warning

# var preferences
csharp_style_var_for_built_in_types = false:suggestion
csharp_style_var_when_type_is_apparent = true:suggestion
csharp_style_var_elsewhere = false:suggestion

# Expression-bodied members
csharp_style_expression_bodied_methods = when_on_single_line:suggestion
csharp_style_expression_bodied_constructors = false:suggestion
csharp_style_expression_bodied_properties = true:suggestion
csharp_style_expression_bodied_accessors = true:suggestion

# Pattern matching
csharp_style_pattern_matching_over_is_with_cast_check = true:warning
csharp_style_pattern_matching_over_as_with_null_check = true:warning

# Null checking
csharp_style_throw_expression = true:suggestion
csharp_style_conditional_delegate_call = true:suggestion

# Code block preferences
csharp_prefer_braces = when_multiline:warning

# Using directive placement
csharp_using_directive_placement = outside_namespace:warning

# Modifier preferences
dotnet_style_require_accessibility_modifiers = for_non_interface_members:warning

# Naming conventions
dotnet_naming_rule.private_fields_should_be_camel_case.severity = warning
dotnet_naming_rule.private_fields_should_be_camel_case.symbols = private_fields
dotnet_naming_rule.private_fields_should_be_camel_case.style = camel_case_underscore

dotnet_naming_symbols.private_fields.applicable_kinds = field
dotnet_naming_symbols.private_fields.applicable_accessibilities = private

dotnet_naming_style.camel_case_underscore.capitalization = camel_case
dotnet_naming_style.camel_case_underscore.required_prefix = _

# Analyzer settings
dotnet_diagnostic.CA1062.severity = warning  # Validate arguments of public methods
dotnet_diagnostic.CA1303.severity = none     # Do not pass literals as localized parameters
dotnet_diagnostic.CA1848.severity = suggestion  # Use LoggerMessage delegates
dotnet_diagnostic.CA2007.severity = warning  # ConfigureAwait
dotnet_diagnostic.CS8618.severity = warning  # Non-nullable property must be initialized

[*.{json,yml,yaml}]
indent_size = 2

[*.md]
trim_trailing_whitespace = false
```

### Directory.Build.props

```xml
<!-- Place at solution root for shared project settings -->
<Project>
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
    <AnalysisLevel>latest-recommended</AnalysisLevel>
    <EnforceCodeStyleInBuild>true</EnforceCodeStyleInBuild>
  </PropertyGroup>

  <PropertyGroup>
    <Authors>Your Team</Authors>
    <Company>Your Company</Company>
    <Copyright>Copyright (c) 2026</Copyright>
    <RepositoryType>git</RepositoryType>
  </PropertyGroup>

  <!-- Central package version management -->
  <PropertyGroup>
    <ManagePackageVersionsCentrally>true</ManagePackageVersionsCentrally>
  </PropertyGroup>

  <!-- Code analysis -->
  <ItemGroup>
    <PackageReference Include="Microsoft.CodeAnalysis.NetAnalyzers" Version="10.*">
      <PrivateAssets>all</PrivateAssets>
      <IncludeAssets>runtime; build; native; contentfiles; analyzers</IncludeAssets>
    </PackageReference>
    <PackageReference Include="StyleCop.Analyzers" Version="1.2.*">
      <PrivateAssets>all</PrivateAssets>
    </PackageReference>
    <PackageReference Include="SonarAnalyzer.CSharp" Version="9.*">
      <PrivateAssets>all</PrivateAssets>
    </PackageReference>
  </ItemGroup>
</Project>
```

### Directory.Packages.props

```xml
<!-- Central Package Management - place at solution root -->
<Project>
  <PropertyGroup>
    <ManagePackageVersionsCentrally>true</ManagePackageVersionsCentrally>
  </PropertyGroup>

  <ItemGroup>
    <!-- ASP.NET Core (.NET 10 LTS — 10.0.8 latest patch) -->
    <PackageVersion Include="Microsoft.AspNetCore.OpenApi" Version="10.0.8" />

    <!-- Entity Framework Core (10.0.8 — aligned with .NET 10 LTS) -->
    <PackageVersion Include="Microsoft.EntityFrameworkCore" Version="10.0.8" />
    <PackageVersion Include="Microsoft.EntityFrameworkCore.SqlServer" Version="10.0.8" />
    <PackageVersion Include="Microsoft.EntityFrameworkCore.Tools" Version="10.0.8" />
    <PackageVersion Include="Npgsql.EntityFrameworkCore.PostgreSQL" Version="10.0.8" />

    <!-- Application Layer -->
    <!-- MediatR 13+ = commercial (RPL-1.5). Community Edition free <$5M revenue. -->
    <PackageVersion Include="MediatR" Version="14.1.0" />
    <PackageVersion Include="FluentValidation" Version="12.1.1" />
    <PackageVersion Include="FluentValidation.DependencyInjectionExtensions" Version="12.1.1" />
    <!-- AutoMapper 15+ = commercial (RPL-1.5). v13.0.1 = last MIT release. Prefer Riok.Mapperly for new projects. -->
    <PackageVersion Include="AutoMapper" Version="13.0.1" />
    <!-- <PackageVersion Include="Riok.Mapperly" Version="3.*" /> -->
    <PackageVersion Include="Ardalis.GuardClauses" Version="4.5.0" />

    <!-- Testing (xUnit v3 3.2.2 stable; FluentAssertions 8.x = commercial license — see note above) -->
    <PackageVersion Include="xunit.v3" Version="3.2.2" />
    <PackageVersion Include="xunit.runner.visualstudio" Version="3.2.2" />
    <PackageVersion Include="Moq" Version="4.20.70" />
    <PackageVersion Include="FluentAssertions" Version="8.10.0" />
    <PackageVersion Include="Bogus" Version="35.4.0" />
    <!-- Testcontainers 4.x (4.12.0 latest stable). 4.0 drops default image versions: always specify .WithImage(). -->
    <PackageVersion Include="Testcontainers" Version="4.12.0" />
    <PackageVersion Include="Microsoft.NET.Test.Sdk" Version="17.9.0" />
    <PackageVersion Include="coverlet.collector" Version="6.0.2" />

    <!-- Observability -->
    <PackageVersion Include="Serilog.AspNetCore" Version="8.0.1" />
    <PackageVersion Include="Polly" Version="8.3.1" />

    <!-- Analyzers -->
    <PackageVersion Include="Microsoft.CodeAnalysis.NetAnalyzers" Version="10.0.300" />
    <PackageVersion Include="StyleCop.Analyzers" Version="1.2.0-beta.556" />
    <PackageVersion Include="SonarAnalyzer.CSharp" Version="9.21.0.86780" />
  </ItemGroup>
</Project>
```

## IDE Configuration

### Visual Studio Settings

```json
// .vs/VSSettings.json (committed settings)
{
  "editor.formatOnSave": true,
  "editor.formatOnPaste": true,
  "dotnet.completion.showCompletionItemsFromUnimportedNamespaces": true,
  "omnisharp.enableRoslynAnalyzers": true,
  "omnisharp.enableEditorConfigSupport": true
}
```

### VS Code Settings

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "ms-dotnettools.csharp",
  "omnisharp.enableRoslynAnalyzers": true,
  "omnisharp.enableEditorConfigSupport": true,
  "dotnet.defaultSolution": "MySolution.sln",
  "[csharp]": {
    "editor.tabSize": 4,
    "editor.insertSpaces": true
  }
}
```

### VS Code Extensions

```json
// .vscode/extensions.json
{
  "recommendations": [
    "ms-dotnettools.csharp",
    "ms-dotnettools.csdevkit",
    "ms-dotnettools.vscode-dotnet-runtime",
    "ms-azuretools.vscode-docker",
    "humao.rest-client",
    "patcx.vscode-nuget-gallery",
    "jmrog.vscode-nuget-package-manager",
    "formulahendry.dotnet-test-explorer"
  ]
}
```

## Docker Configuration

### Development Dockerfile

```dockerfile
# Dockerfile
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy csproj files and restore
COPY ["src/WebAPI/WebAPI.csproj", "src/WebAPI/"]
COPY ["src/Application/Application.csproj", "src/Application/"]
COPY ["src/Domain/Domain.csproj", "src/Domain/"]
COPY ["src/Infrastructure/Infrastructure.csproj", "src/Infrastructure/"]
COPY ["Directory.Build.props", "./"]
COPY ["Directory.Packages.props", "./"]

RUN dotnet restore "src/WebAPI/WebAPI.csproj"

# Copy everything and build
COPY . .
RUN dotnet build "src/WebAPI/WebAPI.csproj" -c Release -o /app/build

# Publish
FROM build AS publish
RUN dotnet publish "src/WebAPI/WebAPI.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
EXPOSE 8080
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "WebAPI.dll"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - '8080:8080'
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
      - ConnectionStrings__DefaultConnection=Host=postgres;Database=myapp;Username=postgres;Password=postgres
    depends_on:
      postgres:
        condition: service_healthy

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: myapp
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'

volumes:
  postgres_data:
```

## CI/CD Configuration

### GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  DOTNET_VERSION: '10.0.x'

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: ${{ env.DOTNET_VERSION }}

      - name: Restore dependencies
        run: dotnet restore

      - name: Build
        run: dotnet build --no-restore -c Release

      - name: Test
        run: dotnet test --no-build -c Release --logger trx --collect:"XPlat Code Coverage"

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          files: '**/coverage.cobertura.xml'

  analyze:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: ${{ env.DOTNET_VERSION }}

      - name: Install dotnet-format
        run: dotnet tool install -g dotnet-format

      - name: Check formatting
        run: dotnet format --verify-no-changes --verbosity diagnostic
```

## Debugging

### Launch Configuration

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": ".NET Core Launch (web)",
      "type": "coreclr",
      "request": "launch",
      "preLaunchTask": "build",
      "program": "${workspaceFolder}/src/WebAPI/bin/Debug/net10.0/WebAPI.dll",
      "args": [],
      "cwd": "${workspaceFolder}/src/WebAPI",
      "stopAtEntry": false,
      "env": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    },
    {
      "name": "Docker: Attach to .NET",
      "type": "docker",
      "request": "attach",
      "platform": "netCore",
      "sourceFileMap": {
        "/src": "${workspaceFolder}"
      }
    }
  ]
}
```

## Claude Code LSP Plugin

The LSP plugin gives Claude structural code understanding via the Language Server Protocol: automatic diagnostics after each edit, go-to-definition, find references, and type information on hover.

### Capabilities

| Capability                | Description                                                         |
| ------------------------- | ------------------------------------------------------------------- |
| **Automatic diagnostics** | C# compilation errors and warnings detected after each modification |
| **Go to Definition**      | Navigate to the exact definition of a symbol                        |
| **Find References**       | All usages of a symbol across the project                           |
| **Hover**                 | Type information and documentation                                  |
| **Workspace Symbols**     | Search symbols across the entire project                            |
| **Call Hierarchy**        | Trace incoming/outgoing calls                                       |

### Installation

```bash
# 1. Install the language server
dotnet tool install -g csharp-ls

# 2. Install the Claude Code plugin (official marketplace)
/plugins install csharp-lsp@claude-plugins-official
```

### Benefits for C# / .NET

- Real-time Roslyn-based diagnostics after every edit
- Navigation through CQRS handlers, MediatR pipelines, and EF Core entities
- NuGet package type resolution across the solution
- Extension members and C# 14 feature support

---

## Tooling Checklist

- [ ] .NET 10 SDK installed (10.0.300+)
- [ ] EditorConfig configured
- [ ] Directory.Build.props set up
- [ ] Central package management enabled
- [ ] Code analyzers configured (Roslyn, StyleCop, SonarAnalyzer)
- [ ] Docker development environment ready
- [ ] CI/CD pipeline configured
- [ ] VS Code / Visual Studio extensions installed
- [ ] Git hooks set up (Husky.Net or similar)
- [ ] Claude Code LSP plugin installed
