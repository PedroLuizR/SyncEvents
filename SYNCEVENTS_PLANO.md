# SyncEvents — Plano de implementação para o Claude Code

> **Como usar este arquivo:** coloque-o na raiz de um repositório vazio (pode renomear para `CLAUDE.md` ou citar com `@SYNCEVENTS_PLANO.md`) e peça ao Claude Code: *"Leia o plano e execute a Fase 0. Ao final de cada fase, rode os testes, faça commit e pare para eu revisar."*

---

## 1. Contexto do produto

| Item | Definição |
|---|---|
| **Nome** | SyncEvents |
| **Tema** | Facilitar o contato entre clientes e empresas organizadoras de eventos, centralizando informações sobre serviços e simplificando a comunicação entre as partes. |
| **Problema** | Clientes têm dificuldade para encontrar empresas adequadas para seus eventos e para falar com elas de forma organizada. |
| **Objetivo** | Uma solução que facilite a busca por empresas de eventos e a comunicação entre clientes e prestadores. |
| **Público-alvo** | Pessoas organizando eventos; empresas organizadoras de eventos; prestadores de serviços para eventos. |
| **Plataforma** | **Android** (app mobile) |
| **Perfis de usuário** | `CLIENTE` e `EMPRESA` |

---

## 2. Stack (decidida)

O requisito é "React + Java para Android". A forma mais direta de cumprir isso é:

### 2.1 Mobile: React Native (Expo) + TypeScript
| Função | Biblioteca |
|---|---|
| Framework | **Expo SDK (versão estável mais recente)** + React Native + **TypeScript (strict)** |
| Navegação | **Expo Router** (rotas por arquivo, grupos `(auth)`, `(cliente)`, `(empresa)`) |
| Dados do servidor / cache | **TanStack Query** |
| HTTP | **axios**, com interceptor que injeta o JWT e trata 401 |
| Estado global (sessão) | **Zustand** |
| Armazenamento seguro do token | **expo-secure-store** |
| Formulários / validação | **react-hook-form** + **zod** (os mesmos schemas usados para as mensagens de erro) |
| Imagens (logo, portfólio, fotos do serviço) | **expo-image-picker** + `expo-image` |
| Chat em tempo real | **@stomp/stompjs** (WebSocket STOMP com o backend) |
| Datas | `@react-native-community/datetimepicker` + `date-fns` (locale pt-BR) |
| Fontes | `expo-font` (usar as fontes do Figma) |
| Testes | **Jest** + **React Native Testing Library**; E2E com **Maestro** (fluxos em YAML) |
| Qualidade | ESLint + Prettier |

Build Android: `npx expo run:android` (dev) e **EAS Build** ou `expo prebuild` + Gradle para gerar o APK.

### 2.2 Backend: Java + Spring Boot
| Função | Tecnologia |
|---|---|
| Linguagem / build | **Java 21**, **Maven** |
| Framework | **Spring Boot 3.x**: Web, Validation, Data JPA, Security, WebSocket |
| Autenticação | **JWT** (lib `jjwt`), senha com **BCrypt** |
| Banco | **PostgreSQL 16** |
| Migrations | **Flyway** (`src/main/resources/db/migration/V1__...sql`) |
| Documentação da API | **springdoc-openapi** (Swagger UI em `/swagger-ui.html`) |
| DTOs | Java `record` + mapeamento manual ou **MapStruct** |
| Upload de arquivos | Multipart → pasta local `uploads/`, servida em `/files/**` (trocar por S3/MinIO depois, atrás de uma interface `StorageService`) |
| Testes | JUnit 5, Mockito, **Testcontainers** (Postgres), MockMvc |

### 2.3 Infra local
- `docker-compose.yml` na raiz com **postgres** (e opcionalmente **pgAdmin**).
- Backend roda em `http://localhost:8080`; no emulador Android a base URL é **`http://10.0.2.2:8080`** (configurar via `EXPO_PUBLIC_API_URL`).

---

