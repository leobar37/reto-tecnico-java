package com.example.api.dto;

import com.example.api.enums.EstadoReclamoEnum;
import jakarta.validation.constraints.NotNull;

public record ClaimStatusRequest(
    @NotNull(message = "Status is required")
    EstadoReclamoEnum status,
    
    String notes
) {
}