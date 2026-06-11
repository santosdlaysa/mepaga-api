# MePaga - Análise de Requisitos

## 📋 Sumário

Este documento descreve os requisitos funcionais e não-funcionais da plataforma MePaga, um aplicativo para divisão de despesas entre grupos de usuários.

---

## 1. Visão Geral do Produto

### 1.1 Descrição do Produto

**MePaga** é uma aplicação móvel que simplifica o gerenciamento de despesas compartilhadas entre grupos (amigos, colegas, familiares). Permite que usuários criem grupos, registrem despesas e saibam automaticamente quanto cada pessoa deve pagar ou receber.

### 1.2 Problema que Resolve

- Dificuldade em lembrar quem deve quanto a quem
- Falta de transparência em divisão de custos
- Necessidade de cálculos manuais complexos
- Dificuldade em rastrear transações de compensação

### 1.3 Proposta de Valor

- ✅ **Simplicidade**: Interface intuitiva e fácil de usar
- ✅ **Precisão**: Cálculos automáticos de saldos
- ✅ **Transparência**: Histórico completo de transações
- ✅ **Integração PIX**: Chave PIX para facilitar transferências
- ✅ **Multi-plataforma**: Funciona em iOS, Android e Web

### 1.4 Público-Alvo

- Grupos de amigos que viajam juntos
- Colegas de trabalho compartilhando refeições
- Familiares dividindo despesas compartilhadas
- Qualquer grupo que precisa dividir custos

---

## 2. Requisitos Funcionais

### 2.1 Gerenciamento de Usuários

#### RF2.1.1 Autenticação
- **Descrição**: O sistema deve permitir que usuários se autentiquem na aplicação
- **Atores**: Usuário não autenticado
- **Pré-condições**: Usuário possui conta ativa
- **Fluxo Principal**:
  1. Usuário insere email e senha
  2. Sistema valida credenciais contra banco de dados
  3. Se válido, autentica usuário e permite acesso
  4. Se inválido, exibe mensagem de erro
- **Pós-condições**: Usuário logado tem acesso à home
- **Restrições**: Limite de tentativas de login
- **Prioridade**: CRÍTICA

#### RF2.1.2 Registro de Novo Usuário
- **Descrição**: Novos usuários podem se registrar na plataforma
- **Atores**: Usuário não registrado
- **Fluxo Principal**:
  1. Usuário acessa tela de registro
  2. Insere nome, sobrenome, email
  3. Insere senha
  4. Insere chave PIX (opcional no registro)
  5. Sistema valida dados
  6. Sistema cria novo usuário
  7. Exibe mensagem de sucesso
- **Validações**:
  - Email deve ser único (não duplicado)
  - Email deve estar em formato válido
  - Senha deve ter mínimo de 8 caracteres
  - Todos os campos obrigatórios devem ser preenchidos
- **Pós-condições**: Novo usuário criado, pode fazer login
- **Prioridade**: CRÍTICA

#### RF2.1.3 Recuperação de Senha
- **Descrição**: Usuários podem recuperar acesso ao fazer reset de senha
- **Atores**: Usuário que esqueceu senha
- **Fluxo Principal**:
  1. Usuário clica em "Esqueci a senha"
  2. Insere email registrado
  3. Sistema envia código de 6 dígitos para email
  4. Usuário insere código recebido
  5. Usuário define nova senha
  6. Sistema valida e atualiza senha no banco
  7. Usuário pode fazer login com nova senha
- **Validações**:
  - Email deve estar registrado no sistema
  - Código deve ser válido e não expirado (15 minutos)
  - Nova senha deve atender requisitos mínimos
- **Pós-condições**: Senha alterada com sucesso
- **Prioridade**: ALTA

#### RF2.1.4 Atualizar Chave PIX
- **Descrição**: Usuário pode adicionar ou atualizar sua chave PIX
- **Atores**: Usuário autenticado
- **Fluxo Principal**:
  1. Usuário acessa perfil
  2. Clica em "Editar chave PIX"
  3. Insere/atualiza chave PIX
  4. Sistema salva a alteração
  5. Exibe confirmação
- **Validações**:
  - Chave PIX deve estar em formato válido
- **Pós-condições**: Chave PIX atualizada
- **Prioridade**: MÉDIA

