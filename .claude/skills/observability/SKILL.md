---
name: observability
description: OpenTelemetry, distributed tracing, structured logging, metrics (Prometheus, Grafana, Datadog). Use when implementing monitoring, tracing, or debugging production issues.
triggers:
  files: ["**/otel*", "**/prometheus*", "**/grafana*", "**/jaeger*", "**/tempo*", "**/loki*"]
  keywords: ["opentelemetry", "otel", "tracing", "distributed tracing", "prometheus", "grafana", "datadog", "structured logging", "metrics", "observability", "monitoring", "SLI", "SLO", "golden signals"]
auto_suggest: true
---

# Observability — OpenTelemetry & Distributed Tracing

Instrumentation moderne avec OpenTelemetry pour métriques, traces et logs structurés.

## Piliers de l'Observabilité

| Pilier | Technologies | Métriques clés |
|--------|--------------|----------------|
| **Metrics** | Prometheus, Grafana, Datadog | RED (Rate, Errors, Duration), USE (Utilization, Saturation, Errors) |
| **Traces** | OpenTelemetry, Jaeger, Tempo | P95 latency, span duration, error rate |
| **Logs** | Loki, ElasticSearch, Datadog | Structured JSON, correlation IDs |

## OpenTelemetry (OTel) Stack

```javascript
// Node.js — Auto-instrumentation
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter(),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
```

## Golden Signals (Google SRE)

| Signal | Description | Seuil typique |
|--------|-------------|---------------|
| **Latency** | P50, P95, P99 response time | P95 < 200ms |
| **Traffic** | Requests per second | Baseline + alerting |
| **Errors** | Error rate (5xx, exceptions) | < 0.1% |
| **Saturation** | CPU, Memory, Disk | < 80% sustained |

## Structured Logging (JSON)

```json
{
  "timestamp": "2026-04-17T10:30:00Z",
  "level": "error",
  "message": "Payment processing failed",
  "trace_id": "4bf92f3577b34da6a3ce929d0e0e4736",
  "span_id": "00f067aa0ba902b7",
  "service.name": "payment-api",
  "error.type": "PaymentGatewayTimeout"
}
```

## SLI / SLO / SLA

| Concept | Exemple |
|---------|---------|
| **SLI** (Indicator) | 99.5% requests < 200ms |
| **SLO** (Objective) | 99.9% uptime mensuel |
| **SLA** (Agreement) | 99.95% uptime + pénalités |

---

Pour instrumentation détaillée par stack : invoquer `@observability-engineer`
