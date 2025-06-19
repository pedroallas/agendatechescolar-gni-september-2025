# Guia de Contribuição - AgendaTech

Obrigado por considerar contribuir para o AgendaTech! Este guia irá ajudá-lo a entender nosso processo de desenvolvimento e como contribuir efetivamente.

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Contribuir](#como-contribuir)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Padrões de Código](#padrões-de-código)
- [Padrões de Commit](#padrões-de-commit)
- [Processo de Pull Request](#processo-de-pull-request)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Testes](#testes)

## 🤝 Código de Conduta

Este projeto segue um código de conduta. Ao participar, você concorda em manter um ambiente respeitoso e inclusivo.

## 🚀 Como Contribuir

### Tipos de Contribuições

- 🐛 **Bug Reports**: Reporte bugs usando as issues do GitHub
- ✨ **Feature Requests**: Sugira novas funcionalidades
- 📚 **Documentação**: Melhore a documentação existente
- 🔧 **Code**: Implemente correções ou novas funcionalidades

### Antes de Contribuir

1. Verifique se já existe uma issue relacionada
2. Para mudanças grandes, abra uma issue primeiro para discussão
3. Fork o repositório
4. Crie uma branch específica para sua contribuição

## ⚙️ Configuração do Ambiente

### Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- Git

### Setup Local

```bash
# 1. Clone seu fork
git clone https://github.com/SEU-USUARIO/agenda-tech.git
cd agenda-tech

# 2. Instale dependências
npm install

# 3. Configure ambiente
cp .env.example .env.local
# Edite .env.local com suas configurações

# 4. Configure banco de dados
npx prisma migrate dev
npm run seed

# 5. Execute o projeto
npm run dev
```

## 📝 Padrões de Código

### TypeScript

- Use TypeScript para todos os arquivos
- Defina tipos explícitos quando necessário
- Evite `any`, prefira tipos específicos

### React/Next.js

- Use componentes funcionais com hooks
- Implemente error boundaries quando apropriado
- Otimize performance com `useMemo` e `useCallback`

### Styling

- Use Tailwind CSS para estilização
- Componentes UI devem usar Shadcn/ui
- Mantenha consistência visual

### Estrutura de Arquivos

```
src/
├── app/                 # App Router (Next.js 13+)
├── components/          # Componentes reutilizáveis
├── lib/                # Utilitários e configurações
├── hooks/              # Custom hooks
├── contexts/           # React contexts
└── types/              # Definições de tipos
```

## 📝 Padrões de Commit

Usamos [Conventional Commits](https://www.conventionalcommits.org/) para mensagens de commit consistentes.

### Formato

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Tipos

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Mudanças na documentação
- `style`: Formatação, ponto e vírgula, etc
- `refactor`: Refatoração de código
- `test`: Adição ou correção de testes
- `chore`: Tarefas de manutenção

### Exemplos

```bash
feat(auth): add password strength validation
fix(booking): resolve conflict detection bug
docs(readme): update installation instructions
refactor(api): optimize database queries
```

## 🔄 Processo de Pull Request

### Checklist antes do PR

- [ ] Código segue os padrões estabelecidos
- [ ] Testes passam (`npm run test`)
- [ ] Build funciona (`npm run build`)
- [ ] Documentação atualizada se necessário
- [ ] Commits seguem padrão conventional

### Template de PR

```markdown
## Descrição

Breve descrição das mudanças

## Tipo de Mudança

- [ ] Bug fix
- [ ] Nova funcionalidade
- [ ] Breaking change
- [ ] Documentação

## Como Testar

1. Passos para testar
2. Cenários específicos
3. Dados de teste necessários

## Screenshots (se aplicável)

Adicione screenshots para mudanças visuais

## Checklist

- [ ] Código testado localmente
- [ ] Documentação atualizada
- [ ] Testes passando
```

### Processo de Review

1. **Automated Checks**: CI/CD verifica build e testes
2. **Code Review**: Pelo menos 1 aprovação necessária
3. **Manual Testing**: Teste das funcionalidades alteradas
4. **Merge**: Squash and merge para histórico limpo

## 🏗️ Estrutura do Projeto

### Arquitetura

```
AgendaTech/
├── Frontend (Next.js + React)
├── Backend (Next.js API Routes)
├── Database (PostgreSQL + Prisma)
└── Authentication (NextAuth.js)
```

### Principais Diretórios

- `/app`: Páginas e API routes (App Router)
- `/components`: Componentes React reutilizáveis
- `/lib`: Configurações e utilitários
- `/prisma`: Schema e migrações do banco
- `/docs`: Documentação do projeto

### Fluxo de Dados

1. **UI Components** → fazem requisições para
2. **API Routes** → que acessam
3. **Database** via **Prisma ORM**

## ✅ Testes

### Executar Testes

```bash
# Todos os testes
npm run test

# Testes em modo watch
npm run test:watch

# Coverage
npm run test:coverage
```

### Tipos de Teste

- **Unit Tests**: Componentes e funções isoladas
- **Integration Tests**: Fluxos completos
- **E2E Tests**: Jornadas do usuário

### Escrevendo Testes

- Use Jest + Testing Library
- Teste comportamentos, não implementação
- Mantenha testes simples e legíveis

## 🐛 Reportando Bugs

### Template de Bug Report

```markdown
**Descrição do Bug**
Descrição clara e concisa do problema

**Passos para Reproduzir**

1. Vá para '...'
2. Clique em '...'
3. Veja o erro

**Comportamento Esperado**
O que deveria acontecer

**Screenshots**
Se aplicável, adicione screenshots

**Ambiente**

- OS: [e.g. Windows 10]
- Browser: [e.g. Chrome 91]
- Versão: [e.g. 1.0.0]
```

## 💡 Sugestões de Funcionalidades

### Template de Feature Request

```markdown
**Problema Relacionado**
Descrição do problema que esta funcionalidade resolveria

**Solução Sugerida**
Descrição clara da solução desejada

**Alternativas Consideradas**
Outras soluções que você considerou

**Contexto Adicional**
Qualquer contexto adicional ou screenshots
```

## 📞 Suporte

- **Issues**: Para bugs e feature requests
- **Discussions**: Para perguntas gerais
- **Email**: Para questões sensíveis

## 🏷️ Versionamento

Este projeto segue [Semantic Versioning](https://semver.org/):

- **MAJOR**: Mudanças incompatíveis na API
- **MINOR**: Funcionalidades compatíveis
- **PATCH**: Correções compatíveis

## 📚 Recursos Úteis

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://reactjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**Obrigado por contribuir com o AgendaTech! 🎓✨**
