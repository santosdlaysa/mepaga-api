# MePaga - Documentação de Arquitetura

## 📋 Sumário Executivo

**MePaga** é uma aplicação de divisão de despesas desenvolvida com arquitetura moderna, separando completamente frontend e backend. O projeto é composto por:

- **Backend**: API REST construída com Fastify + TypeScript + Prisma + PostgreSQL
- **Frontend**: Aplicativo mobile desenvolvido com React Native + Expo + TypeScript

---

## 1. Visão Geral do Projeto

### 1.1 Objetivo
MePaga permite que grupos de usuários dividam despesas de forma simples e eficiente. A aplicação gerencia:
- Criação e participação em grupos
- Registro de despesas compartilhadas
- Divisão automática de custos
- Controle de débitos e créditos entre membros
- Sincronização de dados em tempo real

### 1.2 Tecnologias Principais

**Backend:**
- **Fastify** v5.8.5 - Framework web rápido e eficiente
- **TypeScript** v6.0.3 - Linguagem tipada
- **Prisma** v7.8.0 - ORM moderno com migrações
- **PostgreSQL** - Banco de dados relacional
- **Node.js** - Runtime JavaScript server-side

**Frontend:**
- **React Native** v0.85.3 - Framework cross-platform
- **Expo** v56.0.7 - Plataforma de desenvolvimento
- **React** v19.2.3 - Biblioteca UI
- **TypeScript** v6.0.3 - Linguagem tipada
- **React Navigation** v7.2.5 - Navegação entre telas

### 1.3 Estrutura do Repositório

```
mepaga/
├── mepaga-api/          # Projeto backend
│   ├── src/
│   ├── prisma/          # Schemas e migrações
│   ├── package.json
│   └── ...
├── mepaga-app/          # Projeto frontend
│   ├── src/
│   ├── app.json         # Configuração Expo
│   ├── package.json
│   └── ...
└── .claude/             # Configuração Claude Code
```

---

## 2. Arquitetura da API (Backend)

### 2.1 Padrão Arquitetural

A API segue **Clean Architecture** com separação em camadas bem definidas:

```
┌─────────────────────────────────────────┐
│  PRESENTATION LAYER                     │
│  (Controllers, Routes, HTTP Handling)   │
├─────────────────────────────────────────┤
│  APPLICATION LAYER                      │
│  (Use Cases, Business Logic)            │
├─────────────────────────────────────────┤
│  DOMAIN LAYER                           │
│  (Entities, Interfaces)                 │
├─────────────────────────────────────────┤
│  INFRASTRUCTURE LAYER                   │
│  (Repositories, Database, External APIs)│
├─────────────────────────────────────────┤
│  SHARED LAYER                           │
│  (Utilities, Errors, Constants)         │
└─────────────────────────────────────────┘
```

### 2.2 Estrutura de Diretórios

```
src/
├── domain/                      # Regras de negócio
│   ├── entities/               # Modelos de dados
│   │   ├── User.ts
│   │   ├── Group.ts
│   │   ├── Expense.ts
│   │   └── Balance.ts
│   ├── repositories/           # Interfaces de repositórios
│   │   ├── IUserRepository.ts
│   │   ├── IGroupRepository.ts
│   │   └── IExpenseRepository.ts
│   └── errors/                # Erros de domínio
│
├── application/                # Lógica de aplicação
│   └── usecases/              # Casos de uso (Use Cases)
│       ├── Register.ts         # Registrar novo usuário
│       ├── Login.ts            # Login de usuário
│       ├── CreateGroup.ts      # Criar novo grupo
│       ├── JoinGroup.ts        # Entrar em um grupo
│       ├── CreateExpense.ts    # Registrar despesa
│       ├── GetGroupBalances.ts # Obter saldos do grupo
│       ├── GetUserActivities.ts # Histórico do usuário
│       └── ... (mais use cases)
│
├── infrastructure/             # Implementação técnica
│   ├── database/              # Configuração do banco
│   │   └── prismaClient.ts
│   └── repositories/          # Implementações dos repositórios
│       ├── PrismaUserRepository.ts
│       ├── PrismaGroupRepository.ts
│       └── PrismaExpenseRepository.ts
│
├── presentation/              # Camada de apresentação
│   ├── controllers/          # Controllers (request/response)
│   │   ├── UserController.ts
│   │   ├── GroupController.ts
│   │   ├── ExpenseController.ts
│   │   ├── BalanceController.ts
│   │   └── ActivityController.ts
│   └── routes/              # Definição de rotas HTTP
│       ├── userRoutes.ts
│       ├── groupRoutes.ts
│       ├── expenseRoutes.ts
│       ├── balanceRoutes.ts
│       └── activityRoutes.ts
│
├── shared/                   # Código compartilhado
│   ├── errors/              # Classes de erro
│   ├── uploads/             # Gestão de uploads
│   └── constants/           # Constantes globais
│
├── app.ts                    # Configuração da aplicação Fastify
└── server.ts                 # Entrada da aplicação
```

