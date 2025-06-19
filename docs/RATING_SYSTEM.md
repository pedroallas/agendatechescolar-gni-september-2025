# 🌟 Sistema de Avaliações e Comentários

## Visão Geral

O Sistema de Avaliações permite que usuários avaliem recursos com estrelas (1-5) e deixem comentários detalhados sobre sua experiência. Este sistema fornece feedback valioso para melhorar a qualidade dos recursos e ajudar outros usuários na tomada de decisões.

## Funcionalidades

### ⭐ **Avaliação com Estrelas**

- Escala de 1 a 5 estrelas
- Interface interativa e intuitiva
- Cálculo automático de média
- Prevenção de avaliações duplicadas

### 💬 **Sistema de Comentários**

- Comentários opcionais
- Edição de comentários próprios
- Histórico de edições
- Moderação por administradores

### 📊 **Estatísticas Avançadas**

- Média geral de avaliações
- Distribuição por número de estrelas
- Gráficos de barras visuais
- Contagem total de avaliações

### 👥 **Controle de Permissões**

- Usuários podem avaliar cada recurso apenas uma vez
- Edição limitada ao próprio usuário
- Administradores podem remover qualquer avaliação
- Identificação do papel do usuário (Professor/Diretor/Coordenador)

## Estrutura da API

### Endpoints Principais

#### `GET /api/resources/[id]/ratings`

Busca todas as avaliações de um recurso com estatísticas.

**Resposta:**

```json
{
  "ratings": [
    {
      "id": "rating_id",
      "rating": 5,
      "comment": "Excelente recurso!",
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z",
      "user": {
        "id": "user_id",
        "name": "João Silva",
        "role": "professor"
      }
    }
  ],
  "stats": {
    "totalRatings": 10,
    "averageRating": 4.3,
    "ratingDistribution": {
      "5": 4,
      "4": 3,
      "3": 2,
      "2": 1,
      "1": 0
    }
  }
}
```

#### `POST /api/resources/[id]/ratings`

Cria uma nova avaliação.

**Payload:**

```json
{
  "rating": 5,
  "comment": "Comentário opcional"
}
```

#### `PUT /api/resources/[id]/ratings/[ratingId]`

Edita uma avaliação existente (apenas o próprio usuário).

#### `DELETE /api/resources/[id]/ratings/[ratingId]`

Remove uma avaliação (próprio usuário ou administrador).

## Componente Principal

### `ResourceRatings`

Componente React completo para gerenciar avaliações:

```tsx
<ResourceRatings
  resourceId="resource_id"
  resourceName="Nome do Recurso"
  className="custom-class"
/>
```

#### Funcionalidades do Componente:

1. **📋 Listagem de Avaliações**

   - Ordenação por data (mais recentes primeiro)
   - Avatar e informações do usuário
   - Badge identificando o papel
   - Indicador de edição

2. **📊 Painel de Estatísticas**

   - Média geral destacada
   - Gráfico de distribuição
   - Contagem total
   - Renderização de estrelas

3. **➕ Formulário de Nova Avaliação**

   - Seleção interativa de estrelas
   - Campo de comentário opcional
   - Validações em tempo real
   - Feedback de sucesso/erro

4. **✏️ Edição de Avaliações**

   - Modal de edição para próprias avaliações
   - Preservação de dados existentes
   - Indicador de "editado"

5. **🗑️ Remoção de Avaliações**
   - Confirmação antes da exclusão
   - Permissões baseadas em papel
   - Recálculo automático de estatísticas

## Integração com Recursos

### Atualização Automática de Estatísticas

Sempre que uma avaliação é criada, editada ou removida, as estatísticas do recurso são automaticamente atualizadas:

```typescript
// Campos adicionados ao modelo Resource
{
  averageRating?: number;
  totalRatings: number;
}
```

### Exibição na Lista de Recursos

As avaliações aparecem na lista principal de recursos:

```tsx
{
  resource.averageRating && resource.averageRating > 0 && (
    <div className="flex items-center space-x-1">
      <Star className="h-4 w-4 text-yellow-500 fill-current" />
      <span>{resource.averageRating.toFixed(1)}</span>
      <span>({resource.totalRatings})</span>
    </div>
  );
}
```

## Dados de Exemplo

O sistema inclui avaliações de exemplo no seed:

- **Data Show 1**: 4.5 estrelas (2 avaliações)
- **TV 55"**: 5.0 estrelas (1 avaliação)
- **Laboratório**: 4.0 estrelas (1 avaliação)

## Benefícios

### 👨‍🏫 **Para Professores**

- Escolher recursos baseado em experiências reais
- Compartilhar feedback para melhorias
- Ver comentários de colegas

### 👨‍💼 **Para Administradores**

- Identificar recursos problemáticos
- Priorizar manutenções e atualizações
- Tomar decisões baseadas em dados
- Moderar conteúdo inadequado

### 🏫 **Para a Instituição**

- Melhorar qualidade dos recursos
- Aumentar satisfação dos usuários
- Otimizar investimentos
- Criar cultura de feedback

## Próximos Passos

1. **📱 Notificações**: Alertar sobre novas avaliações
2. **📈 Relatórios**: Dashboard de satisfação
3. **🏆 Gamificação**: Badges por contribuições
4. **🔍 Filtros**: Buscar por avaliação
5. **📊 Analytics**: Tendências de satisfação

## Considerações Técnicas

- **Performance**: Paginação para muitas avaliações
- **Segurança**: Validação de entrada e sanitização
- **Escalabilidade**: Índices de banco otimizados
- **UX**: Loading states e feedback visual
- **Acessibilidade**: Compatível com leitores de tela
