package com.canvacrancha.controller;

import com.canvacrancha.domain.Funcionario;
import com.canvacrancha.repository.FuncionarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/funcionarios")
@CrossOrigin(origins = "*") // Allow frontend access
public class FuncionarioController {

    @Autowired
    private FuncionarioRepository funcionarioRepository;

    @GetMapping
    public List<Funcionario> getAll(@RequestParam(required = false) String empresa) {
        if (empresa != null && !empresa.isEmpty()) {
            return funcionarioRepository.findByNomeEmpresa(empresa);
        }
        return funcionarioRepository.findAll();
    }

    @GetMapping("/empresas")
    public List<String> getEmpresas() {
        return funcionarioRepository.findDistinctNomeEmpresa();
    }

}
