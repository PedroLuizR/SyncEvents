-- Fase 4: orçamentos e gestão (ID08, ID10)

CREATE TABLE solicitacao (
    id              BIGSERIAL PRIMARY KEY,
    cliente_id      BIGINT        NOT NULL REFERENCES cliente (id),
    empresa_id      BIGINT        NOT NULL REFERENCES empresa (id),
    tipo_evento     VARCHAR(20)   NOT NULL
        CHECK (tipo_evento IN ('CASAMENTO', 'ANIVERSARIO', 'CORPORATIVO', 'FORMATURA', 'INFANTIL', 'OUTRO')),
    data_evento     DATE          NOT NULL,
    qtd_convidados  INT           NOT NULL CHECK (qtd_convidados > 0),
    local           VARCHAR(200)  NOT NULL,
    orcamento_min   NUMERIC(12, 2) CHECK (orcamento_min >= 0),
    orcamento_max   NUMERIC(12, 2) CHECK (orcamento_max >= 0),
    mensagem        VARCHAR(2000),
    status          VARCHAR(20)   NOT NULL DEFAULT 'PENDENTE'
        CHECK (status IN ('PENDENTE', 'EM_ANALISE', 'EM_NEGOCIACAO', 'ACEITA', 'CONCLUIDA', 'RECUSADA', 'CANCELADA')),
    aceite_contato  BOOLEAN       NOT NULL,
    criado_em       TIMESTAMPTZ   NOT NULL DEFAULT now(),
    atualizado_em   TIMESTAMPTZ   NOT NULL DEFAULT now()
);
CREATE INDEX ix_solicitacao_cliente ON solicitacao (cliente_id, criado_em DESC);
CREATE INDEX ix_solicitacao_empresa ON solicitacao (empresa_id, criado_em DESC);

CREATE TABLE solicitacao_servico (
    solicitacao_id  BIGINT NOT NULL REFERENCES solicitacao (id) ON DELETE CASCADE,
    servico_id      BIGINT NOT NULL REFERENCES servico (id),
    PRIMARY KEY (solicitacao_id, servico_id)
);
CREATE INDEX ix_solicitacao_servico_servico ON solicitacao_servico (servico_id);

CREATE TABLE solicitacao_anexo (
    id              BIGSERIAL PRIMARY KEY,
    solicitacao_id  BIGINT       NOT NULL REFERENCES solicitacao (id) ON DELETE CASCADE,
    url             VARCHAR(500) NOT NULL
);

CREATE TABLE proposta (
    id              BIGSERIAL PRIMARY KEY,
    solicitacao_id  BIGINT         NOT NULL REFERENCES solicitacao (id) ON DELETE CASCADE,
    valor           NUMERIC(12, 2) NOT NULL CHECK (valor > 0),
    descricao       VARCHAR(2000)  NOT NULL,
    status          VARCHAR(20)    NOT NULL DEFAULT 'ENVIADA' CHECK (status IN ('ENVIADA', 'ACEITA', 'RECUSADA')),
    criado_em       TIMESTAMPTZ    NOT NULL DEFAULT now()
);
CREATE INDEX ix_proposta_solicitacao ON proposta (solicitacao_id, criado_em);
-- no máximo uma proposta aguardando resposta por solicitação
CREATE UNIQUE INDEX ux_proposta_enviada ON proposta (solicitacao_id) WHERE status = 'ENVIADA';

CREATE TABLE conversa (
    id              BIGSERIAL PRIMARY KEY,
    solicitacao_id  BIGINT      NOT NULL UNIQUE REFERENCES solicitacao (id) ON DELETE CASCADE,
    cliente_id      BIGINT      NOT NULL REFERENCES cliente (id),
    empresa_id      BIGINT      NOT NULL REFERENCES empresa (id),
    criado_em       TIMESTAMPTZ NOT NULL DEFAULT now()
);
