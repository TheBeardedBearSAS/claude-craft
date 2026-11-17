# Bear-Craft Plugin Export

Export bear-craft components as official Claude Code plugins for distribution.

## Overview

This tool packages bear-craft rules, commands, agents, and skills into the official Claude Code plugin format. Plugins can be:

- Shared with team members
- Published to plugin marketplaces
- Installed directly via `/plugin install`

## Usage

### Export Single Technology

```bash
# Export Symfony plugin (French)
./export-plugin.sh --tech=symfony --lang=fr ./plugins

# Export Common plugin (English)
./export-plugin.sh --tech=common ./plugins

# Export with custom name and version
./export-plugin.sh --tech=flutter --name=my-flutter-rules --version=1.0.0 ./plugins
```

### Export All Technologies

```bash
./export-plugin.sh --all ./plugins
```

This creates separate plugins for each technology:
- `bear-craft-common`
- `bear-craft-symfony`
- `bear-craft-flutter`
- `bear-craft-python`
- `bear-craft-react`
- `bear-craft-reactnative`
- `bear-craft-project`
- `bear-craft-infra`

## Options

| Option | Description | Default |
|--------|-------------|---------|
| `--tech=TECH` | Technology to export | Required |
| `--lang=LANG` | Language (en, fr, es, de, pt) | en |
| `--name=NAME` | Plugin name | bear-craft-<tech> |
| `--version=VER` | Plugin version | 3.0.0 |
| `--all` | Export all technologies | false |

## Plugin Structure

Generated plugins follow Claude Code plugin format:

```
bear-craft-symfony/
├── .claude-plugin/
│   └── plugin.json          # Plugin manifest
├── commands/                 # Slash commands
├── agents/                   # Custom subagents
├── skills/                   # Auto-invoked skills
├── templates/                # Code templates
├── checklists/               # Quality checklists
└── README.md                 # Plugin documentation
```

## Testing Plugins

Test locally before distribution:

```bash
claude --plugin-dir ./plugins/bear-craft-symfony
```

Commands will be namespaced automatically:
- `/bear-craft-symfony:entity`
- `/bear-craft-symfony:fix-bug`

## Distribution

### Direct Sharing

Share the plugin directory with team members. They can install with:

```bash
claude --plugin-dir /path/to/plugin
```

### Marketplace

1. Host plugin on GitHub or custom URL
2. Create `marketplace.json` if hosting multiple plugins
3. Users install via: `/plugin install <url>`

## Makefile Integration

```bash
# Export single plugin
make plugin-export TECH=symfony LANG=fr OUTPUT=./dist

# Export all plugins
make plugin-export-all OUTPUT=./dist
```

## Related

- [docs/PLUGINS.md](/docs/PLUGINS.md) - Plugin documentation
- [Claude Code Plugin Guide](https://code.claude.com/docs/en/plugins)
