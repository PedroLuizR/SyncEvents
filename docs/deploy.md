# Deploy do backend no Railway

O backend já vem pronto para o [Railway](https://railway.com): `backend/Dockerfile` (build), `backend/railway.json`
(health check e reinício automático) e o perfil **`prod`**, que aceita o banco no formato `DATABASE_URL` que o Railway entrega.
Resultado: backend sempre ligado, com HTTPS, PostgreSQL gerenciado, uploads num volume e deploy automático a cada push na `main`.

> Os nomes dos menus podem mudar um pouco com o tempo; a sequência é a mesma.

## Custo

O plano **Hobby** custa por volta de **US$ 5/mês** (com créditos de uso inclusos), o que costuma bastar para este projeto
(backend + Postgres pequenos). Contas novas recebem créditos de teste. Confira os valores atuais em railway.com/pricing.

## Passo a passo

### 1. Criar o projeto a partir do GitHub

1. Entre em **railway.com** com sua conta do GitHub.
2. **New Project → Deploy from GitHub repo** → escolha `PedroLuizR/SyncEvents`
   (autorize o app do Railway a ler o repositório, se ele pedir).
3. O Railway cria um serviço para o repositório. Abra-o e, em **Settings → Source**:
   - **Root Directory:** `backend`
   - **Config file (config-as-code):** `/backend/railway.json`
   - Branch: `main`

### 2. Adicionar o PostgreSQL

No projeto: **+ Create → Database → PostgreSQL**. O Railway cria o serviço `Postgres` com a variável `DATABASE_URL`.

### 3. Variáveis do backend

No serviço do backend, aba **Variables**, adicione:

| Variável | Valor |
|---|---|
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (referência ao banco; o Railway completa sozinho) |
| `APP_JWT_SECRET` | um segredo longo e aleatório (gere com `openssl rand -base64 48`); **obrigatório** |
| `APP_STORAGE_DIR` | `/data/uploads` |
| `APP_SEED_DEMO` | `true` se quiser as contas e empresas de demonstração (cria só na primeira vez) |

`PORT` é definida pelo próprio Railway; o backend já usa essa variável.

### 4. Volume para os uploads

Logos, capas, portfólio e fotos ficam em disco. Sem volume, eles somem a cada novo deploy.
No serviço do backend: **Settings → Volumes → Add Volume** (ou clique com o botão direito no serviço → *Attach volume*)
com o **Mount path** `/data`.

### 5. Domínio público (HTTPS)

**Settings → Networking → Generate Domain.** Se pedir a porta, use `8080`.
Você recebe um endereço como `https://syncevents-production.up.railway.app`.

### 6. Conferir

Depois do deploy (a primeira build leva alguns minutos):

```bash
curl https://SEU-DOMINIO.up.railway.app/actuator/health
# {"status":"UP"}
```

A documentação interativa fica em `https://SEU-DOMINIO.up.railway.app/swagger-ui.html`.
Os logs ficam na aba **Deployments → View logs**; se aparecer `app.jwt.segredo deve ter no mínimo 32 caracteres`,
falta o `APP_JWT_SECRET`.

### 7. Apontar o app

- **APK já instalado:** na tela de boas-vindas, toque em **"Servidor: … · alterar"**, informe
  `https://SEU-DOMINIO.up.railway.app` e toque em **Testar e salvar**.
- **APK já apontando para o Railway:** no GitHub, **Actions → APK Android → Run workflow** e preencha
  *Endereço padrão do backend* com o seu domínio. O novo APK aparece em Releases.

## Como funciona por dentro

| Peça | Detalhe |
|---|---|
| `backend/railway.json` | build pelo `Dockerfile`, health check em `/actuator/health`, reinício em caso de falha, deploy só quando `backend/**` muda |
| Perfil `prod` (`application-prod.yml`) | logs em INFO, uploads em `/data/uploads`, seed desligado por padrão, pool de 5 conexões, cabeçalhos do proxy HTTPS respeitados |
| `DatabaseUrlEnvironmentPostProcessor` | converte `postgresql://usuario:senha@host:porta/banco` em `jdbc:postgresql://...` + usuário + senha (também serve para Render, Fly.io e Heroku). `DB_URL` em JDBC, se existir, tem prioridade |
| Dockerfile | Java 21, usa até 75% da memória do container |

## Outras plataformas

O mesmo vale para qualquer serviço que rode Docker: defina `SPRING_PROFILES_ACTIVE=prod`, `DATABASE_URL` (ou
`DB_URL`/`DB_USER`/`DB_PASSWORD`), `APP_JWT_SECRET` e um volume em `APP_STORAGE_DIR`. Numa VM (por exemplo, Oracle Cloud
"Always Free"), basta `docker compose up -d --build` e um proxy com HTTPS (Caddy ou Nginx) na frente da porta 8080.
