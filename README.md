# 🎓 AgendaTech - Sistema de Agendamento Escolar

> **MVP Completo** - Sistema moderno de agendamento de recursos educacionais

[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.8.2-2D3748?style=flat-square&logo=prisma)](https://prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)](https://postgresql.org/)

## 📋 Sobre o Projeto

O **AgendaTech** é uma solução completa para gerenciamento de agendamentos de recursos em instituições educacionais. Desenvolvido com tecnologias modernas, oferece uma interface intuitiva e funcionalidades avançadas para otimizar o uso de equipamentos e espaços escolares.

### ✨ Funcionalidades Principais

- 🔐 **Autenticação Completa** - Login/registro com NextAuth.js
- 📊 **Dashboard Interativo** - Visão geral com gráficos e estatísticas
- 📅 **Agendamento Avançado** - Calendário inteligente com validações
- 🏫 **Gestão de Recursos** - CRUD completo com upload de imagens
- 👥 **Controle de Permissões** - Diferentes níveis de acesso por cargo
- ⚡ **Auto-Aprovação** - Sistema inteligente baseado em configurações
- 📱 **Design Responsivo** - Interface adaptada para todos os dispositivos
- 🌙 **Modo Escuro/Claro** - Alternância de temas

## 🚀 Status do Desenvolvimento

### ✅ Fases Concluídas (MVP)

- **Fase 1**: Landing Page e Apresentação (100%)
- **Fase 2**: Autenticação e Onboarding (100%)
- **Fase 3**: Dashboard Principal (100%)
- **Fase 4**: Sistema de Agendamento Avançado (100%)

### 🔄 Próximas Fases

- **Fase 5**: Gestão Avançada de Recursos (Em planejamento)
  - Galerias de fotos
  - Códigos QR
  - Histórico de manutenção
  - Sistema de avaliações

## 🛠️ Tecnologias Utilizadas

### Frontend

- **Next.js 15.2.4** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização utilitária
- **Shadcn/ui** - Componentes UI
- **Lucide React** - Ícones

### Backend

- **Next.js API Routes** - Backend integrado
- **Prisma ORM** - Gerenciamento de banco de dados
- **PostgreSQL** - Banco de dados principal
- **NextAuth.js** - Autenticação

### Ferramentas

- **ESLint** - Linting de código
- **Prettier** - Formatação de código
- **Git** - Controle de versão

## 📦 Instalação e Configuração

### Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- Git

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/agenda-tech.git
cd agenda-tech
```

### 2. Instale as dependências

```bash
npm install
# ou
pnpm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env.local
```

Configure as seguintes variáveis no `.env.local`:

```env
# Database
DATABASE_URL="postgresql://usuario:senha@localhost:5432/agendatech"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="seu-secret-aqui"

# Upload
UPLOAD_DIR="./public/uploads"
```

### 4. Configure o banco de dados

```bash
# Execute as migrações
npx prisma migrate dev

# Popule com dados de exemplo
npm run seed
```

### 5. Execute o projeto

```bash
npm run dev
```

Acesse: `http://localhost:3000`

## 👤 Usuários de Teste

Após executar o seed, você pode usar:

**Administrador:**

- Email: `admin@escola.edu.br`
- Senha: `admin123`

**Professor:**

- Email: `professor@escola.edu.br`
- Senha: `user123`

## 📁 Estrutura do Projeto

```
agenda-tech/
├── app/                    # App Router (Next.js 13+)
│   ├── api/               # API Routes
│   ├── dashboard/         # Páginas do dashboard
│   └── (auth)/           # Páginas de autenticação
├── components/            # Componentes React
│   ├── ui/               # Componentes base (Shadcn)
│   └── dashboard/        # Componentes específicos
├── lib/                  # Utilitários e configurações
├── prisma/               # Schema e migrações do banco
├── docs/                 # Documentação do projeto
└── public/               # Arquivos estáticos
```

## 🔧 Scripts Disponíveis

```bash
npm run dev          # Inicia o servidor de desenvolvimento
npm run build        # Build para produção
npm run start        # Inicia o servidor de produção
npm run lint         # Executa o linting
npm run seed         # Popula o banco com dados de teste
```

## 📚 Documentação

Documentação detalhada disponível em `/docs`:

- [Arquitetura do Sistema](./docs/ARCHITECTURE.md)
- [Configuração do Banco](./docs/DATABASE_SETUP.md)
- [Guia de Desenvolvimento](./docs/DEVELOPMENT.md)
- [Funcionalidades Pendentes](./docs/PENDING_FEATURES.md)
- [Roadmap](./docs/ROADMAP.md)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Contato

- **Desenvolvedor**: [Seu Nome]
- **Email**: [seu-email@exemplo.com]
- **LinkedIn**: [Seu LinkedIn]

---

⭐ **Gostou do projeto? Deixe uma estrela!**
