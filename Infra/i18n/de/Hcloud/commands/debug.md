---
description: Diagnose Hetzner Cloud infrastructure issues from symptoms
argument-hint: <Symptom> [resource]
---

# Hcloud Debug

Du bist ein Hetzner Cloud Troubleshooting-Spezialist. Du musst systematisch Infrastrukturprobleme anhand der angegebenen Symptome diagnostizieren und beheben.

## Argumente
$ARGUMENTS

Argumente:
- Symptombeschreibung (z.B. "Server nicht erreichbar", "Load-Balancer-Health-Check schlägt fehl", "Volume wird nicht gemountet")
- (Optional) Ressourcenname oder -typ
- (Optional) Datacenter oder Standort

Beispiel: `/hcloud:debug "SSH-Verbindung auf web-01 abgelehnt" resource:server`

## Plan-Modus

> **Plan-Modus ist nicht erforderlich.** Dies ist ein Diagnosebefehl, der sofort mit der Untersuchung fortfährt.

## MISSION

### Schritt 1: Informationen sammeln

```
══════════════════════════════════════════════════════════════
HCLOUD DEBUG
══════════════════════════════════════════════════════════════

Symptom: {Beschreibung}
Ressource: {Ressource}
Standort: {Datacenter}

──────────────────────────────────────────────────────────────
UMGEBUNGSSTATUS
──────────────────────────────────────────────────────────────
```

Diagnosebefehle ausführen:
```bash
# Serverstatus
hcloud server describe {resource}
hcloud server list-actions {resource}

# Netzwerkstatus
hcloud server describe {resource} -o json | jq '.private_net'
hcloud network list

# Firewall-Status
hcloud firewall list
hcloud server describe {resource} -o json | jq '.public_net.firewalls'

# Volume-Status
hcloud volume list --server {resource}

# Load-Balancer-Status (falls zutreffend)
hcloud load-balancer list
```

### Schritt 2: Ursachenanalyse

```
──────────────────────────────────────────────────────────────
DIAGNOSE
──────────────────────────────────────────────────────────────

| Prüfung | Status | Details |
|---------|--------|---------|
| Serverstatus | {running/off/rebuilding} | {Details} |
| Öffentliche IP | {zugewiesen/fehlend} | {IP-Adresse} |
| Firewall-Regeln | {ok/blockierend} | {Details} |
| Privates Netzwerk | {angehängt/getrennt} | {Details} |
| Volume-Mount | {ok/fehlgeschlagen} | {Details} |
| Cloud-init | {abgeschlossen/läuft/fehlgeschlagen} | {Details} |
| SSH-Schlüssel | {bereitgestellt/fehlend} | {Details} |

──────────────────────────────────────────────────────────────
ENTSCHEIDUNGSBAUM
──────────────────────────────────────────────────────────────

Symptom: {Symptom}
  ├── Serverproblem?
  │   ├── Läuft nicht → hcloud server describe prüfen, einschalten
  │   ├── Steckt beim Rebuild fest → Warten oder Support kontaktieren
  │   └── Cloud-init fehlgeschlagen → Rescue aktivieren, Logs prüfen
  ├── Netzwerkproblem?
  │   ├── Keine öffentliche IP → Primary-IP-Zuweisung prüfen
  │   ├── Firewall blockiert → Regeln mit hcloud firewall describe prüfen
  │   └── Privates Netzwerk → Attachment und Subnetz prüfen
  ├── Volume-Problem?
  │   ├── Nicht angehängt → hcloud volume attach
  │   ├── Mount-Fehler → Dateisystem prüfen, /dev/disk/by-id/
  │   └── Falscher Standort → Volume muss im selben Datacenter sein
  └── Load-Balancer-Problem?
      ├── Health-Check fehlgeschlagen → Port, Pfad, Statuscodes prüfen
      ├── Keine Targets → Label-Selektor verifizieren
      └── TLS-Fehler → Zertifikat prüfen

Ursache: {Erklärung}
```

### Schritt 3: Behebung

```
──────────────────────────────────────────────────────────────
FIX
──────────────────────────────────────────────────────────────
```

Bereitstellen:
1. **Sofortige Behebung** -- Exakte hcloud-Befehle oder Konfigurationsänderungen zur sofortigen Lösung des Problems
2. **Erklärung** -- Warum dies passiert ist, einschließlich Hetzner-Cloud-Spezifika
3. **Prävention** -- Firewall-Regeln, cloud-init-Skripte oder Monitoring zur Vermeidung eines erneuten Auftretens

### Schritt 4: Verifikation

```bash
# Verifizieren, dass Server läuft
hcloud server describe {resource}

# Konnektivität verifizieren
ssh root@{server-ip} echo "OK"

# Health Checks verifizieren (falls LB)
hcloud load-balancer describe {lb-name} -o json | jq '.targets[].health_status'
```

### Schritt 5: Abschlussbericht

```
══════════════════════════════════════════════════════════════
DEBUG-BERICHT
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
ZUSAMMENFASSUNG
──────────────────────────────────────────────────────────────

| Punkt | Wert |
|-------|------|
| Symptom | {Symptom} |
| Ursache | {Ursache} |
| Angewandter Fix | {Fix} |
| Status | Behoben / Aktion erforderlich |

──────────────────────────────────────────────────────────────
PRÄVENTION
──────────────────────────────────────────────────────────────

- [ ] Monitoring für {Bedingung} hinzufügen
- [ ] Cloud-init aktualisieren um {Problem} zu vermeiden
- [ ] CI-Check für {Validierung} hinzufügen
- [ ] Fix im Runbook für @hcloud-debug-Referenz dokumentieren
```
