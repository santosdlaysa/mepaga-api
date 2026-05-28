# MePaga API - Documentação de Arquitetura

API REST para divisão de despesas em grupo, construída com **Clean Architecture** e **Clean Code**.

---

## Tecnologias

| Tecnologia | Função |
|------------|--------|
| Node.js + TypeScript | Runtime e linguagem |
| Fastify | Framework HTTP |
| Prisma 7 | ORM e migrações |
| PostgreSQL | Banco de dados relacional |

---

## Estrutura do Projeto

```
src/
├── domain/                    # Regras de negócio puras (sem dependências externas)
│   ├── entities/              # Interfaces das entidades do domínio
│   │   ├── User.ts
│   │   ├── Group.ts
│   │   ├── Expense.ts
│   │   └── Balance.ts
│   └── repositories/         # Contratos (interfaces) dos repositórios
│       ├── IUserRepository.ts
│       ├── IGroupRepository.ts
│       └── IExpenseRepository.ts
│
├── application/               # Casos de uso (orquestram o domínio)
│   └── usecases/
│       ├── CreateGroup.ts
│       ├── JoinGroup.ts
│       ├── LinkAccount.ts
│       ├── CreateExpense.ts
│       └── GetGroupBalances.ts
│
├── infrastructure/            # Implementações concretas (banco, serviços externos)
│   ├── database/
│   │   └── prismaClient.ts
│   └── repositories/
│       ├── PrismaUserRepository.ts
│       ├── PrismaGroupRepository.ts
│       └── PrismaExpenseRepository.ts
│
├── presentation/              # Camada HTTP (entrada/saída)
│   ├── controllers/
│   │   ├── GroupController.ts
│   │   ├── UserController.ts
│   │   ├── ExpenseController.ts
│   │   └── BalanceController.ts
│   └── routes/
│       ├── groupRoutes.ts
│       ├── userRoutes.ts
│       ├── expenseRoutes.ts
│       └── balanceRoutes.ts
│
├── shared/                    # Código compartilhado entre camadas
│   └── errors/
│       └── AppError.ts
│
├── app.ts                     # Composition Root (injeção de dependências)
└── server.ts                  # Ponto de entrada da aplicação
```

---

## Princípios Aplicados

### Clean Architecture

O fluxo de dependência é sempre de fora para dentro:

```
Presentation → Application → Domain
                   ↑
Infrastructure ────┘
```

- **Domain** não conhece nenhuma outra camada. Define entidades e contratos.
- **Application** conhece apenas o Domain. Implementa casos de uso consumindo interfaces de repositório.
- **Infrastructure** implementa os contratos do Domain usando Prisma/PostgreSQL.
- **Presentation** recebe HTTP, converte para o formato do caso de uso e retorna a resposta.

### Inversão de Dependência (DIP)

Os casos de uso dependem de **interfaces** (`IUserRepository`, `IGroupRepository`, `IExpenseRepository`), nunca de implementações concretas. A injeção é feita manualmente no `app.ts` (Composition Root).

### Single Responsibility

Cada classe tem uma responsabilidade:
- **Controller** — converte request/response HTTP
- **Use Case** — orquestra regra de negócio
- **Repository** — acessa dados

---

## Modelagem do Banco de Dados

```
┌──────────┐     ┌───────────────┐     ┌──────────┐
│  users   │────<│ group_members │>────│  groups   │
└──────────┘     └───────────────┘     └──────────┘
     │                                      │
     │           ┌──────────────┐           │
     └──────────<│   expenses   │>──────────┘
                 └──────────────┘
                       │
                 ┌─────────────────┐
                 │ expense_splits  │
                 └─────────────────┘
```

| Tabela | Descrição |
|--------|-----------|
| `users` | Usuários (temporários ou com e-mail vinculado) |
| `groups` | Grupos de despesas com token de convite único |
| `group_members` | Relação N:N entre usuários e grupos |
| `expenses` | Despesas registradas (quem pagou, valor, comprovante) |
| `expense_splits` | Divisão individual de cada despesa |

---

## Endpoints da API

### Grupos e Convites

#### `POST /api/groups`

Cria um grupo e o usuário criador (temporário).

**Request:**
```json
{
  "name": "Viagem SP",
  "category": "Viagem",
  "creator_name": "Lorena"
}
```

