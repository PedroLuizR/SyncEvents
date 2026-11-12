# SyncEvents

O plano completo de implementação (contexto, stack, modelo de dados, API, fases e convenções) está em @SYNCEVENTS_PLANO.md. Siga-o.

## Estado atual

- Fases 0 a 5 concluídas (ver tabela no README). Próximas: Fase 6 (avaliações) e Fase 7 (acabamento e APK).
- Design: `docs/design/00-visao-geral.png` (sem link do Figma).
- Decisões e diferenças em relação ao Figma: `docs/decisoes.md` (registre lá qualquer escolha nova, numerada).
- Arquitetura: `docs/arquitetura.md` · API: `docs/api.md` · testes: `docs/testes.md`.

## Convenções práticas

- Rotas do app ficam em `mobile/src/app/` (Expo SDK 58); as áreas logadas são `cliente/` e `empresa/` (pastas comuns, não grupos).
- Dependências do app: `npx expo install` (use `EXPO_OFFLINE=1` se a API do Expo estiver bloqueada).
- Na web (só para visualização) a sessão fica em memória: recarregar a página desloga. Se o Metro servir código antigo, reinicie com `--clear`.
- Testes de integração do backend usam Testcontainers (Docker). Sem Docker: `TEST_DB_URL=... mvn verify`.
- Dados de demonstração no perfil `dev`: `marina@demo.syncevents.com` e `contato@aurora.demo.syncevents.com`, senha `Senha@123`.

## Ao final de cada fase

`mvn verify` (backend); `npm test`, `npm run typecheck`, `npm run lint`, `npx prettier --check .` (mobile); atualizar `docs/api.md`, `docs/decisoes.md`, `docs/testes.md` e a tabela de status do README; commit `feat(fase-N): ...`; parar para revisão.