## 3. Estrutura do repositório (monorepo)

```
syncevents/
├── CLAUDE.md                  # este plano (ou um resumo apontando para ele)
├── docker-compose.yml
├── docs/
│   ├── design/                # PNGs exportados do Figma (uma por tela)
│   ├── api.md                 # gerado/atualizado a cada fase
│   └── decisoes.md            # registro de decisões tomadas durante o desenvolvimento
├── backend/
│   ├── pom.xml
│   └── src/main/java/br/com/syncevents/
│       ├── config/            # Security, CORS, WebSocket, OpenAPI
│       ├── auth/              # login, JWT, registro
│       ├── usuario/           # entidade base Usuario
│       ├── cliente/
│       ├── empresa/           # perfil, portfólio, dashboard
│       ├── categoria/
│       ├── servico/
│       ├── busca/
│       ├── solicitacao/       # orçamentos + propostas
│       ├── chat/              # conversas e mensagens (REST + STOMP)
│       ├── avaliacao/
│       ├── storage/
│       └── common/            # exceptions, handler global, validadores (CNPJ, senha)
└── mobile/
    ├── app/                   # Expo Router
    │   ├── _layout.tsx
    │   ├── index.tsx                      # Boas-vindas
    │   ├── (auth)/login.tsx
    │   ├── (auth)/cadastro-cliente.tsx
    │   ├── (auth)/cadastro-empresa.tsx
    │   ├── (cliente)/(tabs)/...           # Início, Buscar, Solicitações, Perfil
    │   ├── (cliente)/empresa/[id].tsx
    │   ├── (cliente)/orcamento/[empresaId].tsx
    │   ├── (empresa)/(tabs)/...           # Painel, Solicitações, Serviços, Perfil
    │   ├── (empresa)/servico/[id].tsx     # criar/editar ("novo" = criação)
    │   └── chat/[conversaId].tsx          # compartilhado pelos dois perfis
    ├── src/
    │   ├── api/               # cliente axios + funções por recurso
    │   ├── hooks/             # hooks do TanStack Query
    │   ├── components/        # design system (Button, Input, Chip, Card, RatingStars...)
    │   ├── theme/             # tokens: cores, tipografia, espaçamento, raios
    │   ├── store/             # zustand (sessão)
    │   ├── schemas/           # zod
    │   └── utils/             # máscaras (telefone, CNPJ, moeda), formatação
    └── e2e/                   # fluxos Maestro
```

---

## 4. Design (Figma)

As telas já estão desenhadas no Figma. **A UI deve seguir o Figma fielmente** (layout, textos, espaçamentos, ícones).

**Como o Claude Code deve obter o design (nesta ordem):**
1. Se houver um **servidor MCP do Figma** configurado, use-o para ler frames, variáveis de cor e tipografia. Link do arquivo: `<<COLAR AQUI O LINK DO FIGMA>>`
2. Senão, use os PNGs em `docs/design/` (exporte cada frame do Figma com o nome da tela, ex.: `07-perfil-da-empresa.png`).
3. Se nenhum dos dois existir, **pare e peça** ao usuário antes de inventar layout.

**Identidade visual (aproximada, CONFIRMAR no Figma antes de fixar os tokens):**
- Primária: vinho / bordô (~`#5A1F3C`); usada em botões, chips selecionados, tab ativa
- Fundo: creme / off-white (~`#F8F2EC`); cards em branco com borda suave
- Títulos em **fonte serifada**; corpo em **sans-serif**
- Cantos bem arredondados (botões em formato pílula), chips arredondados
- Estrelas de avaliação + nota (ex.: 4,9)

Crie `mobile/src/theme/tokens.ts` com esses valores e **nunca use cores fixas nos componentes**.

### 4.1 Mapa de telas (Figma → rota → história)

