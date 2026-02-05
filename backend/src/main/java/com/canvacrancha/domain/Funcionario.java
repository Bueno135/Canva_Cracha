package com.canvacrancha.domain;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "funcionario")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Funcionario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    private String matricula;

    @Column(columnDefinition = "TEXT")
    private String foto;

    @Column(name = "nome_empresa")
    private String nomeEmpresa;

    @Column(name = "data_admissao")
    private LocalDate dataAdmissao;

    @Column(name = "tipo_sanguineo")
    private String tipoSanguineo;

    private String cpf;

    private String rg;
}
