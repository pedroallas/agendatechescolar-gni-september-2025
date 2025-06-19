# 🔐 Configuração do Login Social - AgendaTech Escolar

## 📋 Pré-requisitos

- Conta no Google Cloud Console
- Projeto criado no Google Cloud
- Aplicação rodando em desenvolvimento ou produção

## 🌐 Configurar Google OAuth

### 1. Acessar Google Cloud Console

1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. Selecione ou crie um novo projeto

### 2. Habilitar Google+ API

1. No menu lateral, vá em **APIs e Serviços** → **Biblioteca**
2. Procure por "Google+ API"
3. Clique em **Ativar**

### 3. Criar Credenciais OAuth 2.0

1. Vá em **APIs e Serviços** → **Credenciais**
2. Clique em **Criar credenciais** → **ID do cliente OAuth**
3. Se solicitado, configure a tela de consentimento OAuth:
   - **Tipo de usuário**: Externo
   - **Nome do aplicativo**: AgendaTech Escolar
   - **Email de suporte**: seu-email@escola.edu.br
   - **Domínios autorizados**: localhost (dev) e seu domínio de produção
   - **Escopos**: email, profile, openid

### 4. Configurar Cliente OAuth

1. **Tipo de aplicativo**: Aplicativo da Web
2. **Nome**: AgendaTech Escolar
3. **URIs de redirecionamento autorizados**:
   - Desenvolvimento: `http://localhost:3000/api/auth/callback/google`
   - Produção: `https://seu-dominio.com/api/auth/callback/google`

### 5. Copiar Credenciais

Após criar, você receberá:

- **Client ID**: `xxx.apps.googleusercontent.com`
- **Client Secret**: `xxx`

### 6. Configurar Variáveis de Ambiente

Adicione ao seu arquivo `.env.local`:

```env
# NextAuth
NEXTAUTH_URL="http://localhost:3000" # ou sua URL de produção
NEXTAUTH_SECRET="gere-uma-string-aleatoria-segura" # use: openssl rand -base64 32

# Google OAuth
GOOGLE_CLIENT_ID="seu-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="seu-client-secret"
```

### 7. Gerar NEXTAUTH_SECRET

Para gerar um secret seguro, execute no terminal:

```bash
openssl rand -base64 32
```

Ou use um gerador online de strings aleatórias.

## 🧪 Testando o Login Social

1. Certifique-se de que o servidor está rodando
2. Acesse `/login`
3. Clique no botão "Google"
4. Faça login com sua conta Google
5. Você será redirecionado para o dashboard

## 🔧 Solução de Problemas

### Erro: "redirect_uri_mismatch"

- Verifique se a URL de callback está exatamente igual no Google Console
- Certifique-se de incluir `/api/auth/callback/google` no final da URL

### Erro: "access_blocked"

- Verifique se a Google+ API está habilitada
- Confirme que a tela de consentimento está configurada

### Usuário não é criado após login

- Verifique os logs do servidor
- Confirme que o banco de dados está acessível
- Verifique se as migrações foram executadas

## 📱 Microsoft OAuth (Futuro)

A implementação do login com Microsoft seguirá processo similar:

1. Registrar aplicação no Azure AD
2. Configurar URIs de redirecionamento
3. Adicionar credenciais ao `.env`
4. Habilitar o provider no NextAuth

## 🚀 Deploy em Produção

Ao fazer deploy, lembre-se de:

1. Atualizar `NEXTAUTH_URL` para a URL de produção
2. Adicionar URL de produção nas URIs autorizadas do Google
3. Usar secrets seguros e únicos
4. Configurar variáveis de ambiente no seu host

## 📊 Monitoramento

Recomenda-se monitorar:

- Taxa de sucesso de login
- Erros de autenticação
- Tempo de resposta do OAuth
- Tentativas de login suspeitas
