# 🚀 Guia de Deploy - Agenda Tech

## Deploy no Vercel (Recomendado)

### 1. **Preparação do Banco de Dados**

#### Opção A: Vercel Postgres (Recomendado)

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Vá em **Storage** > **Create Database** > **Postgres**
3. Copie a `DATABASE_URL` gerada

#### Opção B: Supabase (Gratuito)

1. Acesse [Supabase](https://supabase.com)
2. Crie um novo projeto
3. Vá em **Settings** > **Database**
4. Copie a connection string

### 2. **Deploy no Vercel**

#### Via GitHub (Recomendado)

1. Acesse [Vercel](https://vercel.com)
2. Clique em **New Project**
3. Importe seu repositório GitHub
4. Configure as variáveis de ambiente:

```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=sua-chave-secreta-aqui
NEXTAUTH_URL=https://seu-projeto.vercel.app
```

#### Via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer deploy
vercel

# Configurar variáveis de ambiente
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
```

### 3. **Configuração das Variáveis de Ambiente**

#### Obrigatórias:

- `DATABASE_URL`: URL do banco PostgreSQL
- `NEXTAUTH_SECRET`: Chave secreta para NextAuth (gere uma segura)
- `NEXTAUTH_URL`: URL do seu deploy (ex: https://agendatech.vercel.app)

#### Como gerar NEXTAUTH_SECRET:

```bash
# Opção 1: OpenSSL
openssl rand -base64 32

# Opção 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Opção 3: Online
# https://generate-secret.vercel.app/32
```

### 4. **Configuração do Banco de Dados**

Após o primeiro deploy, execute as migrações:

```bash
# Via Vercel CLI
vercel env pull .env.local
npx prisma migrate deploy
npx prisma db seed
```

### 5. **Configurações Adicionais**

#### Domínio Personalizado (Opcional)

1. No Vercel Dashboard, vá em **Settings** > **Domains**
2. Adicione seu domínio personalizado
3. Configure DNS conforme instruções

#### Configurações de Performance

- ✅ Edge Functions habilitadas
- ✅ Imagens otimizadas automaticamente
- ✅ CDN global ativa

### 6. **Verificação do Deploy**

Após o deploy, verifique:

- [ ] Login funcionando
- [ ] Banco de dados conectado
- [ ] Notificações funcionando
- [ ] Upload de imagens funcionando
- [ ] Todas as páginas carregando

### 7. **Troubleshooting**

#### Erro de Build

```bash
# Verificar logs de build no Vercel Dashboard
# Ou via CLI:
vercel logs
```

#### Erro de Database

- Verificar se `DATABASE_URL` está correta
- Executar migrações: `npx prisma migrate deploy`
- Verificar conexões no banco

#### Erro de NextAuth

- Verificar `NEXTAUTH_SECRET` e `NEXTAUTH_URL`
- Certificar-se que URL está correta (https://)

## Deploy Alternativo - Netlify

Se preferir Netlify:

1. Configure build command: `npm run build`
2. Publish directory: `.next`
3. Configure variáveis de ambiente
4. Adicione plugin Next.js: `@netlify/plugin-nextjs`

## 📝 Notas Importantes

- ✅ **Banco PostgreSQL** é obrigatório (SQLite não funciona em produção)
- ✅ **HTTPS** é obrigatório para NextAuth
- ✅ **Variáveis de ambiente** devem estar configuradas antes do build
- ✅ **Migrações** devem ser executadas após primeiro deploy

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs no Vercel Dashboard
2. Confirme todas as variáveis de ambiente
3. Execute `npm run build` localmente para testar
4. Verifique conexão com banco de dados
