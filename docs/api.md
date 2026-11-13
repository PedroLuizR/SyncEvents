# API do SyncEvents

- Base: `http://localhost:8080/api/v1` (no emulador Android: `http://10.0.2.2:8080/api/v1`)
- Documentação interativa: `/swagger-ui.html` · OpenAPI em JSON: `/v3/api-docs`
- Autenticação: `Authorization: Bearer <jwt>` (a partir da Fase 1)

## Formato de erro

Todas as falhas respondem neste formato (`campos` só aparece em erros de validação):

```json
{ "status": 400, "erro": "VALIDACAO", "mensagem": "Dados inválidos", "campos": { "email": "E-mail já cadastrado" } }
```

| HTTP | `erro` | Quando |
|---|---|---|
| 400 | `VALIDACAO` | Bean Validation ou regra de campo (ex.: e-mail duplicado) |
| 400 | `REQUISICAO_INVALIDA` | JSON mal formado, parâmetro ausente ou com tipo errado |
| 401 | `NAO_AUTENTICADO` | Rota protegida sem token válido |
| 403 | `ACESSO_NEGADO` | Usuário sem permissão sobre o recurso |
| 404 | `NAO_ENCONTRADO` | Recurso ou rota inexistente |
| 405 | `METODO_NAO_PERMITIDO` | Método HTTP não suportado na rota |
| 409 | `CONFLITO` | Conflito de estado (ex.: transição de status inválida) |
| 413 | `ARQUIVO_GRANDE` | Upload acima de 10 MB por arquivo / 30 MB por requisição |
| 500 | `ERRO_INTERNO` | Erro inesperado (detalhes só no log) |

## Rotas públicas (sem token)

`/actuator/health`, `/swagger-ui/**`, `/v3/api-docs/**`, `/files/**`, `POST /api/v1/auth/cadastro/**`, `POST /api/v1/auth/login` e `GET /api/v1/categorias/**`. Qualquer outra rota exige autenticação.

## Fase 1: autenticação e cadastros

### `GET /categorias` (público)

```json
[{ "id": 1, "nome": "Decoração", "icone": "star" }, { "id": 2, "nome": "Buffet", "icone": "coffee" }, ...]
```
Seed: Decoração, Buffet, Fotografia, Som e luz, Planejamento, Bebidas. `icone` é o nome de um ícone Feather.

### `POST /auth/cadastro/cliente` (público, `multipart/form-data`) — ID01

| Campo | Obrigatório | Regra |
|---|---|---|
| `nome` | sim | só letras (com acento) e espaços, até 120 |
| `email` | sim | formato válido e único (sem diferenciar maiúsculas) |
| `telefone` | sim | `(00) 00000-0000` ou só dígitos (10 ou 11) |
| `cidade` | sim | texto livre, ex.: `São Paulo, SP` |
| `senha` | sim | 8+ caracteres com maiúscula, minúscula, número e especial |
| `interesses` | não | repetir o campo: `CASAMENTO`, `ANIVERSARIO`, `CORPORATIVO`, `FORMATURA`, `INFANTIL`, `OUTRO` |
| `aceiteTermos` | sim | `true` |
| `cpf` | não | texto livre, **sem validação** |
| `foto` | não | arquivo PNG, JPG ou WEBP, até 5 MB |

Resposta `201` com o `Usuario` (abaixo). Não devolve token: o app volta para o login.

### `POST /auth/cadastro/empresa` (público, `multipart/form-data`) — ID02

| Campo | Obrigatório | Regra |
|---|---|---|
| `nomeFantasia` | sim | até 120 |
| `cnpj` | sim | 14 dígitos, com ou sem máscara (dígitos verificadores **não** são conferidos); único |
| `email` | sim | formato válido e único |
| `telefone` | sim | WhatsApp da empresa |
| `cidade` | sim | se terminar em `, UF`, a UF é guardada separadamente |
| `categoriaIds` | sim | repetir o campo; ids existentes |
| `descricao` | não | até 2000 |
| `endereco` | não | texto livre, **sem verificação**, editável depois |
| `senha` | sim | mesma regra do cliente |
| `aceiteTermos` | sim | `true` |
| `logo` | não | PNG, JPG ou WEBP, até 5 MB |

Gera o `codigo` público de 6 dígitos (aleatório e único). Resposta `201` com o `Usuario`.

