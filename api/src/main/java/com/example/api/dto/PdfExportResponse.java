package com.example.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Response containing the exported PDF as base64")
public record PdfExportResponse(
    @Schema(description = "Base64 encoded PDF content", requiredMode = Schema.RequiredMode.REQUIRED)
    String pdfContent,
    
    @Schema(description = "Filename for the PDF", requiredMode = Schema.RequiredMode.REQUIRED)
    String filename,
    
    @Schema(description = "Total number of claims exported", requiredMode = Schema.RequiredMode.REQUIRED)
    int totalClaims
) {
}