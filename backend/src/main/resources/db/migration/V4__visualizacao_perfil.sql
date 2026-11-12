-- Fase 3: cliente: descoberta (ID06, ID07)

CREATE TABLE visualizacao_perfil (
    id          BIGSERIAL PRIMARY KEY,
    empresa_id  BIGINT      NOT NULL REFERENCES empresa (id) ON DELETE CASCADE,
    cliente_id  BIGINT      REFERENCES cliente (id) ON DELETE SET NULL,
    criado_em   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ix_visualizacao_empresa_data ON visualizacao_perfil (empresa_id, criado_em);

-- Busca sem acento e sem diferenciar maiúsculas (unaccent já habilitado na V1)
CREATE INDEX ix_empresa_cidade ON empresa (lower(cidade));
