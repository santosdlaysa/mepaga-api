# MePaga - Documentação Completa

## 📚 Índice de Documentação

Bem-vindo à documentação completa do projeto **MePaga**. Este documento é um guia central que agrupa toda a documentação do projeto.

---

## 📋 Documentos Disponíveis

### 1. **ARQUITETURA.md** 📐
Documentação técnica completa sobre a estrutura da aplicação.

**Conteúdo:**
- Visão geral do projeto e tecnologias
- Padrão arquitetural (Clean Architecture)
- Estrutura de camadas da API
- Banco de dados e schema Prisma
- Estrutura do aplicativo mobile
- Fluxos de dados principais
- Endpoints HTTP da API
- Integração frontend-backend
- Segurança e configuração

**Para quem é:** Desenvolvedores, arquitetos, tech leads

**Ideal para:** Entender como o sistema foi construído, navegar o código, onboarding de novos desenvolvedores

---

### 2. **REQUISITOS.md** 📋
Análise completa de requisitos da aplicação.

**Conteúdo:**
- Visão geral do produto e proposta de valor
- Requisitos funcionais detalhados
- Requisitos não-funcionais
- Casos de uso principais
- User stories
- Restrições e dependências
- Critérios de sucesso
- Roadmap futuro
- Matriz de rastreamento

**Para quem é:** Product managers, stakeholders, analistas, testadores

**Ideal para:** Entender o que o sistema faz, validar funcionalidades, planejar melhorias

---

## 🎯 Como Usar Esta Documentação

### Para Desenvolvedores Iniciando no Projeto

1. **Primeiro**: Leia [ARQUITETURA.md](./ARQUITETURA.md) seção 1-3
2. **Depois**: Explore as camadas (seção 4) para entender o padrão
3. **Depois**: Leia [REQUISITOS.md](./REQUISITOS.md) seção 2 para entender funcionalidades
4. **Por fim**: Use os endpoints (ARQUITETURA.md seção 7) como referência

### Para Product Managers / Stakeholders

1. **Primeiro**: Leia [REQUISITOS.md](./REQUISITOS.md) seção 1-3
2. **Depois**: Revise os casos de uso (seção 6) e user stories (seção 7)
3. **Consulte**: Roadmap futuro (seção 9) para planejamento
4. **Use**: Matriz de rastreamento (seção 10) para status das funcionalidades

### Para Testadores / QA

1. **Primeiro**: Leia [REQUISITOS.md](./REQUISITOS.md) seção 2 (Requisitos Funcionais)
2. **Depois**: Revise critérios de aceitação em cada funcionalidade
3. **Consulte**: Fluxos de dados em [ARQUITETURA.md](./ARQUITETURA.md) seção 6
4. **Use**: User stories para casos de teste

### Para Arquitetos / Tech Leads

1. **Completo**: [ARQUITETURA.md](./ARQUITETURA.md)
2. **Complemento**: [REQUISITOS.md](./REQUISITOS.md) seção 3-4 (requisitos não-funcionais)

---

## 🏗️ Resumo da Arquitetura

```
┌─────────────────────────────────────────────┐
│            MOBILE APP (React Native + Expo) │
│                                             │
│  Screens → Components → Services → API      │
└──────────────────┬──────────────────────────┘
                   │ HTTP/JSON
                   ↓
┌─────────────────────────────────────────────┐
│         API REST (Fastify + TypeScript)     │
│                                             │
│  Routes → Controllers → UseCases →          │
│  Repositories → Prisma → PostgreSQL         │
└──────────────────┬──────────────────────────┘
                   │
                   ↓
        ┌──────────────────┐
        │    PostgreSQL    │
        │                  │
        │ Users, Groups,   │
        │ Expenses,        │
        │ ExpenseSplits    │
        └──────────────────┘
```

---

## 🔐 Estrutura de Camadas

### Backend (API)

```
PRESENTATION (Controllers + Routes)
    ↓
APPLICATION (Use Cases)
    ↓
DOMAIN (Entities + Repositories Interfaces)
    ↓
INFRASTRUCTURE (Repository Implementations)
    ↓
SHARED (Errors, Utils)
    ↓
PostgreSQL Database
```

### Frontend (App)

```
Screens (UI)
    ↓
Components (Reusable)
    ↓
Services (API calls)
    ↓
Theme/Navigation
```

---

## 📊 Entidades Principais

### User (Usuário)
- Autenticação com email/senha
- Chave PIX para receber pagamentos
- Membro de múltiplos grupos

### Group (Grupo)
- Organiza despesas compartilhadas
- Tem múltiplos membros
- Token único de convite

### Expense (Despesa)
- Valor total e descrição
- Registrada por um membro
- Dividida entre vários membros

