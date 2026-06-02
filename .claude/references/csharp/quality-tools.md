# C#/.NET Code Quality Tools

## Static Analysis

### Roslyn Analyzers

```xml
<!-- Directory.Build.props -->
<ItemGroup>
  <!-- Microsoft's recommended analyzers -->
  <PackageReference Include="Microsoft.CodeAnalysis.NetAnalyzers" Version="10.*">
    <PrivateAssets>all</PrivateAssets>
    <IncludeAssets>runtime; build; native; contentfiles; analyzers</IncludeAssets>
  </PackageReference>
</ItemGroup>

<PropertyGroup>
  <!-- Enable all analyzers -->
  <AnalysisLevel>latest-recommended</AnalysisLevel>
  <AnalysisMode>All</AnalysisMode>
  <EnforceCodeStyleInBuild>true</EnforceCodeStyleInBuild>
  <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
</PropertyGroup>
```

### StyleCop Analyzers

```xml
<!-- Style consistency enforcement -->
<PackageReference Include="StyleCop.Analyzers" Version="1.2.*">
  <PrivateAssets>all</PrivateAssets>
</PackageReference>
```

```json
// stylecop.json - place at solution root
{
  "$schema": "https://raw.githubusercontent.com/DotNetAnalyzers/StyleCopAnalyzers/master/StyleCop.Analyzers/StyleCop.Analyzers/Settings/stylecop.schema.json",
  "settings": {
    "documentationRules": {
      "companyName": "Your Company",
      "copyrightText": "Copyright (c) {companyName}. All rights reserved.",
      "xmlHeader": false,
      "documentInterfaces": true,
      "documentExposedElements": true,
      "documentInternalElements": false,
      "documentPrivateElements": false
    },
    "orderingRules": {
      "usingDirectivesPlacement": "outsideNamespace",
      "systemUsingDirectivesFirst": true
    },
    "namingRules": {
      "allowCommonHungarianPrefixes": false,
      "allowedHungarianPrefixes": []
    },
    "layoutRules": {
      "newlineAtEndOfFile": "require"
    }
  }
}
```

### SonarAnalyzer

```xml
<!-- Security and code quality -->
<PackageReference Include="SonarAnalyzer.CSharp" Version="9.*">
  <PrivateAssets>all</PrivateAssets>
</PackageReference>
```

### Roslynator

```xml
<!-- 500+ additional analyzers and refactorings -->
<PackageReference Include="Roslynator.Analyzers" Version="4.*">
  <PrivateAssets>all</PrivateAssets>
</PackageReference>
```

## Analyzer Configuration

### .editorconfig Rules

```ini
# Analyzer severity levels
[*.cs]

# CA1062: Validate arguments of public methods
dotnet_diagnostic.CA1062.severity = warning

# CA1303: Do not pass literals as localized parameters
dotnet_diagnostic.CA1303.severity = none

# CA1848: Use LoggerMessage delegates (performance)
dotnet_diagnostic.CA1848.severity = suggestion

# CA2007: ConfigureAwait
dotnet_diagnostic.CA2007.severity = warning

# CS8618: Non-nullable property not initialized
dotnet_diagnostic.CS8618.severity = warning

# IDE0005: Remove unnecessary using
dotnet_diagnostic.IDE0005.severity = warning

# IDE0060: Remove unused parameter
dotnet_diagnostic.IDE0060.severity = warning

# IDE0161: Use file-scoped namespace
dotnet_diagnostic.IDE0161.severity = warning

# SA1633: File must have header
dotnet_diagnostic.SA1633.severity = none

# SA1101: Prefix local calls with this
dotnet_diagnostic.SA1101.severity = none

# SA1309: Field names should not begin with underscore
dotnet_diagnostic.SA1309.severity = none

# S1066: Collapsible "if" statements
dotnet_diagnostic.S1066.severity = suggestion

# S3267: Loops should be simplified with LINQ
dotnet_diagnostic.S3267.severity = suggestion
```

### Global Suppressions

