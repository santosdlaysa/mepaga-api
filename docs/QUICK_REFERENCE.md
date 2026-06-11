# MePaga - Referência Rápida (Cheat Sheet)

Guia rápido para desenvolvedores em manutenção diária do código.

---

## 🚀 Comandos Essenciais

### Backend (mepaga-api)

```bash
# Desenvolvimento
pnpm dev                    # Start dev server com watch (localhost:3000)
pnpm build                  # Compilar TypeScript para JS

# Banco de dados
pnpm prisma:migrate        # Criar/rodar migrations
pnpm prisma:generate       # Gerar tipos Prisma
pnpm prisma:studio         # Abrir Prisma Studio (GUI do banco)

# Produção
pnpm start                  # Rodar versão compilada
```

### Frontend (mepaga-app)

```bash
# Desenvolvimento
pnpm start                  # Iniciar Expo dev server
pnpm android                # Build para Android
pnpm ios                    # Build para iOS
pnpm web                    # Rodar em web (localhost:19006)

# Utilitários
pnpm reverse                # Forward port Android (adb reverse tcp:3000 tcp:3000)
```

---

## 📁 Estrutura Rápida

### Backend

```
src/
├── domain/entities/*.ts              → Modelos de dados
├── domain/repositories/*.ts          → Interfaces dos repos
├── application/usecases/*.ts         → Lógica de negócio
├── infrastructure/repositories/*.ts  → Implementação dos repos
├── infrastructure/database/          → Conexão com banco
├── presentation/controllers/*.ts     → Tratamento HTTP
├── presentation/routes/*.ts          → Definição de endpoints
├── shared/                           → Erros, utils
├── app.ts                            → Config Fastify
└── server.ts                         → Entry point
```

### Frontend

```
src/
├── screens/*.tsx          → Telas (16 total)
├── components/*.tsx       → Componentes reutilizáveis
├── icons/*.tsx           → Ícones SVG
├── services/api.ts       → Client HTTP para API
├── navigation.ts         → Types de navegação
├── theme.ts              → Cores, estilos globais
└── App.tsx               → Componente raiz
```

---

## 🏗️ Padrão de Arquitetura

### Criar Use Case Novo

```typescript
// 1. Domain Entity (se necessário)
// domain/entities/MyEntity.ts
export class MyEntity {
  constructor(public id: number, public name: string) {}
}

// 2. Repository Interface
// domain/repositories/IMyRepository.ts
export interface IMyRepository {
  findById(id: number): Promise<MyEntity | null>;
  create(data: CreateInput): Promise<MyEntity>;
}

// 3. Use Case
// application/usecases/MyUseCase.ts
export class MyUseCase {
  constructor(private readonly repo: IMyRepository) {}
  
  async execute(input: Input): Promise<MyEntity> {
    // validações
    // lógica de negócio
    // chamadas ao repo
    return this.repo.create(input);
  }
}

// 4. Implementação do Repository
// infrastructure/repositories/PrismaMyRepository.ts
export class PrismaMyRepository implements IMyRepository {
  async findById(id: number) {
    return prisma.my.findUnique({ where: { id } });
  }
  async create(data: CreateInput) {
    return prisma.my.create({ data });
  }
}

// 5. Controller
// presentation/controllers/MyController.ts
export class MyController {
  constructor(private readonly myUseCase: MyUseCase) {}
  
  async create(request: FastifyRequest, reply: FastifyReply) {
    const result = await this.myUseCase.execute(request.body);
    return reply.status(201).send(result);
  }
}

// 6. Routes
// presentation/routes/myRoutes.ts
export async function myRoutes(app: FastifyInstance) {
  app.post('/my', (req, reply) => myController.create(req, reply));
}

// 7. Registre em app.ts
// app.ts - adicione:
const myRepository = new PrismaMyRepository();
const myUseCase = new MyUseCase(myRepository);
const myController = new MyController(myUseCase);
await app.register(myRoutes, { controller: myController });
```

---

## 🗄️ Banco de Dados

### Criar Nova Tabela

```sql
# 1. Editar schema.prisma
model MyModel {
  id        Int     @id @default(autoincrement())
  name      String
  createdAt DateTime @default(now())
  
  @@map("my_models")
}

# 2. Rodar migration
pnpm prisma:migrate dev --name add_my_model

# 3. Gerar tipos
pnpm prisma:generate

# 4. Ver no studio
pnpm prisma:studio
```

