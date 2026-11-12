# SyncEvents

O plano completo de implementação (contexto, stack, modelo de dados, API, fases e convenções) está em @SYNCEVENTS_PLANO.md. Siga-o.

- Design: `docs/design/` (sem link do Figma; ver `docs/decisoes.md`).
- Decisões tomadas e pontos em aberto: `docs/decisoes.md`. Registre lá qualquer escolha nova.
- Rotas do app ficam em `mobile/src/app/` (Expo SDK 58). Use `npx expo install` para dependências.
- Ao final de cada fase: `mvn verify` (backend) e `npm test`, `npm run typecheck`, `npm run lint` (mobile); atualizar `docs/api.md`; commit `feat(fase-N): ...`; parar para revisão.
