package com.canvacrancha.api;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import lombok.RequiredArgsConstructor;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.canvacrancha.service.BadgeTemplateService;
import com.canvacrancha.repository.BadgeTemplateRepository;
import com.canvacrancha.domain.BadgeTemplate;
import java.util.Map;

@RestController
@RequestMapping("/api/badges")
// Allow Vite (localhost:5173) and keep Angular (localhost:4200) just in case,
// or just switch as requested.
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class BadgeController {

    private final BadgeTemplateService badgeTemplateService;
    private final BadgeTemplateRepository badgeTemplateRepository; // Direct repo access for findById if service doesn't
                                                                   // have it

    @PostMapping
    public ResponseEntity<BadgeTemplate> saveBadge(@RequestBody Map<String, Object> payload) {
        try {
            BadgeTemplate template = new BadgeTemplate();

            // Map known fields from payload
            if (payload.containsKey("id")) {
                template.setId(Long.valueOf(payload.get("id").toString()));
            }

            // Default or extracted values
            template.setCnpj((String) payload.getOrDefault("cnpj", "00000000000000")); // Default or from payload
            template.setSlotNumber(Integer.valueOf(payload.getOrDefault("slotNumber", "1").toString()));
            template.setTemplateName((String) payload.getOrDefault("name", "Untitled Badge"));

            // Serialize elements to JSON for storage
            Object elements = payload.get("elements");
            ObjectMapper mapper = new ObjectMapper();
            String layoutJson = mapper.writeValueAsString(elements);
            template.setLayoutJson(layoutJson);

            // Images (optional handling based on payload)
            if (payload.containsKey("frenteImagem"))
                template.setFrenteImagem((String) payload.get("frenteImagem"));
            if (payload.containsKey("versoImagem"))
                template.setVersoImagem((String) payload.get("versoImagem"));

            BadgeTemplate saved = badgeTemplateService.saveOrUpdate(template);
            return ResponseEntity.ok(saved);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<BadgeTemplate> getBadge(@PathVariable Long id) {
        return badgeTemplateRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