**Response (201):**
```json
{
  "group": {
    "id": "uuid",
    "name": "Viagem SP",
    "category": "Viagem",
    "invite_url": "http://localhost:3000/invite/abc123xyz"
  },
  "creator": {
    "id": "uuid",
    "name": "Lorena",
    "is_temporary": true
  }
}
```

---

#### `POST /api/groups/join`

Entra em um grupo usando o token de convite.

**Request:**
```json
{
  "invite_token": "abc123xyz",
  "name": "Carlos",
  "user_id": null
}
```

**Response (200):**
```json
{
  "group_id": "uuid",
  "user": {
    "id": "uuid",
    "name": "Carlos",
    "is_temporary": true
  }
}
```

---

### Usuários

#### `PATCH /api/users/link-account`

Vincula um e-mail a um usuário temporário.

**Request:**
```json
{
  "user_id": "uuid",
  "email": "carlos@email.com"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Carlos",
  "email": "carlos@email.com",
  "is_temporary": false
}
```

---

### Despesas

#### `POST /api/groups/:group_id/expenses`

Registra uma despesa com divisão personalizada.

**Request:**
```json
{
  "description": "Jantar",
  "amount": 150.00,
  "paid_by": "uuid-pagador",
  "receipt_url": "https://storage.com/recibo.jpg",
  "splits": [
    { "user_id": "uuid-1", "amount_owed": 50.00 },
    { "user_id": "uuid-2", "amount_owed": 100.00 }
  ]
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "group_id": "uuid",
  "paid_by": "uuid-pagador",
  "amount": 150.00,
  "description": "Jantar",
  "receipt_url": "https://storage.com/recibo.jpg",
  "splits": [
    { "user_id": "uuid-1", "amount_owed": 50.00 },
    { "user_id": "uuid-2", "amount_owed": 100.00 }
  ]
}
```

**Validação:** a soma dos `amount_owed` deve ser igual ao `amount` total (tolerância de R$0,01).

---

### Balanços

#### `GET /api/groups/:group_id/balances`

Retorna saldos individuais e dívidas simplificadas.

**Response (200):**
```json
{
  "group_id": "uuid",
  "who_pays_next": "uuid-mais-negativo",
  "individual_balances": [
    { "user_id": "uuid-1", "name": "Lorena", "net_balance": 100.00 },
    { "user_id": "uuid-2", "name": "Carlos", "net_balance": -100.00 }
  ],
  "simplified_debts": [
    {
      "from": { "id": "uuid-2", "name": "Carlos" },
      "to": { "id": "uuid-1", "name": "Lorena", "pix_key": "lorena@pix.com" },
      "amount": 100.00
    }
  ]
}
```

---

## Motor de Liquidação (Algoritmo Greedy)

O cálculo de `simplified_debts` usa minimização de transações:

1. **Calcula saldo líquido** de cada membro: `total pago - total que deve`
2. **Separa em devedores** (saldo negativo) **e credores** (saldo positivo)
3. **Ordena ambas as listas** do maior para o menor valor
4. **Casamento ganancioso**: pega o maior devedor e maior credor, transfere o mínimo entre ambos, atualiza saldos e repete

Isso transforma cadeias como `A→B→C` em `A→C`, reduzindo o número total de transferências.

Implementação: `src/application/usecases/GetGroupBalances.ts`

---

## Tratamento de Erros

Erros de negócio usam `AppError` com status HTTP apropriado:

| Código | Situação |
|--------|----------|
| 404 | Grupo ou usuário não encontrado, convite inválido |
| 409 | Usuário já é membro, e-mail já em uso, conta já vinculada |
| 422 | Soma das divisões difere do valor total |
| 500 | Erro interno não tratado |

---

## Como Executar

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com a URL do PostgreSQL

# 3. Gerar Prisma Client
npx prisma generate

# 4. Criar tabelas no banco
npx prisma migrate dev --name init

# 5. Iniciar em modo desenvolvimento
npm run dev
```

### Scripts disponíveis

| Script | Comando |
|--------|---------|
| `npm run dev` | Inicia com hot-reload (tsx) |
| `npm run build` | Compila TypeScript |
| `npm start` | Executa build compilado |
| `npm run prisma:generate` | Gera o Prisma Client |
| `npm run prisma:migrate` | Executa migrações |
| `npm run prisma:studio` | Abre o Prisma Studio (GUI) |
