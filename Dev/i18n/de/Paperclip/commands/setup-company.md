---
description: Bootstrapped eine neue Paperclip-Company (Onboarding + erster Agent)
argument-hint: [company-name]
---

# Bootstrap einer neuen Paperclip-Company

## Argumente

1. `company-name` (erforderlich) — kurzer, beschreibender Name (z.B. "Acme Labs")

## MISSION

Führen Sie einen Operator durch das Onboarding: installieren, die Instanz erstellen, das initiale Operator-Konto bootstrappen, die Company via UI erstellen und den ersten Agent mit dem `claude-local`-Adapter ausführen.

> Die echte `paperclipai` CLI (v2026.609.0) exponiert **keinen** `companies create`-Befehl. Company-Erstellung erfolgt entweder über das Dashboard oder durch Import eines Pakets mit `paperclipai company import`. Erfinden Sie keine Flags, die nicht existieren — öffnen Sie `paperclipai company --help` und folgen Sie dem, was dort steht.

## Vorgehensweise

### 1. Vorbedingungen

- [ ] Node.js 20+ und pnpm 9.15+ installiert
- [ ] PostgreSQL erreichbar **ODER** akzeptieren Sie das eingebettete Postgres für Local-Dev
- [ ] Port 3100 verfügbar (oder setzen Sie `PORT`)

### 2. Installieren & Onboarden

Schnellster Pfad:

```bash
npx paperclipai onboard --yes
```

Oder aus einem Checkout:

```bash
git clone https://github.com/paperclipai/paperclip.git
cd paperclip
pnpm install
pnpm dev
```

Das Dashboard ist standardmäßig unter `http://localhost:3100` (oder welchen `PORT` Sie auch immer gesetzt haben).

### 3. Diagnose-Check

```bash
paperclipai doctor
# oder, um Auto-Reparaturen zu versuchen:
paperclipai doctor --repair --yes
```

Beheben Sie alles, was als Hard-Failure gemeldet wird, bevor Sie fortfahren.

### 4. Bootstrap des ersten Operators (CEO)

Zwei Pfade stehen je nach Deployment-Kontext zur Verfügung:

**A — Browser-Claim (private / self-hosted, nicht beanspruchte Instanz):** Wenn die Instanz noch nicht beansprucht wurde, navigieren Sie zu `http://localhost:3100` im Browser. Ein Erststart-Bildschirm sollte erscheinen, der die direkte Einrichtung des initialen Admin-Kontos ermöglicht. Verwenden Sie diesen Pfad bei einer frisch deployten Instanz ohne bestehenden Operator.

**B — CLI-Bootstrap:** Führen Sie den CLI-Befehl aus, um das initiale Operator-Konto programmatisch zu erstellen:

```bash
paperclipai auth-bootstrap-ceo
```

> **Welcher Pfad gilt?** Leitet das Dashboard beim ersten Laden auf eine Claim-/Setup-Seite weiter, verwenden Sie Pfad A. Zeigt es ein Login-Formular, verwenden Sie Pfad B (oder die Instanz hat bereits einen Operator). Konsultieren Sie `docs.paperclip.ing` für das genaue Verhalten Ihrer Version.

Dies erstellt das initiale Operator-Konto, das zum Anmelden im Dashboard verwendet wird. **Widerrufen oder rotieren** Sie es nach Abschluss des Onboardings.

### 5. Company erstellen

Es gibt keinen CLI-Befehl, um eine Company von Grund auf neu zu erstellen. Zwei unterstützte Pfade:

**A — Dashboard (empfohlen für Erstnutzer):**
- Melden Sie sich unter `http://localhost:3100` mit dem Bootstrap-Operator an
- **Companies → New** → setzen Sie den Namen "$1" und einen URL-Slug

**B — Import aus einem vorbereiteten Paket:**
```bash
paperclipai company import --target new --new-company-name "$1" path/to/company.pcpkg
```

Notieren Sie sich in jedem Fall die zurückgegebene `companyId`.

### 6. Companies auflisten zur Bestätigung

```bash
paperclipai company list
paperclipai company get --id <companyId>
```

### 7. Adapter-Verfügbarkeit prüfen

Paperclip liefert Built-in-Adapter (beobachtet v2026.609.0):
`claude_local`, `codex_local`, `cursor_local`, `gemini_local`, `opencode_local`, `openclaw_gateway`, `pi_local`.

Sie registrieren sich beim Boot selbst in der Server-Adapter-Registry. Verwenden Sie das Dashboard (oder die `/companies/:companyId/adapters/:type/...`-Routen), um zu bestätigen, dass der gewünschte vorhanden ist und antwortet.

### 8. Ersten Agent einstellen

Paperclip stellt Agents **nicht** aus einer YAML-Datei via CLI ein (bei v2026.609.0). Agent einstellen:

- **Via Dashboard**: **Agents → Hire** mit Adapter `claude_local`, wählen Sie ein Modell, setzen Sie ein Budget, weisen Sie ein Ziel zu.
- **Via HTTP-API**: `POST /companies/:companyId/agents` (authentifiziert). Felder: `adapterType`, adapterspezifische Config, Agent-Metadaten. Siehe `server/src/routes/agents.ts` für die maßgebliche Form.

Nach dem Einstellen inspizieren Sie ihn:

```bash
paperclipai agent list
paperclipai agent get --id <agentId>
```

### 9. Approvals-Inbox

Testen Sie Approvals:

```bash
paperclipai approval list
# wenn eine Anfrage aussteht:
paperclipai approval approve --id <approvalId>
# oder reject / request-revision / comment
paperclipai approval reject --id <approvalId> --reason "<kurze Begründung>"
```

### 10. Optional — Plugin installieren

```bash
paperclipai plugin list
paperclipai plugin examples     # Scaffolded Examples ansehen
paperclipai plugin install <package>
paperclipai plugin inspect <pluginKey>
paperclipai plugin enable <pluginKey>
```

### 11. Activity & Audit

```bash
paperclipai activity list
# filtern nach Company, Datumsbereich, etc.
```

### 12. Lokal dokumentieren

Erstellen Sie ein repo-lokales `.paperclip/`-Verzeichnis mit nicht-geheimen Operator-Notizen:

```
.paperclip/
├── README.md           # wer meldet sich an, wie der erste Agent eingestellt wurde
└── runbook.md          # Kill-Switch, Plugin-Disable, Export-Prozeduren
```

Committen Sie es. **Committen Sie niemals Secrets, `.env` oder das `BETTER_AUTH_SECRET`.**

## Checklist nach Setup

- [ ] Dashboard erreichbar und CEO-Operator kann sich anmelden
- [ ] `paperclipai doctor` vollständig grün
- [ ] Company sichtbar in `paperclipai company list`
- [ ] Ziel-Adapter (`claude_local` oder ähnlich) registriert und antwortet
- [ ] Erster Agent eingestellt und produziert Activity
- [ ] Approvals-Flow End-to-End getestet
- [ ] `.paperclip/` ohne Secrets committet

## Output

Bericht: Company-ID, verfügbare(r) Adapter, erste Agent-ID, Dashboard-URL und die exakten CLI-Befehle, die funktioniert haben. Link zu https://docs.paperclip.ing/foundation/quickstart für Follow-ups.
