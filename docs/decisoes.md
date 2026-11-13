# Registro de decisões

Todas as escolhas feitas durante o desenvolvimento, principalmente onde o plano estava em aberto ou onde a implementação difere do Figma. Numeradas em ordem; itens atualizados em fases seguintes dizem isso no próprio texto.

## Fase 0

| # | Decisão | Motivo |
|---|---|---|
| 1 | O design vem de `docs/design/00-visao-geral.png`: uma imagem única com as 12 telas, já que não há link do Figma. | O usuário só tem a imagem. Detalhes finos (medidas exatas, hex exato) foram estimados a partir dela. Exportar cada frame em PNG para `docs/design/` melhora a fidelidade nas fases seguintes. |
| 2 | Tokens: primária `#5A1F3C`, fundo `#F8F2EC`, cards brancos com borda `#E8DDD4`, estrelas `#D9A035`. | Cores aproximadas a partir da imagem. Ajustar em `mobile/src/theme/tokens.ts` quando houver os valores exatos do Figma. |
| 3 | Fontes: **Playfair Display** (títulos, serifada) e **Inter** (corpo), via `@expo-google-fonts`. | O Figma usa uma serifada nos títulos e uma sans-serif no corpo; os nomes exatos não aparecem na imagem. Basta trocar em `theme/fonts.ts` e `theme/tokens.ts`. |
| 4 | Rotas do Expo Router em `mobile/src/app/` (e não `mobile/app/`, como diz o plano). | É a convenção do template do Expo SDK 58. A organização interna (`(auth)`, `(cliente)`, `(empresa)`, `chat/`) continua a mesma do plano. |
| 5 | Spring Boot **3.5.16** (último 3.x), e não a 4.x. | O plano pede Spring Boot 3.x. |
| 6 | Na Fase 0, `/` mostra o catálogo de componentes. | É o critério de aceite da Fase 0. Na Fase 1 vira a tela de boas-vindas. |
| 7 | A migration `V1__extensoes.sql` só habilita `unaccent`. As tabelas começam na Fase 1 (V2 em diante). | Fazer o Flyway rodar desde a Fase 0 sem antecipar o modelo; `unaccent` vai ser usado na busca da Fase 3. |
| 8 | Testes de integração com Testcontainers; se a variável `TEST_DB_URL` existir, usam esse banco. | Permite rodar em CI ou máquinas sem Docker. |
| 9 | Na web, a sessão fica só em memória (o SecureStore não existe lá). | A web serve só para visualizar a interface; o alvo é Android. |
| 10 | O componente `TabBar` só desenha a barra; é ligado ao navegador de abas a partir da Fase 1/2. | Mantém o componente testável e independente de rotas. |

## Fase 1

