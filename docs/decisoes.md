# Registro de decisões

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
| 29 | Excluir serviço apaga de vez (com as fotos) após uma confirmação. Quando houver solicitações (Fase 4), a regra será revista para não quebrar o histórico. | Hoje nada referencia o serviço. |
| 30 | A tela de criar/editar serviço abre por cima das abas (sem a barra de abas), enquanto no Figma a barra aparece. | Os botões fixos "Salvar rascunho" / "Atualizar serviço" ficam mais visíveis e não competem com a barra. |
| 31 | O código da empresa aparece no perfil com o texto "Compartilhe com sua equipe". | Pensando no futuro perfil Funcionário (fora do escopo). |
| 32 | Na web, os uploads convertem a imagem em `Blob` antes de enviar (no Android o `FormData` aceita `{ uri, name, type }`). | Permite demonstrar o app pelo navegador. |

## Fase 3

| # | Decisão | Motivo |
|---|---|---|
| 33 | **Notas e avaliações ficam para a Fase 6.** Até lá os cards e o perfil mostram o selo "Novo", e "Melhor avaliadas" ordena por relevância. O seed também não traz avaliações. | A tabela `avaliacao` depende de `solicitacao` (Fase 4): só quem concluiu um evento pode avaliar. Criar avaliações falsas agora quebraria essa regra. |
| 34 | Indicadores do perfil: **serviços publicados**, **fotos no portfólio** e **ano de entrada**, no lugar de "eventos realizados", "tempo de resposta" e "% recomendam" do Figma. | Esses três dependem de solicitações, chat e avaliações (Fases 4 a 6). O campo `eventosRealizados` já existe na API e passa a ser preenchido na Fase 4. |
| 35 | Busca com várias palavras: **todas** precisam aparecer (no nome, na categoria, num serviço ou nas descrições); palavras como "de", "para" e "e" são ignoradas. | "Decoração para casamento" deve trazer quem faz decoração **de** casamento, não qualquer decoração. |
| 36 | A busca usa SQL com `unaccent` em vez de JPA/Criteria. | Relevância ponderada, filtros opcionais e agregações (menor preço) ficam mais simples e rápidas em SQL. |
| 37 | Não implementados por estarem fora do escopo ou sem dados: **distância** ("4,2 km"), **favoritos** (coração), **mapa** e o **sino de notificações**. O filtro de faixa de preço do Figma ("até R$ 5.000") também não, porque o plano define só categoria, cidade e ordenação. | Exigiriam geolocalização, uma tabela nova ou push (fora do MVP). |
| 38 | Os filtros da busca ficam nos **parâmetros da rota** (`/cliente/buscar?q=&categoriaId=&cidade=&ordenar=`). | O Início abre a busca já filtrada (categoria, texto, banner) e o "voltar" preserva o estado. |
| 39 | Busca e recomendados são só para **clientes** (403 para empresa); o perfil público pode ser aberto por qualquer usuário logado, mas só a visita de cliente conta como visualização. | Seção 7 do plano. |
| 40 | Seed de demonstração em Java (`DemoSeeder`), com imagens geradas por código (gradiente com "luzes"), no lugar de fotos reais. | Evita fotos com direitos autorais e roda sem depender de internet. |
| 41 | "Solicitar orçamento" no perfil ainda mostra "Em breve". | O fluxo de orçamento é a Fase 4. |

## Pontos em aberto (aguardando o usuário)

1. ~~Cadastro de cliente, etapa 2~~ → decidido (decisão 11).
2. ~~Endereço da empresa~~ → decidido (decisão 12).
3. **Diagrama de classes (`APP_EVENTOS.pdf`):** não fornecido; o modelo segue a seção 6 do plano.
4. **Link do Figma:** não existe; usando a imagem (decisão 1).