### `POST /auth/login` (público) — ID03

```json
{ "login": "marina@email.com", "senha": "Senha@123", "tipo": "CLIENTE" }
```
Com `tipo: "EMPRESA"`, `login` aceita e-mail **ou CNPJ** (com ou sem máscara).

```json
{ "token": "<jwt>", "usuario": { ...Usuario } }
```

| Situação | Resposta |
|---|---|
| Senha errada ou usuário inexistente | `401 CREDENCIAIS_INVALIDAS` "E-mail ou senha incorretos" (empresa: "E-mail/CNPJ ou senha incorretos") |
| Conta de outro perfil (senha certa) | `401` "Esta conta é de cliente. Entre pela aba Cliente." |

O JWT (HS256) vale 7 dias (`APP_JWT_VALIDADE`) e leva `sub` (id do usuário), `email` e `tipo`.

### `GET /auth/me` (autenticado)

Devolve o `Usuario` logado.

### `Usuario`

```json
{
  "id": 1, "email": "marina@email.com", "tipo": "CLIENTE", "perfilId": 1,
  "nome": "Marina Alves", "telefone": "11987654321", "cidade": "São Paulo, SP",
  "fotoUrl": "/files/clientes/<uuid>.png",
  "interesses": ["CASAMENTO"],          // só cliente
  "codigo": "504731",                    // só empresa
  "categorias": [{ "id": 1, "nome": "Decoração", "icone": "star" }]  // só empresa
}
```
`fotoUrl` é a foto do cliente ou a logo da empresa, servida pelo backend em `/files/**`.

## Fase 2: empresa: perfil e serviços

Todas exigem token de **empresa** (cliente recebe `403`). A posse é checada no backend:
outra empresa recebe `403 "Este serviço pertence a outra empresa"`.

### Perfil (ID04)

| Método | Rota | Corpo | Resposta |
|---|---|---|---|
| GET | `/empresas/me` | — | `EmpresaPerfil` |
| PUT | `/empresas/me` | JSON `{ nomeFantasia, telefone, cidade, endereco?, descricao?, categoriaIds[] }` | `EmpresaPerfil` |
| POST | `/empresas/me/logo` | multipart `arquivo` | `EmpresaPerfil` (a logo antiga é apagada) |
| POST | `/empresas/me/capa` | multipart `arquivo` | `EmpresaPerfil` |
| POST | `/empresas/me/portfolio` | multipart `arquivo` (máx. 12 fotos) | `EmpresaPerfil` |
| DELETE | `/empresas/me/portfolio/{fotoId}` | — | `EmpresaPerfil` (`404` se a foto não é sua) |

E-mail e CNPJ **não** são editáveis.

```json
{
  "id": 1, "codigo": "504731", "nomeFantasia": "Ateliê Aurora", "cnpj": "42591003000118",
  "email": "contato@aurora.com", "telefone": "1134567890", "cidade": "São Paulo, SP", "uf": "SP",
  "endereco": "Rua das Flores, 100", "descricao": "...", "logoUrl": "/files/logos/x.png",
  "capaUrl": "/files/capas/y.png", "categorias": [{ "id": 1, "nome": "Decoração", "icone": "star" }],
  "portfolio": [{ "id": 9, "url": "/files/portfolio/z.png", "ordem": 0 }]
}
```

### Serviços (ID05)

| Método | Rota | Quem | Descrição |
|---|---|---|---|
| GET | `/servicos/me` | empresa | todos os seus (inclui inativos e rascunhos) |
| POST | `/servicos/me` | empresa | cria → `201` |
| GET | `/servicos/{id}` | autenticado | a dona vê qualquer um; os demais só ativos e publicados (senão `404`) |
| PUT | `/servicos/{id}` | dona | edita |
| DELETE | `/servicos/{id}` | dona | remove → `204` (apaga também as fotos) |
| POST | `/servicos/{id}/fotos` | dona | multipart `arquivo` (máx. 6) |
| DELETE | `/servicos/{id}/fotos/{fotoId}` | dona | remove a foto |
| GET | `/empresas/{id}/servicos` | autenticado | serviços **ativos e publicados** da empresa |

Corpo de criação/edição:

