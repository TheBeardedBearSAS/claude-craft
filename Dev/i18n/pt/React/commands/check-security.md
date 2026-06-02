---
description: Auditoria de Segurança
---

# Auditoria de Segurança

Realize uma auditoria de segurança abrangente da aplicação React.

## O Que Este Comando Faz

1. **Análise de Segurança**
   - Verificar vulnerabilidades de XSS
   - Validar a sanitização de entradas
   - Auditar dependências
   - Verificar a implementação de autenticação
   - Validar o gerenciamento de segredos
   - Verificar cabeçalhos CSP

2. **Ferramentas Utilizadas**
   - npm audit
   - Snyk
   - Plugins de segurança para ESLint
   - OWASP ZAP (opcional)

3. **Relatório Gerado**
   - Vulnerabilidades de segurança
   - Níveis de severidade (crítico, alto, médio, baixo)
   - Etapas de remediação
   - Status de conformidade

## Como Usar

```bash
# Executar auditoria de segurança
npm run security:check

# Ou verificações individuais
npm audit
npm run lint:security
```

## Modo Plano

> O modo plano é ativado automaticamente quando o escopo abrange vários módulos ou exige investigação transversal.

## Verificações de Segurança

### 1. Prevenção de XSS

```typescript
// ❌ PERIGOSO - Nunca use com entrada do usuário
const UnsafeComponent = ({ html }: { html: string }) => {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};

// ✅ SEGURO - Sanitizar primeiro
import DOMPurify from 'dompurify';

const SafeComponent = ({ html }: { html: string }) => {
  const sanitized = DOMPurify.sanitize(html);
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
};

// ✅ SEGURO - React escapa por padrão
const SafeComponent = ({ text }: { text: string }) => {
  return <div>{text}</div>; // React escapa automaticamente
};
```

### 2. Validação de Entrada

```typescript
// ❌ RUIM - Sem validação
const handleSubmit = (email: string) => {
  sendEmail(email); // Perigoso!
};

// ✅ BOM - Validação com Zod
import { z } from 'zod';

const emailSchema = z.string().email().max(255);

const handleSubmit = (email: string) => {
  const result = emailSchema.safeParse(email);
  if (!result.success) {
    throw new Error('E-mail inválido');
  }
  sendEmail(result.data);
};
```

### 3. Autenticação

```typescript
// ❌ RUIM - Token no localStorage (vulnerável a XSS)
localStorage.setItem('token', jwt);

// ✅ BOM - Cookie HttpOnly (lado do servidor)
// O servidor define: Set-Cookie: token=xxx; HttpOnly; Secure; SameSite=Strict

// ✅ ACEITÁVEL - Se armazenamento no lado do cliente for necessário, criptografar
import CryptoJS from 'crypto-js';

const encryptedToken = CryptoJS.AES.encrypt(token, secretKey).toString();
sessionStorage.setItem('auth', encryptedToken);
```

### 4. Rotas Protegidas

```typescript
// ✅ BOM - Proteção de rotas
export const ProtectedRoute: FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
```

### 5. Proteção CSRF

```typescript
// ✅ BOM - Token CSRF nas requisições
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.VITE_API_URL,
  withCredentials: true
});

apiClient.interceptors.request.use((config) => {
  const csrfToken = document
    .querySelector('meta[name="csrf-token"]')
    ?.getAttribute('content');

  if (csrfToken) {
    config.headers['X-CSRF-TOKEN'] = csrfToken;
  }

  return config;
});
```

## Segurança de Dependências

### NPM Audit

```bash
# Verificar vulnerabilidades
npm audit

# Corrigir automaticamente (atenção a breaking changes)
npm audit fix

# Verificar sem corrigir
npm audit --audit-level=moderate
```

### Snyk

```bash
# Instalar o Snyk
npm install -g snyk

# Autenticar
snyk auth

# Testar vulnerabilidades
snyk test

# Monitorar o projeto
snyk monitor
```

### Manter Dependências Atualizadas

```bash
# Verificar pacotes desatualizados
npm outdated

# Atualizar com segurança
npm update

# Verificar atualizações principais
npx npm-check-updates
```

## Cabeçalhos de Segurança

### Content Security Policy

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    headers: {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self'",
        "connect-src 'self' https://api.example.com",
        "frame-ancestors 'none'",
      ].join('; '),
    },
  },
});
```

### Cabeçalhos de Segurança (Nginx)

```nginx
# nginx.conf
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

## Gerenciamento de Segredos

### Variáveis de Ambiente

```bash
# ❌ RUIM - Segredos no código
const API_KEY = 'sk-1234567890abcdef';

# ✅ BOM - Variáveis de ambiente
const API_KEY = import.meta.env.VITE_API_KEY;
```

### Gerenciamento de Arquivos .env