#### RF2.1.5 Vincular Conta Social
- **Descrição**: Usuários podem vincular contas sociais (Google, Apple)
- **Atores**: Usuário autenticado
- **Fluxo Principal**:
  1. Usuário acessa perfil
  2. Clica em "Vincular conta"
  3. Seleciona provider (Google/Apple)
  4. Realiza autenticação com provider
  5. Sistema vincula conta
- **Pós-condições**: Conta social vinculada ao perfil
- **Prioridade**: MÉDIA

#### RF2.1.6 Visualizar Perfil
- **Descrição**: Usuário pode visualizar e editar seu perfil
- **Atores**: Usuário autenticado
- **Dados Exibidos**:
  - Nome
  - Email
  - Chave PIX
  - Foto de perfil (futuro)
  - Número de grupos
  - Número de amigos
- **Prioridade**: ALTA

---

### 2.2 Gerenciamento de Grupos

#### RF2.2.1 Criar Grupo
- **Descrição**: Usuário autenticado pode criar um novo grupo
- **Atores**: Usuário autenticado
- **Fluxo Principal**:
  1. Usuário clica em "Novo Grupo"
  2. Insere nome do grupo
  3. Seleciona categoria (viagem, colegas, família, outro)
  4. Sistema cria grupo com token único de convite
  5. Usuário é adicionado como membro criador
  6. Exibe tela de sucesso com opção de convidar
- **Validações**:
  - Nome do grupo obrigatório (máximo 100 caracteres)
  - Categoria obrigatória
- **Pós-condições**: Novo grupo criado, usuário é membro
- **Prioridade**: CRÍTICA

#### RF2.2.2 Entrar em Grupo (Join)
- **Descrição**: Usuário pode entrar em um grupo via token de convite
- **Atores**: Usuário autenticado
- **Fluxo Principal**:
  1. Usuário clica em "Entrar em Grupo"
  2. Insere token de convite (ou acessa link)
  3. Sistema valida token
  4. Adiciona usuário como membro do grupo
  5. Exibe grupo na lista de grupos do usuário
- **Validações**:
  - Token deve ser válido
  - Token deve corresponder a um grupo existente
  - Usuário não pode ser membro duplicado
- **Pós-condições**: Usuário adicionado ao grupo
- **Prioridade**: CRÍTICA

#### RF2.2.3 Listar Grupos do Usuário
- **Descrição**: Exibir todos os grupos dos quais o usuário é membro
- **Atores**: Usuário autenticado
- **Dados Exibidos** por grupo:
  - Nome do grupo
  - Categoria
  - Número de membros
  - Saldo do usuário naquele grupo (simplificado)
  - Data de entrada no grupo
- **Ações Disponíveis**:
  - Clicar para ver detalhes
  - Sair do grupo (futuro)
- **Prioridade**: CRÍTICA

#### RF2.2.4 Visualizar Detalhes do Grupo
- **Descrição**: Exibir informações completas e atividades do grupo
- **Atores**: Membro do grupo
- **Dados Exibidos**:
  - Nome, categoria
  - Lista de membros com seus saldos
  - Histórico de despesas (últimas transações)
  - Total gasto no grupo
- **Ações Disponíveis**:
  - Adicionar despesa
  - Ver saldos (quem deve para quem)
  - Compartilhar convite
  - Configurações (se criador)
- **Prioridade**: CRÍTICA

#### RF2.2.5 Configurações do Grupo
- **Descrição**: Criador do grupo pode ajustar configurações
- **Atores**: Criador do grupo
- **Configurações Disponíveis**:
  - Editar nome
  - Editar categoria
  - Editar membros (remover membros)
  - Gerar novo token de convite
  - Deletar grupo
- **Prioridade**: ALTA

#### RF2.2.6 Deletar Grupo
- **Descrição**: Criador pode deletar grupo
- **Atores**: Criador do grupo
- **Fluxo Principal**:
  1. Criador acessa configurações do grupo
  2. Clica em "Deletar grupo"
  3. Sistema solicita confirmação
  4. Após confirmação, deleta grupo e todas as associações
- **Pós-condições**: Grupo deletado permanentemente
- **Prioridade**: MÉDIA

---

### 2.3 Gerenciamento de Despesas

