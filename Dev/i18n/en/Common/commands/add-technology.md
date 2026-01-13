---
description: Add a new technology to claude-craft with best practices from Context7 and web search
argument-hint: <technology-name>
---

# Add Technology

You are an expert technology integrator for claude-craft. Your mission is to add a new technology stack by:
1. Researching best practices using Context7 MCP and web search
2. Generating all necessary files (rules, commands, templates, skills, agents)
3. Creating the installation script
4. Updating documentation and landing page

## Arguments
$ARGUMENTS

Arguments:
- `technology-name`: Name of the technology to add (e.g., "nextjs", "nestjs", "golang", "laravel")
- (Optional) `category`: Category of the technology (frontend, backend, mobile, devops, fullstack)

Example: `/common:add-technology "nestjs"` or `/common:add-technology "golang" backend`

## MISSION

### Step 1: Analyze the Technology

Identify:
- Official name and common aliases
- Type: framework, library, language, tool
- Category: frontend, backend, mobile, devops, fullstack
- Ecosystem: related tools, testing frameworks, deployment options
- Target audience: web, mobile, API, CLI, etc.

### Step 2: Research with Context7 (MCP)

**Use Context7 to access official documentation:**

```
Query Context7 for:
1. Official getting started guide
2. Recommended project structure
3. Best practices and design patterns
4. Testing strategies (unit, integration, e2e)
5. Security best practices
6. Performance optimization tips
7. Deployment recommendations
```

#### Information to Extract

| Topic | Details to Find |
|-------|-----------------|
| Architecture | Recommended patterns (MVC, Clean, Hexagonal, etc.) |
| Coding Standards | Style guide, naming conventions, file structure |
| Tooling | CLI tools, formatters, linters, bundlers |
| Testing | Test frameworks, coverage tools, mocking strategies |
| Security | Authentication, authorization, common vulnerabilities |
| Quality | Static analysis, type checking, code review practices |

### Step 3: Complement with Web Search

**Search for 2026 trends and community practices:**

1. **Latest Trends**
   - Current stable version
   - Upcoming features
   - Deprecation warnings
   - Migration guides

2. **Community Best Practices**
   - Popular boilerplates
   - Production configurations
   - Performance benchmarks
   - Real-world architectures

3. **Common Pitfalls**
   - Frequent mistakes
   - Anti-patterns
   - Security vulnerabilities
   - Performance bottlenecks

4. **Ecosystem**
   - Recommended libraries
   - Testing tools
   - DevOps integrations
   - Monitoring solutions

### Step 4: Generate Technology Files

**Create the complete file structure in all 5 languages (en, fr, es, de, pt):**

```
Dev/i18n/{lang}/{TECHNOLOGY}/
├── CLAUDE.md.template
├── rules/
│   ├── 00-project-context.md.template
│   ├── 02-architecture-{tech}.md
│   ├── 03-coding-standards.md
│   ├── 06-tooling.md
│   ├── 07-testing-{tech}.md
│   ├── 08-quality-tools.md
│   └── 11-security-{tech}.md
├── commands/
│   ├── check-compliance.md
│   ├── check-architecture.md
│   ├── check-code-quality.md
│   ├── check-testing.md
│   ├── check-security.md
│   └── [generate-*.md if applicable]
├── templates/
│   └── [technology-specific templates]
├── checklists/
│   ├── pre-commit.md
│   └── new-feature.md
├── agents/
│   └── {tech}-reviewer.md
└── skills/
    └── [technology-specific skills]
```

#### Rules to Generate

| File | Content |
|------|---------|
| `02-architecture-{tech}.md` | Architecture patterns, folder structure, clean architecture principles |
| `03-coding-standards.md` | Style guide, naming conventions, file organization |
| `06-tooling.md` | CLI commands, formatters, linters, build tools |
| `07-testing-{tech}.md` | Test strategies, frameworks, coverage requirements |
| `08-quality-tools.md` | Static analysis, type checking, CI/CD integration |
| `11-security-{tech}.md` | Security practices, common vulnerabilities, authentication |

#### Commands to Generate

| Command | Purpose |
|---------|---------|
| `check-compliance.md` | Full compliance audit (score /100) |
| `check-architecture.md` | Architecture review |
| `check-code-quality.md` | Code quality analysis |
| `check-testing.md` | Test coverage and quality |
| `check-security.md` | Security audit |

### Step 5: Create Installation Script

**Generate `Dev/scripts/install-{tech}-rules.sh`:**

Follow the pattern from existing scripts:
- Support `--lang`, `--force`, `--update`, `--dry-run`, `--backup` options
- Copy generic rules from Common/
- Copy technology-specific rules
- Generate CLAUDE.md and 00-project-context.md
- Display installation summary