### 2.3 Fluxo de Requisição

```
Cliente HTTP (Mobile App)
        ↓
    Fastify Server
        ↓
    Routes (presentation/routes/)
        ↓
    Controllers (presentation/controllers/)
        ↓
    Use Cases (application/usecases/)
        ↓
    Repositories (infrastructure/repositories/)
        ↓
    Prisma Client
        ↓
    PostgreSQL Database
```

### 2.4 Injeção de Dependência

As dependências são injetadas no arquivo `app.ts`:

```typescript
// Exemplo: Controllers recebem Use Cases como dependências
const userController = new UserController(
  new Register(userRepository),
  new Login(userRepository),
  // ... mais use cases
);
```

---

## 3. Banco de Dados

### 3.1 Schema do Banco de Dados

**Entidades principais:**

#### User (Usuários)
```
id (INT, PK)
name (VARCHAR)
email (VARCHAR, UNIQUE)
passwordHash (VARCHAR)
pixKey (VARCHAR, nullable)
resetCode (VARCHAR, nullable)
resetCodeExpiresAt (DATETIME, nullable)
createdAt (DATETIME)

Relacionamentos:
  - 1:N com GroupMember (participação em grupos)
  - 1:N com Group (grupos criados)
  - 1:N com Expense (despesas pagas)
  - 1:N com ExpenseSplit (divisões de despesa)
```

#### Group (Grupos)
```
id (INT, PK)
name (VARCHAR)
category (VARCHAR)
inviteToken (VARCHAR, UNIQUE)
createdByUserId (INT, FK)
createdAt (DATETIME)

Relacionamentos:
  - N:1 com User (criador)
  - N:N com User via GroupMember (membros)
  - 1:N com Expense (despesas do grupo)
```

#### GroupMember (Membros do Grupo)
```
groupId (INT, PK, FK)
userId (INT, PK, FK)
joinedAt (DATETIME)

PK Composto: (groupId, userId)
Cascade Delete: ao deletar Group ou User
```

#### Expense (Despesas)
```
id (INT, PK)
groupId (INT, FK)
paidByUserId (INT, FK)
amount (DECIMAL)
description (VARCHAR)
receiptUrl (VARCHAR, nullable)
createdAt (DATETIME)

Relacionamentos:
  - N:1 com Group
  - N:1 com User (quem pagou)
  - 1:N com ExpenseSplit (divisão da despesa)
```

#### ExpenseSplit (Divisões de Despesa)
```
id (INT, PK)
expenseId (INT, FK)
userId (INT, FK)
amountOwed (DECIMAL)
createdAt (DATETIME)

Relacionamentos:
  - N:1 com Expense
  - N:1 com User
```

### 3.2 Características do Prisma

- **ORM Type-Safe**: Geração automática de tipos TypeScript
- **Migrações**: Controle de versão do schema via arquivos
- **Seed Data**: Possibilidade de popular dados iniciais
- **Adapter PostgreSQL**: Uso de `@prisma/adapter-pg` para otimização