#### RF2.3.1 Criar Despesa
- **Descrição**: Membro do grupo pode registrar uma despesa
- **Atores**: Membro autenticado
- **Fluxo Principal**:
  1. Membro clica em "Adicionar Despesa"
  2. Insere descrição da despesa
  3. Insere valor total
  4. Seleciona quem pagou (padrão: usuário logado)
  5. Seleciona quem participa da despesa (checkboxes)
  6. Sistema calcula divisão (valores por pessoa)
  7. Permite upload de recibo (foto)
  8. Sistema cria registros de Expense e ExpenseSplit
  9. Exibe confirmação
- **Validações**:
  - Valor deve ser positivo
  - Deve haver pelo menos 1 pessoa na divisão
  - Descrição obrigatória (máx 255 caracteres)
  - Arquivo de recibo máximo 10 MB
- **Tipos de Divisão**:
  - Igualmente (divide em partes iguais)
  - Manualmente (insere valor para cada pessoa)
  - Percentual (futuro)
- **Pós-condições**: Despesa criada, ExpenseSplits geradas
- **Prioridade**: CRÍTICA

#### RF2.3.2 Visualizar Despesa
- **Descrição**: Ver detalhes completos de uma despesa
- **Atores**: Membro do grupo
- **Dados Exibidos**:
  - Descrição
  - Valor total
  - Quem pagou
  - Divisão (quem deve quanto)
  - Data de criação
  - Recibo (se houver)
- **Prioridade**: ALTA

#### RF2.3.3 Editar Despesa
- **Descrição**: Quem registrou pode editar despesa
- **Atores**: Criador da despesa
- **Campos Editáveis**:
  - Descrição
  - Valor
  - Quem pagou
  - Divisão entre membros
- **Pós-condições**: Despesa atualizada, ExpenseSplits recalculados
- **Prioridade**: MÉDIA

#### RF2.3.4 Deletar Despesa
- **Descrição**: Quem registrou pode deletar despesa
- **Atores**: Criador da despesa
- **Fluxo Principal**:
  1. Usuário clica em deletar despesa
  2. Sistema solicita confirmação
  3. Deleta Expense e ExpenseSplits relacionados
  4. Recalcula saldos do grupo
- **Pós-condições**: Despesa deletada, saldos atualizados
- **Prioridade**: MÉDIA

---

### 2.4 Visualização de Saldos

#### RF2.4.1 Visualizar Saldos do Grupo
- **Descrição**: Mostrar quem deve quanto para quem no grupo
- **Atores**: Membro do grupo
- **Fluxo Principal**:
  1. Membro clica em "Saldos" na tela de detalhes do grupo
  2. Sistema calcula:
     - Quanto cada pessoa pagou
     - Quanto cada pessoa deve (ExpenseSplits)
     - Saldo líquido (crédito ou débito)
  3. Exibe lista clara de liquidações necessárias
- **Formato de Exibição**:
  ```
  João deve R$ 150 para Maria
  Maria deve R$ 50 para Pedro
  etc.
  ```
- **Prioridade**: CRÍTICA

#### RF2.4.2 Resumo Financeiro do Usuário
- **Descrição**: Exibir resumo de finanças do usuário em todos os grupos
- **Atores**: Usuário autenticado
- **Dados Exibidos**:
  - Total que deve em todos os grupos
  - Total que lhe devem em todos os grupos
  - Saldo consolidado (quanto é devedor ou credor geral)
  - Breakdown por grupo
- **Prioridade**: ALTA

---

### 2.5 Histórico e Atividades

#### RF2.5.1 Visualizar Atividades do Grupo
- **Descrição**: Mostrar histórico de transações do grupo
- **Atores**: Membro do grupo
- **Dados Exibidos**:
  - Tipo de atividade (criação, despesa adicionada, membro entrou)
  - Usuário envolvido
  - Descrição
  - Valor (se aplicável)
  - Data e hora
- **Filtragem/Ordenação**:
  - Por data (mais recente primeiro)
  - Quantidade limitada (com paginação)
- **Prioridade**: ALTA

#### RF2.5.2 Visualizar Atividades do Usuário
- **Descrição**: Mostrar histórico de atividades do usuário
- **Atores**: Usuário autenticado
- **Dados Exibidos**:
  - Tipo de atividade (login, grupo criado, despesa adicionada)
  - Grupo envolvido (se aplicável)
  - Descrição
  - Data e hora
- **Prioridade**: MÉDIA