| # | Decisão | Motivo |
|---|---|---|
| 11 | **Cadastro de cliente em 2 etapas:** etapa 1 igual ao Figma; etapa 2 com **CPF (opcional, sem validação)** e **foto (opcional)**. | Resposta do usuário: projeto simples, para apresentação. |
| 12 | **Cadastro de empresa em 2 etapas:** etapa 1 igual ao Figma; etapa 2 com senha, confirmação de senha, **endereço (opcional, sem verificação)** e aceite dos termos. | O Figma não tem campo de senha para a empresa; o endereço segue a resposta do usuário e pode ser editado depois no perfil (Fase 2). |
| 13 | O CNPJ **não confere os dígitos verificadores**; só exige 14 dígitos (com ou sem máscara) e continua único. | Pedido do usuário (projeto para apresentação). Os 14 dígitos são mantidos porque a máscara, o banco e o login por CNPJ dependem desse formato. |
| 14 | Os cadastros usam `multipart/form-data` com campos simples (não JSON). | Envia a foto/logo na mesma requisição e funciona bem com o `FormData` do React Native. |
| 15 | O cadastro não devolve token: o app volta ao login com "Cadastro realizado!" e o e-mail preenchido. | Pedido do plano. |
| 16 | Login na aba errada (senha certa) responde "Esta conta é de cliente. Entre pela aba Cliente.". Senha errada e usuário inexistente têm a **mesma** mensagem. | Mensagem clara sem revelar quais e-mails existem. |
| 17 | Cidade é texto livre (ex.: "São Paulo, SP"). No Figma ela tem uma seta de lista, mas não há lista de cidades definida. A UF é extraída quando vem depois da vírgula. | A opção mais simples; dá para trocar por um seletor depois. |
| 18 | As áreas logadas ficam em `src/app/cliente/` e `src/app/empresa/` (pastas comuns, não grupos com parênteses). | Com grupos, `(cliente)/(tabs)/index` e `(empresa)/(tabs)/index` teriam a mesma URL `/` (e o mesmo valia para `/perfil` e `/solicitacoes`), o que o Expo Router não permite. |
| 19 | O acesso às áreas é controlado com `Stack.Protected` no layout raiz: sem login mostra boas-vindas/login/cadastros; com login, só a área do perfil do usuário. | Redireciona sozinho após login e logout. |
| 20 | A foto da tela de boas-vindas foi substituída por um fundo bordô com "luzes" desfocadas. | Não temos a foto original. Basta exportar a imagem do Figma e trocar em `HeroBoasVindas.tsx`. |
| 21 | Uploads gravados em `backend/uploads/` e servidos em `/files/**`, atrás da interface `StorageService` (adiantado da Fase 2). | O logo e a foto já são enviados no cadastro. |
| 22 | O catálogo de componentes saiu da rota `/` e foi para `/catalogo`. | `/` agora é a tela de boas-vindas. |

## Fase 2

| # | Decisão | Motivo |
|---|---|---|
| 23 | **Rascunho** exige só nome e categoria; **publicar** exige também descrição e preço conforme o modelo. Sem modelo escolhido, o rascunho fica como "Sob consulta". | O Figma tem "Salvar rascunho" e "Atualizar serviço"; o rascunho serve para salvar um serviço incompleto. |
| 24 | Um serviço só aparece para clientes se estiver **ativo e publicado**. A dona vê todos. | Combina a chave "ativo" do Figma com o rascunho. |
| 25 | Modelos de preço: "A partir de" (padrão, como no Figma), "Preço fixo", "Faixa de preço" (mín. e máx.) e "Sob consulta". | Seção 6 do plano. |
| 26 | Limites: 6 fotos por serviço (o Figma mostra "x de 6") e 12 no portfólio. | Evitar uploads sem fim; 12 é suficiente para um portfólio. |
| 27 | No formulário de serviço, as fotos novas e removidas ficam pendentes e só são enviadas ao salvar (depois de criar o serviço, porque o upload precisa do id). No **perfil**, logo, capa e portfólio são enviados **na hora**. | No serviço, permite cancelar a edição; no perfil, cada foto é uma ação independente. |
| 28 | E-mail e CNPJ não podem ser editados no perfil. | São as credenciais de login da empresa. |
| 29 | Excluir serviço apaga de vez (com as fotos) após uma confirmação. **Atualizado na Fase 4:** se o serviço aparece em alguma solicitação, a exclusão é bloqueada (409) e a empresa deve desativá-lo. | Preserva o histórico dos pedidos. |
| 30 | A tela de criar/editar serviço abre por cima das abas (sem a barra de abas), enquanto no Figma a barra aparece. | Os botões fixos "Salvar rascunho" / "Atualizar serviço" ficam mais visíveis e não competem com a barra. |
| 31 | O código da empresa aparece no perfil com o texto "Compartilhe com sua equipe". | Pensando no futuro perfil Funcionário (fora do escopo). |
| 32 | Na web, os uploads convertem a imagem em `Blob` antes de enviar (no Android o `FormData` aceita `{ uri, name, type }`). | Permite demonstrar o app pelo navegador. |

## Fase 3

