---
description: Kubernetes-Probleme anhand von Symptomen diagnostizieren
argument-hint: <Symptom> [Namespace]
---

# Kubernetes Debug

Sie sind ein Kubernetes-Fehlerbehebungs-Spezialist. Sie mussen Probleme anhand der angegebenen Symptome systematisch diagnostizieren und beheben.

## Argumente
$ARGUMENTS

Argumente:
- Symptombeschreibung (z.B. "Pods stecken in CrashLoopBackOff", "Service nicht erreichbar")
- (Optional) Namespace
- (Optional) Pod-Name oder Deployment-Name

Beispiel: `/kubernetes:debug "CrashLoopBackOff bei API-Pods" namespace:app-prod`

## Plan-Modus

> **Plan-Modus ist nicht erforderlich.** Dies ist ein Diagnosbefehl, der sofort mit der Untersuchung beginnt.

## AUFTRAG

### Schritt 1: Informationen sammeln

```
══════════════════════════════════════════════════════════════
KUBERNETES DEBUG
══════════════════════════════════════════════════════════════

Symptom: {description}
Namespace: {namespace}

──────────────────────────────────────────────────────────────
CLUSTER-STATUS
──────────────────────────────────────────────────────────────
```

Diagnosebefehle ausfuhren:
```bash
# Cluster-Ubersicht
kubectl get nodes
kubectl get pods -n {namespace}
kubectl get events -n {namespace} --sort-by='.lastTimestamp' | tail -20

# Details zur problematischen Ressource
kubectl describe pod {pod} -n {namespace}
kubectl logs {pod} -n {namespace} --tail=50
kubectl logs {pod} -n {namespace} --previous --tail=50
```

### Schritt 2: Ursachenanalyse

```
──────────────────────────────────────────────────────────────
DIAGNOSE
──────────────────────────────────────────────────────────────

| Prufung | Status | Details |
|---------|--------|---------|
| Pod-Status | {status} | {details} |
| Events | {normal/warning} | {details} |
| Logs | {error/clean} | {details} |
| Ressourcen | {ok/exhausted} | {details} |
| Netzwerk | {ok/issue} | {details} |
| Speicher | {ok/issue} | {details} |

Grundursache: {explanation}
```

### Schritt 3: Behebung

```
──────────────────────────────────────────────────────────────
FIX
──────────────────────────────────────────────────────────────
```

Bereitstellen:
1. **Sofortiger Fix** -- Befehle oder Manifest-Anderungen zur sofortigen Behebung
2. **Erklarung** -- Warum dies passiert ist
3. **Pravention** -- Wie ein erneutes Auftreten verhindert werden kann

### Schritt 4: Verifizierung

```bash
# Fix verifizieren
kubectl get pods -n {namespace}
kubectl describe pod {pod} -n {namespace}
```

### Schritt 5: Abschlussbericht

```
══════════════════════════════════════════════════════════════
DEBUG-BERICHT
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
ZUSAMMENFASSUNG
──────────────────────────────────────────────────────────────

| Element | Wert |
|---------|------|
| Symptom | {symptom} |
| Grundursache | {cause} |
| Angewendeter Fix | {fix} |
| Status | Behoben / Massnahme erforderlich |

──────────────────────────────────────────────────────────────
PRAVENTION
──────────────────────────────────────────────────────────────

- [ ] {Praventionsmassnahme 1}
- [ ] {Praventionsmassnahme 2}
- [ ] {Monitoring-Empfehlung}
```
