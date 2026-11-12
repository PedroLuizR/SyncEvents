-- Fase 5: chat (ID09)

CREATE TABLE mensagem (
    id                    BIGSERIAL PRIMARY KEY,
    conversa_id           BIGINT        NOT NULL REFERENCES conversa (id) ON DELETE CASCADE,
    remetente_usuario_id  BIGINT        NOT NULL REFERENCES usuario (id),
    tipo                  VARCHAR(20)   NOT NULL CHECK (tipo IN ('TEXTO', 'PROPOSTA')),
    conteudo              VARCHAR(2000) NOT NULL,
    proposta_id           BIGINT        REFERENCES proposta (id) ON DELETE SET NULL,
    lida                  BOOLEAN       NOT NULL DEFAULT FALSE,
    enviada_em            TIMESTAMPTZ   NOT NULL DEFAULT now()
);
CREATE INDEX ix_mensagem_conversa ON mensagem (conversa_id, id DESC);
CREATE INDEX ix_mensagem_nao_lidas ON mensagem (conversa_id, remetente_usuario_id) WHERE NOT lida;

-- Propostas enviadas antes do chat existir viram mensagens do tipo PROPOSTA
INSERT INTO mensagem (conversa_id, remetente_usuario_id, tipo, conteudo, proposta_id, lida, enviada_em)
SELECT c.id, e.usuario_id, 'PROPOSTA', p.descricao, p.id, TRUE, p.criado_em
FROM proposta p
JOIN conversa c ON c.solicitacao_id = p.solicitacao_id
JOIN empresa e ON e.id = c.empresa_id;