| # | Decisão | Motivo |
|---|---|---|
| 33 | **Notas e avaliações ficam para a Fase 6** (feito: ver decisões 61 a 65). Até lá os cards e o perfil mostram o selo "Novo", e "Melhor avaliadas" ordena por relevância. O seed também não traz avaliações. | A tabela `avaliacao` depende de `solicitacao` (Fase 4): só quem concluiu um evento pode avaliar. Criar avaliações falsas agora quebraria essa regra. |
| 34 | Indicadores do perfil: **serviços publicados**, **fotos no portfólio** e **ano de entrada**, no lugar de "eventos realizados", "tempo de resposta" e "% recomendam" do Figma. | Esses três dependem de solicitações, chat e avaliações (Fases 4 a 6). O campo `eventosRealizados` já existe na API e passa a ser preenchido na Fase 4. |
| 35 | Busca com várias palavras: **todas** precisam aparecer (no nome, na categoria, num serviço ou nas descrições); palavras como "de", "para" e "e" são ignoradas. | "Decoração para casamento" deve trazer quem faz decoração **de** casamento, não qualquer decoração. |
| 36 | A busca usa SQL com `unaccent` em vez de JPA/Criteria. | Relevância ponderada, filtros opcionais e agregações (menor preço) ficam mais simples e rápidas em SQL. |
| 37 | Não implementados por estarem fora do escopo ou sem dados: **distância** ("4,2 km"), **favoritos** (coração), **mapa** e o **sino de notificações**. O filtro de faixa de preço do Figma ("até R$ 5.000") também não, porque o plano define só categoria, cidade e ordenação. | Exigiriam geolocalização, uma tabela nova ou push (fora do MVP). |
| 38 | Os filtros da busca ficam nos **parâmetros da rota** (`/cliente/buscar?q=&categoriaId=&cidade=&ordenar=`). | O Início abre a busca já filtrada (categoria, texto, banner) e o "voltar" preserva o estado. |
| 39 | Busca e recomendados são só para **clientes** (403 para empresa); o perfil público pode ser aberto por qualquer usuário logado, mas só a visita de cliente conta como visualização. | Seção 7 do plano. |
| 40 | Seed de demonstração em Java (`DemoSeeder`), com imagens geradas por código (gradiente com "luzes"), no lugar de fotos reais. | Evita fotos com direitos autorais e roda sem depender de internet. |
| 41 | "Solicitar orçamento" no perfil ainda mostra "Em breve". | O fluxo de orçamento é a Fase 4. |

## Fase 4

| # | Decisão | Motivo |
|---|---|---|
| 42 | Novo status **CANCELADA**, para quando o cliente desiste antes de aceitar. | O plano diz que o cliente pode cancelar antes de ACEITA, mas o diagrama não tinha um estado para isso. |
| 43 | **Recusar a proposta** não encerra o pedido: a proposta fica RECUSADA e a solicitação continua EM_NEGOCIACAO, para a empresa mandar outra. Só uma proposta pode estar aguardando resposta por vez (índice único no banco). | Recusar costuma significar "quero outro valor"; para desistir de vez existe o cancelamento. |
| 44 | A empresa **não** passa para EM_NEGOCIACAO pelo PATCH de status: isso só acontece ao enviar uma proposta. | EM_NEGOCIACAO significa "proposta enviada" no plano. |
| 45 | A **mensagem do tipo PROPOSTA no chat** fica para a Fase 5 (a tabela `mensagem` nasce lá). A conversa já é criada junto com a solicitação. **Feito na Fase 5**, inclusive para propostas antigas (migration V6). | Segue a ordem das fases do plano. |
| 46 | Taxa de resposta = % das solicitações dos últimos 30 dias que saíram de PENDENTE, **sem contar as canceladas** pelo cliente. O período é fixo em 30 dias (o seletor "Últimos 30 dias" do Figma é só um rótulo). | Uma solicitação cancelada antes de a empresa abrir não deveria baixar a taxa. Seletor de período não está no plano. |
| 47 | Faixas de orçamento fixas (até 5 mil, 5–10, 10–20, 20–50, acima de 50 mil, "Prefiro não informar"), gravadas como mínimo e máximo. | O Figma mostra um seletor de faixa; guardar números permite filtros futuros. |
| 48 | O pedido tem 3 etapas: **dados → revisão → confirmação**, como a barra de 3 partes do Figma. Inspirações são enviadas depois de criar a solicitação (precisam do id). | Critério de aceite da fase. |
| 49 | "Responder", no painel e na lista da empresa, abre o detalhe já com o formulário de proposta. Contato direto pelo WhatsApp disponível nos dois lados. | O chat em tempo real é a Fase 5. |
| 50 | Listas, detalhe e painel sempre recarregam ao abrir a tela (`staleTime: 0`). | O status muda pelo outro lado; sem chat/push ainda, é o jeito simples de "o cliente ver a atualização". |
| 51 | Na web, o campo de data é texto com máscara dd/mm/aaaa (o seletor nativo não existe na web). | A web serve para demonstração. |