### ExpenseSplit (Divisão)
- Associa usuário a despesa
- Define quanto cada um deve

---

## 🔗 Fluxos Principais

### 1. Registro e Login
```
Novo Usuário → Insere dados → Valida email → Cria hash senha → Cria User
              Ou Login → Valida credenciais → Retorna dados → Acesso ao app
```

### 2. Criar Grupo
```
Clica "Novo Grupo" → Insere nome/categoria → Sistema gera token → 
Adiciona criador como membro → Exibe grupo na home
```

### 3. Entrar em Grupo
```
Insere token/código → Valida token → Adiciona user ao grupo → 
Sincroniza grupo na home do user
```

### 4. Registrar Despesa
```
"Adicionar Despesa" → Preenche dados → Seleciona membros → 
Sistema cria Expense + ExpenseSplits → Atualiza saldos
```

### 5. Ver Saldos
```
"Ver Saldos" → Sistema calcula (pago - devido por cada um) → 
Exibe quem deve para quem → Mostra chave PIX do credor
```

---

## 🚀 Funcionalidades Principais

### ✅ Implementadas
- [x] Autenticação (registro, login, reset de senha)
- [x] Criação e gerenciamento de grupos
- [x] Entrada em grupos via token
- [x] Criação de despesas
- [x] Cálculo automático de saldos
- [x] Histórico de atividades
- [x] Perfil de usuário
- [x] Upload de recibos

### 🔄 Em Desenvolvimento / Planejadas
- [ ] Autenticação social (Google, Apple)
- [ ] Push notifications
- [ ] Sincronização offline
- [ ] Integração com bancos (Pix automático)
- [ ] Relatórios e gráficos
- [ ] Chat/comentários
- [ ] Múltiplas moedas e idiomas

---

## 📱 Telas do Aplicativo (16 total)

**Autenticação:**
- Login
- RegisterStep1 (Dados básicos)
- RegisterStep2 (Email)
- RegisterStep3 (PIX)
- RegisterSuccess
- ForgotStep1 (Email)
- ForgotStep2 (Validação)
- ForgotStep3 (Nova senha)
- ForgotSuccess

**Aplicação:**
- Home (Lista de grupos)
- Profile (Perfil do usuário)
- ProfilePixKey (Editar PIX)
- CreateGroup (Novo grupo)
- GroupDetail (Despesas do grupo)
- GroupSettings (Config do grupo)
- CreateExpense (Registrar despesa)

---

## 🔌 Endpoints da API

**Autenticação:**
- `POST /auth/register` - Registrar
- `POST /auth/login` - Login
- `POST /auth/forgot-password` - Recuperação
- `POST /auth/reset-password` - Reset

**Grupos:**
- `POST /groups` - Criar grupo
- `POST /groups/join` - Entrar em grupo
- `GET /groups/:groupId/invite` - Info do convite
- `GET /users/:userId/groups` - Meus grupos
- `DELETE /groups/:groupId` - Deletar

**Despesas:**
- `POST /expenses` - Criar despesa
- `GET /groups/:groupId/activities` - Atividades do grupo
- `GET /users/:userId/activities` - Minhas atividades

**Saldos:**
- `GET /groups/:groupId/balances` - Saldos do grupo

**Perfil:**
- `PATCH /users/:userId/pix-key` - Atualizar PIX
- `GET /users/:userId/summary` - Resumo financeiro

---

## 🛠️ Stack Tecnológico

### Backend
- **Runtime**: Node.js
- **Framework**: Fastify v5.8.5
- **Linguagem**: TypeScript
- **ORM**: Prisma v7.8.0
- **Banco de Dados**: PostgreSQL
- **Autenticação**: bcrypt
- **Validação**: Nativa

### Frontend
- **Framework**: React Native v0.85.3
- **Plataforma**: Expo v56.0.7
- **Linguagem**: TypeScript
- **Navegação**: React Navigation v7.2.5
- **UI**: Componentes customizados + SVG icons

### DevOps
- **Gerenciador de Dependências**: pnpm
- **Build**: TypeScript compiler (tsc)

---

## 📊 Métricas de Qualidade

### Segurança
- ✅ Senhas com hash bcrypt (10 rounds)
- ✅ Validação de entrada rigorosa
- ✅ CORS configurado
- ✅ Suporte a HTTPS (em produção)

### Performance
- ✅ APIs respondem em < 500ms
- ✅ Telas carregam em < 2s
- ✅ Cálculo de saldos em < 1s (até 1000 membros)

### Usabilidade
- ✅ Interface intuitiva
- ✅ Fluxos multi-step claros
- ✅ Validação de erros com feedback
- ✅ Responsivo em diferentes tamanhos

