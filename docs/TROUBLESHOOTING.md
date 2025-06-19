# 🔧 Guia de Solução de Problemas - AgendaTech Escolar

## 🐛 Problemas Comuns e Soluções

### 1. Erro de NextAuth (NEXTAUTH_URL / NO_SECRET)

**Sintomas:**

- Warnings no console sobre NEXTAUTH_URL
- Erro de JWT_SESSION_ERROR
- Página inicial não carrega corretamente

**Solução:**

1. Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=gere-uma-chave-com-openssl-rand-base64-32
```

2. Para gerar uma secret segura:

```bash
openssl rand -base64 32
```

3. Reinicie o servidor de desenvolvimento

### 2. ChunkLoadError

**Sintomas:**

- Erro ChunkLoadError no navegador
- Hot reload não funciona

**Solução:**

1. Pare o servidor (Ctrl+C ou `taskkill /F /IM node.exe`)
2. Delete os caches:

```bash
rm -rf .next
rm -rf node_modules/.cache
```

3. Reinicie o servidor

### 3. Porta 3000 em Uso

**Sintomas:**

- Servidor inicia na porta 3001 ou outra

**Solução:**

1. Encontre o processo usando a porta:

```bash
netstat -ano | findstr :3000
```

2. Mate o processo ou use outra porta:

```bash
npm run dev -- -p 3001
```

### 4. Erro de Autenticação no Login

**Sintomas:**

- Login não funciona
- Cookies não são salvos

**Solução:**

1. Verifique se as variáveis de ambiente estão corretas
2. Limpe os cookies do navegador
3. Use o modo incógnito para testar

### 5. Erro de Banco de Dados

**Sintomas:**

- Erro ao conectar com PostgreSQL
- Migrações falham

**Solução:**

1. Verifique se o PostgreSQL está rodando
2. Confirme a DATABASE_URL no .env
3. Execute as migrações:

```bash
npx prisma migrate dev
npx prisma generate
```

### 6. React Hydration Error

**Sintomas:**

- Erro de hydration no console
- Conteúdo diferente entre servidor e cliente

**Solução:**

1. Adicione `"use client"` em componentes com estado
2. Use `useEffect` para código que depende do cliente
3. Evite renderização condicional baseada em `window`

### 7. Module Not Found

**Sintomas:**

- Erro de módulo não encontrado
- Import falha

**Solução:**

1. Verifique se o módulo está instalado:

```bash
npm install nome-do-modulo
```

2. Delete node_modules e reinstale:

```bash
rm -rf node_modules
npm install
```

### 8. TypeScript Errors

**Sintomas:**

- Erros de tipo no build
- Autocomplete não funciona

**Solução:**

1. Atualize os tipos:

```bash
npm install -D @types/nome-do-pacote
```

2. Reinicie o servidor TypeScript no VSCode:
   - Ctrl+Shift+P → "TypeScript: Restart TS Server"

## 📝 Dicas de Debug

### Console do Navegador

- F12 → Console para ver erros JavaScript
- Network tab para verificar requisições
- Application → Cookies para verificar autenticação

### Logs do Servidor

- Verifique o terminal onde `npm run dev` está rodando
- Use `console.log` temporário para debug
- Habilite logs verbose do NextAuth

### Ferramentas Úteis

- React DevTools Extension
- Redux DevTools (se usar Redux)
- Prisma Studio: `npx prisma studio`

## 🚨 Quando Pedir Ajuda

Se o problema persistir:

1. Capture o erro completo (stack trace)
2. Anote os passos para reproduzir
3. Verifique os logs do servidor e navegador
4. Confira a versão das dependências

## 💡 Prevenção

1. **Sempre use variáveis de ambiente** para configurações sensíveis
2. **Mantenha as dependências atualizadas** regularmente
3. **Teste em modo produção** antes de deploy: `npm run build && npm start`
4. **Use Git** para poder reverter mudanças problemáticas
5. **Documente mudanças** no CHANGELOG.md
