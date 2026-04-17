# Claude Craft Shell Completions

Auto-completion support for Claude Craft CLI commands across Bash, Zsh, and Fish shells.

## Installation

### Bash

Add to your `~/.bashrc`:

```bash
source /path/to/claude-craft/completions/claude-craft.bash
```

Or install globally:

```bash
sudo cp completions/claude-craft.bash /etc/bash_completion.d/
```

### Zsh

Copy to your Zsh completions directory:

```bash
# For user-specific installation
mkdir -p ~/.zsh/completions
cp completions/_claude-craft ~/.zsh/completions/

# Add to ~/.zshrc if not already present
fpath=(~/.zsh/completions $fpath)
autoload -Uz compinit && compinit
```

Or install globally:

```bash
sudo cp completions/_claude-craft /usr/local/share/zsh/site-functions/
```

### Fish

Copy to Fish completions directory:

```bash
mkdir -p ~/.config/fish/completions
cp completions/claude-craft.fish ~/.config/fish/completions/
```

## Usage

After installation, you'll have auto-completion for:

### Namespaces

```bash
claude-craft <TAB>
# Shows: angular common csharp flutter laravel php python qa react...
```

### Commands per Namespace

```bash
claude-craft symfony <TAB>
# Shows: api-endpoint check-architecture check-code-quality...

claude-craft react <TAB>
# Shows: accessibility-check bundle-analyze check-architecture...
```

### Full Example

```bash
# Type:
claude-craft sy<TAB>

# Autocompletes to:
claude-craft symfony

# Then type:
claude-craft symfony check-<TAB>

# Shows:
check-architecture  check-code-quality  check-compliance  check-security  check-testing
```

## Supported Namespaces

- `angular` - Angular commands (6 commands)
- `common` - Common commands (17 commands)
- `csharp` - C# commands (6 commands)
- `flutter` - Flutter commands (10 commands)
- `laravel` - Laravel commands (6 commands)
- `php` - PHP commands (5 commands)
- `python` - Python commands (10 commands)
- `qa` - QA commands (6 commands)
- `react` - React commands (10 commands)
- `reactnative` - React Native commands (10 commands)
- `symfony` - Symfony commands (10 commands)
- `team` - Team commands (4 commands)
- `uiux` - UI/UX commands (8 commands)
- `vuejs` - Vue.js commands (6 commands)
- `workflow` - Workflow commands (9 commands)

**Total: 15 namespaces, 123 commands**

## Troubleshooting

### Bash: Completions not working

```bash
# Reload bash config
source ~/.bashrc

# Or restart your terminal
```

### Zsh: Completions not showing

```bash
# Rebuild completion cache
rm -f ~/.zcompdump
autoload -Uz compinit && compinit
```

### Fish: Completions not appearing

```bash
# Fish automatically loads completions from ~/.config/fish/completions/
# If not working, check file permissions:
chmod +r ~/.config/fish/completions/claude-craft.fish

# Restart fish
exec fish
```

## Updating Completions

When new commands are added to Claude Craft:

1. Update the completion files with new commands
2. Reload your shell configuration
3. Rebuild completion cache (Zsh only)

## Contributing

To add a new command to completions:

1. Edit `claude-craft.bash`, `_claude-craft`, and `claude-craft.fish`
2. Add the command to the appropriate namespace array
3. Test in each shell
4. Submit a PR

## License

Same as Claude Craft main project.

---

**Version:** 1.0.0  
**Author:** The Bearded CTO  
**Date:** 2026-04-17
