# 🎯 MePaga - Divisão de Despesas

Um aplicativo moderno para simplificar o gerenciamento de despesas compartilhadas entre grupos de amigos, colegas e familiares.

---

## 📱 O que é MePaga?

**MePaga** permite que você:
- ✅ Crie grupos para organizar despesas
- ✅ Registre despesas compartilhadas automaticamente
- ✅ Veja exatamente quem deve quanto para quem
- ✅ Compartilhe chaves PIX para transferências fáceis
- ✅ Mantenha histórico completo de transações
- ✅ Use em iOS, Android e Web

---

## 🏗️ Arquitetura do Projeto

MePaga é composto por duas aplicações principais:

### 1. **Backend (API REST)**
- **Framework**: Fastify
- **Banco de Dados**: PostgreSQL
- **ORM**: Prisma
- **Padrão**: Clean Architecture
- **Localização**: `mepaga-api/`

### 2. **Frontend (Aplicativo Mobile)**
- **Framework**: React Native
- **Plataforma**: Expo
- **Navegação**: React Navigation
- **Suporte**: iOS, Android, Web
- **Localização**: `mepaga-app/`

---

## 🚀 Quick Start

### Requisitos
- Node.js 18+
- PostgreSQL 12+
- pnpm (ou npm)

### Instalação

**1. Backend**
```bash
cd mepaga-api
pnpm install
pnpm prisma:migrate
pnpm dev
# Acesso em http://localhost:3000
```

**2. Frontend**
```bash
cd mepaga-app
pnpm install
pnpm start
# Escolha: Android, iOS ou Web
```

---

## 📚 Documentação Completa

Este projeto possui documentação detalhada:

| Documento | Para Quem | Conteúdo |
|-----------|-----------|----------|
| 📐 **[ARQUITETURA.md](./ARQUITETURA.md)** | Desenvolvedores | Estrutura técnica, padrões, código |
| 📋 **[REQUISITOS.md](./REQUISITOS.md)** | PMs, Analysts | Funcionalidades, regras de negócio |
| 📖 **[DOCUMENTACAO.md](./DOCUMENTACAO.md)** | Todos | Índice central e guia de navegação |
| ⚡ **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** | Devs em manutenção | Cheat sheet, comandos, snippets |

---

## 🎯 Funcionalidades Principais

### ✅ Implementadas

#### Autenticação
- Registro de novo usuário
- Login com email/senha
- Recuperação de senha (código por email)
- Atualização de chave PIX

#### Grupos
- Criar grupos (com categorias)
- Entrar via token de convite
- Visualizar membros do grupo
- Deletar grupo (criador)
- Histórico de atividades

#### Despesas
- Criar despesa compartilhada
- Divisão automática entre membros
- Upload de recibo/foto
- Visualizar histórico

#### Saldos
- Cálculo automático de quem deve para quem
- Visualizar chave PIX de quem receber
- Resumo financeiro do usuário
- Breakdown por grupo

---

## 🏗️ Estrutura do Projeto

```
mepaga/
├── mepaga-api/
│   ├── src/
│   │   ├── domain/          # Entidades e interfaces
│   │   ├── application/     # Use cases
│   │   ├── infrastructure/  # Repositórios
│   │   ├── presentation/    # Controllers e rotas
│   │   ├── shared/          # Erros, utils
│   │   ├── app.ts           # Config Fastify
│   │   └── server.ts        # Entry point
│   ├── prisma/
│   │   └── schema.prisma    # Schema do banco
│   ├── package.json
│   └── tsconfig.json
│
├── mepaga-app/
│   ├── src/
│   │   ├── screens/         # 16 telas da app
│   │   ├── components/      # Componentes reutilizáveis
│   │   ├── icons/           # Ícones SVG
│   │   ├── services/        # Client HTTP
│   │   ├── navigation.ts    # Tipos de navegação
│   │   ├── theme.ts         # Temas e estilos
│   │   └── App.tsx          # Componente raiz
│   ├── app.json             # Config Expo
│   ├── package.json
│   └── tsconfig.json
│
├── ARQUITETURA.md           # Documentação técnica
├── REQUISITOS.md            # Análise de requisitos
├── DOCUMENTACAO.md          # Índice e guia
├── QUICK_REFERENCE.md       # Referência rápida
└── README.md                # Este arquivo
```

