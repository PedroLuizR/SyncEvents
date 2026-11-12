-- Fase 1: autenticação e cadastros (ID01, ID02, ID03)

CREATE TABLE usuario (
    id          BIGSERIAL PRIMARY KEY,
    email       VARCHAR(255) NOT NULL,
    senha_hash  VARCHAR(100) NOT NULL,
    tipo        VARCHAR(20)  NOT NULL CHECK (tipo IN ('CLIENTE', 'EMPRESA')),
    ativo       BOOLEAN      NOT NULL DEFAULT TRUE,
    criado_em   TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX ux_usuario_email ON usuario (lower(email));

CREATE TABLE cliente (
    id          BIGSERIAL PRIMARY KEY,
    usuario_id  BIGINT       NOT NULL UNIQUE REFERENCES usuario (id) ON DELETE CASCADE,
    nome        VARCHAR(120) NOT NULL,
    telefone    VARCHAR(11)  NOT NULL,
    cidade      VARCHAR(120) NOT NULL,
    cpf         VARCHAR(14),  -- opcional, sem validação (decisão do usuário)
    foto_url    VARCHAR(500)
);

CREATE TABLE cliente_interesse (
    cliente_id  BIGINT      NOT NULL REFERENCES cliente (id) ON DELETE CASCADE,
    tipo_evento VARCHAR(20) NOT NULL
        CHECK (tipo_evento IN ('CASAMENTO', 'ANIVERSARIO', 'CORPORATIVO', 'FORMATURA', 'INFANTIL', 'OUTRO')),
    PRIMARY KEY (cliente_id, tipo_evento)
);

CREATE TABLE categoria (
    id     BIGSERIAL PRIMARY KEY,
    nome   VARCHAR(60) NOT NULL UNIQUE,
    icone  VARCHAR(40) NOT NULL
);

INSERT INTO categoria (nome, icone) VALUES
    ('Decoração',    'star'),
    ('Buffet',       'coffee'),
    ('Fotografia',   'camera'),
    ('Som e luz',    'music'),
    ('Planejamento', 'calendar'),
    ('Bebidas',      'droplet');

CREATE TABLE empresa (
    id                 BIGSERIAL PRIMARY KEY,
    usuario_id         BIGINT       NOT NULL UNIQUE REFERENCES usuario (id) ON DELETE CASCADE,
    codigo             VARCHAR(6)   NOT NULL UNIQUE CHECK (codigo ~ '^[0-9]{6}$'),
    nome_fantasia      VARCHAR(120) NOT NULL,
    cnpj               VARCHAR(14)  NOT NULL UNIQUE CHECK (cnpj ~ '^[0-9]{14}$'),
    telefone_whatsapp  VARCHAR(11)  NOT NULL,
    cidade             VARCHAR(120) NOT NULL,
    uf                 VARCHAR(2),
    endereco           VARCHAR(255),  -- opcional, sem verificação, editável no perfil
    descricao          VARCHAR(2000),
    logo_url           VARCHAR(500),
    capa_url           VARCHAR(500),
    criado_em          TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE empresa_categoria (
    empresa_id    BIGINT NOT NULL REFERENCES empresa (id) ON DELETE CASCADE,
    categoria_id  BIGINT NOT NULL REFERENCES categoria (id),
    PRIMARY KEY (empresa_id, categoria_id)
);
CREATE INDEX ix_empresa_categoria_categoria ON empresa_categoria (categoria_id);