```bash
# .gitignore
.env
.env.local
.env.*.local

# .env.example (fazer commit deste arquivo)
VITE_API_BASE_URL=http://localhost:8000
VITE_API_KEY=your-api-key-here

# .env (NÃO fazer commit)
VITE_API_BASE_URL=https://api.production.com
VITE_API_KEY=sk-real-secret-key
```

## Vulnerabilidades Comuns

### 1. Redirecionamentos Abertos

```typescript
// ❌ VULNERÁVEL
const handleRedirect = () => {
  const url = new URLSearchParams(window.location.search).get('redirect');
  window.location.href = url; // Perigoso!
};

// ✅ SEGURO - Validar URL de redirecionamento
const ALLOWED_DOMAINS = ['example.com', 'app.example.com'];

const handleRedirect = () => {
  const url = new URLSearchParams(window.location.search).get('redirect');

  try {
    const parsed = new URL(url);
    if (!ALLOWED_DOMAINS.includes(parsed.hostname)) {
      throw new Error('Domínio de redirecionamento inválido');
    }
    window.location.href = url;
  } catch {
    window.location.href = '/';
  }
};
```

### 2. Referência Direta a Objetos Inseguros

```typescript
// ❌ VULNERÁVEL
const UserProfile = () => {
  const { userId } = useParams();
  const { data } = useQuery(['user', userId], () =>
    fetch(`/api/users/${userId}`).then(r => r.json())
  );
  // Sem verificação de autorização!
};

// ✅ SEGURO - Autorização no lado do servidor
// O servidor deve verificar: "O usuário autenticado tem acesso a este recurso?"
```

### 3. Injeção de SQL (Backend)

```typescript
// Frontend: Sempre usar queries parametrizadas no backend
// ✅ BOM - Validação com Zod antes de enviar
const userSchema = z.object({
  email: z.string().email(),
  name: z.string().max(100).regex(/^[a-zA-Z\s]+$/),
});
```

## Regras ESLint de Segurança

```json
// .eslintrc.json
{
  "plugins": ["security"],
  "extends": ["plugin:security/recommended"],
  "rules": {
    "security/detect-object-injection": "warn",
    "security/detect-non-literal-regexp": "warn",
    "security/detect-unsafe-regex": "error",
    "security/detect-buffer-noassert": "error",
    "security/detect-child-process": "error",
    "security/detect-disable-mustache-escape": "error",
    "security/detect-eval-with-expression": "error",
    "security/detect-no-csrf-before-method-override": "error",
    "security/detect-non-literal-fs-filename": "error",
    "security/detect-non-literal-require": "error",
    "security/detect-possible-timing-attacks": "error",
    "security/detect-pseudoRandomBytes": "error"
  }
}
```

## Checklist de Segurança

- [ ] Proteção contra XSS implementada (DOMPurify para HTML)
- [ ] Validação de entrada em todos os formulários (Zod/Yup)
- [ ] Autenticação corretamente implementada
- [ ] Rotas protegidas configuradas
- [ ] Tokens CSRF utilizados
- [ ] Segredos em variáveis de ambiente
- [ ] Dependências auditadas (npm audit/Snyk)
- [ ] Cabeçalhos de segurança configurados
- [ ] HTTPS imposto
- [ ] Cabeçalhos CSP definidos
- [ ] Sem segredos hardcoded
- [ ] Links externos usam `rel="noopener noreferrer"`
- [ ] Uploads de arquivos validados
- [ ] Rate limiting implementado
- [ ] Logs não expõem dados sensíveis

## Testes de Segurança

### Testes Automatizados

```typescript
// security.test.ts
describe('Segurança', () => {
  it('deve sanitizar entrada HTML', () => {
    const malicious = '<script>alert("xss")</script>';
    const sanitized = DOMPurify.sanitize(malicious);
    expect(sanitized).not.toContain('<script>');
  });

  it('deve validar o formato do e-mail', () => {
    const result = emailSchema.safeParse('email-invalido');
    expect(result.success).toBe(false);
  });

  it('deve proteger as rotas', () => {
    render(<ProtectedRoute><AdminPage /></ProtectedRoute>);
    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
  });
});
```

### Testes Manuais

1. Testar vetores XSS em todas as entradas
2. Tentar acessar rotas não autorizadas
3. Testar com tokens expirados ou inválidos
4. Verificar dados sensíveis no console/aba de rede
5. Confirmar redirecionamento para HTTPS
6. Testar proteção CSRF

## Ferramentas

- **npm audit**: Scanner de vulnerabilidades integrado
- **Snyk**: Monitoramento contínuo de segurança
- **OWASP ZAP**: Scanner de segurança para aplicações web
- **DOMPurify**: Sanitização de HTML
- **helmet**: Cabeçalhos de segurança (servidor)
- **eslint-plugin-security**: Análise estática de segurança

## Recursos

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Melhores Práticas de Segurança no React](https://react.dev/learn/escape-hatches#security-pitfalls)
- [Segurança Web MDN](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Snyk Advisor](https://snyk.io/advisor/)
