package com.canvacrancha.repository;

import com.canvacrancha.domain.BadgeTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface BadgeTemplateRepository extends JpaRepository<BadgeTemplate, Long> {
    List<BadgeTemplate> findByCnpj(String cnpj);

    Optional<BadgeTemplate> findByCnpjAndSlotNumber(String cnpj, Integer slotNumber);

    long countByCnpj(String cnpj);
}
