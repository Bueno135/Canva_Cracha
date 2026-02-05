package com.canvacrancha.api;

import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/badges")
@CrossOrigin(origins = "http://localhost:4200") // Allow Angular dev server
public class BadgeController {

    @PostMapping
    public Map<String, String> saveBadge(@RequestBody Map<String, Object> badgeData) {
        // Mock save
        System.out.println("Saving badge: " + badgeData);
        return Map.of("status", "success", "id", "123");
    }

    @GetMapping("/{id}")
    public Map<String, Object> getBadge(@PathVariable String id) {
        // Mock load
        return Map.of(
            "id", id,
            "name", "Sample Badge",
            "activeSide", "front",
            "elements", java.util.Collections.emptyList()
        );
    }
}