| # | Tela no Figma | Rota | Perfil | História |
|---|---|---|---|---|
| 1 | Tela de boas-vindas (escolha "Sou cliente" / "Sou empresa" + "Continuar") | `app/index.tsx` | público | — |
| 2 | Login (abas Cliente/Empresa, e-mail, senha, "Esqueci minha senha", Entrar, "Continuar com Google", link Cadastre-se) | `(auth)/login` | público | ID03 |
| 3 | Cadastro de cliente ("Etapa 1 de 2"; nome completo, e-mail, celular, cidade, senha, chips de tipo de evento de interesse, aceite dos termos) | `(auth)/cadastro-cliente` | público | ID01 |
| 4 | Cadastro de empresa (logo, nome fantasia, CNPJ, e-mail comercial, telefone, cidade, categorias principais em chips, "Sobre a empresa") | `(auth)/cadastro-empresa` | público | ID02 |
| 5 | Cliente — Início ("Vamos celebrar?", busca, "Explore por categoria", banner, "Recomendados para você") | `(cliente)/(tabs)/index` | cliente | ID06 |
| 6 | Resultados de busca (contagem + cidade, filtros em chips, cards com categoria, nota e "a partir de R$") | `(cliente)/(tabs)/buscar` | cliente | ID06 |
| 7 | Perfil da empresa (capa, logo, nome, categoria, cidade, nota/nº de avaliações, indicadores, Portfólio, Serviços, Avaliações, botão "Solicitar orçamento") | `(cliente)/empresa/[id]` | cliente | ID07 |
| 8 | Solicitação de orçamento (data, nº de convidados, local, tipo de evento, serviços desejados, faixa de orçamento, mensagem, anexar inspirações, aceite de contato, "Revisar solicitação") | `(cliente)/orcamento/[empresaId]` | cliente | ID08 |
| 9 | Conversa com empresa (cabeçalho com o orçamento e status "Em negociação", mensagens, card de "Proposta inicial" com valor e "Ver proposta") | `chat/[conversaId]` | ambos | ID09 |
| 10 | Avaliação de empresa ("Minhas solicitações" com abas Todas/Aguardando/Propostas/Concluídas + bottom sheet "Evento concluído" com estrelas, chips de destaque, comentário, "Publicar avaliação") | `(cliente)/(tabs)/solicitacoes` | cliente | ID11 |
| 11 | Painel da empresa ("Olá, {empresa}", visão geral com visualizações, solicitações e taxa de resposta, lista "Solicitações recebidas" com "Ver detalhes"/"Responder") | `(empresa)/(tabs)/index` | empresa | ID10 / ID04 |
| 12 | Cadastro/Editar serviço (serviço ativo, fotos, nome, categoria, descrição, modelo de preço, valor, itens inclusos, "Salvar rascunho"/"Atualizar serviço") | `(empresa)/servico/[id]` | empresa | ID05 |

Telas **sem frame no Figma** que precisam existir (fazer no mesmo estilo, de forma simples): editar perfil da empresa (ID04), lista de serviços da empresa, detalhe de uma solicitação (empresa), lista de conversas, perfil do cliente / logout.

---

## 5. Regras de negócio (da documentação do Trello)

### 5.1 Validações
- **Senha** (cliente e empresa): mín. 8 caracteres, com **maiúscula, minúscula, número e caractere especial**. Validar no app (zod) **e** no backend (validador customizado).
- **E-mail**: formato válido e único no sistema.
- **CNPJ**: 14 dígitos com **validação dos dígitos verificadores**, único. Máscara `00.000.000/0000-00`.
- **Telefone**: máscara `(00) 00000-0000`. O telefone da empresa é o contato de **WhatsApp** (exibir botão que abre `https://wa.me/55<numero>` no perfil).
- **Nome** (pessoa): apenas letras (com acento) e espaços.
- **Código da empresa**: ao cadastrar, gerar um **código público de 6 dígitos aleatórios e único** (`codigo`), exibido no perfil da empresa. (Fica pronto para o futuro perfil "Funcionário", que é fora do escopo.)

