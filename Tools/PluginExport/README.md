# Plugin generation

`plugins/bear-<namespace>/` is **generated** — do not edit it by hand. The generator is
[`scripts/generate-plugins.mjs`](../../scripts/generate-plugins.mjs); this folder only keeps the plugin icon
(`icon.png`) copied into every plugin.

```bash
npm run plugins:generate    # or: make plugin-export-all  (regenerates plugins/ and the marketplace plugin list)
npm run plugins:check       # or: make plugin-check       (exit code != 0 when plugins/ drifts from the installers)
```

How it works: the real installers (`Dev/scripts/install-*-rules.sh`, `Project/install-project-commands.sh`) run in a
scratch project under `.test-tmp/`; their `.claude/` output is reshaped into one plugin per command namespace and per
stack, deprecated redirect stubs are dropped, and `.claude/<rules|references|templates|checklists|skills|agents>/…`
references are rewritten to `${CLAUDE_PLUGIN_ROOT}/…` (the referenced files are vendored into the plugin that cites
them). The sources already use the `bear-` prefixed slash names (the CLI installs the same `/bear-<ns>:<cmd>` commands). Hooks ship only in the `common` plugin. See the README of each plugin for its contents.