```csharp
// GlobalSuppressions.cs - for solution-wide suppressions
using System.Diagnostics.CodeAnalysis;

// Suppress for entire assembly
[assembly: SuppressMessage(
    "Design",
    "CA1062:Validate arguments of public methods",
    Justification = "Null checks handled by FluentValidation",
    Scope = "namespaceanddescendants",
    Target = "~N:MyApp.Application.Features")]

// Suppress specific rule everywhere
[assembly: SuppressMessage(
    "Style",
    "IDE0058:Expression value is never used",
    Justification = "Fluent API pattern")]
```

## Code Formatting

### dotnet format

```bash
# Check formatting
dotnet format --verify-no-changes --verbosity diagnostic

# Fix formatting
dotnet format

# Format specific project
dotnet format ./src/WebAPI/WebAPI.csproj

# Format only analyzers
dotnet format analyzers

# Format only style rules
dotnet format style
```

### CSharpier (Opinionated Formatter)

```bash
# Install
dotnet tool install csharpier -g

# Format
dotnet csharpier .

# Check
dotnet csharpier --check .
```

```json
// .csharpierrc.json
{
  "printWidth": 120,
  "useTabs": false,
  "tabWidth": 4,
  "endOfLine": "lf"
}
```

## Code Coverage

### Coverlet

```xml
<!-- Test project -->
<ItemGroup>
  <PackageReference Include="coverlet.collector" Version="6.*">
    <PrivateAssets>all</PrivateAssets>
    <IncludeAssets>runtime; build; native; contentfiles; analyzers</IncludeAssets>
  </PackageReference>
</ItemGroup>
```

```bash
# Run tests with coverage
dotnet test --collect:"XPlat Code Coverage"

# With specific format
dotnet test /p:CollectCoverage=true /p:CoverletOutputFormat=opencover

# Generate HTML report
dotnet tool install -g dotnet-reportgenerator-globaltool
reportgenerator -reports:**/coverage.cobertura.xml -targetdir:coverage-report -reporttypes:Html
```

### Coverage Thresholds

```xml
<!-- Directory.Build.props -->
<PropertyGroup>
  <CollectCoverage>true</CollectCoverage>
  <CoverletOutputFormat>cobertura</CoverletOutputFormat>
  <Threshold>80</Threshold>
  <ThresholdType>line,branch,method</ThresholdType>
  <ThresholdStat>total</ThresholdStat>
</PropertyGroup>
```

## Dependency Analysis

### NDepend (Commercial)

```xml
<!-- ndepend.config patterns -->
<Queries>
  <Query Active="True" DisplayMode="Graph">
    <![CDATA[
    // Detect circular dependencies
    from n in Application.Namespaces
    let deps = n.NamespacesUsed
    where deps.Any(d => d.NamespacesUsed.Contains(n))
    select n
    ]]>
  </Query>
</Queries>
```

### Architecture Tests with NetArchTest

```csharp
// Architecture enforcement tests
public class ArchitectureTests
{
    [Fact]
    public void Domain_Should_Not_Reference_Infrastructure()
    {
        var result = Types.InAssembly(typeof(Order).Assembly)
            .ShouldNot()
            .HaveDependencyOn("Infrastructure")
            .GetResult();

        result.IsSuccessful.Should().BeTrue();
    }

    [Fact]
    public void Controllers_Should_Have_ApiController_Attribute()
    {
        var result = Types.InAssembly(typeof(Program).Assembly)
            .That()
            .ResideInNamespace("WebAPI.Controllers")
            .Should()
            .HaveCustomAttribute(typeof(ApiControllerAttribute))
            .GetResult();

        result.IsSuccessful.Should().BeTrue();
    }

    [Fact]
    public void Handlers_Should_Be_Sealed()
    {
        var result = Types.InAssembly(typeof(CreateOrderCommandHandler).Assembly)
            .That()
            .ImplementInterface(typeof(IRequestHandler<,>))
            .Should()
            .BeSealed()
            .GetResult();

        result.IsSuccessful.Should().BeTrue();
    }
}
```

## Security Scanning