---

## 📊 Modelo de Dados

### Entidades Principais

**User** - Usuário da aplicação
- Autenticação com email/senha
- Chave PIX para recebimentos
- Múltiplos grupos

**Group** - Grupo de despesas compartilhadas
- Token único de convite
- Múltiplos membros
- Histórico de despesas

**Expense** - Despesa registrada
- Valor total
- Quem pagou
- Divisão entre membros

**ExpenseSplit** - Divisão de despesa
- Quanto cada membro deve
- Referência a expense e user

---

## 🔌 Endpoints da API

### Autenticação
```
POST   /auth/register
POST   /auth/login
POST   /auth/forgot-password
POST   /auth/reset-password
```

### Grupos
```
POST   /groups
POST   /groups/join
GET    /groups/:groupId/invite
GET    /users/:userId/groups
DELETE /groups/:groupId
```

### Despesas
```
POST   /expenses
GET    /groups/:groupId/activities
GET    /users/:userId/activities
```

### Saldos
```
GET    /groups/:groupId/balances
PATCH  /users/:userId/pix-key
GET    /users/:userId/summary
```

---

## 🛠️ Stack Tecnológico

### Backend
- **Fastify** 5.8.5 - Framework web rápido
- **TypeScript** 6.0.3 - Linguagem tipada
- **Prisma** 7.8.0 - ORM moderno
- **PostgreSQL** - Banco de dados
- **bcrypt** - Hashing de senha
- **Node.js** - Runtime

### Frontend
- **React Native** 0.85.3 - Framework mobile
- **Expo** 56.0.7 - Plataforma
- **React** 19.2.3 - UI library
- **TypeScript** 6.0.3 - Linguagem tipada
- **React Navigation** 7.2.5 - Navegação

---

## 🔐 Segurança

- ✅ Senhas com hash bcrypt (10 rounds)
- ✅ Validação rigorosa de entrada
- ✅ CORS configurado
- ✅ Autorização por usuário
- ✅ Proteção contra SQL Injection (Prisma)
- ✅ HTTPS em produção

---

## 📱 Telas da Aplicação

### Autenticação (9 telas)
- Login
- Register (3 passos)
- Register Success
- Forgot Password (3 passos)
- Forgot Success

### Aplicação (7 telas)
- Home (lista de grupos)
- Profile
- Profile - PIX
- Create Group
- Group Detail
- Group Settings
- Create Expense

---

## 🎓 Para Começar a Desenvolver

1. **Ler documentação**: Comece por [DOCUMENTACAO.md](./DOCUMENTACAO.md)
2. **Entender arquitetura**: Revise [ARQUITETURA.md](./ARQUITETURA.md)
3. **Explorar requisitos**: Conheça [REQUISITOS.md](./REQUISITOS.md)
4. **Setup local**: Siga "Quick Start" acima
5. **Referência rápida**: Use [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) no dia-a-dia

---

## 🔄 Fluxo Principal

```
┌─────────────────────────────────────────────┐
│ 1. Usuário Registra / Faz Login             │
│    (Email + Senha, com hash bcrypt)         │
├─────────────────────────────────────────────┤
│ 2. Cria ou Entra em Grupo                   │
│    (Grupo com múltiplos membros)            │
├─────────────────────────────────────────────┤
│ 3. Registra Despesa Compartilhada           │
│    (Sistema cria Expense + ExpenseSplits)   │
├─────────────────────────────────────────────┤
│ 4. Visualiza Saldos                         │
│    (Quem deve para quem, com valores)       │
├─────────────────────────────────────────────┤
│ 5. Transfere via PIX                        │
│    (Usa chave PIX do credor)                │
└─────────────────────────────────────────────┘
```

---

## 🌟 Diferenciais

- ✨ **Clean Architecture** - Código bem estruturado
- ✨ **Type-Safe** - 100% TypeScript
- ✨ **Cross-platform** - iOS, Android, Web
- ✨ **Autenticação** - Email/senha com recuperação
- ✨ **Real-time Calculations** - Saldos atualizados
- ✨ **PIX Integration** - Facilita transferências
- ✨ **Recibos** - Upload de fotos de comprovantes
- ✨ **Bem Documentado** - Documentação completa

