package com.canvacrancha.domain;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "badge_template", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "cnpj", "slot_number" })
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BadgeTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cnpj", nullable = false)
    private String cnpj;

    @Column(name = "slot_number", nullable = false)
    private Integer slotNumber;

    @Column(name = "template_name")
    private String templateName;

    @Column(name = "frente_imagem", columnDefinition = "TEXT")
    private String frenteImagem;

    @Column(name = "verso_imagem", columnDefinition = "TEXT")
    private String versoImagem;

    @Column(name = "layout_json", columnDefinition = "TEXT")
    private String layoutJson;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
