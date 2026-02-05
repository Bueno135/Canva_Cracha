package com.canvacrancha.controller;

import com.canvacrancha.domain.BadgeTemplate;
import com.canvacrancha.service.BadgeTemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/templates")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BadgeTemplateController {

    private final BadgeTemplateService service;

    @GetMapping("/{cnpj}")
    public ResponseEntity<List<BadgeTemplate>> getTemplatesByCnpj(@PathVariable String cnpj) {
        List<BadgeTemplate> templates = service.findByCnpj(cnpj);
        return ResponseEntity.ok(templates);
    }

    @GetMapping("/{cnpj}/{slot}")
    public ResponseEntity<BadgeTemplate> getTemplateBySlot(
            @PathVariable String cnpj,
            @PathVariable Integer slot) {
        return service.findByCnpjAndSlot(cnpj, slot)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<BadgeTemplate> saveTemplate(@RequestBody BadgeTemplate template) {
        try {
            return ResponseEntity.ok(service.saveOrUpdate(template));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