## Fase 5

| # | Decisão | Motivo |
|---|---|---|
| 52 | STOMP sobre **WebSocket puro** em `/ws` (sem SockJS), com o broker simples do Spring em memória. | O React Native tem WebSocket nativo; o broker em memória basta para uma instância (para escalar, troca-se por RabbitMQ sem mudar o app). |
| 53 | Autenticação no **CONNECT** do STOMP (JWT no cabeçalho), e checagem de participação em cada SUBSCRIBE e SEND. O HTTP de `/ws` é público. | Navegadores e o RN não mandam cabeçalhos customizados no handshake HTTP do WebSocket. |
| 54 | As mensagens só são publicadas no tópico **depois do commit** da transação. | Evita o app receber uma mensagem que depois sofreu rollback. |
| 55 | Proposta aceita/recusada **republica a mesma mensagem** com o status novo; o app faz "upsert" pelo id. Não existe um tipo "SISTEMA". | O plano define só TEXTO e PROPOSTA; assim o card muda de status nos dois lados em tempo real. |
| 56 | O cliente pode **aceitar/recusar a proposta direto no card do chat** (com confirmação). "Ver proposta" abre o detalhe da solicitação. | Pedido do plano para a tela 9. |
| 57 | Histórico paginado por **cursor** (`antesDe` = id), 30 mensagens por vez. Lista invertida que carrega as mais antigas ao rolar para cima. | Cursor não "pula" mensagens quando chegam novas durante a rolagem. |
| 58 | A conversa é marcada como lida ao abrir e a cada mensagem recebida. A confirmação de leitura (✓ verde) do remetente atualiza quando ele reabre a conversa (não é empurrada em tempo real). | Mantém o protocolo simples; o estado no servidor está sempre correto. |
| 59 | A lista de conversas não tem aba própria: abre pelo **ícone de conversas** (com contador de não lidas) no Início do cliente e no Painel da empresa, e pelo botão "Conversar"/"Abrir conversa" nos detalhes da solicitação. | O Figma tem 4 abas por perfil e nenhuma é de conversas. |
| 60 | Não implementados: anexos no chat (botão "+"), mensagem de voz (microfone), indicador "digitando…" e status "online". | Fora do escopo do plano. |

## Fase 6

| # | Decisão | Motivo |
|---|---|---|
| 61 | O autor da avaliação aparece como "Ana S." (primeiro nome + inicial do sobrenome). | Privacidade do cliente; o Figma mostra um nome curto. |
| 62 | "% recomendam" = porcentagem de notas 4 e 5. O perfil passa a mostrar **eventos realizados**, **% recomendam** e **serviços**, como no Figma (sem avaliações, mostra fotos no portfólio no lugar do %). | Indicadores reais disponíveis a partir desta fase. |
| 63 | "Tempo de resposta" do Figma não foi implementado. | Exigiria medir a primeira resposta no chat; fora das regras do plano. |
| 64 | O seed cria clientes extras (Ana, Bruno, Carla, Diego) com **pedidos concluídos e proposta aceita** antes de criar as avaliações de demonstração. | Mantém a regra "só quem concluiu pode avaliar" também nos dados de exemplo. |
| 65 | A avaliação não pode ser editada nem apagada pelo cliente. | O plano define uma avaliação por solicitação; edição não está no escopo. |