### 5.2 Categorias de serviço
Tabela `categoria` com seed: **Decoração, Buffet, Fotografia, Som e luz, Planejamento, Bebidas** (as quatro primeiras são as do Figma; Planejamento e Bebidas vêm do campo "Especialidade" da documentação). Cada categoria tem um ícone.

### 5.3 Tipos de evento
Enum: `CASAMENTO, ANIVERSARIO, CORPORATIVO, FORMATURA, INFANTIL, OUTRO`.

### 5.4 Status da solicitação de orçamento
```
PENDENTE ──► EM_ANALISE ──► EM_NEGOCIACAO (proposta enviada) ──► ACEITA ──► CONCLUIDA
     └──────────────┴──────────────┴──► RECUSADA        (cliente pode CANCELAR antes de ACEITA)
```
- Abas do cliente: **Aguardando** = PENDENTE/EM_ANALISE · **Propostas** = EM_NEGOCIACAO/ACEITA · **Concluídas** = CONCLUIDA.
- A empresa altera o status; o cliente aceita/recusa a proposta.
- Ao criar a solicitação, **criar automaticamente a conversa** entre cliente e empresa, ligada à solicitação.

### 5.5 Avaliação
- Só quem tem uma solicitação **CONCLUIDA** com a empresa pode avaliar, **uma avaliação por solicitação**.
- Nota **1 a 5**, comentário opcional, destaques opcionais (`PONTUALIDADE, QUALIDADE, ATENDIMENTO, CUSTO_BENEFICIO`).
- O perfil da empresa mostra a **média** (1 casa decimal, formato pt-BR "4,9") e o total de avaliações.

### 5.6 Indicadores do painel da empresa
- **Visualizações do perfil**: contar cada abertura do perfil por um cliente (tabela `visualizacao_perfil`), comparar com os 30 dias anteriores (%).
- **Solicitações**: total no período.
- **Taxa de resposta**: % de solicitações que saíram de PENDENTE.

---

## 6. Modelo de dados (PostgreSQL)

> O Trello tem um **Diagrama de Classes** (`APP_EVENTOS.pdf`) anexado que não veio no JSON. Se o usuário colocar esse PDF em `docs/`, **compare com o modelo abaixo e alinhe os nomes** antes de criar as migrations.

```
usuario(id PK, email UNIQUE, senha_hash, tipo [CLIENTE|EMPRESA], ativo, criado_em)
cliente(id PK, usuario_id FK UNIQUE, nome, telefone, cidade, foto_url NULL)
cliente_interesse(cliente_id FK, tipo_evento)                       -- chips do cadastro
empresa(id PK, usuario_id FK UNIQUE, codigo CHAR(6) UNIQUE, nome_fantasia, cnpj UNIQUE,
        telefone_whatsapp, cidade, uf, endereco, descricao, logo_url, capa_url, criado_em)
empresa_categoria(empresa_id FK, categoria_id FK)
categoria(id PK, nome UNIQUE, icone)
portfolio_foto(id PK, empresa_id FK, url, ordem)
servico(id PK, empresa_id FK, categoria_id FK, nome, descricao,
        modelo_preco [FIXO|A_PARTIR_DE|FAIXA|SOB_CONSULTA], preco_min NUMERIC NULL, preco_max NUMERIC NULL,
        ativo, rascunho, criado_em, atualizado_em)
servico_foto(id PK, servico_id FK, url, ordem)
servico_item_incluso(id PK, servico_id FK, descricao)
solicitacao(id PK, cliente_id FK, empresa_id FK, tipo_evento, data_evento, qtd_convidados, local,
            orcamento_min NULL, orcamento_max NULL, mensagem, status, aceite_contato, criado_em, atualizado_em)
solicitacao_servico(solicitacao_id FK, servico_id FK)               -- "serviços desejados"
solicitacao_anexo(id PK, solicitacao_id FK, url)                    -- "inspirações"
proposta(id PK, solicitacao_id FK, valor NUMERIC, descricao, status [ENVIADA|ACEITA|RECUSADA], criado_em)
conversa(id PK, solicitacao_id FK UNIQUE, cliente_id FK, empresa_id FK, criado_em)
mensagem(id PK, conversa_id FK, remetente_usuario_id FK, tipo [TEXTO|PROPOSTA], conteudo, proposta_id NULL, lida, enviada_em)
avaliacao(id PK, solicitacao_id FK UNIQUE, empresa_id FK, cliente_id FK, nota SMALLINT CHECK 1..5,
          comentario NULL, destaques TEXT[] , criado_em)
visualizacao_perfil(id PK, empresa_id FK, cliente_id FK NULL, criado_em)
```