```json
{
  "nome": "Decoração completa", "categoriaId": 1, "descricao": "Projeto personalizado...",
  "modeloPreco": "A_PARTIR_DE", "precoMin": 2800, "precoMax": null,
  "ativo": true, "rascunho": false, "itensInclusos": ["Projeto e moodboard", "Montagem"]
}
```

| Regra | Mensagem |
|---|---|
| Sempre: nome e categoria | "Informe o nome do serviço", "Escolha a categoria" |
| Para publicar (`rascunho: false`): descrição | "Descreva o serviço" |
| Para publicar: modelo de preço | "Escolha o modelo de preço" |
| `FIXO` / `A_PARTIR_DE` / `FAIXA`: valor mínimo > 0 | "Informe o valor" |
| `FAIXA`: valor máximo > 0 e ≥ mínimo | "Informe o valor máximo" / "O valor máximo deve ser maior ou igual ao mínimo" |

Normalização: `SOB_CONSULTA` descarta os preços; `precoMax` só é guardado em `FAIXA`; itens vazios são ignorados.
Um serviço aparece para clientes apenas se `ativo = true` e `rascunho = false`.

## Fase 3: cliente: descoberta

### `GET /empresas` (cliente) — ID06

| Parâmetro | Descrição |
|---|---|
| `q` | texto livre. Ignora acentos e maiúsculas. Cada palavra (exceto "de", "para", "e"...) precisa aparecer no **nome da empresa**, numa **categoria**, no **nome de um serviço publicado** ou nas descrições |
| `categoriaId` | só empresas com essa categoria |
| `cidade` | prefixo da cidade, sem acento (ex.: `sao paulo` ou `São Paulo, SP`) |
| `ordenar` | `relevancia` (padrão), `nota` ou `preco` (menor "a partir de" primeiro; sem preço por último) |
| `page`, `size` | página a partir de 0; tamanho padrão 20, máximo 50 |

Relevância: nome (4) > categoria (3) > nome de serviço (2) > descrições (1), somada por palavra.
Serviços inativos e rascunhos não contam.

```json
{
  "conteudo": [{
    "id": 1, "nomeFantasia": "Ateliê Aurora Eventos", "logoUrl": "/files/logos/a.jpg",
    "capaUrl": "/files/capas/b.jpg", "cidade": "São Paulo, SP",
    "categorias": [{ "id": 1, "nome": "Decoração", "icone": "star" }],
    "nota": null, "totalAvaliacoes": 0, "precoAPartirDe": 2800.00
  }],
  "pagina": 0, "tamanho": 20, "total": 7, "totalPaginas": 1, "ultima": true
}
```

### `GET /empresas/recomendadas` (cliente)

Até 10 empresas com ao menos um serviço publicado. As da **cidade do cliente** vêm primeiro, depois as com mais serviços.

### `GET /empresas/{id}` (autenticado) — ID07

Perfil público: dados, categorias, portfólio, serviços publicados, nota e indicadores.
Quando quem abre é um **cliente**, grava uma linha em `visualizacao_perfil` (usado no painel da empresa, Fase 4).
Não expõe CNPJ nem e-mail.

```json
{
  "id": 1, "codigo": "504731", "nomeFantasia": "Ateliê Aurora Eventos", "descricao": "...",
  "cidade": "São Paulo, SP", "uf": "SP", "endereco": "Rua Harmonia, 520", "telefoneWhatsapp": "11987654321",
  "logoUrl": "...", "capaUrl": "...", "categorias": [...], "portfolio": [...], "servicos": [...],
  "nota": null, "totalAvaliacoes": 0,
  "indicadores": { "eventosRealizados": 0, "servicos": 2, "fotos": 4, "naPlataformaDesde": 2026 }
}
```

### Dados de demonstração (perfil `dev`)

Ao subir no perfil `dev`, o backend cria (uma única vez) 10 empresas com logo, capa, portfólio e serviços, e a cliente
**marina@demo.syncevents.com**. Todas as contas usam a senha **Senha@123**; os e-mails das empresas terminam em
`@...demo.syncevents.com` (ex.: `contato@aurora.demo.syncevents.com`). Para desligar: `APP_SEED_DEMO=false`.

## Fase 4: orçamentos e gestão

### Máquina de estados

