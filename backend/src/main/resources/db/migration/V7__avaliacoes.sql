-- Fase 6: avaliações (ID11)

CREATE TABLE avaliacao (
    id              BIGSERIAL PRIMARY KEY,
    solicitacao_id  BIGINT        NOT NULL UNIQUE REFERENCES solicitacao (id) ON DELETE CASCADE,
    empresa_id      BIGINT        NOT NULL REFERENCES empresa (id) ON DELETE CASCADE,
    cliente_id      BIGINT        NOT NULL REFERENCES cliente (id) ON DELETE CASCADE,
    nota            SMALLINT      NOT NULL CHECK (nota BETWEEN 1 AND 5),
    comentario      VARCHAR(1000),
    destaques       TEXT[]        NOT NULL DEFAULT '{}',
    criado_em       TIMESTAMPTZ   NOT NULL DEFAULT now()
);
CREATE INDEX ix_avaliacao_empresa ON avaliacao (empresa_id, criado_em DESC);