### Step 6: Update Documentation

**Files to update:**

| File | Changes |
|------|---------|
| `README.md` | Add technology to supported stacks list |
| `docs/index.html` | Increment stats, add technology card |
| `docs/COMMANDS.md` | Document new commands |
| `Makefile` | Add `install-{tech}` target |

#### Landing Page Updates (docs/index.html)

1. **Stats Section**: Increment "Tech Stacks" counter
2. **Technology Grid**: Add new technology card:

```html
<div class="bg-slate-800/50 p-6 rounded-xl border border-white/5 hover:border-brand-500/50 transition-colors text-center group">
    <div class="h-16 w-16 mx-auto bg-black rounded-full flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
        <span class="text-2xl font-bold text-white">{ICON}</span>
    </div>
    <h3 class="font-bold text-white">{TECH_NAME}</h3>
    <p class="text-xs text-slate-400 mt-2" data-i18n="tech_{tech}_desc">{DESCRIPTION}</p>
</div>
```

3. **Translations**: Add i18n keys for all 5 languages

#### Makefile Target

```makefile
install-{tech}:
	./Dev/scripts/install-{tech}-rules.sh --lang=$(RULES_LANG) $(OPTIONS) $(TARGET)
```

### Step 7: Validation

#### Definition of Done Checklist

```
══════════════════════════════════════════════════════════════
✅ DEFINITION OF DONE: Add Technology [{TECH_NAME}]
══════════════════════════════════════════════════════════════

📁 FILES CREATED
──────────────────────────────────────────────────────────────
- [ ] Rules (7 files × 5 languages = 35 files)
- [ ] Commands (5 files × 5 languages = 25 files)
- [ ] Templates (at least 2 per language)
- [ ] Checklists (2 files × 5 languages = 10 files)
- [ ] Agent {tech}-reviewer (1 file × 5 languages = 5 files)
- [ ] CLAUDE.md.template (× 5 languages)
- [ ] Installation script (Dev/scripts/install-{tech}-rules.sh)

📄 DOCUMENTATION UPDATED
──────────────────────────────────────────────────────────────
- [ ] README.md: Technology added to supported stacks
- [ ] docs/index.html: Stats incremented
- [ ] docs/index.html: Technology card added
- [ ] docs/index.html: i18n translations added (5 languages)
- [ ] docs/COMMANDS.md: New commands documented
- [ ] Makefile: install-{tech} target added

🧪 VERIFICATION
──────────────────────────────────────────────────────────────
- [ ] Installation script runs without errors
- [ ] All files are properly formatted
- [ ] Commands are functional
- [ ] Documentation is accurate

══════════════════════════════════════════════════════════════
```

### Output Format

After completing all steps, provide:

```
══════════════════════════════════════════════════════════════
🎉 TECHNOLOGY ADDED: {TECH_NAME}
══════════════════════════════════════════════════════════════

📊 SUMMARY
──────────────────────────────────────────────────────────────
Technology: {TECH_NAME}
Category: {CATEGORY}
Version: {CURRENT_VERSION}

Files created: {COUNT}
- Rules: 35 files
- Commands: 25 files
- Templates: {COUNT}
- Checklists: 10 files
- Agents: 5 files

📁 STRUCTURE
──────────────────────────────────────────────────────────────
Dev/i18n/
├── en/{TECH}/
├── fr/{TECH}/
├── es/{TECH}/
├── de/{TECH}/
└── pt/{TECH}/

Dev/scripts/
└── install-{tech}-rules.sh

🔧 INSTALLATION
──────────────────────────────────────────────────────────────
# Via Makefile
make install-{tech} TARGET=~/my-project RULES_LANG=en

# Direct script
./Dev/scripts/install-{tech}-rules.sh ~/my-project

📚 DOCUMENTATION
──────────────────────────────────────────────────────────────
- README.md ✅ Updated
- docs/index.html ✅ Updated
- docs/COMMANDS.md ✅ Updated
- Makefile ✅ Updated

✅ DEFINITION OF DONE: COMPLETE
══════════════════════════════════════════════════════════════
```

### Important Guidelines

1. **Research First** - Always use Context7 and web search before generating files
2. **Follow Patterns** - Use existing technologies (React, Symfony, Flutter) as templates
3. **All 5 Languages** - Generate content for en, fr, es, de, pt
4. **Quality over Speed** - Ensure all files are properly formatted and functional
5. **Update Everything** - Don't forget documentation and landing page

### Error Handling

If research fails:
- Clearly indicate what information is missing
- Propose alternative sources
- Ask user for clarification if needed
- NEVER generate files with placeholder or invented content
