# Migration Guide v9 → v10: claude-craft becomes bear-craft

> **v10.0.0** renames the product from **claude-craft** to **bear-craft**. Claude Code reserves the
> `claude-` prefix for Anthropic's own plugins, so `claude plugin validate` rejected the plugin name;
> the new name also matches the publisher, The Bearded Bear. Rules, agents, commands and skills keep their
> content: names, package, URLs and the **slash-command prefix** change. 9.4.0 is the last release published as claude-craft.

---

## What changes

| Before (≤ 9.4.0) | After (10.0.0) | Compatibility in 10.x |
|------------------|----------------|-----------------------|
| npm package `@the-bearded-bear/claude-craft` | `@the-bearded-bear/bear-craft` | The old package is deprecated on npm and stays at 9.4.0 |
| Command `claude-craft` | `bear-craft` | `claude-craft` still works and prints a deprecation notice; removed in 11.0 |
| Claude Code plugin `claude-craft@claude-craft` | `bear-common@bear-craft`, `bear-react@bear-craft`, … (one plugin per namespace or stack) | Reinstall the plugins you need (see below) |
| Slash commands `/<ns>:<cmd>` (e.g. `react:check`, `workflow:init`), in every channel | `/bear-<ns>:<cmd>` (e.g. `/bear-react:check`, `/bear-workflow:init`) | `bear-craft update` removes the old `.claude/commands/<ns>/` folders and keeps any folder that holds your own files; the CLI and the plugins now expose identical commands, and nothing clashes with your project's commands or other plugins |
| `CLAUDE_CRAFT_USER` (Kanban author) | `BEAR_CRAFT_USER` | `CLAUDE_CRAFT_USER` is still read when `BEAR_CRAFT_USER` is unset; removed in 11.0 |
| Community skills `claude-craft-skill-*` | `bear-craft-skill-*` | `bear-craft skill add` still accepts `claude-craft-skill-*` packages; removed in 11.0 |
| Shared shell lib `~/.local/lib/claude-craft/` | `~/.local/lib/bear-craft/` | `install-rtk.sh` still finds the old path |
| Repository `github.com/TheBeardedBearSAS/claude-craft` | `github.com/TheBeardedBearSAS/bear-craft` | A `claude-craft` placeholder repository points to the new one |
| Site `thebeardedbearsas.github.io/claude-craft/` | `thebeardedbearsas.github.io/bear-craft/` | Old URLs redirect to the same page on the new site |
| Shell completions `_claude-craft`, `claude-craft.bash`, `claude-craft.fish` | `_bear-craft`, `bear-craft.bash`, `bear-craft.fish` | The new files also complete the `claude-craft` alias |
| Bundles `bundles/*/claude-craft-bundle.md` | `bundles/*/bear-craft-bundle.md` | — |

Your projects' `.claude/` folders keep working, with one exception: command folders move from `.claude/commands/<ns>/`
to `.claude/commands/bear-<ns>/` (`references/<tech>/`, agents, skills and hooks do not move). Run `bear-craft update` to migrate.

## Steps

1. **Switch the global install** (if you installed it globally):

   ```bash
   npm uninstall -g @the-bearded-bear/claude-craft
   npm install -g @the-bearded-bear/bear-craft
   bear-craft --version
   ```

   With `npx`, replace `npx @the-bearded-bear/claude-craft …` with `npx @the-bearded-bear/bear-craft …`.

2. **Update scripts and CI** that call `claude-craft` or install the old package. They keep working in
   10.x, with a deprecation notice on stderr.

3. **Reinstall the Claude Code plugin** if you use it. In Claude Code, run `/plugin`, remove `claude-craft`, then
   add the `bear-craft` marketplace (`TheBeardedBearSAS/bear-craft`), then install the plugins you need — one per
   namespace or stack, named `bear-<namespace>`; commands become `/bear-<namespace>:<command>` (e.g. `/bear-react:check`): `/plugin install bear-common@bear-craft`, `/plugin install bear-react@bear-craft`
   Use either the `common` plugin or the CLI installation for hooks, not both.

4. **Migrate your projects' commands**: run `bear-craft update` in each project. It installs `.claude/commands/bear-<ns>/` and deletes the old `.claude/commands/<ns>/` folder **only when every file in it is one we ship** (same file name as the distribution). A folder that holds a file you added is kept untouched and a warning names the file: move your file into `.claude/commands/` under your own name, or delete the old folder yourself, otherwise both the old and the `bear-` command names stay available. Update your own notes and scripts to the prefixed names.

5. **Rename environment variables**: `export BEAR_CRAFT_USER="…"` instead of `CLAUDE_CRAFT_USER`.

6. **Skill authors**: publish new versions as `bear-craft-skill-<name>`. The `claude-craft-skill-<name>`
   packages keep installing in 10.x.

7. **Contributors**: point your clone to the new repository.

   ```bash
   git remote set-url origin git@github.com:TheBeardedBearSAS/bear-craft.git
   ```

## Removed in 11.0

The `claude-craft` command, the `CLAUDE_CRAFT_USER` fallback, the `claude-craft-skill-*` prefix, the
`ClaudeCraftCLI` export (now `BearCraftCLI`) and the old shell-lib path.
