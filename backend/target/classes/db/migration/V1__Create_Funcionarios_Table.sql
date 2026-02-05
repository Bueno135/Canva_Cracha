CREATE TABLE funcionario (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    matricula VARCHAR(100),
    foto TEXT,
    nome_empresa VARCHAR(255),
    data_admissao DATE,
    tipo_sanguineo VARCHAR(10),
    cpf VARCHAR(20),
    rg VARCHAR(20)
);

CREATE INDEX idx_funcionario_nome_empresa ON funcionario(nome_empresa);