### Security Code Scan

```xml
<PackageReference Include="SecurityCodeScan.VS2019" Version="5.*">
  <PrivateAssets>all</PrivateAssets>
</PackageReference>
```

### OWASP Dependency Check

```bash
# Install
dotnet tool install -g dotnet-outdated-tool

# Check for vulnerabilities
dotnet list package --vulnerable

# Check for outdated packages
dotnet outdated
```

### GitHub Dependabot

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: 'nuget'
    directory: '/'
    schedule:
      interval: 'weekly'
    open-pull-requests-limit: 10
    reviewers:
      - 'team-name'
    labels:
      - 'dependencies'
      - 'nuget'
```

## Performance Analysis

### BenchmarkDotNet

```csharp
// Micro-benchmarking
[MemoryDiagnoser]
[RankColumn]
public class SerializationBenchmarks
{
    private readonly Order _order;
    private readonly string _json;

    public SerializationBenchmarks()
    {
        _order = CreateTestOrder();
        _json = JsonSerializer.Serialize(_order);
    }

    [Benchmark(Baseline = true)]
    public string SystemTextJson_Serialize()
        => JsonSerializer.Serialize(_order);

    [Benchmark]
    public Order SystemTextJson_Deserialize()
        => JsonSerializer.Deserialize<Order>(_json)!;

    [Benchmark]
    public string Newtonsoft_Serialize()
        => JsonConvert.SerializeObject(_order);
}
```

### dotnet-counters

```bash
# Real-time performance monitoring
dotnet tool install -g dotnet-counters

# Monitor application
dotnet counters monitor --process-id <PID> --counters System.Runtime

# Collect metrics
dotnet counters collect --process-id <PID> --output metrics.csv
```

### dotnet-trace

```bash
# Detailed tracing
dotnet tool install -g dotnet-trace

# Collect trace
dotnet trace collect --process-id <PID> --output trace.nettrace

# Analyze with PerfView or Visual Studio
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/quality.yml
name: Code Quality

on: [push, pull_request]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '10.0.x'

      - name: Restore
        run: dotnet restore

      - name: Build with analyzers
        run: dotnet build --no-restore -warnaserror

      - name: Check formatting
        run: dotnet format --verify-no-changes

      - name: Run tests with coverage
        run: dotnet test --collect:"XPlat Code Coverage"

      - name: Check coverage threshold
        run: |
          coverage=$(cat **/coverage.cobertura.xml | grep -oP 'line-rate="\K[^"]+' | head -1)
          if (( $(echo "$coverage < 0.8" | bc -l) )); then
            echo "Coverage $coverage is below 80%"
            exit 1
          fi

      - name: Upload coverage
        uses: codecov/codecov-action@v4
```

### SonarCloud Integration

```yaml
# .github/workflows/sonar.yml
name: SonarCloud Analysis

on:
  push:
    branches: [main]
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  sonarcloud:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '10.0.x'

      - name: Install SonarScanner
        run: dotnet tool install -g dotnet-sonarscanner

      - name: Begin Analysis
        run: |
          dotnet sonarscanner begin \
            /k:"project-key" \
            /o:"organization" \
            /d:sonar.login="${{ secrets.SONAR_TOKEN }}" \
            /d:sonar.cs.opencover.reportsPaths="**/coverage.opencover.xml"

      - name: Build
        run: dotnet build

      - name: Test with coverage
        run: dotnet test /p:CollectCoverage=true /p:CoverletOutputFormat=opencover

      - name: End Analysis
        run: dotnet sonarscanner end /d:sonar.login="${{ secrets.SONAR_TOKEN }}"
```

## Quality Gates Checklist

- [ ] All analyzers enabled and configured
- [ ] No warnings in build (TreatWarningsAsErrors=true)
- [ ] Code formatting verified (dotnet format --verify-no-changes)
- [ ] Code coverage > 80%
- [ ] No known vulnerable dependencies
- [ ] Architecture tests passing
- [ ] No critical SonarCloud issues
- [ ] Performance benchmarks within thresholds