---

### 2.6 Uploads de Recibos

#### RF2.6.1 Upload de Comprovante
- **Descrição**: Usuário pode fazer upload de foto do recibo/nota fiscal
- **Atores**: Criador da despesa
- **Fluxo Principal**:
  1. Ao criar/editar despesa, usuário clica "Adicionar recibo"
  2. Pode escolher foto da câmera ou galeria
  3. Sistema valida tamanho (máx 10 MB)
  4. Faz upload para servidor
  5. URL do arquivo é armazenada na despesa
- **Validações**:
  - Arquivo deve ser imagem (JPG, PNG, etc)
  - Tamanho máximo 10 MB
- **Armazenamento**: `/uploads` no servidor
- **Prioridade**: MÉDIA

#### RF2.6.2 Visualizar Recibo
- **Descrição**: Membros do grupo podem ver foto do recibo
- **Atores**: Membro do grupo
- **Fluxo Principal**:
  1. Ao visualizar despesa, ver opção "Ver recibo"
  2. Clica e vê imagem em tela cheia
- **Prioridade**: MÉDIA

---

## 3. Requisitos Não-Funcionais

### 3.1 Performance

| Requisito | Especificação |
|-----------|--------------|
| **Tempo de Resposta** | APIs devem responder em < 500ms em condições normais |
| **Carregamento de Tela** | Telas devem carregar em < 2 segundos |
| **Sincronização** | Dados devem sincronizar entre dispositivos em < 5 segundos |
| **Cálculo de Saldos** | Cálculo de saldos até 1000 membros em < 1 segundo |

### 3.2 Confiabilidade

| Requisito | Especificação |
|-----------|--------------|
| **Uptime** | API deve ter uptime de 99.5% |
| **Recuperação de Erro** | Sistema deve recuperar de falhas de rede automaticamente |
| **Integridade de Dados** | Nenhuma perda de dados em falhas (transações ACID) |
| **Backup** | Backup automático do banco de dados a cada 24h |

### 3.3 Usabilidade

| Requisito | Especificação |
|-----------|--------------|
| **Interface** | Intuitiva e fácil de usar para usuários não-técnicos |
| **Acessibilidade** | Suporte a leitores de tela (futuro) |
| **Responsive** | Funciona em diferentes tamanhos de tela |
| **Idioma** | Português do Brasil (futuro: multilíngue) |

### 3.4 Segurança

| Requisito | Especificação |
|-----------|--------------|
| **Senhas** | Hash com bcrypt (no mínimo 10 rounds) |
| **HTTPS** | Todas as comunicações via HTTPS em produção |
| **Validação** | Validação rigorosa de todas as entradas |
| **Autorização** | Usuários só veem/acessam seus próprios dados |
| **CORS** | Apenas origens autorizadas podem acessar API |
| **Rate Limiting** | Limite de requisições por IP (futuro) |

### 3.5 Escalabilidade

| Requisito | Especificação |
|-----------|--------------|
| **Usuários Simultâneos** | Suportar 10.000+ usuários simultâneos |
| **Banco de Dados** | Escalável horizontalmente (futuro: replicação) |
| **Cache** | Implementar cache para consultas frequentes (futuro) |
| **CDN** | Servir assets estáticos via CDN (futuro) |

### 3.6 Compatibilidade

| Requisito | Especificação |
|-----------|--------------|
| **Plataformas** | iOS 13+, Android 8+, Web (navegadores modernos) |
| **Browsers** | Chrome, Safari, Firefox, Edge (versões recentes) |
| **Dispositivos** | Smartphones, tablets, desktop |

### 3.7 Manutenibilidade

| Requisito | Especificação |
|-----------|--------------|
| **Código** | TypeScript em 100% da aplicação |
| **Testes** | Coverage mínima de 70% (futuro) |
| **Documentação** | Código bem documentado com comentários onde necessário |
| **Logs** | Logs estruturados de todas as operações (futuro) |

---

## 4. Casos de Uso Principais

### CU1: Usuário Registra e Faz Login

```
Pré-condições: Aplicativo instalado
1. Usuário abre app
2. Clica em "Registrar"
3. Preenche nome, sobrenome, email, senha
4. Valida email (deve ser único)
5. Sistema envia confirmação
6. Usuário volta e faz login
7. Sistema verifica credenciais
8. Exibe home com grupos
```