```
PENDENTE ──► EM_ANALISE ──► EM_NEGOCIACAO (proposta enviada) ──► ACEITA ──► CONCLUIDA
    └────────────┴───────────────┴──► RECUSADA   (empresa)
    └────────────┴───────────────┴──► CANCELADA  (cliente, antes de ACEITA)
```

| Ação | Quem | Rota | Permitido a partir de | Resultado |
|---|---|---|---|---|
| Criar | cliente | `POST /solicitacoes` | — | `PENDENTE` + conversa criada |
| Em análise | empresa | `PATCH /solicitacoes/{id}/status` `{status: EM_ANALISE}` | PENDENTE | `EM_ANALISE` |
| Proposta | empresa | `POST /solicitacoes/{id}/propostas` `{valor, descricao}` | PENDENTE, EM_ANALISE, EM_NEGOCIACAO (sem outra em aberto) | `EM_NEGOCIACAO` |
| Aceitar proposta | cliente | `PATCH /propostas/{id}` `{status: ACEITA}` | EM_NEGOCIACAO | `ACEITA` |
| Recusar proposta | cliente | `PATCH /propostas/{id}` `{status: RECUSADA}` | EM_NEGOCIACAO | continua `EM_NEGOCIACAO` (a empresa pode propor de novo) |
| Recusar pedido | empresa | `PATCH /solicitacoes/{id}/status` `{status: RECUSADA}` | PENDENTE, EM_ANALISE, EM_NEGOCIACAO | `RECUSADA` |
| Concluir | empresa | `PATCH /solicitacoes/{id}/status` `{status: CONCLUIDA}` | ACEITA | `CONCLUIDA` |
| Cancelar | cliente | `PATCH /solicitacoes/{id}/cancelar` | PENDENTE, EM_ANALISE, EM_NEGOCIACAO | `CANCELADA` |

Qualquer outra transição responde **409** (`erro: "CONFLITO"`), por exemplo "Não é possível mudar de pendente para concluída".
Quem não participa da solicitação recebe **403**.

### `POST /solicitacoes` (cliente) — ID08

```json
{
  "empresaId": 7, "tipoEvento": "CASAMENTO", "dataEvento": "2027-10-16", "qtdConvidados": 120,
  "local": "Espaço Jardim das Oliveiras, Cotia", "servicoIds": [12, 13],
  "orcamentoMin": 10000, "orcamentoMax": 20000, "mensagem": "...", "aceiteContato": true
}
```

Regras: data de hoje em diante, convidados ≥ 1, serviços **publicados da própria empresa**, máximo ≥ mínimo, `aceiteContato` obrigatório.
Inspirações: `POST /solicitacoes/{id}/anexos` (multipart `arquivo`, até 5).

### `GET /solicitacoes/me?status=PENDENTE,EM_ANALISE`

Cliente: as suas (mais recentes primeiro). Empresa: as recebidas. Na lista, `propostaAtual` traz a última proposta.

### `GET /solicitacoes/{id}`

Detalhe com `cliente` (nome, cidade, telefone, e-mail), `empresa`, `servicos`, `anexos`, `propostas` e `conversaId`.

### `GET /empresas/me/dashboard` (empresa)

```json
{ "dias": 30, "visualizacoes": 1248, "variacaoVisualizacoes": 18, "solicitacoes": 24,
  "variacaoSolicitacoes": 12, "taxaResposta": 92, "pendentes": 2, "servicosAtivos": 6, "servicosRascunho": 1 }
```

- **Visualizações**: aberturas do perfil por clientes nos últimos 30 dias; variação em relação aos 30 dias anteriores (`null` se o período anterior foi zero).
- **Solicitações**: recebidas nos últimos 30 dias, com a mesma comparação.
- **Taxa de resposta**: % das solicitações do período que saíram de `PENDENTE`, sem contar as canceladas pelo cliente (`null` sem solicitações).

O perfil público passa a mostrar `indicadores.eventosRealizados` (solicitações concluídas).
Um serviço que aparece em alguma solicitação não pode mais ser excluído (**409**); use "desativar".

## Fase 5: chat

Cada solicitação tem **uma conversa** (criada junto com o pedido). Só o cliente e a empresa envolvidos acessam: os outros recebem **403**.

### REST