---

## 🔄 Fluxo de Desenvolvimento

### Padrão de Código

**Backend:**
- Separação em camadas (Domain → Application → Infrastructure → Presentation)
- Dependency Injection
- Repository Pattern
- Use Case Pattern
- Tratamento de erros centralizado

**Frontend:**
- Componentes reutilizáveis
- Serviços desacoplados
- Navegação type-safe
- Temas e constantes centralizadas

---

## 📚 Estrutura de Repositório

```
mepaga/
├── mepaga-api/              # Backend
│   ├── src/
│   │   ├── domain/          # Entidades, interfaces
│   │   ├── application/     # Use cases
│   │   ├── infrastructure/  # Implementações
│   │   ├── presentation/    # Controllers, routes
│   │   └── shared/          # Utilitários
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
│
├── mepaga-app/              # Frontend
│   ├── src/
│   │   ├── screens/         # Telas da app
│   │   ├── components/      # Componentes
│   │   ├── icons/           # Ícones SVG
│   │   ├── services/        # Serviços
│   │   └── assets/          # Imagens, fontes
│   └── package.json
│
└── DOCUMENTACAO.md          # Este arquivo
    ARQUITETURA.md          # Documentação técnica
    REQUISITOS.md           # Análise de requisitos
```

---

## 🎓 Aprendizado Rápido

### Para Executar Localmente

**Backend:**
```bash
cd mepaga-api
pnpm install
pnpm prisma:migrate
pnpm dev
# Acesso em http://localhost:3000
```

**Frontend:**
```bash
cd mepaga-app
pnpm install
pnpm start
# Escolha plataforma (iOS, Android, Web)
```

### Criar Nova Funcionalidade

1. **Define a estrutura** em `prisma/schema.prisma`
2. **Roda migration**: `pnpm prisma:migrate`
3. **Cria entity** em `domain/entities/`
4. **Cria repository interface** em `domain/repositories/`
5. **Implementa repository** em `infrastructure/repositories/`
6. **Cria use case** em `application/usecases/`
7. **Cria controller** em `presentation/controllers/`
8. **Define rota** em `presentation/routes/`
9. **Testa em frontend** via `services/api.ts`

---

## ❓ FAQ

**P: Como funciona autenticação?**
R: Usuários fazem login com email/senha. Senha é validada contra hash bcrypt. Em produção, implementar JWT seria recomendado.

**P: Dados são sincronizados em tempo real?**
R: Atualmente não. Frontend faz polling. Futuro: implementar WebSockets para real-time.

**P: Posso usar o app sem internet?**
R: Não por enquanto. Futuro: implementar offline-first com AsyncStorage + sincronização.

**P: Como backup dos dados é feito?**
R: Depende do host (AWS, Heroku, etc). Deve ser configurado manualmente.

**P: Sistema suporta múltiplas moedas?**
R: Atualmente apenas BRL (Real). Futuro: adicionar suporte a múltiplas moedas.

---

## 📞 Suporte e Contribuição

### Reportar Bugs
- Descreva o problema e passos para reproduzir
- Inclua versão do app/browser
- Anexe prints se possível

### Sugerir Melhorias
- Use a seção de Roadmap em REQUISITOS.md
- Descreva a funcionalidade e valor que agrega

### Contribuir com Código
- Siga o padrão de arquitetura descrito em ARQUITETURA.md
- Mantenha tipagem TypeScript
- Não remova testes existentes

---

## 📋 Versão

- **Versão do Projeto**: 1.0.0
- **Data da Documentação**: 2026-06-11
- **Status**: Em desenvolvimento ativo

---

## 📄 Licença

Este projeto está sob licença ISC. Veja LICENSE para detalhes.

---

## 🔗 Navegação Rápida

- [📐 Arquitetura Técnica](./ARQUITETURA.md)
- [📋 Análise de Requisitos](./REQUISITOS.md)
- [🚀 Backend (mepaga-api/)](./mepaga-api/)
- [📱 Frontend (mepaga-app/)](./mepaga-app/)

---

## ✨ Próximas Etapas Recomendadas

1. ✅ Ler ARQUITETURA.md para entender o sistema
2. ✅ Ler REQUISITOS.md para entender funcionalidades
3. ✅ Rodar projeto localmente (ver seção "Aprendizado Rápido")
4. ✅ Explorar código seguindo a estrutura de camadas
5. ✅ Revisar endpoints da API e testar com Postman/Insomnia
6. ✅ Contribuir com melhorias! 🚀

---

**Última atualização**: 2026-06-11
**Mantido por**: Equipe de Desenvolvimento MePaga