### CU2: Criar Grupo e Convidar Membros

```
Pré-condições: Usuário logado
1. Usuário clica "Novo Grupo"
2. Insere nome (ex: "Viagem Fortaleza")
3. Seleciona categoria (ex: "Viagem")
4. Sistema cria grupo com token único
5. Usuário é adicionado como criador
6. Sistema exibe token de convite (código ou link)
7. Usuário compartilha token com amigos
8. Amigos entram usando token
9. Grupo agora tem múltiplos membros
```

### CU3: Registrar Despesa e Calcular Saldos

```
Pré-condições: Usuário em grupo com múltiplos membros
1. Usuário em restaurante com amigos
2. Paga conta de R$ 300 para 3 pessoas
3. Abre app → Grupo → "Adicionar Despesa"
4. Descrição: "Almoço no restaurante"
5. Valor: R$ 300
6. Seleciona: João, Maria, Pedro (incluindo ele)
7. Tipo de divisão: Igualmente
8. Clica "Confirmar"
9. Sistema cria Expense (R$ 300)
10. Sistema cria ExpenseSplit:
    - João: R$ 100
    - Maria: R$ 100
    - Pedro: R$ 100
11. Usuário pode ver saldos:
    - João deve R$ 100
    - Maria deve R$ 100
    - Pedro deve R$ 100
```

### CU4: Visualizar Saldos e Liquidar Débitos

```
Pré-condições: Grupo com despesas registradas
1. Usuário abre grupo
2. Clica em "Saldos"
3. Vê: "João deve R$ 100 para você"
4. Clica em João
5. Vê chave PIX de João
6. Pode transferir via Pix pelo banco
7. Volta e marca como pago (futuro)
```

---

## 5. Histórias de Usuário (User Stories)

### US1: Registro de Novo Usuário
```
Como um novo usuário
Quero registrar uma conta no MePaga
Para poder compartilhar despesas com meus amigos

Critério de Aceitação:
- Posso inserir nome, sobrenome, email e senha
- Recebo validação se email já existe
- Posso começar a usar o app após registro
- Minha chave PIX é opcional no registro
```

### US2: Criar Grupo com Amigos
```
Como um usuário logado
Quero criar um novo grupo
Para organizar despesas com um grupo específico

Critério de Aceitação:
- Posso escolher nome e categoria do grupo
- Recebo um código/link de convite único
- Sou adicionado automaticamente como membro
- Posso compartilhar o código com amigos
```

### US3: Registrar Despesa Compartilhada
```
Como membro de um grupo
Quero registrar uma despesa que fiz
Para que seja dividida entre os membros

Critério de Aceitação:
- Posso inserir descrição, valor e membros
- A divisão é calculada automaticamente
- Posso fazer upload de recibo/foto
- Os membros veem a despesa imediatamente
```

### US4: Visualizar Quanto Devo
```
Como membro de um grupo
Quero ver meu saldo no grupo
Para saber quanto devo e quanto me devem

Critério de Aceitação:
- Vejo lista clara de liquidações
- Vejo chave PIX de quem devo pagar
- Posso filtrar por grupo
- Vejo histórico de todas as transações
```

### US5: Recuperar Acesso
```
Como um usuário que esqueceu a senha
Quero recuperar meu acesso
Para continuar usando a aplicação

Critério de Aceitação:
- Recebo código de 6 dígitos por email
- Código expira em 15 minutos
- Posso definir nova senha
- Consigo fazer login com nova senha
```

---

## 6. Restrições

### 6.1 Técnicas
- Aplicativo deve usar tecnologias open-source ou com licenças compatíveis
- Backend em Node.js com TypeScript
- Frontend em React Native com Expo
- Banco de dados PostgreSQL
- Dados sensíveis devem ser criptografados

### 6.2 Negócio
- Aplicativo deve ser gratuito
- Sem anúncios
- Dados de usuários não são vendidos
- Conformidade com LGPD (Lei Geral de Proteção de Dados)

### 6.3 Operacionais
- Suporte inicial via email
- Banco de dados em único datacenter (futuro: múltiplos)
- Deployment automático via CI/CD

---

## 7. Dependências Externas