### 3.3 Migrations

Localização: `prisma/migrations/`

Comandos:
```bash
# Criar nova migration
pnpm prisma:migrate

# Gerar tipos Prisma
pnpm prisma:generate

# Visualizar dados no studio
pnpm prisma:studio
```

---

## 4. Camadas da API em Detalhe

### 4.1 Camada de Domínio (Domain Layer)

**Responsabilidade**: Definir as regras de negócio e contratos

**Entities** (Entidades):
- Representam objetos do domínio
- Contêm validações específicas de negócio
- Exemplo: `User`, `Group`, `Expense`

**Repositories** (Interfaces):
- Definem contratos de acesso a dados
- Permitem abstração da implementação
- Exemplo: `IUserRepository`, `IGroupRepository`

```typescript
// domain/repositories/IUserRepository.ts
export interface IUserRepository {
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserInput): Promise<User>;
  update(id: number, data: UpdateUserInput): Promise<User>;
  delete(id: number): Promise<void>;
}
```

### 4.2 Camada de Aplicação (Application Layer)

**Responsabilidade**: Orquestrar a lógica de negócio através de Use Cases

**Use Cases**:
- Cada Use Case representa uma ação do sistema
- Recebem repositórios como dependências
- Validam entrada e executam operações
- Retornam resultados ou lançam erros

```typescript
// application/usecases/Register.ts
export class Register {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(input: Input): Promise<User> {
    // Validações
    const existing = await this.userRepo.findByEmail(input.email);
    if (existing) {
      throw new AppError("E-mail já está em uso", 409);
    }

    // Hash de senha
    const hashedPassword = await bcrypt.hash(input.password, 10);

    // Persistência
    return this.userRepo.create({
      name: input.name,
      email: input.email,
      passwordHash: hashedPassword,
      pixKey: input.pixKey,
    });
  }
}
```

**Use Cases Principais:**

1. **Autenticação**
   - `Register.ts` - Registrar novo usuário
   - `Login.ts` - Autenticar usuário
   - `ForgotPassword.ts` - Solicitar reset
   - `ResetPassword.ts` - Confirmar reset
   - `LinkAccount.ts` - Vincular conta social

2. **Grupos**
   - `CreateGroup.ts` - Criar novo grupo
   - `JoinGroup.ts` - Entrar em grupo
   - `DeleteGroup.ts` - Deletar grupo
   - `GetGroupByInvite.ts` - Buscar por link de convite
   - `GetUserGroups.ts` - Listar grupos do usuário

3. **Despesas**
   - `CreateExpense.ts` - Registrar nova despesa
   - `GetGroupActivities.ts` - Histórico de despesas

4. **Saldos e Resumos**
   - `GetGroupBalances.ts` - Calcular quem deve para quem
   - `GetUserSummary.ts` - Resumo financeiro do usuário
   - `GetUserActivities.ts` - Histórico de atividades

5. **Perfil**
   - `UpdatePixKey.ts` - Atualizar chave PIX

### 4.3 Camada de Infraestrutura (Infrastructure Layer)

**Responsabilidade**: Implementação técnica de repositórios e serviços externos

**Prisma Client**:
```typescript
// infrastructure/database/prismaClient.ts
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
```

**Repositórios Implementados**:
```typescript
// infrastructure/repositories/PrismaUserRepository.ts
export class PrismaUserRepository implements IUserRepository {
  async findById(id: number): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async create(data: CreateUserInput): Promise<User> {
    return prisma.user.create({ data });
  }
  // ... mais métodos
}
```

### 4.4 Camada de Apresentação (Presentation Layer)

**Responsabilidade**: Receber requisições HTTP e enviar respostas

**Controllers**:
- Validam parâmetros de entrada
- Chamam Use Cases
- Formatam e retornam respostas

