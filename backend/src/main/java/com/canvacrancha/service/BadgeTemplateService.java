package com.canvacrancha.service;

import com.canvacrancha.domain.BadgeTemplate;
import com.canvacrancha.repository.BadgeTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BadgeTemplateService {

    private static final int MAX_SLOTS_PER_CNPJ = 3;
    private final BadgeTemplateRepository repository;

    public List<BadgeTemplate> findByCnpj(String cnpj) {
        return repository.findByCnpj(cnpj);
    }

    public Optional<BadgeTemplate> findByCnpjAndSlot(String cnpj, Integer slotNumber) {
        return repository.findByCnpjAndSlotNumber(cnpj, slotNumber);
    }

    public BadgeTemplate saveOrUpdate(BadgeTemplate template) {
        // Validate slot number is within range
        if (template.getSlotNumber() < 1 || template.getSlotNumber() > MAX_SLOTS_PER_CNPJ) {
            throw new IllegalArgumentException("Slot number must be between 1 and " + MAX_SLOTS_PER_CNPJ);
        }

        // Check if template already exists for this CNPJ + slot
        Optional<BadgeTemplate> existing = repository.findByCnpjAndSlotNumber(
                template.getCnpj(),
                template.getSlotNumber());

        if (existing.isPresent()) {
            // Update existing template
            BadgeTemplate dbTemplate = existing.get();
            dbTemplate.setTemplateName(template.getTemplateName());
            dbTemplate.setFrenteImagem(template.getFrenteImagem());
            dbTemplate.setVersoImagem(template.getVersoImagem());
            dbTemplate.setLayoutJson(template.getLayoutJson());
            return repository.save(dbTemplate);
        }

        // Save new template
        return repository.save(template);
    }
}