| Dependência | Propósito | Status |
|-----------|----------|--------|
| PostgreSQL | Banco de dados | Necessário |
| Fastify | Framework backend | Implementado |
| Prisma | ORM | Implementado |
| React Native | Framework mobile | Implementado |
| Expo | Toolchain | Implementado |
| bcrypt | Hashing de senha | Implementado |
| UUID | Geração de IDs | Implementado |

---

## 8. Critérios de Sucesso

A aplicação será considerada bem-sucedida se:

✅ Usuários conseguem criar contas e fazer login com sucesso
✅ Grupos são criados e membros podem entrar via código/link
✅ Despesas são registradas e saldos calculados corretamente
✅ Interface é intuitiva e usuários conseguem usar sem manual
✅ Aplicativo não sofre perdas de dados
✅ Performance está dentro dos requisitos (< 500ms por API call)
✅ Funciona em iOS, Android e Web
✅ Código é legível, bem estruturado e fácil de manter

---

## 9. Roadmap Futuro

### Phase 2 (próximos meses)
- [ ] Autenticação via Google/Apple
- [ ] Push notifications
- [ ] Histórico de atividades detalhado
- [ ] Marcar pagamentos como completados
- [ ] Editar/deletar despesas

### Phase 3 (médio prazo)
- [ ] Sincronização offline (AsyncStorage)
- [ ] Relatórios e gráficos de gastos
- [ ] Integração com bancos (Pix automático)
- [ ] Chat/comentários em despesas
- [ ] Fotos de perfil

### Phase 4 (longo prazo)
- [ ] Suporte a múltiplas moedas
- [ ] Internacionalização (múltiplos idiomas)
- [ ] Automação de pagamentos
- [ ] Integração com planilhas (Excel/Google Sheets)
- [ ] Acesso web avançado

---

## 10. Matriz de Rastreamento

| ID | Requisito | Prioridade | Status | Complexidade | Valor |
|---|-----------|-----------|--------|-------------|-------|
| RF2.1.1 | Autenticação | CRÍTICA | ✅ Feito | Média | Alto |
| RF2.1.2 | Registro | CRÍTICA | ✅ Feito | Média | Alto |
| RF2.1.3 | Reset de Senha | ALTA | ✅ Feito | Média | Médio |
| RF2.1.4 | Atualizar PIX | MÉDIA | ✅ Feito | Baixa | Médio |
| RF2.2.1 | Criar Grupo | CRÍTICA | ✅ Feito | Média | Alto |
| RF2.2.2 | Entrar em Grupo | CRÍTICA | ✅ Feito | Média | Alto |
| RF2.2.3 | Listar Grupos | CRÍTICA | ✅ Feito | Baixa | Alto |
| RF2.3.1 | Criar Despesa | CRÍTICA | ✅ Feito | Alta | Alto |
| RF2.4.1 | Ver Saldos | CRÍTICA | ✅ Feito | Alta | Alto |
| RF2.5.1 | Atividades Grupo | ALTA | ✅ Feito | Média | Médio |
| RF2.6.1 | Upload Recibo | MÉDIA | ✅ Feito | Média | Baixo |

---

## 11. Questões em Aberto

1. **Autenticação JWT**: Implementar tokens JWT para segurança?
2. **Rate Limiting**: Necessário limitar requisições por IP?
3. **Criptografia**: Dados de PIX devem ser criptografados?
4. **Email**: Sistema de confirmação de email no registro?
5. **Notificações**: Push notifications quando alguém entra no grupo?
6. **Backup**: Onde fazer backup dos dados (AWS, GCP)?

---

## 12. Glossário

| Termo | Definição |
|-------|-----------|
| **Grupo** | Conjunto de usuários que compartilham despesas |
| **Despesa** | Custo registrado que será dividido |
| **Saldo** | Quanto um usuário deve ou lhe devem em um grupo |
| **ExpenseSplit** | Divisão de uma despesa entre membros |
| **Token de Convite** | Código único para entrar em um grupo |
| **PIX** | Sistema de pagamento instantâneo brasileiro |
| **Hash** | Valor criptografado irrecuperável da senha |
| **Use Case** | Ação/operação que o sistema pode executar |

---

## Conclusão

Este documento define completamente os requisitos do MePaga. A aplicação está bem estruturada e cobre os casos de uso principais de divisão de despesas. Com uma arquitetura sólida e requisitos bem documentados, o projeto tem base forte para manutenção e expansão futura.
