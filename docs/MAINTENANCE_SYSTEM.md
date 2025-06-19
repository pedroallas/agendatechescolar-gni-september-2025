# Sistema de Histórico de Manutenção

## 📋 Visão Geral

O Sistema de Histórico de Manutenção é uma funcionalidade completa que permite o gerenciamento de manutenções preventivas e corretivas dos recursos da escola. O sistema oferece rastreamento detalhado, controle de custos e alertas preventivos.

## ✨ Funcionalidades Principais

### 🔧 Gerenciamento de Registros

- **Reportar Manutenção**: Usuários podem reportar necessidades de manutenção
- **Tipos de Manutenção**: Preventiva, Corretiva, Emergência
- **Níveis de Prioridade**: Baixa, Média, Alta, Urgente
- **Status de Acompanhamento**: Pendente, Em Andamento, Concluído, Cancelado

### 📊 Dashboard de Estatísticas

- **Métricas Gerais**: Total de registros, pendentes, em andamento, concluídos
- **Tempo Médio de Resolução**: Cálculo automático em dias
- **Distribuição por Status**: Visualização clara do estado atual

### 💰 Controle de Custos

- **Custo Estimado**: Previsão de gastos no momento do reporte
- **Custo Real**: Valor efetivamente gasto na manutenção
- **Histórico Financeiro**: Rastreamento completo de investimentos

### 🔄 Automação Inteligente

- **Status Automático do Recurso**: Recursos marcados como "em manutenção" automaticamente
- **Datas Automáticas**: Timestamps automáticos para início e conclusão
- **Alertas Preventivos**: Sugestão de próximas manutenções

## 🎯 Benefícios

### Para Professores

- **Reporte Simples**: Interface intuitiva para reportar problemas
- **Acompanhamento**: Visibilidade do status das solicitações
- **Histórico**: Acesso ao histórico completo de cada recurso

### Para Administradores

- **Gestão Centralizada**: Todos os registros em um local
- **Controle de Custos**: Monitoramento de gastos com manutenção
- **Planejamento**: Base de dados para manutenções preventivas
- **Relatórios**: Estatísticas detalhadas para tomada de decisão

### Para a Escola

- **Maior Durabilidade**: Manutenções preventivas prolongam vida útil
- **Menor Downtime**: Resolução mais rápida de problemas
- **Controle Orçamentário**: Previsibilidade de gastos
- **Transparência**: Histórico completo e auditável

## 🔗 API Endpoints

### GET `/api/resources/[id]/maintenance`

Busca o histórico de manutenção de um recurso específico.

**Resposta:**

```json
{
  "records": [
    {
      "id": "record_id",
      "type": "corrective",
      "priority": "high",
      "status": "completed",
      "description": "Descrição do problema",
      "solution": "Solução aplicada",
      "performedBy": "Técnico responsável",
      "reportedAt": "2024-01-15T10:00:00Z",
      "resolvedAt": "2024-01-16T14:30:00Z",
      "estimatedCost": 150.0,
      "actualCost": 120.0,
      "user": {
        "id": "user_id",
        "name": "Nome do Usuário",
        "role": "professor"
      }
    }
  ],
  "stats": {
    "totalRecords": 5,
    "pendingCount": 1,
    "inProgressCount": 1,
    "completedCount": 3,
    "averageResolutionDays": 2
  }
}
```

### POST `/api/resources/[id]/maintenance`

Cria um novo registro de manutenção.

**Payload:**

```json
{
  "type": "corrective",
  "priority": "high",
  "description": "Descrição detalhada do problema",
  "scheduledDate": "2024-01-20",
  "estimatedCost": 200.0
}
```

### PUT `/api/resources/[id]/maintenance/[recordId]`

Atualiza um registro de manutenção existente.

**Payload:**

```json
{
  "status": "completed",
  "solution": "Descrição da solução aplicada",
  "performedBy": "Nome do técnico",
  "actualCost": 180.0,
  "nextService": "2024-04-20"
}
```

### DELETE `/api/resources/[id]/maintenance/[recordId]`

Remove um registro de manutenção.

## 🎨 Componente React

### ResourceMaintenance

Componente principal que renderiza todo o sistema de manutenção.

**Props:**

- `resourceId`: ID do recurso
- `resourceName`: Nome do recurso (para exibição)
- `isAdmin`: Permissões administrativas
- `className`: Classes CSS adicionais

**Exemplo de Uso:**

