---
description: "Kubernetes-Sicherheitslage prufen"
argument-hint: "[Namespace] [Umfang]"
---

# Kubernetes Security Audit

Sie sind ein Kubernetes-Sicherheitsspezialist. Sie mussen ein umfassendes Sicherheitsaudit des Clusters oder Namespaces durchfuhren.

## Argumente
$ARGUMENTS

Argumente:
- (Optional) Zu prufender Namespace (Standard: alle Namespaces)
- (Optional) Umfang: rbac, network, pods, secrets, images, full (Standard: full)

Beispiel: `/kubernetes:security-audit namespace:app-prod scope:full`

## Plan-Modus

> **Plan-Modus ist bedingt.** Aktiviert sich automatisch, wenn der Umfang "full" ist oder mehrere Namespaces umfasst.

## AUFTRAG

### Schritt 1: Umfangsdefinition

```
══════════════════════════════════════════════════════════════
KUBERNETES SICHERHEITSAUDIT
══════════════════════════════════════════════════════════════

Umfang: {Namespace oder cluster-weit}
Kategorien: {rbac, network, pods, secrets, images}

──────────────────────────────────────────────────────────────
AUDIT-UMFANG
──────────────────────────────────────────────────────────────
```

### Schritt 2: RBAC-Audit

```
──────────────────────────────────────────────────────────────
RBAC-ANALYSE
──────────────────────────────────────────────────────────────

| Prufung | Status | Details |
|---------|--------|---------|
| cluster-admin-Bindungen | {anzahl} | {details} |
| Ubermassig permissive Rollen | {anzahl} | {details} |
| Ungenutzte ServiceAccounts | {anzahl} | {details} |
| Token Auto-Mount | {aktiviert/deaktiviert} | {details} |
```

### Schritt 3: Pod-Sicherheitsaudit

```
──────────────────────────────────────────────────────────────
POD-SICHERHEIT
──────────────────────────────────────────────────────────────

| Prufung | Status | Details |
|---------|--------|---------|
| PSS-Durchsetzung | {restricted/baseline/keine} | {details} |
| Root-Container | {anzahl} | {pod-liste} |
| Privilegierte Container | {anzahl} | {pod-liste} |
| Schreibgeschutztes Root-FS | {%} | {details} |
| Capabilities entfernt | {%} | {details} |
| Seccomp-Profile | {%} | {details} |
```

### Schritt 4: Netzwerksicherheitsaudit

```
──────────────────────────────────────────────────────────────
NETZWERKSICHERHEIT
──────────────────────────────────────────────────────────────

| Prufung | Status | Details |
|---------|--------|---------|
| Default-Deny-Richtlinien | {ja/nein pro ns} | {details} |
| Exponierte Services | {anzahl} | {service-liste} |
| Ingress-TLS | {%} | {details} |
| Interne Service-Exposition | {anzahl} | {details} |
```

### Schritt 5: Secrets-Audit

```
──────────────────────────────────────────────────────────────
SECRETS-VERWALTUNG
──────────────────────────────────────────────────────────────

| Prufung | Status | Details |
|---------|--------|---------|
| Secrets in Env-Variablen | {anzahl} | {details} |
| Externe Secrets | {ja/nein} | {tool} |
| Verschlusselung at Rest | {aktiviert/deaktiviert} | {details} |
| Secret-Rotation | {automatisiert/manuell/keine} | {details} |
```

### Schritt 6: Image-Sicherheit

```
──────────────────────────────────────────────────────────────
IMAGE-SICHERHEIT
──────────────────────────────────────────────────────────────

| Prufung | Status | Details |
|---------|--------|---------|
| Latest-Tags | {anzahl} | {images} |
| Unsignierte Images | {anzahl} | {images} |
| Bekannte Schwachstellen | {anzahl} | {schweregrad-aufschlusselung} |
| Vertrauenswurdige Registries | {%} | {details} |
```

### Schritt 7: Abschlussbericht

```
══════════════════════════════════════════════════════════════
SICHERHEITSAUDIT-BERICHT
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
BEWERTUNG
──────────────────────────────────────────────────────────────

| Kategorie | Bewertung | Status |
|-----------|-----------|--------|
| RBAC | {x}/100 | {bestanden/warnung/fehlgeschlagen} |
| Pod-Sicherheit | {x}/100 | {bestanden/warnung/fehlgeschlagen} |
| Netzwerk | {x}/100 | {bestanden/warnung/fehlgeschlagen} |
| Secrets | {x}/100 | {bestanden/warnung/fehlgeschlagen} |
| Images | {x}/100 | {bestanden/warnung/fehlgeschlagen} |
| **Gesamt** | **{x}/100** | **{status}** |

──────────────────────────────────────────────────────────────
KRITISCHE BEFUNDE
──────────────────────────────────────────────────────────────

1. [ ] {kritischer Befund 1}
2. [ ] {kritischer Befund 2}

──────────────────────────────────────────────────────────────
EMPFEHLUNGEN
──────────────────────────────────────────────────────────────

Prioritat 1 (Sofort):
- [ ] {Empfehlung}

Prioritat 2 (Diesen Sprint):
- [ ] {Empfehlung}

Prioritat 3 (Nachstes Quartal):
- [ ] {Empfehlung}
```
