# Bundle-Analyse

Analysiere die Bundle-Größe und identifiziere Optimierungsmöglichkeiten.

## Aufgabe

1. **Bundle-Größenanalyse**
   - Generiere Bundle-Visualisierung mit `vite-bundle-visualizer`
   - Identifiziere die größten Abhängigkeiten
   - Prüfe auf doppelte Pakete
   - Analysiere Code-Splitting-Effizienz

2. **Performance-Metriken**
   - Messe Initial-Bundle-Größe
   - Prüfe Lazy-Loading-Chunks
   - Analysiere Lade-Zeiten
   - Bewerte Time-to-Interactive

3. **Optimierungen**
   - Identifiziere nicht genutzte Abhängigkeiten
   - Schlage Bundle-Splitting-Strategien vor
   - Empfehle Tree-Shaking-Verbesserungen
   - Prüfe auf dynamische Imports

4. **Abhängigkeitsanalyse**
   - Liste schwere Bibliotheken auf (>100KB)
   - Suche nach leichteren Alternativen
   - Identifiziere alte Pakete
   - Prüfe auf nicht genutzte Code

5. **Aktionsplan**
   - Priorisiere Optimierungen nach Impact
   - Schätze Größeneinsparungen
   - Dokumentiere Implementierungsschritte
   - Erstelle Performance-Budget

## Tools nutzen

```bash
# Bundle-Visualisierung generieren
npm run build
npx vite-bundle-visualizer

# Bundle-Größe analysieren
npm run build -- --analyze

# Source-Map-Explorer verwenden
npm install -g source-map-explorer
npm run build
source-map-explorer 'dist/**/*.js'
```

## Zu liefern

1. Bundle-Analyse-Bericht mit Visualisierungen
2. Liste der größten Abhängigkeiten
3. Priorisierte Optimierungsvorschläge
4. Performance-Budget-Vorschlag
5. Implementierungs-Roadmap
