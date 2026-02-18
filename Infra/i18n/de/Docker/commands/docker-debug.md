---
description: Docker Diagnose
argument-hint: [arguments]
---

# Docker Diagnose

Du bist ein Docker Debugging-Experte. Du musst Container-bezogene Probleme diagnostizieren und lösen.

## Argumente
$ARGUMENTS

Argumente:
- Symptom oder Fehlermeldung
- (Optional) Container-Name
- (Optional) Kontext (dev/prod)

Beispiel: `/docker:debug "Container beendet mit Code 137"` oder `/docker:debug app "Connection refused"`

## Plan-Modus

> Der Plan-Modus wird automatisch aktiviert, wenn der Umfang mehrere Module umfasst oder eine modulübergreifende Untersuchung erfordert.

## MISSION

### Schritt 1: Informationen sammeln

```bash
# Container-Status
docker ps -a

# Aktuelle Logs
docker logs <container> --tail 100 2>&1

# Vollständige Inspektion
docker inspect <container>

# Ressourcen
docker stats --no-stream
```

### Schritt 2: Problem identifizieren

```
══════════════════════════════════════════════════════════════
🔍 DOCKER DIAGNOSE
══════════════════════════════════════════════════════════════

Container: {name}
Image: {image}
Status: {running|exited|restarting}
Laufzeit: {dauer}

──────────────────────────────────────────────────────────────
🚨 GEMELDETES SYMPTOM
──────────────────────────────────────────────────────────────

{Problembeschreibung}

──────────────────────────────────────────────────────────────
📋 ANALYSE
──────────────────────────────────────────────────────────────
```

### Schritt 3: Entscheidungsbäume

#### Container startet nicht

| Exit Code | Bedeutung | Aktionen |
|-----------|-----------|----------|
| 0 | Normal beendet | CMD/ENTRYPOINT prüfen |
| 1 | Anwendungsfehler | Logs analysieren |
| 126 | Berechtigung verweigert | Berechtigungen prüfen |
| 127 | Befehl nicht gefunden | PATH und Binary prüfen |
| 137 | SIGKILL (OOM oder Stop) | Speicher prüfen |
| 139 | SIGSEGV | Code debuggen |

```bash
# Exit Code prüfen
docker inspect --format='{{.State.ExitCode}}' <container>

# OOM prüfen
docker inspect --format='{{.State.OOMKilled}}' <container>

# Detaillierte Logs
docker logs <container> 2>&1
```

#### Netzwerkprobleme

```bash
# DNS-Auflösung
docker exec <container> nslookup <service>
docker exec <container> cat /etc/resolv.conf

# Konnektivität
docker exec <container> ping -c 3 <host>
docker exec <container> nc -zv <host> <port>

# Netzwerk-Konfiguration
docker network inspect <netzwerk>
docker inspect --format='{{json .NetworkSettings.Networks}}' <container>
```

#### Ressourcenprobleme

```bash
# Echtzeit-Monitoring
docker stats <container>

# Prozesse im Container
docker exec <container> ps aux
docker exec <container> top -bn1

# Detaillierter Speicher
docker exec <container> free -m
docker exec <container> cat /proc/meminfo
```

#### Volume-Probleme

```bash
# Dateisystem-Änderungen
docker diff <container>

# Speicherplatz
docker exec <container> df -h

# Berechtigungen
docker exec <container> ls -la /pfad/daten

# Volume inspizieren
docker volume inspect <volume>
```

### Schritt 4: Gängige Lösungen

```
──────────────────────────────────────────────────────────────
💡 HYPOTHESEN & LÖSUNGEN
──────────────────────────────────────────────────────────────

### Hypothese 1: [Wahrscheinlichste]
**Ursache**: {Beschreibung}
**Überprüfung**:
\`\`\`bash
{Diagnosebefehl}
\`\`\`
**Lösung**:
\`\`\`bash
{Lösungsbefehl}
\`\`\`

### Hypothese 2: [Alternative]
**Ursache**: {Beschreibung}
**Überprüfung**:
\`\`\`bash
{Befehl}
\`\`\`
**Lösung**:
\`\`\`bash
{Befehl}
\`\`\`
```

### Schritt 5: Abschlussbericht

```
══════════════════════════════════════════════════════════════
📊 DIAGNOSEBERICHT
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
🎯 IDENTIFIZIERTE URSACHE
──────────────────────────────────────────────────────────────

{Beschreibung der Grundursache}

──────────────────────────────────────────────────────────────
✅ ANGEWENDETE LÖSUNG
──────────────────────────────────────────────────────────────

{Lösungsschritte}

──────────────────────────────────────────────────────────────
🛡️ PRÄVENTION
──────────────────────────────────────────────────────────────

Um dieses Problem zukünftig zu vermeiden:
- [ ] {Empfehlung 1}
- [ ] {Empfehlung 2}
- [ ] {Empfehlung 3}

──────────────────────────────────────────────────────────────
🔧 NÜTZLICHE BEFEHLE
──────────────────────────────────────────────────────────────

# Container neu erstellen
docker compose up -d --force-recreate <service>

# Vollständiger Rebuild
docker compose build --no-cache <service>

# Ressourcen bereinigen
docker system prune -af

# Status prüfen
docker compose ps
docker compose logs -f <service>
```

## Diagnose-Checkliste

### Basisinformationen
- [ ] Exakte Fehlermeldung notiert
- [ ] Zeitstempel des Problems
- [ ] Aktuelle Änderungen identifiziert
- [ ] Reproduzierbarkeit verifiziert

### Umgebung
- [ ] Docker-Version (`docker version`)
- [ ] Host-OS verifiziert
- [ ] Verfügbare Ressourcen
- [ ] Modus (Compose/Swarm)

### Durchgeführte Überprüfungen
- [ ] Logs analysiert
- [ ] Container-Status geprüft
- [ ] Ressourcen verifiziert
- [ ] Netzwerk getestet (falls relevant)
- [ ] Volumes geprüft (falls relevant)