```typescript
// presentation/controllers/UserController.ts
export class UserController {
  constructor(
    private readonly register: Register,
    private readonly login: Login,
    // ... mais use cases
  ) {}

  async registerUser(request: FastifyRequest, reply: FastifyReply) {
    const { name, email, password, pix_key } = request.body;
    const user = await this.register.execute({
      name,
      email,
      password,
      pixKey: pix_key,
    });
    return reply.status(201).send(user);
  }
}
```

**Routes**:
- Definem endpoints HTTP
- Mapeiam requisições para controladores
- Tratamento de erros global

```typescript
// presentation/routes/userRoutes.ts
export async function userRoutes(app: FastifyInstance) {
  app.post("/auth/register", (req, reply) => 
    userController.registerUser(req, reply)
  );
  
  app.post("/auth/login", (req, reply) => 
    userController.login(req, reply)
  );
  // ... mais rotas
}
```

### 4.5 Camada Compartilhada (Shared Layer)

**Responsabilidade**: Código reutilizável entre camadas

**AppError**:
```typescript
// shared/errors/AppError.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500
  ) {
    super(message);
  }
}
```

**Uploads**:
- Gestão de arquivos de comprovantes
- Configuração de diretórios
- Integração com Fastify multipart

---

## 5. Arquitetura do Aplicativo Mobile

### 5.1 Stack Tecnológico

- **React Native** - Framework de desenvolvimento mobile
- **Expo** - Plataforma que simplifica React Native (build, deployment)
- **React Navigation** - Sistema de navegação entre telas
- **TypeScript** - Tipagem estática

### 5.2 Estrutura do Projeto

```
src/
├── assets/              # Imagens, fontes, recursos estáticos
├── components/          # Componentes reutilizáveis
│   ├── FloatingLabelInput.tsx
│   ├── InputField.tsx
│   ├── PrimaryButton.tsx
│   ├── ProgressBar.tsx
│   ├── Skeleton.tsx
│   └── ...
├── icons/              # Componentes de ícones SVG
│   ├── AppleIcon.tsx
│   ├── GoogleIcon.tsx
│   ├── CheckIcon.tsx
│   ├── LockIcon.tsx
│   ├── LogoMePaga.tsx
│   └── ...
├── screens/            # Telas da aplicação (16 telas)
│   ├── LoginScreen.tsx
│   ├── CreateGroupScreen.tsx
│   ├── CreateExpenseScreen.tsx
│   ├── GroupDetailScreen.tsx
│   ├── ProfileScreen.tsx
│   ├── RegisterStep1Screen.tsx
│   ├── RegisterStep2Screen.tsx
│   ├── RegisterStep3Screen.tsx
│   ├── RegisterSuccessScreen.tsx
│   ├── ForgotStep1Screen.tsx
│   ├── ForgotStep2Screen.tsx
│   ├── ForgotStep3Screen.tsx
│   ├── ForgotSuccessScreen.tsx
│   └── ...
├── services/           # Serviços (API, storage, etc)
│   ├── api.ts          # Cliente HTTP para backend
│   └── ...
├── navigation.ts       # Definição de tipos e estrutura de navegação
├── theme.ts            # Temas, cores, estilos globais
└── App.tsx             # Componente raiz da aplicação
```

### 5.3 Sistema de Navegação

O aplicativo usa **React Navigation** com uma pilha de navegação (Stack Navigation):

```typescript
// navigation.ts
export type RootStackParamList = {
  // Autenticação
  Login: undefined;
  RegisterStep1: undefined;
  RegisterStep2: { nome: string; sobrenome: string; email: string };
  RegisterStep3: { /* dados necessários */ };
  RegisterSuccess: undefined;
  ForgotStep1: undefined;
  ForgotStep2: { email: string };
  ForgotStep3: { email: string; code: string };
  ForgotSuccess: undefined;
  
  // Home e Perfil
  Home: { userId: number; name: string; email: string; pixKey?: string };
  Profile: { userId: number; /* ... */ };
  ProfilePixKey: { userId: number; pixKey?: string };
  
  // Grupos
  CreateGroup: { userId: number; name: string };
  GroupDetail: { userId: number; groupId: number; /* ... */ };
  GroupSettings: { userId: number; groupId: number; /* ... */ };
  
  // Despesas
  CreateExpense: { userId: number; groupId: number; /* ... */ };
};
```

