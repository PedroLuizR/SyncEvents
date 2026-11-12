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

## Endpoints por fase

| Fase | Endpoints |
|---|---|
| 0 | `GET /actuator/health` |
| 1 | _a implementar:_ `auth/cadastro/cliente`, `auth/cadastro/empresa`, `auth/login`, `auth/me`, `categorias` |

O contrato completo planejado está na seção 7 de [`SYNCEVENTS_PLANO.md`](../SYNCEVENTS_PLANO.md).