```tsx
<ResourceMaintenance
  resourceId="resource_id"
  resourceName="Data Show 1"
  isAdmin={true}
  className="lg:col-span-3"
/>
```

## 🗃️ Modelo de Dados

### MaintenanceRecord

```prisma
model MaintenanceRecord {
  id            String   @id @default(cuid())
  resourceId    String
  userId        String   // Quem reportou
  type          String   // preventive, corrective, emergency
  priority      String   // low, medium, high, urgent
  status        String   @default("pending")
  description   String   // Descrição do problema
  solution      String?  // Solução aplicada
  performedBy   String?  // Quem executou
  reportedAt    DateTime @default(now())
  scheduledDate DateTime? // Data agendada
  startedAt     DateTime? // Início da execução
  resolvedAt    DateTime? // Conclusão
  nextService   DateTime? // Próxima manutenção
  estimatedCost Float?   // Custo estimado
  actualCost    Float?   // Custo real

  resource      Resource @relation(fields: [resourceId], references: [id])
  user          User     @relation(fields: [userId], references: [id])
}
```

## 🔐 Permissões

### Usuários (Professores)

- ✅ Criar registros de manutenção
- ✅ Visualizar histórico completo
- ✅ Editar próprios registros (apenas pendentes)
- ✅ Deletar próprios registros (apenas pendentes)

### Administradores

- ✅ Todas as permissões de usuários
- ✅ Atualizar qualquer registro
- ✅ Deletar qualquer registro
- ✅ Alterar status dos registros
- ✅ Gerenciar custos e soluções

## 🎯 Tipos e Prioridades

### Tipos de Manutenção

- **Preventiva**: Manutenção programada para evitar problemas
- **Corretiva**: Reparo de problemas existentes
- **Emergência**: Situações urgentes que impedem o uso

### Níveis de Prioridade

- **Baixa**: Pode aguardar, não impacta uso imediato
- **Média**: Deve ser resolvida em prazo razoável
- **Alta**: Impacta significativamente o uso do recurso
- **Urgente**: Requer ação imediata, recurso indisponível

## 📈 Métricas e KPIs

### Indicadores Calculados

- **Tempo Médio de Resolução**: Média em dias entre reporte e conclusão
- **Taxa de Conclusão**: Percentual de registros concluídos
- **Distribuição por Tipo**: Preventiva vs Corretiva vs Emergência
- **Custo Médio**: Valor médio gasto por manutenção

### Relatórios Disponíveis

- Histórico completo por recurso
- Estatísticas de performance
- Análise de custos
- Previsão de manutenções

## 🔮 Funcionalidades Futuras

### Melhorias Planejadas

- **Notificações Automáticas**: Alertas por email/SMS
- **Calendário de Manutenções**: Visualização de agendamentos
- **Relatórios Avançados**: Gráficos e dashboards
- **Integração com Fornecedores**: Contato direto com técnicos
- **QR Codes**: Reporte rápido via código QR
- **App Mobile**: Aplicativo para técnicos

### Integrações Possíveis

- Sistema de compras para peças
- Agenda dos técnicos
- Sistema de aprovação de orçamentos
- Controle de estoque de peças

## 🚀 Implementação

O sistema está **100% implementado** e inclui:

1. ✅ **Backend Completo**: APIs REST para CRUD
2. ✅ **Frontend Responsivo**: Interface React moderna
3. ✅ **Banco de Dados**: Schema Prisma otimizado
4. ✅ **Permissões**: Controle de acesso robusto
5. ✅ **Validações**: Validação completa de dados
6. ✅ **Estatísticas**: Cálculos automáticos de métricas
7. ✅ **UX/UI**: Interface intuitiva e profissional
8. ✅ **Dados de Exemplo**: Seeds para demonstração

## 📝 Como Usar

### Para Reportar uma Manutenção

1. Acesse a página de detalhes do recurso
2. Clique em "Reportar Manutenção"
3. Selecione tipo e prioridade
4. Descreva o problema detalhadamente
5. Opcionalmente, sugira data e custo estimado
6. Clique em "Criar Registro"

### Para Gerenciar Manutenções (Admin)

1. Visualize todos os registros na página do recurso
2. Clique no ícone de edição para atualizar status
3. Adicione solução e custos reais
4. Marque como concluído quando finalizado
5. Defina próxima manutenção preventiva se necessário

O sistema de manutenção é uma ferramenta poderosa que transforma a gestão de recursos da escola, proporcionando maior controle, previsibilidade e eficiência operacional.