### 5.4 Componentes Principais

**Componentes de Input:**
- `FloatingLabelInput` - Input com label flutuante (Material Design)
- `InputField` - Input básico reutilizável

**Componentes de UI:**
- `PrimaryButton` - Botão principal da aplicação
- `ProgressBar` - Barra de progresso (para multi-step)
- `Skeleton` - Componente de carregamento (skeleton loading)

**Sistema de Ícones:**
- Todos os ícones são componentes SVG
- Permite customização de cor, tamanho
- Exemplos: LogoMePaga, UserIcon, LockIcon, CheckIcon

### 5.5 Serviços

**API Service** (`services/api.ts`):
- Cliente HTTP que comunica com o backend
- Métodos para cada operação (login, criar grupo, etc)
- Tratamento de erros
- Gerenciamento de tokens (se houver)

### 5.6 Temas e Estilos

**theme.ts**:
- Paleta de cores (primária, secundária, etc)
- Tipografia (fontes, tamanhos)
- Spacing (espaçamentos padrão)
- Estilos globais

---

## 6. Fluxos Principais da Aplicação

### 6.1 Fluxo de Autenticação - Registro

```
RegisterStep1Screen
  ↓ (Insere nome, sobrenome)
RegisterStep2Screen
  ↓ (Insere email, validação)
RegisterStep3Screen
  ↓ (Insere chave PIX)
Register (UseCase)
  ├─ Validar email duplicado
  ├─ Hash de senha (bcrypt)
  └─ Criar usuário no banco
      ↓
RegisterSuccessScreen
  ↓
Login
```

### 6.2 Fluxo de Login

```
LoginScreen (email + senha)
  ↓
Login UseCase
  ├─ Buscar usuário por email
  ├─ Comparar senha com hash
  └─ Retornar dados do usuário
      ↓
HomeScreen
```

### 6.3 Fluxo de Criar Grupo

```
HomeScreen (botão "Novo Grupo")
  ↓
CreateGroupScreen (nome + categoria)
  ↓
CreateGroup UseCase
  ├─ Validar dados
  ├─ Gerar token único de convite
  ├─ Criar grupo no banco
  └─ Adicionar criador como membro
      ↓
GroupDetailScreen
```

### 6.4 Fluxo de Criar Despesa

```
GroupDetailScreen (botão "Adicionar Despesa")
  ↓
CreateExpenseScreen (seleção de membros + valores)
  ↓
CreateExpense UseCase
  ├─ Validar dados
  ├─ Criar registro de Expense
  ├─ Criar ExpenseSplits (divisão para cada membro)
  └─ Persistir no banco
      ↓
GroupDetailScreen (atualizado com despesa)
```

### 6.5 Fluxo de Visualizar Saldos

```
GroupDetailScreen
  ↓
GetGroupBalances UseCase
  ├─ Calcular total gasto por membro (paidBy)
  ├─ Calcular total devido por membro (ExpenseSplit)
  ├─ Calcular líquido (crédito/débito)
  └─ Retornar quem deve para quem
      ↓
BalanceScreen (exibição de saldos)
```

---

## 7. Endpoints da API

### 7.1 Autenticação

```
POST /auth/register
Body: { name, email, password, pix_key? }
Response: 201 { id, name, email, is_temporary }

POST /auth/login
Body: { email, password }
Response: 200 { id, name, email, pix_key?, is_temporary }

POST /auth/forgot-password
Body: { email }
Response: 200 { message }

POST /auth/reset-password
Body: { email, code, new_password }
Response: 200 { message }

POST /auth/link-account
Body: { user_id, email }
Response: 200 { id, name, email, is_temporary }
```

