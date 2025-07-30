package com.example.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateClaimRequest(
    @NotBlank(message = "Title is required")
    String title,
    
    @NotBlank(message = "Description is required")
    String description,
    
    @NotNull(message = "Customer ID is required")
    Long customerId
) {
}