Valores monetários em `NUMERIC(12,2)` / `BigDecimal`; no app formatar como `R$ 18.500`.

---

## 7. API REST (contrato)

Prefixo `/api/v1`. Todas as rotas, exceto `auth` e `GET` públicos de categoria, exigem `Authorization: Bearer <jwt>`. Erros no formato:
```json
{ "status": 400, "erro": "VALIDACAO", "mensagem": "Dados inválidos", "campos": { "email": "E-mail já cadastrado" } }
```

| Método | Rota | Perfil | Descrição |
|---|---|---|---|
| POST | `/auth/cadastro/cliente` | público | ID01 |
| POST | `/auth/cadastro/empresa` | público | ID02 (multipart com logo opcional) |
| POST | `/auth/login` | público | ID03: `{ login, senha, tipo }`; `login` aceita e-mail ou CNPJ quando `tipo=EMPRESA` → `{ token, usuario }` |
| GET | `/auth/me` | ambos | dados do usuário logado |
| GET | `/categorias` | público | lista |
| GET | `/empresas?q=&categoriaId=&cidade=&page=&size=&ordenar=relevancia\|nota\|preco` | cliente | ID06 (busca por nome, nome de serviço ou categoria) |
| GET | `/empresas/recomendadas` | cliente | Início: melhor nota, filtrado pelos interesses/cidade do cliente |
| GET | `/empresas/{id}` | ambos | ID07: perfil completo (registra visualização se for cliente) |
| GET/PUT | `/empresas/me` | empresa | ID04: ver/editar o próprio perfil |
| POST/DELETE | `/empresas/me/portfolio` | empresa | fotos do portfólio |
| GET | `/empresas/me/dashboard` | empresa | indicadores do painel |
| GET | `/empresas/{id}/servicos` | ambos | serviços ativos |
| GET/POST | `/servicos/me` | empresa | ID05: listar/criar |
| PUT/DELETE | `/servicos/{id}` | empresa (dona) | editar/remover |
| POST | `/servicos/{id}/fotos` | empresa (dona) | upload |
| POST | `/solicitacoes` | cliente | ID08 |
| GET | `/solicitacoes/me?status=` | ambos | cliente: as suas; empresa: recebidas (ID10) |
| GET | `/solicitacoes/{id}` | envolvidos | detalhe |
| PATCH | `/solicitacoes/{id}/status` | empresa | ID10: EM_ANALISE / RECUSADA / CONCLUIDA |
| POST | `/solicitacoes/{id}/propostas` | empresa | envia proposta (vira mensagem do tipo PROPOSTA no chat e muda status para EM_NEGOCIACAO) |
| PATCH | `/propostas/{id}` | cliente | aceitar/recusar |
| PATCH | `/solicitacoes/{id}/cancelar` | cliente | cancelar |
| GET | `/conversas` | ambos | ID09: lista com última mensagem e não lidas |
| GET | `/conversas/{id}/mensagens?antesDe=&size=` | envolvidos | histórico paginado |
| POST | `/conversas/{id}/mensagens` | envolvidos | envia (fallback REST) |
| WS | `/ws` (STOMP) → envia `/app/conversas/{id}`, assina `/topic/conversas/{id}` | envolvidos | tempo real, JWT no header `CONNECT` |
| POST | `/avaliacoes` | cliente | ID11 |
| GET | `/empresas/{id}/avaliacoes?page=` | ambos | lista + média |