### 7.2 Grupos

```
POST /groups
Body: { name, category, created_by_user_id }
Response: 201 { id, name, category, invite_token, created_at }

POST /groups/join
Body: { invite_token, user_id }
Response: 200 { message }

GET /groups/:groupId/invite
Response: 200 { group, members }

GET /users/:userId/groups
Response: 200 [{ id, name, category, memberCount, ... }]

DELETE /groups/:groupId
Response: 200 { message }
```

### 7.3 Despesas

```
POST /expenses
Body: { group_id, paid_by_user_id, amount, description, receipt_url? }
Response: 201 { id, group_id, paid_by_user_id, amount, ... }

GET /groups/:groupId/activities
Response: 200 [{ type, user, amount, description, created_at, ... }]

GET /users/:userId/activities
Response: 200 [{ type, group, amount, description, created_at, ... }]
```

### 7.4 Saldos

```
GET /groups/:groupId/balances
Response: 200 {
  total: Decimal,
  balances: [
    { user_id, name, paidTotal, owedTotal, balance },
    ...
  ],
  settlements: [
    { from_user, to_user, amount },
    ...
  ]
}
```

### 7.5 Perfil

```
PATCH /users/:userId/pix-key
Body: { pix_key }
Response: 200 { id, name, email, pix_key }

GET /users/:userId/summary
Response: 200 { id, name, email, friendCount, groupCount, ... }
```

---

## 8. Fluxo de Dados (Data Flow)

### 8.1 Fluxo de Criação de Despesa

```
Frontend (CreateExpenseScreen)
  │ (usuário preenche formulário)
  ├─ POST /expenses
  │
Backend (Fastify)
  ├─ ExpenseController.create()
  │   ├─ Valida dados da requisição
  │   └─ Chama CreateExpense.execute()
  │
  ├─ CreateExpense UseCase
  │   ├─ Valida regras de negócio
  │   ├─ Chama PrismaExpenseRepository.create()
  │   └─ Cria Expense + ExpenseSplits
  │
  ├─ PrismaExpenseRepository
  │   ├─ prisma.expense.create()
  │   └─ prisma.expenseSplit.createMany()
  │
  ├─ PostgreSQL
  │   ├─ INSERT INTO expenses
  │   └─ INSERT INTO expense_splits
  │
  └─ Retorna ao Frontend
      │ (resposta com ID da despesa criada)
      │
Frontend
  └─ Atualiza GroupDetailScreen
```

### 8.2 Fluxo de Leitura de Saldos

```
Frontend (GroupDetailScreen)
  │ GET /groups/:groupId/balances
  │
Backend
  ├─ BalanceController.getGroupBalances()
  │
  ├─ GetGroupBalances UseCase
  │   ├─ Busca Expenses do grupo (onde paidBy = cada membro)
  │   ├─ Busca ExpenseSplits (onde userId = cada membro)
  │   ├─ Calcula saldos líquidos
  │   └─ Retorna quem deve para quem
  │
  ├─ PrismaExpenseRepository
  │   ├─ SELECT * FROM expenses WHERE groupId = X
  │   └─ SELECT * FROM expense_splits WHERE expenseId IN (...)
  │
  └─ Retorna ao Frontend
      │ {
      │   total: 1000,
      │   balances: [
      │     { user: "João", balance: -200 },
      │     { user: "Maria", balance: +300 },
      │     ...
      │   ]
      │ }
      │
Frontend
  └─ Renderiza BalanceScreen
```

---

## 9. Segurança

### 9.1 Autenticação

- **Senha**: Hashing com bcrypt (10 rounds)
- **Tokens**: Suporta integração com JWT (não implementado ainda)
- **Reset de Senha**: Código de 6 dígitos com expiração

### 9.2 Validações

- Email em formato válido
- Senhas com requisitos mínimos
- Verificação de email duplicado
- Validação de token de convite

### 9.3 CORS

