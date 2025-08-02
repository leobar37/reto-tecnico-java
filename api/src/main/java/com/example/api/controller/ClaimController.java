package com.example.api.controller;

import com.example.api.dto.CreateClaimRequest;
import com.example.api.dto.ClaimStatusRequest;
import com.example.api.dto.ClaimResponse;
import com.example.api.dto.ClaimDetailResponse;
import com.example.api.dto.PdfExportResponse;
import com.example.api.enums.EstadoReclamoEnum;
import com.example.api.service.ClaimService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/claims")
@RequiredArgsConstructor
@Tag(name = "Claims", description = "Claims management API")
public class ClaimController {

    private final ClaimService claimService;

    @PostMapping
    @Operation(summary = "Create a new claim", description = "Creates a new claim with the provided details")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Claim created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request data")
    })
    public ResponseEntity<ClaimResponse> createClaim(
            @Valid @RequestBody CreateClaimRequest request) {
        ClaimResponse createdClaim = claimService.createClaim(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdClaim);
    }

    @GetMapping
    @Operation(summary = "Get all claims", description = "Retrieves all claims with optional filtering by status and text search")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Claims retrieved successfully")
    })
    public ResponseEntity<List<ClaimResponse>> getAllClaims(
            @Parameter(description = "Filter by claim status (optional)")
            @RequestParam(required = false) EstadoReclamoEnum status,
            @Parameter(description = "Search text in title, description or code (optional)")
            @RequestParam(required = false) String search) {
        
        if (status != null || (search != null && !search.trim().isEmpty())) {
            List<ClaimResponse> claims = claimService.getClaimsWithFilters(status, search);
            return ResponseEntity.ok(claims);
        }
        
        List<ClaimResponse> claims = claimService.getAllClaimsWithLastStatus();
        return ResponseEntity.ok(claims);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get claim details", description = "Retrieves detailed information about a specific claim")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Claim details retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Claim not found")
    })
    public ResponseEntity<ClaimDetailResponse> getClaimById(
            @Parameter(description = "ID of the claim to retrieve", required = true)
            @PathVariable Long id) {
        ClaimDetailResponse claimDetails = claimService.getClaimDetailsById(id);
        return ResponseEntity.ok(claimDetails);
    }

    @PostMapping("/{id}/status")
    @Operation(summary = "Update claim status", description = "Adds a new status update to the specified claim")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Status updated successfully"),
            @ApiResponse(responseCode = "404", description = "Claim not found"),
            @ApiResponse(responseCode = "400", description = "Invalid status data")
    })
    public ResponseEntity<Void> updateClaimStatus(
            @Parameter(description = "ID of the claim to update", required = true)
            @PathVariable Long id,
            @Valid @RequestBody ClaimStatusRequest request) {
        claimService.addStatusToClaim(id, request);
        return ResponseEntity.ok().build();
    }

    @PostMapping(value = "/{id}/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload attachment", description = "Uploads a file attachment to the specified claim")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Attachment uploaded successfully"),
            @ApiResponse(responseCode = "404", description = "Claim not found"),
            @ApiResponse(responseCode = "400", description = "Invalid file or file is empty")
    })
    public ResponseEntity<Void> uploadAttachment(
            @Parameter(description = "ID of the claim to add attachment to", required = true)
            @PathVariable Long id,
            @Parameter(description = "File to upload", required = true)
            @RequestParam("file") MultipartFile file) {
        claimService.addAttachmentToClaim(id, file);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/export/pdf")
    @Operation(summary = "Export claims to PDF", description = "Exports all claims to a PDF file and returns it as base64 encoded content")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "PDF generated successfully"),
            @ApiResponse(responseCode = "500", description = "Error generating PDF")
    })
    public ResponseEntity<PdfExportResponse> exportClaimsToPdf() {
        PdfExportResponse pdfResponse = claimService.exportClaimsToPdf();
        return ResponseEntity.ok(pdfResponse);
    }
}