### Queries Comuns (Prisma)

```typescript
// CREATE
const user = await prisma.user.create({
  data: { name: "John", email: "john@example.com" }
});

// READ
const user = await prisma.user.findUnique({ where: { id: 1 } });
const users = await prisma.user.findMany({ where: { /* ... */ } });

// UPDATE
const user = await prisma.user.update({
  where: { id: 1 },
  data: { name: "Jane" }
});

// DELETE
await prisma.user.delete({ where: { id: 1 } });

// COUNT
const count = await prisma.user.count();

// AGGREGATE
const aggregate = await prisma.expense.aggregate({
  _sum: { amount: true },
  where: { groupId: 1 }
});
```

---

## 🔌 Endpoints Cheat Sheet

### Autenticação

| Método | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/auth/register` | `{name, email, password, pix_key?}` | 201 User |
| POST | `/auth/login` | `{email, password}` | 200 User |
| POST | `/auth/forgot-password` | `{email}` | 200 OK |
| POST | `/auth/reset-password` | `{email, code, new_password}` | 200 OK |

### Grupos

| Método | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/groups` | `{name, category, created_by_user_id}` | 201 Group |
| POST | `/groups/join` | `{invite_token, user_id}` | 200 OK |
| GET | `/groups/:groupId/invite` | - | 200 Group + members |
| GET | `/users/:userId/groups` | - | 200 Groups[] |
| DELETE | `/groups/:groupId` | - | 200 OK |

### Despesas

| Método | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/expenses` | `{group_id, paid_by_user_id, amount, description}` | 201 Expense |
| GET | `/groups/:groupId/activities` | - | 200 Activities[] |
| GET | `/users/:userId/activities` | - | 200 Activities[] |

### Saldos & Perfil

| Método | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/groups/:groupId/balances` | - | 200 Balances |
| PATCH | `/users/:userId/pix-key` | `{pix_key}` | 200 User |
| GET | `/users/:userId/summary` | - | 200 Summary |

---

## 🎯 Entidades Principais

### User
```typescript
{
  id: number
  name: string
  email: string
  passwordHash: string
  pixKey?: string
  resetCode?: string
  resetCodeExpiresAt?: Date
  createdAt: Date
}
```

### Group
```typescript
{
  id: number
  name: string
  category: string
  inviteToken: string
  createdByUserId?: number
  createdAt: Date
}
```

### Expense
```typescript
{
  id: number
  groupId: number
  paidByUserId: number
  amount: Decimal
  description: string
  receiptUrl?: string
  createdAt: Date
}
```

### ExpenseSplit
```typescript
{
  id: number
  expenseId: number
  userId: number
  amountOwed: Decimal
  createdAt: Date
}
```

---

## 🧪 Testes Rápidos (Postman/Insomnia)

### 1. Registrar

```
POST http://localhost:3000/auth/register
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123456",
  "pix_key": "joao@gmail.com"
}

Response: 201 { id, name, email, ... }
```

### 2. Login

```
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "joao@example.com",
  "password": "senha123456"
}

Response: 200 { id, name, email, ... }
```

### 3. Criar Grupo

```
POST http://localhost:3000/groups
Content-Type: application/json

{
  "name": "Viagem Fortaleza",
  "category": "viagem",
  "created_by_user_id": 1
}

Response: 201 { id, name, category, invite_token, ... }
```

### 4. Entrar em Grupo

```
POST http://localhost:3000/groups/join
Content-Type: application/json

{
  "invite_token": "abc123...",
  "user_id": 2
}

Response: 200 OK
```

### 5. Criar Despesa

```
POST http://localhost:3000/expenses
Content-Type: application/json

{
  "group_id": 1,
  "paid_by_user_id": 1,
  "amount": 300.00,
  "description": "Almoço"
}

Response: 201 { id, group_id, paid_by_user_id, ... }
```

### 6. Ver Saldos

```
GET http://localhost:3000/groups/1/balances

Response: 200 {
  "total": 300.00,
  "balances": [
    { "user_id": 1, "name": "João", "paidTotal": 300, "owedTotal": 100, "balance": 200 },
    { "user_id": 2, "name": "Maria", "paidTotal": 0, "owedTotal": 100, "balance": -100 }
  ]
}
```