## Fase 7

| # | Decisão | Motivo |
|---|---|---|
| 66 | **Tela "Servidor"** (link na tela de boas-vindas) para trocar o endereço do backend no próprio app, com teste de conexão. | O mesmo APK precisa funcionar no emulador (10.0.2.2) e num celular na rede local (IP do computador). |
| 67 | O APK permite tráfego HTTP sem TLS (`usesCleartextTraffic`, via `expo-build-properties`). | O backend local roda em `http://`. Em produção, usar HTTPS e desligar isso. |
| 68 | O APK de release é **assinado com a chave de depuração** e gerado no **GitHub Actions** (não localmente). | Suficiente para testes. O ambiente de desenvolvimento não tem acesso ao Android SDK; os runners do GitHub já o trazem. |
| 69 | Ícone, ícone adaptativo e splash gerados com a identidade do app ("S" em Playfair sobre o bordô), no lugar dos ícones padrão do Expo. | O Figma não traz um ícone de app. |
| 70 | `backend/Dockerfile` e o serviço `backend` no `docker-compose.yml`: `docker compose up -d --build` sobe tudo com os dados de demonstração. | Quem testa o APK não precisa instalar Java nem Maven. |
| 71 | Revisão de acessibilidade: todo elemento tocável tem papel (`accessibilityRole`) e rótulo; áreas de toque de pelo menos 48dp (com `hitSlop` nos chips e botões compactos); mensagens de erro anunciadas (`accessibilityLiveRegion`). | Item da Fase 7 do plano. |
| 72 | APK com as arquiteturas `armeabi-v7a`, `arm64-v8a` e `x86_64` (sem `x86` de 32 bits). | Cobre celulares e emuladores atuais com um arquivo menor. |

## Diferenças em relação ao Figma (revisão tela a tela)

| Tela | Diferença | Motivo / decisão |
|---|---|---|
| 1 · Boas-vindas | Foto de casamento trocada por fundo bordô com "luzes"; link "Servidor" no rodapé | Sem a imagem original (20); testes do APK (66) |
| 2 · Login | Igual ao Figma; Google e "Esqueci minha senha" mostram "Em breve" | Fora do MVP |
| 3 · Cadastro de cliente | Cidade em texto livre (sem lista); etapa 2 com CPF e foto opcionais | 11, 17 |
| 4 · Cadastro de empresa | Etapa 2 com senha, endereço opcional e termos; CNPJ só com 14 dígitos | 12, 13 |
| 5 · Início | Sem sino de notificações; ícone de conversas no lugar | 37, 59 |
| 6 · Resultados | Sem distância, favoritos, mapa e filtro de faixa de preço | 37 |
| 7 · Perfil da empresa | Sem "tempo de resposta" e sem favoritar; demais indicadores reais | 62, 63 |
| 8 · Solicitação de orçamento | Igual ao Figma, com etapa de revisão e confirmação | 48 |
| 9 · Chat | Sem anexos, áudio, "digitando…" e "online"; mostra o estado da conexão | 60 |
| 10 · Avaliação | Igual ao Figma (abas, resumo e bottom sheet) | 61 |
| 11 · Painel | Período fixo de 30 dias (seletor só visual); "novos pedidos" = solicitações recebidas | 46 |
| 12 · Cadastro de serviço | Abre sem a barra de abas | 30 |
| Geral | Cores e fontes aproximadas a partir da imagem (Playfair Display + Inter) | 2, 3 |

## Pontos em aberto (aguardando o usuário)

1. ~~Cadastro de cliente, etapa 2~~ → decidido (decisão 11).
2. ~~Endereço da empresa~~ → decidido (decisão 12).
3. **Diagrama de classes (`APP_EVENTOS.pdf`):** não fornecido; o modelo segue a seção 6 do plano.
4. **Link do Figma:** não existe; usando a imagem (decisão 1).
