---
description: "Kubernetes-Ressourcennutzung und -kosten optimieren"
argument-hint: "[Namespace] [Ziel]"
---

# Kubernetes Optimize

Sie sind ein Kubernetes-Optimierungs-Spezialist. Sie mussen die Ressourcennutzung analysieren und umsetzbare Empfehlungen fur Right-Sizing, Autoscaling und Kostensenkung geben.

## Argumente
$ARGUMENTS

Argumente:
- (Optional) Zu optimierender Namespace (Standard: alle Namespaces)
- (Optional) Ziel: resources, autoscaling, costs, full (Standard: full)

Beispiel: `/kubernetes:optimize namespace:app-prod target:resources`

## Plan-Modus

> **Plan-Modus wird empfohlen.** Claude analysiert die aktuelle Ressourcennutzung, bevor Anderungen vorgeschlagen werden.

## AUFTRAG

### Schritt 1: Ressourcenanalyse

```
══════════════════════════════════════════════════════════════
KUBERNETES OPTIMIERUNG
══════════════════════════════════════════════════════════════

Namespace: {namespace}
Ziel: {resources/autoscaling/costs/full}

──────────────────────────────────────────────────────────────
AKTUELLE RESSOURCENNUTZUNG
──────────────────────────────────────────────────────────────
```

Analysieren mit:
```bash
kubectl top pods -n {namespace}
kubectl top nodes
kubectl get hpa -n {namespace}
kubectl get pdb -n {namespace}
kubectl get vpa -n {namespace}
```

### Schritt 2: Right-Sizing-Analyse

```
──────────────────────────────────────────────────────────────
RIGHT-SIZING-EMPFEHLUNGEN
──────────────────────────────────────────────────────────────

| Workload | Aktueller Req | Aktuelles Limit | Tatsachliche Nutzung | Empfohlen |
|----------|---------------|-----------------|----------------------|-----------|
| api | 500m/512Mi | 1/1Gi | 120m/200Mi | 200m/300Mi |
| worker | 250m/256Mi | 500m/512Mi | 50m/100Mi | 100m/150Mi |

Mogliche Einsparungen: {estimate}
```

### Schritt 3: Autoscaling-Konfiguration

```
──────────────────────────────────────────────────────────────
AUTOSCALING-EMPFEHLUNGEN
──────────────────────────────────────────────────────────────

| Workload | Aktuell | Empfohlener HPA | VPA-Vorschlag |
|----------|---------|-----------------|---------------|
| api | 3 fest | 2-10, CPU 70% | mode: Auto |
| worker | 2 fest | 1-5, Warteschlangenlange | mode: Auto |
```

HPA-Manifeste generieren:
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
```

### Schritt 4: PodDisruptionBudget

```
──────────────────────────────────────────────────────────────
PDB-EMPFEHLUNGEN
──────────────────────────────────────────────────────────────

| Workload | Replicas | PDB | Empfehlung |
|----------|----------|-----|------------|
| api | 3 | keine | minAvailable: 2 |
| worker | 2 | keine | minAvailable: 1 |
```

PDB-Manifeste generieren.

### Schritt 5: Kostenoptimierung

```
──────────────────────────────────────────────────────────────
KOSTENANALYSE
──────────────────────────────────────────────────────────────

| Bereich | Aktuell | Optimiert | Einsparungen |
|---------|---------|-----------|--------------|
| Compute (CPU) | {x} Cores | {y} Cores | {z}% |
| Memory | {x} Gi | {y} Gi | {z}% |
| Speicher | {x} Gi | {y} Gi | {z}% |
| Spot/Preemptible | {nein} | {empfohlen} | {z}% |
```

### Schritt 6: Abschlussbericht

```
══════════════════════════════════════════════════════════════
OPTIMIERUNGSBERICHT
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
ZUSAMMENFASSUNG
──────────────────────────────────────────────────────────────

| Optimierung | Auswirkung | Aufwand | Prioritat |
|-------------|------------|---------|-----------|
| Requests richtig dimensionieren | Hoch | Niedrig | 1 |
| HPA hinzufugen | Hoch | Mittel | 2 |
| PDB hinzufugen | Mittel | Niedrig | 3 |
| Spot-Instanzen | Hoch | Mittel | 4 |

──────────────────────────────────────────────────────────────
GENERIERTE DATEIEN
──────────────────────────────────────────────────────────────

| Datei | Beschreibung |
|-------|--------------|
| {file} | {description} |

──────────────────────────────────────────────────────────────
NACHSTE SCHRITTE
──────────────────────────────────────────────────────────────

1. [ ] Right-Sizing zuerst in Staging anwenden
2. [ ] HPA aktivieren und 24h uberwachen
3. [ ] PDBs vor dem nachsten Wartungsfenster hinzufugen
4. [ ] Monitoring mit @kubernetes-monitoring konfigurieren
```
