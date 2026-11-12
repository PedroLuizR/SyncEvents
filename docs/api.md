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

## Erros de validação (exemplos)

```json
{ "status": 400, "erro": "VALIDACAO", "mensagem": "Dados inválidos",
  "campos": { "email": "E-mail já cadastrado", "cnpj": "O CNPJ deve ter 14 dígitos" } }
```

O contrato completo planejado está na seção 7 de [`SYNCEVENTS_PLANO.md`](../SYNCEVENTS_PLANO.md).
