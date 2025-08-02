package com.example.api.dto;

import com.example.api.enums.EstadoReclamoEnum;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Request to update claim status")
public record ClaimStatusRequest(
    @Schema(description = "New status for the claim", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "Status is required")
    EstadoReclamoEnum status,
    
    @Schema(description = "Optional notes for the status change")
    String notes,
    
    @Schema(description = "Email of the advisor handling the claim")
    String asesor_email
) {
}