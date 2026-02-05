CREATE TABLE badge_template (
    id BIGSERIAL PRIMARY KEY,
    nome_empresa VARCHAR(255) NOT NULL UNIQUE,
    frente_imagem TEXT,
    verso_imagem TEXT,
    layout_json TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