| Método | Rota | Descrição |
|---|---|---|
| GET | `/conversas` | conversas do usuário (mais recente primeiro) com `contato`, contexto do orçamento, `ultimaMensagem` e `naoLidas` |
| GET | `/conversas/{id}` | uma conversa (cabeçalho do chat) |
| GET | `/conversas/{id}/mensagens?antesDe=&size=` | histórico paginado: 30 por vez (máx. 100), em ordem cronológica; `antesDe` = id da mensagem mais antiga que o app já tem; `temMais` indica se há mais antigas |
| POST | `/conversas/{id}/mensagens` | envia `{ "conteudo": "..." }` (fallback quando o WebSocket não está conectado) |
| PATCH | `/conversas/{id}/lidas` | marca como lidas as mensagens recebidas → `{ "marcadas": 3 }` |

```json
{
  "id": 42, "conversaId": 11, "remetenteUsuarioId": 7, "tipo": "PROPOSTA",
  "conteudo": "Pacote completo", "proposta": { "id": 90, "valor": 10500, "descricao": "...", "status": "ENVIADA" },
  "lida": false, "enviadaEm": "2026-11-12T20:41:00Z"
}
```

### WebSocket (STOMP)

- Endpoint: **`/ws`** (WebSocket puro, sem SockJS). No emulador: `ws://10.0.2.2:8080/ws`.
- `CONNECT` com o cabeçalho STOMP `Authorization: Bearer <jwt>`. Sem token válido, a conexão é recusada.
- Assinar **`/topic/conversas/{id}`** e enviar para **`/app/conversas/{id}`** com `{ "conteudo": "..." }`.
  Assinar ou enviar para uma conversa da qual não participa encerra a sessão.
- Tudo o que acontece na conversa é publicado no tópico como `Mensagem`: textos enviados por STOMP **ou** REST,
  propostas enviadas e propostas aceitas/recusadas (a mesma mensagem chega de novo com o status novo; o app substitui pelo `id`).
- Heartbeat de 10 s. O app reconecta sozinho a cada 5 s e, enquanto estiver desconectado, recarrega o histórico a cada 5 s (polling).

## Fase 6: avaliações

### `POST /avaliacoes` (cliente) — ID11

```json
{ "solicitacaoId": 42, "nota": 5, "comentario": "Equipe impecável!", "destaques": ["ATENDIMENTO", "QUALIDADE"] }
```

| Regra | Resposta |
|---|---|
| Só o cliente da solicitação | outros: **403** |
| Só solicitações `CONCLUIDA` | **409** "Só é possível avaliar depois que o evento for concluído" |
| Uma avaliação por solicitação | **409** "Você já avaliou este evento" |
| Nota de 1 a 5 | **400** "Escolha uma nota de 1 a 5" |

Destaques: `PONTUALIDADE`, `QUALIDADE`, `ATENDIMENTO`, `CUSTO_BENEFICIO` (opcionais). Comentário opcional (até 1000).

### `GET /empresas/{id}/avaliacoes?page=&size=`

```json
{
  "resumo": { "media": 4.7, "total": 12, "recomendam": 92 },
  "avaliacoes": { "conteudo": [{ "id": 1, "nota": 5, "comentario": "...", "destaques": ["ATENDIMENTO"],
    "tipoEvento": "CASAMENTO", "autor": { "nome": "Ana S." }, "criadoEm": "..." }], "pagina": 0, "total": 12, ... }
}
```

- `media` com 1 casa decimal (o app mostra "4,7"); `recomendam` = % de notas 4 e 5. Sem avaliações: `media` e `recomendam` nulos.
- O autor aparece como primeiro nome + inicial do sobrenome.
- A média e o total também vêm em `GET /empresas` (cards), `GET /empresas/recomendadas` (agora ordenadas por nota depois da cidade)
  e `GET /empresas/{id}` (`nota`, `totalAvaliacoes`, `indicadores.recomendam`). `ordenar=nota` passa a ordenar pela média.
- Solicitações passam a trazer `avaliada: true|false`.

## Erros de validação (exemplos)

```json
{ "status": 400, "erro": "VALIDACAO", "mensagem": "Dados inválidos",
  "campos": { "email": "E-mail já cadastrado", "cnpj": "O CNPJ deve ter 14 dígitos" } }
```

O contrato completo planejado está na seção 7 de [`SYNCEVENTS_PLANO.md`](../SYNCEVENTS_PLANO.md).
