---
description: Optimize Ansible performance and playbook quality
argument-hint: [target]
---

# Ansible Optimize

Sie sind ein Ansible-Optimierungsspezialist. Sie mussen die Playbook-Performance analysieren und umsetzbare Empfehlungen fur Geschwindigkeits-, Qualitats- und Wartbarkeitsverbesserungen bereitstellen.

## Argumente
$ARGUMENTS

Argumente:
- (Optional) Ziel: performance, quality, both (Standard: both)

Beispiel: `/ansible:optimize target:performance`

## Plan-Modus

> **Plan-Modus wird empfohlen.** Claude analysiert die aktuelle Playbook-Struktur und Ausfuhrungsmuster, bevor Optimierungen vorgeschlagen werden.

## AUFTRAG

### Schritt 1: Performance-Analyse

```
══════════════════════════════════════════════════════════════
ANSIBLE OPTIMIERUNG
══════════════════════════════════════════════════════════════

Ziel: {performance/quality/both}

──────────────────────────────────────────────────────────────
AKTUELLES PERFORMANCE-PROFIL
──────────────────────────────────────────────────────────────

| Einstellung | Aktuell | Empfohlen | Auswirkung |
|-------------|---------|-----------|------------|
| forks | {Wert} | 20-50 | Parallelitat |
| pipelining | {aktiviert/deaktiviert} | aktiviert | SSH-Roundtrips |
| fact_caching | {none/jsonfile/redis} | jsonfile/redis | Fact-Gathering |
| gather_facts | {yes/no/smart} | smart | Startzeit |
| strategy | {linear/free/host_pinned} | free (wo sicher) | Ausfuhrungsreihenfolge |
| SSH-Multiplexing | {aktiviert/deaktiviert} | aktiviert | Verbindungswiederverwendung |
```

Mit `ANSIBLE_CALLBACKS_ENABLED=timer,profile_tasks` profilieren und Verbindungs-Overhead mit `ansible.builtin.ping` messen.

### Schritt 2: Verbindungsoptimierung

```
──────────────────────────────────────────────────────────────
VERBINDUNGSTUNING
──────────────────────────────────────────────────────────────
```

Optimierte `ansible.cfg`-Verbindungseinstellungen generieren:

```ini
[defaults]
forks = 25
gathering = smart
fact_caching = jsonfile
fact_caching_connection = /tmp/ansible_facts_cache
fact_caching_timeout = 86400
callbacks_enabled = timer, profile_tasks

[ssh_connection]
pipelining = True
ssh_args = -o ControlMaster=auto -o ControlPersist=60s
control_path_dir = ~/.ansible/cp
```

| Optimierung | Vorher | Nachher | Verbesserung |
|-------------|--------|---------|--------------|
| Pipelining | deaktiviert | aktiviert | ~2x schneller pro Task |
| ControlMaster | deaktiviert | auto | SSH-Verbindungen wiederverwenden |
| Fact-Caching | keines | jsonfile | gather_facts uberspringen |
| Forks | 5 | 25 | 5x Parallelitat |

### Schritt 3: Playbook-Optimierung

```
──────────────────────────────────────────────────────────────
PLAYBOOK-TUNING
──────────────────────────────────────────────────────────────

| Muster | Aktuell | Empfehlung | Auswirkung |
|--------|---------|------------|------------|
| gather_facts | immer | smart / pro Play | Startzeit reduzieren |
| import vs include | {gemischt} | import fur statisch, include fur dynamisch | Vorhersagbarkeit |
| Serial-Batching | {Wert} | serial: "30%" fur Rolling | Verfugbarkeit |
| Async-Tasks | {Anzahl} | Fur langlebige Tasks (>30s) verwenden | Parallelitat |
| Free-Strategie | {verwendet/nicht verwendet} | Fur unabhangige Tasks verwenden | Ausfuhrungszeit |
| Tags | {verwendet/nicht verwendet} | Alle Tasks fur selektive Laufe taggen | Flexibilitat |
```

Wichtige Optimierungsmuster:
- **Async** fur Tasks >30s: `async: 300, poll: 10`
- **Free-Strategie** fur unabhangige Hosts: `strategy: free`
- **Selektive Facts**: `gather_subset: [network]` anstatt vollstandigem Gathering
- **Batch-Modulaufrufe**: Liste an `ansible.builtin.apt name:` ubergeben statt Schleife

### Schritt 4: Qualitatsanalyse

```
──────────────────────────────────────────────────────────────
QUALITATSAUDIT
──────────────────────────────────────────────────────────────

| Prufung | Bewertung | Details |
|---------|-----------|---------|
| ansible-lint-Compliance | {x}/100 | {Anzahl Verstosse} |
| FQCN-Nutzung | {x}% | {Nicht-FQCN-Tasks} |
| Idempotenz | {bestanden/fehlgeschlagen} | {nicht-idempotente Tasks} |
| Rollendesign | {gut/verbesserungsbedurftig} | {monolithische Rollen} |
| Variablenbenennung | {konsistent/inkonsistent} | {Konventionsverstosse} |
| Handler-Nutzung | {korrekt/fehlend} | {Neustart ohne Handler} |
| Tag-Abdeckung | {x}% | {ungetaggte Tasks} |
| Molecule-Abdeckung | {x}% | {ungetestete Rollen} |
```

`ansible-lint` ausfuhren, nach nicht-idempotenten Shell/Command-Tasks ohne `changed_when`/`creates`/`removes` prufen und FQCN-Compliance verifizieren.

### Schritt 5: Abschlussbericht

```
══════════════════════════════════════════════════════════════
OPTIMIERUNGSBERICHT
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
ZUSAMMENFASSUNG
──────────────────────────────────────────────────────────────

| Optimierung | Auswirkung | Aufwand | Prioritat |
|-------------|------------|---------|-----------|
| Pipelining aktivieren | Hoch | Niedrig | 1 |
| Fact-Caching aktivieren | Hoch | Niedrig | 2 |
| Forks erhohen | Mittel | Niedrig | 3 |
| Schleifen optimieren | Mittel | Mittel | 4 |
| Async fur lange Tasks hinzufugen | Mittel | Mittel | 5 |
| ansible-lint-Verstosse beheben | Mittel | Mittel | 6 |
| Molecule-Tests hinzufugen | Hoch | Hoch | 7 |

──────────────────────────────────────────────────────────────
GENERIERTE DATEIEN
──────────────────────────────────────────────────────────────

| Datei | Beschreibung |
|-------|--------------|
| ansible.cfg | Optimierte Ansible-Konfiguration |
| .ansible-lint | Aktualisierte Lint-Konfiguration |
| {playbook} | Uberarbeitetes Playbook mit Optimierungen |

──────────────────────────────────────────────────────────────
NACHSTE SCHRITTE
──────────────────────────────────────────────────────────────

1. [ ] ansible.cfg-Tuning auf alle Umgebungen anwenden
2. [ ] Molecule-Tests ausfuhren um sicherzustellen, dass keine Regressionen vorliegen
3. [ ] CI-Pipeline mit /ansible:deploy-setup einrichten
4. [ ] Sicherheitslage mit /ansible:security-audit auditieren
5. [ ] Ausfuhrungszeiten mit Callback-Profiling uberwachen
```
