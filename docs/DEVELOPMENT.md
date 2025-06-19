# 🛠️ Guia de Desenvolvimento - AgendaTech Escolar

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- Git
- VS Code (recomendado)

## 🚀 Setup Inicial

1. **Clone o repositório**

   ```bash
   git clone [repo-url]
   cd agenda-tech
   ```

2. **Instale as dependências**

   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**

   ```bash
   # Crie um arquivo .env.local
   DATABASE_URL="postgresql://user:password@localhost:5432/agenda_tech"
   JWT_SECRET="your-secret-key"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Configure o banco de dados**

   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Popule com dados de exemplo**

   ```bash
   # Rode o servidor
   npm run dev

   # Em outro terminal
   curl http://localhost:3000/api/seed
   ```

## 📁 Estrutura de Código

### Componentes

```tsx
// components/example-component.tsx
"use client";

interface ExampleComponentProps {
  title: string;
  children: React.ReactNode;
}

export function ExampleComponent({ title, children }: ExampleComponentProps) {
  return (
    <div className="rounded-lg border p-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </div>
  );
}
```

### API Routes

```ts
// app/api/example/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const data = await prisma.model.findMany();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar dados" },
      { status: 500 }
    );
  }
}
```

## 🎨 Convenções de Código

### Naming

- **Componentes**: PascalCase (`UserProfile.tsx`)
- **Funções/Hooks**: camelCase (`useAuth()`, `getUserData()`)
- **Constantes**: UPPER_SNAKE_CASE (`MAX_ITEMS`)
- **Arquivos**: kebab-case (`user-profile.tsx`)

### TypeScript

- Sempre use tipos explícitos
- Evite `any`, use `unknown` quando necessário
- Crie interfaces para props de componentes

### Tailwind CSS

- Use classes utilitárias, evite CSS customizado
- Agrupe classes relacionadas
- Use `cn()` helper para classes condicionais

## 🧪 Testes

```bash
# Rodar testes (quando implementados)
npm test

# Coverage
npm run test:coverage
```

## 🔍 Debugging

### Next.js Debug Mode

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "port": 9229,
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

### Prisma Studio

```bash
npx prisma studio
```

## 📝 Commits

Siga o padrão [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` nova funcionalidade
- `fix:` correção de bug
- `docs:` documentação
- `style:` formatação
- `refactor:` refatoração
- `test:` testes
- `chore:` tarefas gerais

## 🚀 Deploy

### Vercel (Recomendado)

1. Push para GitHub
2. Conecte no Vercel
3. Configure variáveis de ambiente
4. Deploy automático

### Checklist Pre-Deploy

- [ ] Testes passando
- [ ] Build sem erros
- [ ] Variáveis de ambiente configuradas
- [ ] Migrações aplicadas
- [ ] Seeds removidos de produção

## 🐛 Troubleshooting

### Erro: "Module not found"

```bash
# Limpe o cache
rm -rf .next node_modules
npm install
npm run dev
```

### Erro: "Prisma Client not generated"

```bash
npx prisma generate
```

### Erro: "Database connection failed"

- Verifique se PostgreSQL está rodando
- Confirme DATABASE_URL no .env.local
- Teste conexão: `npx prisma db pull`

## 📚 Recursos

- [Next.js 15 Docs](https://nextjs.org/docs)
- [Prisma Best Practices](https://www.prisma.io/docs/guides)
- [Radix UI Components](https://www.radix-ui.com/docs/primitives)
- [Tailwind CSS](https://tailwindcss.com/docs)
