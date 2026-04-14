# Padrões de Código — Paperclip (TypeScript)

## Linguagem & Versões

| Item | Padrão |
|---|---|
| Node.js | 20+ (LTS) |
| TypeScript | 5.x |
| Gerenciador de pacotes | pnpm 9.15+ (monorepo workspace) |
| Sistema de módulos | Somente ESM (`"type": "module"`) |

---

## TypeScript

Modo strict é **obrigatório**. `tsconfig.base.json`:

```jsonc
{
  "compilerOptions": {
    "target": "ES2023",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true
  }
}
```

**Proibido:** `any`, casts `as unknown as X` sem um comentário explicando por quê, `// @ts-ignore`, `// @ts-expect-error` sem uma issue vinculada.

**Obrigatório:** tipos de retorno explícitos em funções exportadas, `readonly` em props / tipos de domínio, uniões discriminadas para tipos variantes.

---

## Nomenclatura

| Tipo | Convenção | Exemplo |
|---|---|---|
| Arquivos | kebab-case | `agent-registry.ts`, `approval-service.ts` |
| Diretórios | kebab-case | `src/modules/approvals/` |
| Tipos / Interfaces | PascalCase | `AgentConfig`, `HeartbeatPayload` |
| Componentes React | PascalCase (arquivo + símbolo) | `OrgChart.tsx` exporta `OrgChart` |
| Funções / variáveis | camelCase | `reportCost`, `isApproved` |
| Constantes | UPPER_SNAKE_CASE | `DEFAULT_BUDGET_TOKENS`, `HEARTBEAT_INTERVAL_MS` |
| Variáveis de ambiente | UPPER_SNAKE_CASE, prefixadas | `PAPERCLIP_DATABASE_URL`, `PAPERCLIP_SECRET_KEY` |
| Tabelas DB | snake_case plural | `activity_log`, `agent_registrations` |
| Eventos de domínio | `PastTense` | `AgentHired`, `BudgetExceeded` |

**Sem prefixos/sufixos:** não escreva `IAgent` ou `AgentType` — escreva `Agent`. Use `Props`, `State`, `Result` como sufixos explícitos apenas quando clarificam (`LoginFormProps`, `AgentsQueryResult`).

---

## Arquivos

- Preferência por uma exportação pública por arquivo. Um módulo pode exportar múltiplos símbolos quando formam uma unidade coesa (ex.: `agent-service.ts` exporta `AgentService` + seus DTOs).
- Meta de comprimento de arquivo: **< 300 linhas**. Acima disso, dividir por responsabilidade.
- Ordem dentro de um arquivo:
  1. Imports (externo → interno → relativo)
  2. Tipos / interfaces
  3. Constantes
  4. Exportações públicas
  5. Helpers privados

---

## Imports

- Imports absolutos dentro de um pacote usando aliases de caminho TS (`@/modules/...`).
- Imports relativos apenas para arquivos irmãos dentro da mesma pasta.
- Sem arquivos barrel (`index.ts`) exceto em fronteiras de pacote — eles quebram tree-shaking e detecção de dependências circulares.
- Apenas named imports; sem exportações default exceto para componentes React exigidos por frameworks.

---

## Tratamento de Erros

Dois estilos aceitos — escolha um por módulo e mantenha consistência:

1. **`DomainError` lançado** — preferido para serviços de servidor.
   ```ts
   export class BudgetExceededError extends DomainError {
     readonly code = 'BUDGET_EXCEEDED';
     constructor(public readonly agentId: string, public readonly limit: number) {
       super(`Agent ${agentId} exceeded budget (${limit} tokens)`);
     }
   }
   ```

2. **Tipo `Result<T, E>`** — preferido para código de adaptador e caminhos de borda onde lançar atravessa fronteiras de processo.

**Nunca:**
- Engolir erros com blocos `catch {}` vazios.
- Lançar strings ou objetos simples.
- Re-envolver um erro e perder o `cause` original (sempre passe `{ cause: err }`).

---

## React (UI web)

- Apenas componentes funcionais. Sem componentes de classe.
- Props tipados via `readonly`, sem `React.FC`.
- Hooks nomeados `useX`, uma responsabilidade cada.
- Derive estado; não espelhe. Sem useState que duplique props ou dados do servidor.
- Estado do servidor vive em React Query (ou equivalente). Estado do cliente em um store mínimo (Zustand ou React context).
- **UI é burra**: sem decisões de governança no navegador. Verificações de aprovação, orçamento e permissão fazem ida e volta ao servidor.

---

## Async

- Apenas `async`/`await`. Sem cadeias `.then()` puras.
- Todas as fronteiras async que podem falhar retornam erros tipados ou lançam `DomainError`.
- Sem promises não tratadas — sempre `await`, `.catch`, ou `void` (com comentário se intencional).
- Timeouts são explícitos (`AbortController`); sem esperas indefinidas.

---

## Logging

- Logs JSON estruturados (pino ou equivalente).
- Logue **eventos**, não strings: `log.info({ agentId, event: 'agent.hired' })`.
- Nunca logue segredos, chaves de API brutas, ou corpos de requisição completos contendo PII.
- Toda mutação loga um evento `activity_log` (nível de domínio); logs de nível de SO são apenas para diagnósticos.

---

## Configuração

- Toda config via variáveis de ambiente, carregadas através de um parser tipado (zod) no boot.
- Sem leituras de config em tempo de requisição — injete a config resolvida.
- Paperclip injeta `PAPERCLIP_WORKSPACE_*` e `PAPERCLIP_RUNTIME_*` em processos de agente spawned para ferramentas do lado do agente; mantenha esse prefixo para quaisquer vars voltadas a agentes que você adicionar.

### Variáveis de ambiente canônicas (observadas em `.env.example`)

| Nome | Propósito |
|---|---|
| `DATABASE_URL` | String de conexão PostgreSQL. Omitir → Postgres embarcado (apenas dev). |
| `PORT` | Porta HTTP para o servidor (padrão `3100`). |
| `SERVE_UI` | `true` para que o servidor também sirva o bundle da UI construído. |
| `BETTER_AUTH_SECRET` | Segredo para [Better Auth](https://better-auth.com). **Deve ser rotacionado por ambiente.** |

Config de plugin / adaptador vive **dentro** do pacote do plugin ou adaptador, não em env de nível superior. Referencie suas próprias vars de ambiente do `configSchema` do seu plugin (zod) em vez de ler `process.env` em runtime.

---

## Linting & Formatação

- Config flat do ESLint (`eslint.config.js`) com `@typescript-eslint/strict-type-checked`.
- Prettier para formatação (sem `semi: false` — mantenha ponto e vírgulas).
- Forçado em CI + hook de pre-commit.

---

## Checklist

- [ ] `strict: true` + `noUncheckedIndexedAccess` ativo
- [ ] Sem `any`, sem casts silenciosos
- [ ] Tipos de retorno explícitos em funções exportadas
- [ ] Arquivos kebab-case, tipos PascalCase, vars camelCase
- [ ] Uma responsabilidade por arquivo, < 300 linhas
- [ ] Logs estruturados, sem segredos em logs
- [ ] Todo async aguardado ou explicitamente `void`ed
- [ ] ESLint + Prettier passam

---

**Última atualização:** 2026-04 | **Versão:** 1.0.0 | **Autor:** The Bearded CTO