---

## 🚧 Roadmap Futuro

### Phase 2
- [ ] OAuth (Google, Apple)
- [ ] Push Notifications
- [ ] Marcação de pagamentos
- [ ] Edição/deleção de despesas

### Phase 3
- [ ] Offline First (AsyncStorage)
- [ ] Relatórios e Gráficos
- [ ] Integração com Bancos
- [ ] Chat/Comentários

### Phase 4
- [ ] Múltiplas Moedas
- [ ] Internacionalização
- [ ] Automação de Pagamentos
- [ ] Integração com Planilhas

---

## 📞 Suporte

### Reportar Bugs
- Descreva o problema
- Inclua passos para reproduzir
- Anexe screenshots

### Sugerir Features
- Descreva o caso de uso
- Explique o valor agregado
- Revise [REQUISITOS.md](./REQUISITOS.md) primeiro

### Contribuir
- Siga padrão de arquitetura
- Mantenha TypeScript
- Não remova testes
- Documente mudanças

---

## 📋 Padrões de Código

### Backend
- **Clean Architecture**: Domain → Application → Infrastructure → Presentation
- **Dependency Injection**: Desacoplamento de componentes
- **Repository Pattern**: Abstração de dados
- **Use Case Pattern**: Encapsulamento de operações

### Frontend
- **Componentes Reutilizáveis**: Props tipadas
- **Navegação Type-Safe**: React Navigation
- **Serviços Desacoplados**: API isolada
- **Temas Centralizados**: Colors, fonts, spacing

---

## 🧪 Testes

```bash
# Backend
pnpm test              # Rodar testes

# Frontend
# Testes manuais em emulador/device
```

---

## 📦 Variáveis de Ambiente

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/mepaga
PORT=3000
NODE_ENV=development
```

### Frontend (app.json)
```json
{
  "plugins": [
    "expo-image-picker"
  ]
}
```

---

## 📈 Métricas

| Métrica | Target | Status |
|---------|--------|--------|
| Response Time | < 500ms | ✅ |
| Uptime | 99.5% | ✅ |
| Code Coverage | 70%+ | 🔄 |
| TypeScript | 100% | ✅ |
| Devices | iOS 13+, Android 8+ | ✅ |

---

## 🎯 Visão Geral

**MePaga** é uma solução completa para divisão de despesas que combina:
- Backend robusto e escalável
- Frontend intuitivo e responsivo
- Arquitetura clean e manutenível
- Documentação abrangente

Perfeito para grupos que precisam organizar finanças de forma simples e transparente.

---

## 📄 Licença

Este projeto está sob licença **ISC**.

---

## 🔗 Links Rápidos

- 📐 [Arquitetura Técnica](./ARQUITETURA.md)
- 📋 [Análise de Requisitos](./REQUISITOS.md)
- 📖 [Documentação Completa](./DOCUMENTACAO.md)
- ⚡ [Referência Rápida](./QUICK_REFERENCE.md)
- 🚀 [Backend](./mepaga-api/)
- 📱 [Frontend](./mepaga-app/)

---

## 🙋 Perguntas Frequentes

**P: Como funciona a divisão de despesas?**
R: Ao registrar uma despesa, você seleciona os membros que participam. O sistema calcula automaticamente quanto cada um deve baseado no valor total e número de participantes.

**P: Preciso de internet para usar?**
R: Sim, atualmente todas as operações sincronizam com o servidor. Offline-first é planejado para o futuro.

**P: Os dados são seguros?**
R: Sim! Senhas são hashadas com bcrypt e dados comunicam via HTTPS em produção. Seguimos práticas de segurança padrão.

**P: Quanto custa?**
R: Totalmente gratuito! Sem anúncios, sem cobranças.

---

## 🚀 Deploy

```bash
# Backend (produção)
pnpm build
PORT=3000 NODE_ENV=production pnpm start

# Frontend (Expo)
pnpm run build
# Ou via Expo Cloud: eas build
```

---

**Versão**: 1.0.0  
**Última atualização**: 2026-06-11  
**Mantido por**: Equipe MePaga