Toda rota que acessa um recurso de outra pessoa deve **checar a posse/participação** (retornar 403/404 caso contrário).

---

## 8. Ordem de implementação (fases)

Cada fase entrega **backend + mobile + testes** daquela funcionalidade. Ao final de cada fase: `mvn verify` e `npm test` passando, commit (`feat(fase-N): ...`), atualização de `docs/api.md` e uma **pausa para revisão do usuário**.

### Fase 0: Fundação
- Monorepo, `docker-compose.yml`, `.gitignore`, `.env.example` (backend e mobile), README com como rodar.
- Backend: projeto Spring Boot, perfil `dev`, Flyway rodando, handler global de erros, OpenAPI, CORS, endpoint `/actuator/health`.
- Mobile: Expo + TypeScript + Expo Router, `theme/tokens.ts`, fontes, cliente axios com `EXPO_PUBLIC_API_URL`, TanStack Query provider, ESLint/Prettier.
- **Design system** base em `src/components/`: `Button` (primário/secundário/pílula), `TextInput` (com label, erro, máscara, ícone de olho na senha), `Chip` (selecionável), `Card`, `RatingStars`, `Avatar`, `SectionHeader`, `EmptyState`, `TabBar` estilizada.
- **Aceite:** app abre no emulador mostrando uma tela de catálogo dos componentes; backend sobe com o banco do docker.

### Fase 1 (Sprint 1): Autenticação e cadastros (ID01, ID02, ID03)
- Migrations de `usuario`, `cliente`, `cliente_interesse`, `empresa`, `categoria` (+ seed), `empresa_categoria`.
- Spring Security stateless + JWT; validadores de senha e CNPJ; geração do `codigo` de 6 dígitos.
- Telas 1 a 4 do Figma. Após o cadastro: **voltar para o Login** com mensagem de sucesso (como diz o tutorial). Após o login: redirecionar para `(cliente)` ou `(empresa)` conforme o tipo. Sessão persistida no SecureStore; logout.
- "Continuar com Google" e "Esqueci minha senha": **visíveis, mas mostram "Em breve"** (fora do MVP).
- **Aceite:** e-mail duplicado, CNPJ inválido, senha fraca e login errado mostram mensagens claras; testes unitários dos validadores; testes de integração dos 3 endpoints; fluxo Maestro "cadastrar cliente → logar".

### Fase 2 (Sprint 2): Empresa: perfil e serviços (ID04, ID05)
- Migrations de `servico`, fotos, itens inclusos, `portfolio_foto`; `StorageService` local.
- Tela 12 (criar/editar serviço, com rascunho e ativo/inativo), lista "Meus serviços" com editar/excluir (confirmação antes de excluir).
- Ver e editar o próprio perfil (logo, capa, descrição, contatos, cidade, categorias, portfólio).
- Tab bar da empresa com Painel (placeholder até a Fase 4), Solicitações, Serviços, Perfil.
- **Aceite:** empresa cria, edita, desativa e remove serviço; outra empresa não consegue editar (teste de 403).

### Fase 3 (Sprint 2): Cliente: descoberta (ID06, ID07)
- Busca com filtro por categoria, cidade e ordenação; paginação com scroll infinito.
- Tela 5 (Início com categorias, banner e recomendados), tela 6 (resultados) e tela 7 (perfil da empresa com portfólio, serviços, avaliações, indicadores e botão de WhatsApp).
- Registrar a visualização do perfil.
- Gerar um **seed de dados de demonstração** (perfil `dev`): cerca de 10 empresas com serviços, fotos e avaliações, para as telas não ficarem vazias.
- **Aceite:** buscar "decoração" retorna as empresas da categoria e as que têm serviço com esse nome; estados de carregando, vazio e erro em todas as listas.

