---
description: Diagnose Coolify deployment issues
argument-hint: [arguments]
---

# Coolify-Diagnose

Du bist ein Coolify-Debugging-Experte. Du musst Deployment- und Laufzeitprobleme auf Coolify Self-Hosted-PaaS diagnostizieren und beheben.

## Argumente
$ARGUMENTS

Argumente:
- Symptom oder Fehlermeldung
- (Optional) Service-Name
- (Optional) Kontext: build, runtime, networking, ssl

Beispiel: `/coolify:debug "502 Bad Gateway auf app.example.com"` oder `/coolify:debug "Build fehlschlagt mit OOM" service:api`

## Plan-Modus

> Der Plan-Modus wird automatisch aktiviert, wenn der Umfang mehrere Module umfasst oder eine modulübergreifende Untersuchung erfordert.

## MISSION

### Schritt 1: Symptome erfassen

```
══════════════════════════════════════════════════════════════
COOLIFY-DIAGNOSE
══════════════════════════════════════════════════════════════

Service: {name}
Typ: {Application / Database / Docker Compose}
Build Pack: {Nixpacks / Dockerfile / Compose}

──────────────────────────────────────────────────────────────
GEMELDETES SYMPTOM
──────────────────────────────────────────────────────────────

{Problembeschreibung}

### Symptom-Klassifizierung
| Kategorie | Wahrscheinlichkeit |
|-----------|-------------------|
| Build-Fehler | {Hoch/Mittel/Niedrig} |
| Laufzeitfehler | {Hoch/Mittel/Niedrig} |
| Netzwerk | {Hoch/Mittel/Niedrig} |
| SSL/TLS | {Hoch/Mittel/Niedrig} |
| Webhook/Git | {Hoch/Mittel/Niedrig} |
| Speicher | {Hoch/Mittel/Niedrig} |
```

### Schritt 2: Deployment-Status und Logs prufen

```bash
# Coolify-Services prufen
docker ps --filter "name=coolify" --format "table {{.Names}}\t{{.Status}}"

# Anwendungscontainer prufen
docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Anwendungslogs (vom Coolify-Dashboard oder CLI)
docker logs <container-name> --tail 200 2>&1

# Traefik-Proxy-Logs
docker logs coolify-proxy --tail 100 2>&1 | grep -i "error\|warn"

# Systemressourcen
free -h
df -h /var/lib/docker
```

```
──────────────────────────────────────────────────────────────
DEPLOYMENT-STATUS
──────────────────────────────────────────────────────────────

| Prufung | Ergebnis | Details |
|---------|----------|---------|
| Container-Zustand | {running/exited/restarting} | {Laufzeit oder Exit-Code} |
| Health Check | {healthy/unhealthy/none} | {Letztes Prufungsergebnis} |
| Traefik-Route | {aktiv/fehlend} | {Domain-Routing-Status} |
| Letztes Deploy | {Erfolg/Fehlgeschlagen} | {Zeitstempel} |
| Ressourcen | {OK/Warnung} | CPU: {%}, RAM: {verwendet/gesamt} |
| Festplatte | {OK/Warnung} | {verwendet/gesamt} ({Prozent}) |
```

### Schritt 3: Container-Status prufen

```bash
# Detaillierte Container-Inspektion
docker inspect <container-name> --format='
  State: {{.State.Status}}
  Exit Code: {{.State.ExitCode}}
  OOM Killed: {{.State.OOMKilled}}
  Started: {{.State.StartedAt}}
  Finished: {{.State.FinishedAt}}
  Restarts: {{.RestartCount}}
'

# Container-Prozesse
docker exec <container-name> ps aux 2>/dev/null || echo "Exec nicht moglich (Container lauft nicht)"

# Container-Ressourcenverbrauch
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
```

### Schritt 4: Netzwerk prufen

```bash
# DNS-Auflosung
dig +short {domain}
nslookup {domain} 8.8.8.8

# Port-Erreichbarkeit (von extern)
curl -s -o /dev/null -w "%{http_code}" https://{domain}
curl -s -o /dev/null -w "%{http_code}" http://{domain}

# Traefik-Routing
docker logs coolify-proxy 2>&1 | grep "{domain}"

# Interne Konnektivitat (vom Container)
docker exec <container-name> wget -q -O- http://localhost:{port}/health 2>/dev/null

# Firewall prufen
sudo ufw status verbose
```

