# Projektverfassung

## Dokumentinformationen
| Feld | Wert |
|------|------|
| **Projekt** | {project_name} |
| **Version** | {version} |
| **Datum** | {date} |
| **Autor** | {author} |
| **Status** | Entwurf / Ratifiziert |

---

## 1. Vision und Mission

### 1.1 Produktvision
{Visionserklärung in einem Satz}

### 1.2 Missionserklärung
{Was das Produkt tut, für wen und warum}

### 1.3 Nicht verhandelbare Ziele
- {objective_1}
- {objective_2}

---

## 2. Technische Einschränkungen

### 2.1 Technologie-Stack
| Schicht | Technologie | Version | Gesperrt |
|---------|------------|---------|----------|
| {layer} | {tech} | {version} | Ja/Nein |

### 2.2 Architekturmuster
- **Muster**: {pattern} (z.B. Clean Architecture, Hexagonal, MVC)
- **Begründung**: {why}

### 2.3 Infrastruktur-Einschränkungen
- {constraint_1}
- {constraint_2}

---

## 3. Designprinzipien

### 3.1 Obligatorische Muster
| Muster | Geltungsbereich | Begründung |
|--------|----------------|------------|
| {pattern} | {where} | {why} |

### 3.2 Verbotene Muster
| Anti-Muster | Grund | Alternative |
|-------------|-------|-------------|
| {pattern} | {why_forbidden} | {use_instead} |

### 3.3 Code-Standards
- {standard_1}
- {standard_2}

---

## 4. Nicht-funktionale Anforderungen (NFA)

### 4.1 Leistungsziele
| Metrik | Ziel | SLA |
|--------|------|-----|
| {metric} | {target} | {sla} |

### 4.2 Sicherheitsanforderungen
- {security_req_1}
- {security_req_2}

### 4.3 Compliance
| Standard | Geltungsbereich | Obligatorisch |
|----------|----------------|---------------|
| {standard} | {scope} | Ja/Nein |

### 4.4 Verfügbarkeit und Zuverlässigkeit
- **Verfügbarkeitsziel**: {target}
- **RTO**: {rto}
- **RPO**: {rpo}

---

## 5. Grenzen

### 5.1 Explizite Ausschlüsse
- {exclusion_1}
- {exclusion_2}

### 5.2 Integrationsgrenzen
| System | Richtung | Protokoll | Eigentum |
|--------|----------|-----------|----------|
| {system} | Eingang/Ausgang/Beides | {protocol} | Ja/Nein |

### 5.3 Teamgrenzen
- {boundary_1}

---

## 6. Änderungsverfahren

Änderungen an dieser Verfassung erfordern:
1. Schriftlicher Vorschlag mit Begründung
2. Auswirkungsanalyse auf bestehenden Code und Spezifikationen
3. Genehmigung durch {role}
4. Versionserhöhung und Changelog-Eintrag

---

## Revisionshistorie
| Version | Datum | Autor | Änderungen |
|---------|-------|-------|------------|
| 1.0 | {date} | {author} | Erstmalige Ratifizierung |
