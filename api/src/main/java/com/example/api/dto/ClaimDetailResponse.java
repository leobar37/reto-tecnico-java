package com.example.api.dto;

import com.example.api.enums.EstadoReclamoEnum;
import java.time.LocalDateTime;
import java.util.List;

public record ClaimDetailResponse(
    Long id,
    String title,
    String description,
    Long customerId,
    EstadoReclamoEnum currentStatus,
    LocalDateTime createdAt,
    LocalDateTime lastUpdated,
    List<ClaimStatusHistory> statusHistory,
    List<ClaimAttachment> attachments
) {
    
    public record ClaimStatusHistory(
        Long id,
        EstadoReclamoEnum status,
        String notes,
        LocalDateTime createdAt
    ) {}
    
    public record ClaimAttachment(
        Long id,
        String fileName,
        String fileType,
        Long fileSize,
        LocalDateTime uploadedAt
    ) {}
}