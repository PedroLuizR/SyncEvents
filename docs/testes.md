# Testes

Cada fase entrega testes de **service** (unitários), **controller/API** (integração com MockMvc e Postgres real),
**regras de autorização** e, no app, **validação de formulários e telas**. Antes de cada commit rodam (e o GitHub Actions repete a cada push, em `.github/workflows/ci.yml`):
`mvn verify` no backend e `npm test`, `npm run typecheck`, `npm run lint` e `prettier --check` no mobile.

| Onde | Testes | Ferramentas |
|---|---|---|
| Backend: unitários | 98 | JUnit 5, Mockito, AssertJ |
| Backend: integração | 63 | Spring Boot Test, MockMvc, Testcontainers (PostgreSQL 16), cliente STOMP real |
| Mobile | 151 | Jest (jest-expo), React Native Testing Library |
| E2E | 9 fluxos | Maestro (`mobile/e2e/`) |

## Backend

| Suíte | Tipo | O que garante |
|---|---|---|
| `ValidadoresTest` | unitário | Senha forte, CNPJ (14 dígitos), telefone e nome com acento |
| `GlobalExceptionHandlerTest` | unitário | Todas as falhas no formato `{status, erro, mensagem, campos}`, sem vazar detalhes internos |
| `JwtServiceTest` | unitário | Token válido, adulterado, de outra chave ou expirado |
| `AuthServiceTest` | unitário | Normalização dos dados, e-mail/CNPJ duplicado, login por CNPJ, mensagens de login errado |
| `CodigoEmpresaGeneratorTest` | unitário | Código de 6 dígitos único (com novas tentativas) |
| `ServicoServiceTest` | unitário | Regras de rascunho e publicação por modelo de preço, posse (403), limite de fotos, exclusão bloqueada |
| `FiltroBuscaTest` | unitário | Termos sem acento e sem palavras vazias, paginação |
| `StatusSolicitacaoTest` | unitário | Todas as transições válidas e inválidas da máquina de estados |
| `FundacaoIT` | integração | Health, Flyway, OpenAPI, CORS e 401 no formato padrão |
| `AuthIT` | integração | Cadastros (com foto e logo), duplicados, senha fraca, CNPJ incompleto, login, `/auth/me` |
| `ServicoIT` | integração | Criar, editar, desativar e remover; **outra empresa recebe 403**; cliente não gerencia serviços |
| `EmpresaPerfilIT` | integração | Ver e editar perfil, logo, capa e portfólio; cliente recebe 403 |
| `BuscaIT` | integração | **"decoração" traz a categoria e quem tem serviço com esse nome**, filtros, ordenação por preço, paginação, recomendados e registro de visualização |
| `DemoSeederIT` | integração | Seed idempotente e utilizável pela cliente demo |
| `SolicitacaoIT` | integração | Fluxo completo até concluir, **transições inválidas com 409**, cancelamento, 403 para quem é de fora, validações, anexos e painel |
| `AvaliacaoIT` | integração | Avaliação de evento concluído, **não avalia duas vezes nem sem ter concluído**, só o cliente do pedido, média atualizada no perfil, na busca e na ordenação por nota |
| `ChatIT` | integração | Conversa nasce com o pedido, mensagens e não lidas, proposta no chat, histórico paginado, **403 para quem é de fora**, troca **em tempo real via STOMP** entre cliente e empresa, conexão sem token recusada |

Os testes de integração usam um PostgreSQL real em container (Testcontainers). Sem Docker, defina `TEST_DB_URL`.

## Mobile

| Suíte | O que garante |
|---|---|
| `components.test.tsx` | Button, TextInput (máscara, erro, olho da senha), Chip, RatingStars, Avatar, EmptyState, TabBar |
| `masks`, `validacao`, `servico`, `solicitacao`, `chat`, `whatsapp` | Máscaras, regras iguais às do backend, preços, datas, status, upsert e ordem das mensagens |
| `schemas/*` | Mensagens de erro de cada formulário (login, cadastros, serviço, pedido) |
| `login`, `cadastroCliente`, `cadastroEmpresa` | Validação, envio, erro do servidor no campo certo, volta ao login com sucesso |
| `servicoForm`, `meusServicos`, `editarPerfilEmpresa` | Rascunho × publicação, preço convertido, fotos, exclusão com confirmação, 403 exibido |
| `inicioCliente`, `buscar`, `perfilEmpresaPublico` | Navegação com filtros, rolagem infinita, estados de carregando/vazio/erro, WhatsApp |
| `solicitarOrcamento`, `solicitacoesCliente`, `empresaSolicitacoes` | Pedido em 3 etapas, abas por status, aceitar/recusar/cancelar, painel, proposta, conclusão, erro 409 |
| `avaliacao` | Botão só para concluídos não avaliados, nota obrigatória, destaques e comentário, erro 409 exibido |
| `chat` | Histórico e card de proposta, envio por WebSocket conectado e por REST desconectado, recebimento em tempo real, aceitar no chat, lista de conversas |

## E2E (Maestro)

| Fluxo | Arquivo |
|---|---|
| Boas-vindas | `e2e/fase0-boas-vindas.yaml` |
| Cadastrar cliente → logar | `e2e/fase1-cadastro-cliente-login.yaml` |
| Empresa cria, edita, desativa e remove serviço | `e2e/fase2-servico-empresa.yaml` |
| Cliente busca e abre um perfil | `e2e/fase3-descoberta-cliente.yaml` |
| Pedido de orçamento e proposta | `e2e/fase4-orcamento.yaml` |
| Chat | `e2e/fase5-chat.yaml` |
| **Cliente completo:** cadastro → busca → orçamento → chat | `e2e/completo-cliente.yaml` |
| **Empresa completa:** cadastro → serviço → responder → proposta | `e2e/completo-empresa.yaml` |
| Cliente aceita a proposta (e depois avalia) | `e2e/completo-cliente-avaliacao.yaml` |

Os fluxos Maestro precisam do APK instalado num emulador Android (`maestro test e2e/<fluxo>.yaml`) e ainda não foram
executados (o ambiente de desenvolvimento não tem emulador). Cada fase também foi verificada de ponta a ponta na versão web do app, com o backend e o banco reais;
os prints estão em [`docs/telas/`](telas/).