---

## 🐛 Debug Útil

### Ver Logs da API
```bash
# Fastify gera logs automáticos
# Procure por linhas com "error", "warn", "info"
```

### Inspecionar Banco de Dados
```bash
# Abrir GUI do Prisma
pnpm prisma:studio
# Acesso em http://localhost:5555
```

### Validar Tipos TypeScript
```bash
# No editor, pressionar Ctrl+Shift+B (VS Code)
# Ou verificar na compilação: pnpm build
```

### Testar API Manualmente
```bash
# Instalar REST Client no VS Code
# Ou usar Postman/Insomnia (veja seção Testes)
```

---

## ⚠️ Erros Comuns

### "Database connection refused"
```
Solução: 
- Verificar if PostgreSQL está rodando
- Verificar DATABASE_URL em .env
- Executar: pnpm prisma:migrate
```

### "Type 'User' is not assignable to type 'User'"
```
Solução:
- Gerar tipos Prisma: pnpm prisma:generate
- Reiniciar editor/IDE
```

### "Port 3000 already in use"
```
Solução:
- Matar processo: npx kill-port 3000
- Ou usar PORT diferente: PORT=3001 pnpm dev
```

### "CORS error on frontend"
```
Solução:
- Verificar se CORS está habilitado em app.ts
- Verificar se API_URL está correta no frontend
```

### "Email already in use"
```
Solução:
- Email já existe no banco
- Limpar banco: pnpm prisma:migrate reset
- Ou criar com outro email
```

---

## 📋 Checklist para Nova Feature

- [ ] Criar/atualizar schema no Prisma
- [ ] Rodar migration: `pnpm prisma:migrate`
- [ ] Gerar tipos: `pnpm prisma:generate`
- [ ] Criar/atualizar Entity em domain/entities/
- [ ] Criar/atualizar Repository interface em domain/repositories/
- [ ] Implementar Repository em infrastructure/repositories/
- [ ] Criar Use Case em application/usecases/
- [ ] Criar Controller em presentation/controllers/
- [ ] Definir rotas em presentation/routes/
- [ ] Registrar em app.ts
- [ ] Testar endpoint com Postman/Insomnia
- [ ] Atualizar frontend services/api.ts
- [ ] Testar feature completa no app
- [ ] Adicionar à documentação se necessário

---

## 🔑 Variáveis de Ambiente

### Backend (.env)
```
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mepaga

# Server
PORT=3000
NODE_ENV=development
```

### Frontend (app.json)
```json
{
  "expo": {
    "plugins": [
      "expo-image-picker"
    ]
  }
}
```

---

## 📞 Troubleshooting Rápido

| Problema | Solução |
|----------|---------|
| npm vs pnpm | Use **pnpm** (projeto usa pnpm-lock.yaml) |
| Node version | Use Node.js 18+ |
| Porta ocupada | `npx kill-port 3000` |
| Banco offline | Iniciar PostgreSQL / Docker |
| Types não atualizam | `pnpm prisma:generate` |
| App não conecta API | Verificar `EXPO_PUBLIC_API_URL` |
| Build fail | Limpar: `rm -rf node_modules dist` |

---

## 🚀 Deploy Quick Checklist

- [ ] Build backend: `pnpm build`
- [ ] Build frontend: `pnpm run build` (Expo)
- [ ] Rodar migrations: `pnpm prisma:migrate`
- [ ] Configurar variáveis ambiente
- [ ] Testar endpoints em produção
- [ ] Backup de banco de dados
- [ ] Configurar CI/CD (GitHub Actions, etc)

---

## 📚 Links Úteis

- [Fastify Docs](https://www.fastify.io/docs/latest/)
- [Prisma Docs](https://www.prisma.io/docs/)
- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)

---

## 💡 Dicas Produtivas

1. **Use Prisma Studio para inspecionar dados**: `pnpm prisma:studio`
2. **Extensão REST Client do VS Code** para testar APIs
3. **Ctrl+F para buscar** em arquivos (VS Code Ctrl+Shift+F)
4. **TypeScript IntelliSense** funciona muito bem, use sempre
5. **Logs estruturados** em Production é importante (futuro)
6. **Variáveis de ambiente** nunca commitar na base (usar .env.example)

---

**Última atualização**: 2026-06-11  
**Versão**: 1.0.0
