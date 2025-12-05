# Analise de Tamanho do Bundle

Analisar o bundle de producao para identificar oportunidades de otimizacao.

## O Que Este Comando Faz

1. **Analise do Bundle**
   - Visualizar composicao do bundle
   - Identificar dependencias grandes
   - Detectar codigo duplicado
   - Verificar code splitting
   - Analisar tamanhos de chunks

2. **Ferramentas Usadas**
   - rollup-plugin-visualizer (Vite)
   - webpack-bundle-analyzer (Webpack)
   - source-map-explorer

3. **Relatorio Gerado**
   - Treemap interativo
   - Decomposicao de tamanho por modulo
   - Tamanhos comprimidos com gzip
   - Recomendacoes de otimizacao

## Como Usar

```bash
# Analisar bundle
npm run build:analyze

# Ou com pnpm
pnpm build:analyze
```

## Tamanhos Recomendados de Bundle

- **Bundle Inicial**: < 200KB (gzipped)
- **JavaScript Total**: < 500KB (gzipped)
- **Chunks Individuais**: < 100KB cada
- **Maior Chunk**: < 200KB

## Melhores Praticas

1. **Analisar regularmente** apos adicionar dependencias
2. **Definir orcamentos de tamanho** e aplicar no CI
3. **Lazy load** codigo nao-critico
4. **Tree shake** agressivamente
5. **Monitorar** tamanho do bundle ao longo do tempo
6. **Dividir codigo** inteligentemente
7. **Escolher alternativas leves**
8. **Remover** dependencias nao utilizadas
