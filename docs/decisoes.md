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

## Pontos em aberto (aguardando o usuário)

1. **Cadastro de cliente, "Etapa 1 de 2":** proposta: a etapa 2 coleta CPF (opcional) e foto.
2. **Endereço da empresa:** proposta: cidade obrigatória; endereço opcional, editável no perfil.
3. **Diagrama de classes (`APP_EVENTOS.pdf`):** não fornecido; o modelo segue a seção 6 do plano.
4. **Link do Figma:** não existe; usando a imagem (ver decisão 1).
