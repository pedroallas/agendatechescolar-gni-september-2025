# Sistema de QR Codes - AgendaTech

## 📱 Visão Geral

O Sistema de QR Codes permite acesso rápido e fácil aos recursos da escola através de códigos QR. Cada recurso pode ter seu próprio QR Code que, quando escaneado, leva diretamente à página pública do recurso.

## ✨ Funcionalidades Principais

### 🔧 Geração de QR Codes

- **Geração Automática**: QR Codes criados dinamicamente para cada recurso
- **Múltiplos Formatos**: PNG, SVG e Data URL
- **Tamanhos Customizáveis**: De 100x100 até 1000x1000 pixels
- **Cache Inteligente**: QR Codes salvos no banco para performance

### 📱 Página Pública

- **Acesso Sem Login**: Qualquer pessoa pode ver detalhes do recurso
- **Layout Responsivo**: Otimizado para dispositivos móveis
- **Informações Completas**: Status, localização, descrição, avaliações
- **Call-to-Action**: Link direto para fazer agendamento

### 🎯 Funcionalidades de Gestão

- **Download para Impressão**: QR Codes em alta resolução
- **Preview da Página**: Visualização da página pública
- **Cópia de URL**: Compartilhamento rápido do link
- **Instruções de Uso**: Guia para implementação física

## 🔗 API Endpoints

### GET `/api/resources/[id]/qrcode`

Gera QR Code para um recurso específico.

**Query Parameters:**

- `format`: Formato do QR Code (`png`, `svg`, `dataurl`)
- `size`: Tamanho em pixels (padrão: 200)

**Exemplos:**

```bash
# PNG para download
GET /api/resources/123/qrcode?format=png&size=400

# SVG para web
GET /api/resources/123/qrcode?format=svg&size=200

# Data URL para JavaScript
GET /api/resources/123/qrcode?format=dataurl&size=300
```

**Resposta (format=dataurl):**

```json
{
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "url": "https://escola.com/resource/123",
  "resourceName": "Data Show 1"
}
```

### POST `/api/resources/[id]/qrcode`

Salva QR Code no banco de dados.

**⚠️ Requer: Perfil de administrador (diretor/coordenador)**

**Resposta:**

```json
{
  "success": true,
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "url": "https://escola.com/resource/123"
}
```

## 🎨 Componente React

### QRCodeManager

Componente completo para gestão de QR Codes.

**⚠️ Acesso Restrito: Apenas Administradores (diretor/coordenador)**

**Props:**

- `resourceId`: ID do recurso
- `resourceName`: Nome do recurso
- `isAdmin`: Permissões administrativas (obrigatório `true`)
- `className`: Classes CSS adicionais

**Exemplo de Uso:**

```tsx
<QRCodeManager
  resourceId={resource.id}
  resourceName={resource.name}
  isAdmin={isAdmin}
  className="lg:col-span-1"
/>
```

**Funcionalidades do Componente:**

- ✅ **Acesso Restrito**: Só renderiza para administradores
- ✅ **Geração Automática**: QR Code criado ao carregar
- ✅ **Preview Visual**: Exibição limpa do QR Code gerado
- ✅ **Download PNG**: Botão para baixar em alta resolução
- ✅ **Copiar URL**: Compartilhamento do link público
- ✅ **Salvar no Banco**: Cache para performance
- ✅ **Instruções de Uso**: Guia para implementação

## 📄 Página Pública do Recurso

### Rota: `/resource/[id]`

Página acessível publicamente através do QR Code.

**Características:**

- **Layout Limpo**: Design focado na informação
- **Sem Autenticação**: Acesso livre para visualização
- **Mobile-First**: Otimizado para smartphones
- **Call-to-Action**: Botão para acessar sistema completo

**Seções da Página:**

1. **Header**: Logo e link para login
2. **Informações Principais**: Nome, categoria, status, avaliações
3. **Detalhes**: Localização, capacidade, descrição
4. **Galeria**: Imagens do recurso (se disponível)
5. **Avaliações**: Sistema de ratings público
6. **Sidebar**: Informações sobre QR Code e link para agendamento
7. **Footer**: Informações da escola

## 🏗️ Implementação Física

### Como Usar os QR Codes:

1. **Gerar QR Code**

   - Acesse a página do recurso no dashboard
   - Clique em "Baixar" no componente QR Code
   - Escolha tamanho adequado (recomendado: 400x400px)

2. **Imprimir Etiqueta**

   - Use papel adesivo resistente
   - Tamanho mínimo: 3x3 cm para boa leitura
   - Inclua nome do recurso abaixo do QR Code

3. **Aplicar no Recurso**

   - Cole em local visível e acessível
   - Evite superfícies curvas ou reflexivas
   - Proteja de umidade e desgaste

4. **Testar Funcionamento**
   - Escaneie com aplicativo de QR Code
   - Verifique se abre página correta
   - Teste em diferentes dispositivos

### Dicas de Implementação:

- **Localização**: Cole em local de fácil acesso
- **Proteção**: Use material laminado para durabilidade
- **Tamanho**: Maior = mais fácil de escanear
- **Contraste**: Fundo branco, código preto
- **Backup**: Mantenha cópias digitais dos QR Codes

## 📊 Benefícios do Sistema

### Para Usuários:

- **Acesso Rápido**: Informações instantâneas do recurso
- **Sem App**: Funciona com qualquer leitor de QR Code
- **Informações Atualizadas**: Sempre sincronizado com o sistema
- **Facilidade**: Não precisa procurar no sistema

### Para Administradores:

- **Gestão Centralizada**: Todos os QR Codes em um local
- **Atualizações Automáticas**: Mudanças refletem imediatamente
- **Analytics**: Possibilidade de rastrear acessos (futuro)
- **Flexibilidade**: Múltiplos formatos e tamanhos

### Para a Escola:

- **Modernização**: Tecnologia acessível e prática
- **Eficiência**: Reduz tempo de busca por informações
- **Transparência**: Informações públicas dos recursos
- **Economia**: Reduz necessidade de suporte manual

## 🔄 Fluxo de Uso

```mermaid
graph TD
    A[Usuário escaneia QR Code] --> B[Abre página pública do recurso]
    B --> C[Visualiza informações detalhadas]
    C --> D{Quer fazer agendamento?}
    D -->|Sim| E[Clica em "Fazer Agendamento"]
    D -->|Não| F[Visualiza apenas]
    E --> G[Redirecionado para login]
    G --> H[Acessa sistema completo]
    F --> I[Pode avaliar recurso]
```

## 🚀 Implementação Completa

O Sistema de QR Codes está **100% funcional** e pronto para uso! 🎉

### ✨ Melhorias Aplicadas:

- **🔒 Acesso Restrito**: Componente visível apenas para administradores
- **🎨 Interface Limpa**: Removida informação desnecessária de pixels
- **👥 Foco no Público**: Professores não precisam se preocupar com QR Codes
- **⚡ Performance**: Componente não renderiza para usuários não-admin

### Status das Funcionalidades:

✅ API de geração de QR Codes
✅ Página pública de recursos
✅ Componente de gestão (admin-only)
✅ Download e impressão
✅ Integração no dashboard
✅ Controle de acesso por perfil
