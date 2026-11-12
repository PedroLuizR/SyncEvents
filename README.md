# SyncEvents

App Android que conecta **clientes** a **empresas organizadoras de eventos**: busca de empresas, solicitação de orçamento, chat e avaliações.

- **Mobile:** React Native (Expo SDK 58) + TypeScript + Expo Router (`mobile/`)
- **Backend:** Java 21 + Spring Boot 3.5 + PostgreSQL 16 + Flyway (`backend/`)
- **Plano completo:** [`SYNCEVENTS_PLANO.md`](SYNCEVENTS_PLANO.md) · decisões: [`docs/decisoes.md`](docs/decisoes.md) · API: [`docs/api.md`](docs/api.md)

## Status

| Fase | Conteúdo | Status |
|---|---|---|
| 0 | Fundação (infra, backend base, app base, design system) | ✅ |
| 1 | Autenticação e cadastros (boas-vindas, login, cadastro de cliente e de empresa) | ✅ |
| 2 | Empresa: perfil (logo, capa, portfólio) e serviços (criar, editar, rascunho, ativar/desativar, excluir) | ✅ |
| 3 | Cliente: busca e perfil da empresa | ⏳ |
| 4 a 7 | Ver o plano | — |

## Pré-requisitos

- Docker (para o PostgreSQL)
- Java 21 e Maven 3.9+
- Node 20+ e npm
- Android Studio com um emulador (ou um aparelho com o Expo Go / dev build)

## Como rodar

### 1. Banco de dados

```bash
cp .env.example .env
docker compose up -d postgres
```

pgAdmin (opcional): `docker compose --profile tools up -d` → http://localhost:5050 (`admin@syncevents.local` / `admin`).

### 2. Backend

```bash
cd backend
mvn spring-boot:run
```

- API: http://localhost:8080/api/v1
- Saúde: http://localhost:8080/actuator/health
- Swagger: http://localhost:8080/swagger-ui.html

O perfil `dev` é o padrão e conecta em `localhost:5432/syncevents` (usuário e senha `syncevents`). As variáveis estão em `backend/.env.example`. O Flyway aplica as migrations ao subir. Em produção, defina `APP_JWT_SECRET` (mínimo de 32 caracteres).

### 3. Mobile

```bash
cd mobile
cp .env.example .env
npm install
npx expo run:android
```

`EXPO_PUBLIC_API_URL` no `.env`: `http://10.0.2.2:8080` no emulador Android; em aparelho físico, use o IP da sua máquina na rede.

Para só ver a interface no navegador: `npx expo start --web`.

## Testes e qualidade

```bash
# Backend: testes unitários + integração (Testcontainers, precisa do Docker)
cd backend && mvn verify

# Sem Docker: aponte para um Postgres existente
TEST_DB_URL=jdbc:postgresql://localhost:5432/syncevents_test mvn verify

# Mobile
cd mobile
npm test
npm run typecheck
npm run lint
npx prettier --check .

# E2E (Maestro, com o app instalado no emulador)
maestro test e2e/
```

## Telas

Prints de cada fase em [`docs/telas/`](docs/telas/).

## Estrutura

```
backend/   Spring Boot (pacotes por domínio em br.com.syncevents.*)
mobile/    Expo: rotas em src/app/, design system em src/components/, tokens em src/theme/
docs/      design (Figma), api.md, decisoes.md
```
