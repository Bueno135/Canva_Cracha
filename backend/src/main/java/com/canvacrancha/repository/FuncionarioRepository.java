package com.canvacrancha.repository;

import com.canvacrancha.domain.Funcionario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FuncionarioRepository extends JpaRepository<Funcionario, Long> {
    List<Funcionario> findByNomeEmpresa(String nomeEmpresa);

    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT f.nomeEmpresa FROM Funcionario f")
    List<String> findDistinctNomeEmpresa();
}
