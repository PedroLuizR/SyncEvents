-- Fase 2: empresa: perfil e serviços (ID04, ID05)

CREATE TABLE portfolio_foto (
    id          BIGSERIAL PRIMARY KEY,
    empresa_id  BIGINT       NOT NULL REFERENCES empresa (id) ON DELETE CASCADE,
    url         VARCHAR(500) NOT NULL,
    ordem       INT          NOT NULL DEFAULT 0
);
CREATE INDEX ix_portfolio_foto_empresa ON portfolio_foto (empresa_id, ordem);

CREATE TABLE servico (
    id             BIGSERIAL PRIMARY KEY,
    empresa_id     BIGINT        NOT NULL REFERENCES empresa (id) ON DELETE CASCADE,
    categoria_id   BIGINT        NOT NULL REFERENCES categoria (id),
    nome           VARCHAR(120)  NOT NULL,
    descricao      VARCHAR(2000),
    modelo_preco   VARCHAR(20)   NOT NULL
        CHECK (modelo_preco IN ('FIXO', 'A_PARTIR_DE', 'FAIXA', 'SOB_CONSULTA')),
    preco_min      NUMERIC(12, 2) CHECK (preco_min >= 0),
    preco_max      NUMERIC(12, 2) CHECK (preco_max >= 0),
    ativo          BOOLEAN       NOT NULL DEFAULT TRUE,
    rascunho       BOOLEAN       NOT NULL DEFAULT FALSE,
    criado_em      TIMESTAMPTZ   NOT NULL DEFAULT now(),
    atualizado_em  TIMESTAMPTZ   NOT NULL DEFAULT now()
);
CREATE INDEX ix_servico_empresa ON servico (empresa_id);
CREATE INDEX ix_servico_categoria ON servico (categoria_id);

CREATE TABLE servico_foto (
    id          BIGSERIAL PRIMARY KEY,
    servico_id  BIGINT       NOT NULL REFERENCES servico (id) ON DELETE CASCADE,
    url         VARCHAR(500) NOT NULL,
    ordem       INT          NOT NULL DEFAULT 0
);
CREATE INDEX ix_servico_foto_servico ON servico_foto (servico_id, ordem);

CREATE TABLE servico_item_incluso (
    id          BIGSERIAL PRIMARY KEY,
    servico_id  BIGINT       NOT NULL REFERENCES servico (id) ON DELETE CASCADE,
    descricao   VARCHAR(200) NOT NULL,
    ordem       INT          NOT NULL DEFAULT 0
);
CREATE INDEX ix_servico_item_servico ON servico_item_incluso (servico_id, ordem);