### Fase 4 (Sprint 3): Orçamentos e gestão (ID08, ID10)
- Migrations de `solicitacao`, `solicitacao_servico`, `solicitacao_anexo`, `proposta`, `conversa`.
- Tela 8 com passo de **revisão** antes de enviar e tela de confirmação de envio.
- Empresa: lista de solicitações recebidas, detalhe, mudar status, enviar proposta.
- Tela 11 (painel da empresa) com os indicadores reais.
- Cliente: aba "Minhas solicitações" (parte de lista da tela 10) com as abas por status.
- **Aceite:** máquina de estados testada (transições inválidas retornam 409); o cliente vê a atualização do status.

### Fase 5 (Sprint 3): Chat (ID09)
- Migration de `mensagem`; STOMP sobre WebSocket com autenticação JWT; endpoints REST de histórico.
- Lista de conversas + tela 9 (cabeçalho com o contexto do orçamento, bolhas, card de proposta com aceitar/recusar para o cliente, marcar como lida).
- Reconexão automática; se o WebSocket cair, fazer polling a cada 5 s.
- **Aceite:** duas sessões (cliente e empresa) trocam mensagens em tempo real; o histórico carrega paginado; usuário de fora recebe 403.

### Fase 6 (Sprint 3): Avaliações (ID11)
- Migration de `avaliacao`; regra "só CONCLUIDA, uma por solicitação".
- Bottom sheet da tela 10; média e lista no perfil da empresa (tela 7).
- **Aceite:** não é possível avaliar duas vezes nem avaliar sem ter concluído (teste); a média é atualizada no perfil.

### Fase 7: Acabamento e entrega
- Revisão visual tela a tela contra o Figma (listar as diferenças em `docs/decisoes.md`).
- Acessibilidade: `accessibilityLabel` nos botões de ícone, área de toque ≥ 48dp, contraste.
- Fluxos Maestro completos: cliente (cadastro → busca → orçamento → chat → avaliação) e empresa (cadastro → serviço → responder → proposta).
- Gerar o **APK** de release e documentar no README.
- Preencher o cartão "Documentação de tudo que foi feito" com o resumo de `docs/`.

---

## 9. Convenções para o Claude Code

- **Idioma:** código (classes, variáveis, rotas) em **português** seguindo os nomes deste plano (ex.: `Solicitacao`, `/solicitacoes`); textos da UI em pt-BR, iguais aos do Figma.
- **Backend:** organizar por funcionalidade (pacote por domínio) com `Controller → Service → Repository`; nada de lógica no controller; DTOs de entrada e saída separados das entidades; `@Transactional` no service.
- **Mobile:** telas finas; chamadas de API só pelos hooks em `src/hooks`; cores, espaçamentos e fontes só pelos tokens.
- **Testes obrigatórios por fase:** service (unitário), controller (MockMvc), regras de autorização e, no mobile, validação dos formulários e componentes principais.
- **Commits:** Conventional Commits, um por fase (ou mais, se a fase for grande).
- **Na dúvida:** não invente regra de negócio. Registre a dúvida em `docs/decisoes.md`, escolha a opção mais simples e avise na revisão da fase.
- **Fora do escopo do MVP:** perfil Funcionário, login com Google, recuperação de senha, pagamentos, notificações push. Deixe pontos de extensão, mas não implemente.

---

## 10. Pontos em aberto (o Claude Code deve perguntar ou registrar em `docs/decisoes.md`)

1. **"Etapa 1 de 2" no cadastro de cliente:** o Figma só mostra a etapa 1. O tutorial do ID01 cita **CPF**, que não aparece no design. Proposta: a etapa 2 coleta CPF (opcional) e foto. Confirmar com o usuário.
2. **Endereço da empresa:** o tutorial do ID02 pede endereço, o Figma pede só cidade. Proposta: cidade obrigatória e endereço opcional, editável no perfil.
3. **Diagrama de classes (`APP_EVENTOS.pdf`):** não está no JSON; alinhar o modelo da seção 6 se o PDF for fornecido.
4. **Link do Figma:** preencher na seção 4.