### Schritt 5: SSL und Let's Encrypt verifizieren

```bash
# Zertifikatsdetails
openssl s_client -connect {domain}:443 -servername {domain} 2>/dev/null | \
  openssl x509 -noout -dates -subject -issuer

# Let's Encrypt Logs
docker logs coolify-proxy 2>&1 | grep -i "acme\|certificate\|letsencrypt"

# ACME-Speicher
docker exec coolify-proxy cat /data/acme.json 2>/dev/null | jq '.[] | keys'

# DNS-Challenge-Verifizierung (falls Wildcard)
dig TXT _acme-challenge.{domain}
```

### Schritt 6: Webhooks und Git-Integration prufen

```
──────────────────────────────────────────────────────────────
GIT- & WEBHOOK-STATUS
──────────────────────────────────────────────────────────────

### GitHub App
- Prufen: GitHub > Settings > Applications > Coolify
- Kurzliche Zustellungen: Settings > Developer settings > GitHub Apps > Advanced
- Verifizieren: Repository hat Coolify App installiert

### Webhook-Zustellung
| Prufung | Status |
|---------|--------|
| Webhook-URL erreichbar | {ja/nein} |
| Status kurzlicher Zustellungen | {Erfolg/Fehler} |
| Antwortcode | {200/404/500} |
| Branch-Ubereinstimmung | {ja/nein} |
| Auto-Deploy aktiviert | {ja/nein} |

### Manueller Ausloser-Test
curl -X POST https://coolify.example.com/api/v1/deploy \
  -H "Authorization: Bearer {token}" \
  -d '{"uuid": "{service-uuid}"}'
```

### Schritt 7: Losung vorschlagen

```
──────────────────────────────────────────────────────────────
DIAGNOSE
──────────────────────────────────────────────────────────────

### Grundursache
{Beschreibung der Grundursache}

### Beweise
- {Beweis 1}
- {Beweis 2}

──────────────────────────────────────────────────────────────
LOSUNG
──────────────────────────────────────────────────────────────

### Hypothese 1: {Am wahrscheinlichsten}
**Ursache**: {Beschreibung}
**Losung**:
\`\`\`bash
{Behebungsbefehle}
\`\`\`

### Hypothese 2: {Alternative}
**Ursache**: {Beschreibung}
**Losung**:
\`\`\`bash
{Behebungsbefehle}
\`\`\`

──────────────────────────────────────────────────────────────
PRAVENTION
──────────────────────────────────────────────────────────────

Um dieses Problem zukunftig zu vermeiden:
- [ ] {Empfehlung 1}
- [ ] {Empfehlung 2}
- [ ] {Empfehlung 3}

──────────────────────────────────────────────────────────────
NUTZLICHE BEFEHLE
──────────────────────────────────────────────────────────────

# Service redeployen
# Dashboard > Service > Deploy (oder Rebuild ohne Cache)

# Traefik Proxy neustarten
docker restart coolify-proxy

# Docker-Ressourcen bereinigen
docker system prune -af

# Gesundheitsstatus aller Container prufen
docker ps --format "{{.Names}}: {{.Status}}" | sort
```

## Diagnose-Checkliste

### Grundlegende Informationen
- [ ] Genaue Fehlermeldung oder Symptom notiert
- [ ] Startzeit des Problems identifiziert
- [ ] Kurzliche Anderungen uberpruft (Deploy, Konfiguration, DNS)
- [ ] Reproduzierbarkeit bestatigt

### Umgebung
- [ ] Coolify-Version gepruft
- [ ] Server-Ressourcen verifiziert (RAM, Festplatte, CPU)
- [ ] Docker-Status verifiziert
- [ ] Netzwerkverbindung getestet

### Durchgefuhrte Prufungen
- [ ] Deployment-Logs analysiert
- [ ] Container-Zustand gepruft
- [ ] Traefik-Routing verifiziert
- [ ] DNS-Auflosung bestatigt
- [ ] SSL-Zertifikat validiert
- [ ] Webhook-Zustellung gepruft
