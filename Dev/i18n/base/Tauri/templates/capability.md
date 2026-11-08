# Template: Tauri Capability and Scoped Permissions

A capability binds a set of permissions (with optional scopes) to windows or webviews. Without a capability, a window cannot call plugin or core commands. Targets Tauri v2 (stable 2.12). Capability files live in `src-tauri/capabilities/*.json` (JSON; the configuration schema also validates them via `gen/schemas/`).

## Conventions

- One capability file per window role (`main`, `settings`, ...), identified by `identifier` and documented by `description`
- `windows` lists window labels; avoid `"*"`
- Grant the minimum permissions; do not stack `:default` sets you have not read
- Scope resource permissions with `allow`; protect sensitive locations with `deny` (`deny` wins over `allow`)
- Use `platforms` for permissions needed only on some targets
- Remote-URL capabilities are exceptional and stay narrow and read-only
- Every change to `capabilities/` is reviewed and covered by a snapshot test
- By default all files in `capabilities/` are enabled; to enable a subset, list identifiers in `app.security.capabilities` of `tauri.conf.json`

## Main Window Capability

```json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "main-window",
  "description": "Permissions for the main window: core defaults and the notes API",
  "windows": ["main"],
  "permissions": [
    "core:default",
    {
      "identifier": "fs:allow-read-text-file",
      "allow": [{ "path": "$APPDATA/notes/**" }],
      "deny": [{ "path": "$APPDATA/notes/.private/**" }]
    },
    {
      "identifier": "fs:allow-write-text-file",
      "allow": [{ "path": "$APPDATA/notes/**" }]
    },
    {
      "identifier": "http:default",
      "allow": [{ "url": "https://api.example.com/*" }]
    }
  ]
}
```

Reading it:
- `core:default` gives the window the default core permissions it needs to function
- fs permissions are limited to the app's notes directory; a private subfolder is explicitly denied
- HTTP is limited to one API origin

## Secondary Window with Fewer Rights

```json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "settings-window",
  "description": "Settings window: no filesystem, no network",
  "windows": ["settings"],
  "permissions": ["core:default"]
}
```

## Desktop-Only Permission

```json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "desktop-extras",
  "description": "Permissions that exist only on desktop targets",
  "windows": ["main"],
  "platforms": ["linux", "macOS", "windows"],
  "permissions": ["core:default"]
}
```

Use `platforms` so a mobile build does not reference desktop-only permissions; pair with `#[cfg(desktop)]` plugin registration in Rust.

## Referencing Capabilities in `tauri.conf.json`

```json
{
  "app": {
    "security": {
      "capabilities": ["main-window", "settings-window"]
    }
  }
}
```

Omit the `capabilities` key to enable every file in the directory; list identifiers to enable an explicit subset (inline capability objects are also accepted).

## Scope Variables

| Variable | Typical use |
|----------|-------------|
| `$APPDATA`, `$APPCONFIG`, `$APPCACHE`, `$APPLOG` | App-owned directories: preferred for fs scopes |
| `$HOME`, `$DOCUMENT`, `$DOWNLOAD`, `$DESKTOP` | User directories: avoid, or scope to one subfolder the user picked |

Verify the exact variable names and available permissions for your installed plugin versions with `tauri permission` or the plugin documentation before use.

## Review Checklist

- [ ] Capability targets only the windows that need it
- [ ] Each permission is used by the frontend (search the code for the plugin API call)
- [ ] fs/shell/http entries have `allow` scopes; sensitive locations have `deny`
- [ ] No `$HOME/**`, no `https://*`, no unrestricted shell
- [ ] `platforms` set where permissions are platform-specific
- [ ] `description` states the purpose
- [ ] Snapshot test updated; reviewer from the security group approved the diff
