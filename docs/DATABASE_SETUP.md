# 🗄️ Configuração do Banco de Dados - AgendaTech Escolar

## 📋 Opções de Banco de Dados

Você tem 3 opções para configurar o banco de dados:

### Opção 1: PostgreSQL Local (Recomendado para produção)

#### Windows:

1. Baixe o PostgreSQL: https://www.postgresql.org/download/windows/
2. Execute o instalador e anote:
   - Porta: 5432 (padrão)
   - Usuário: postgres (padrão)
   - Senha: (você define)
3. Após instalar, abra o pgAdmin ou psql
4. Crie um banco de dados:
   ```sql
   CREATE DATABASE agendatech;
   ```

#### macOS:

```bash
brew install postgresql
brew services start postgresql
createdb agendatech
```

#### Linux:

```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo -u postgres createdb agendatech
```

### Opção 2: Neon (Recomendado para desenvolvimento) ⭐

**Gratuito e não precisa instalar nada!**

1. Acesse: https://neon.tech
2. Crie uma conta gratuita
3. Crie um novo projeto
4. Copie a connection string (algo como):
   ```
   postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb
   ```

### Opção 3: Supabase (Alternativa gratuita)

1. Acesse: https://supabase.com
2. Crie uma conta gratuita
3. Crie um novo projeto
4. Vá em Settings → Database
5. Copie a connection string

### Opção 4: SQLite (Apenas para testes rápidos)

Se quiser testar rapidamente sem configurar PostgreSQL:

1. Edite `prisma/schema.prisma`:

   ```prisma
   datasource db {
     provider = "sqlite"
     url      = "file:./dev.db"
   }
   ```

2. Ajuste os tipos de campo que são incompatíveis com SQLite:
   - Remova `@db.Text` dos campos
   - Troque `DateTime` por `String` temporariamente

## 🔧 Configurando a Connection String

### 1. Edite o arquivo `.env.local`:

```env
# Para PostgreSQL local:
DATABASE_URL="postgresql://postgres:suasenha@localhost:5432/agendatech"

# Para Neon:
DATABASE_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb"

# Para Supabase:
DATABASE_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"

# Para SQLite:
DATABASE_URL="file:./dev.db"
```

### 2. Execute as migrações:

```bash
# Gerar o cliente Prisma
npx prisma generate

# Executar migrações
npx prisma migrate dev

# (Opcional) Popular com dados de teste
npm run seed
```

## 🚀 Solução Rápida com Neon (Recomendado)

1. **Crie uma conta no Neon**: https://neon.tech
2. **Crie um projeto** (leva 30 segundos)
3. **Copie a connection string**
4. **Cole no `.env.local`**:
   ```env
   DATABASE_URL="sua-connection-string-aqui"
   ```
5. **Execute**:
   ```bash
   npx prisma migrate dev
   npm run seed
   npm run dev
   ```

## 🔍 Verificando a Conexão

Para verificar se está funcionando:

```bash
npx prisma studio
```

Isso abrirá uma interface visual do banco de dados.

## ❓ Problemas Comuns

### "Can't reach database server"

- Verifique se o PostgreSQL está rodando
- Confirme a porta (5432 é padrão)
- Verifique firewall/antivírus

### "Authentication failed"

- Confirme usuário e senha
- No PostgreSQL local, pode precisar editar pg_hba.conf

### "Database does not exist"

- Crie o banco: `CREATE DATABASE agendatech;`
- Ou use o nome padrão do serviço (postgres, neondb, etc)

## 💡 Dica para Desenvolvimento

Use Neon ou Supabase para desenvolvimento - é gratuito, não precisa instalar nada e funciona imediatamente!
