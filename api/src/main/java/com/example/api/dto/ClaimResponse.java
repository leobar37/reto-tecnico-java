package com.example.api.dto;

import com.example.api.enums.EstadoReclamoEnum;
import java.time.LocalDateTime;

public record ClaimResponse(
    Long id,
    String title,
    String description,
    Long customerId,
    EstadoReclamoEnum currentStatus,
    LocalDateTime createdAt,
    LocalDateTime lastUpdated
) {
}