```typescript
await app.register(cors, {
  origin: true,
  methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
});
```

### 9.4 Upload de Arquivos

- Limite de 10 MB por arquivo
- Suporte a multipart/form-data
- Armazenamento em `/uploads`

---

## 10. Configuração e Deployment

### 10.1 Variáveis de Ambiente

```
# Backend
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/mepaga
NODE_ENV=development

# Frontend
EXPO_PUBLIC_API_URL=http://localhost:3000
```

### 10.2 Scripts de Desenvolvimento

**Backend:**
```bash
# Desenvolvimento com watch
pnpm dev

# Build para produção
pnpm build

# Iniciar produção
pnpm start

# Gerenciar banco de dados
pnpm prisma:migrate
pnpm prisma:generate
pnpm prisma:studio
```

**Frontend:**
```bash
# Iniciar Expo dev server
pnpm start

# Rodar no Android
pnpm android

# Rodar no iOS
pnpm ios

# Rodar na web
pnpm web

# Reverse port (Android com localhost)
pnpm reverse
```

### 10.3 Estrutura de Build

**Backend:**
- TypeScript compilado para JavaScript
- Artifacts em `/dist`
- Entrada: `dist/server.js`

**Frontend:**
- Bundled via Expo
- Suporta web, iOS, Android
- Configuração em `app.json`

---

## 11. Integração Frontend-Backend

### 11.1 Comunicação HTTP

O Frontend comunica com o Backend via requisições HTTP usando fetch/axios:

```typescript
// services/api.ts (exemplo)
const API_URL = "http://localhost:3000";

export const login = async (email: string, password: string) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return response.json();
};
```

### 11.2 Formato de Dados

- **Request**: JSON (Content-Type: application/json)
- **Response**: JSON
- **Erros**: HTTP status codes + mensagem de erro

```json
// Success Response
{
  "id": 1,
  "name": "João",
  "email": "joao@example.com"
}

// Error Response
{
  "statusCode": 409,
  "message": "E-mail já está em uso"
}
```

---

## 12. Melhorias Futuras

1. **Autenticação avançada**
   - JWT com refresh tokens
   - OAuth2 (Google, Apple)
   - Two-factor authentication

2. **Persistência no Frontend**
   - AsyncStorage para dados locais
   - Sincronização offline

3. **Real-time Updates**
   - WebSockets para notificações
   - Atualizações em tempo real de saldos

4. **Notificações**
   - Push notifications
   - Alertas de atividades

5. **Relatórios**
   - Exportação de transações
   - Gráficos de gastos

6. **Internacionalização**
   - Suporte a múltiplos idiomas
   - Diferentes moedas

---

## 13. Considerações de Desenvolvimento

### 13.1 Padrões Utilizados

- **Clean Architecture**: Separação clara de responsabilidades
- **Domain-Driven Design**: Foco na lógica de negócio
- **Dependency Injection**: Desacoplamento de componentes
- **Repository Pattern**: Abstração de dados
- **Use Case Pattern**: Encapsulamento de operações

### 13.2 Tipagem TypeScript

Ambos os projetos utilizam TypeScript para:
- Type safety em tempo de compilação
- Melhor documentação de código
- Autocomplete em IDEs
- Detecção de erros mais cedo

### 13.3 Performance

- Fastify é altamente otimizado (mais rápido que Express)
- Prisma gera queries otimizadas
- React Native com Expo permite cross-platform
- Lazy loading em navegação (React Navigation)

---

## 14. Conclusão

MePaga é uma aplicação bem estruturada que segue arquitetura limpa e moderna. A separação entre backend (API Fastify) e frontend (React Native) permite:

- ✅ Manutenção independente de cada camada
- ✅ Código reutilizável e testável
- ✅ Escalabilidade futura
- ✅ Desenvolvimento paralelo de equipes
- ✅ Cross-platform mobile com Expo

A aplicação está pronta para novos recursos e melhorias enquanto mantém uma base sólida e profissional.
