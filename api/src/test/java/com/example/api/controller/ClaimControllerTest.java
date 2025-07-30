package com.example.api.controller;

import com.example.api.dto.CreateClaimRequest;
import com.example.api.dto.ClaimStatusRequest;
import com.example.api.dto.ClaimResponse;
import com.example.api.dto.ClaimDetailResponse;
import com.example.api.exception.ClaimNotFoundException;
import com.example.api.service.ClaimService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ClaimController.class)
class ClaimControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ClaimService claimService;

    @Autowired
    private ObjectMapper objectMapper;

    private CreateClaimRequest createClaimRequest;
    private ClaimResponse claimResponse;
    private ClaimDetailResponse claimDetailResponse;

    @BeforeEach
    void setUp() {
        createClaimRequest = new CreateClaimRequest(
                "Test Claim",
                "Test Description",
                123L
        );

        claimResponse = new ClaimResponse(
                1L,
                "Test Claim",
                "Test Description",
                123L,
                "Ingresado",
                LocalDateTime.now(),
                LocalDateTime.now()
        );

        List<ClaimDetailResponse.ClaimStatusHistory> statusHistory = Arrays.asList(
                new ClaimDetailResponse.ClaimStatusHistory(
                        1L,
                        "Ingresado",
                        "Reclamo creado exitosamente",
                        LocalDateTime.now()
                )
        );

        List<ClaimDetailResponse.ClaimAttachment> attachments = Arrays.asList(
                new ClaimDetailResponse.ClaimAttachment(
                        1L,
                        "test.pdf",
                        "application/pdf",
                        1024L,
                        LocalDateTime.now()
                )
        );

        claimDetailResponse = new ClaimDetailResponse(
                1L,
                "Test Claim",
                "Test Description",
                123L,
                "Ingresado",
                LocalDateTime.now(),
                LocalDateTime.now(),
                statusHistory,
                attachments
        );
    }

    @Test
    void createClaim_ValidRequest_ShouldReturnCreated() throws Exception {
        when(claimService.createClaim(any(CreateClaimRequest.class))).thenReturn(claimResponse);

        mockMvc.perform(post("/api/claims")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createClaimRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("Test Claim"))
                .andExpect(jsonPath("$.description").value("Test Description"))
                .andExpect(jsonPath("$.customerId").value(123))
                .andExpect(jsonPath("$.currentStatus").value("Ingresado"));

        verify(claimService).createClaim(any(CreateClaimRequest.class));
    }

    @Test
    void createClaim_InvalidRequest_MissingTitle_ShouldReturnBadRequest() throws Exception {
        CreateClaimRequest invalidRequest = new CreateClaimRequest(
                "",
                "Test Description",
                123L
        );

        mockMvc.perform(post("/api/claims")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());

        verify(claimService, never()).createClaim(any());
    }

    @Test
    void createClaim_InvalidRequest_MissingDescription_ShouldReturnBadRequest() throws Exception {
        CreateClaimRequest invalidRequest = new CreateClaimRequest(
                "Test Claim",
                "",
                123L
        );

        mockMvc.perform(post("/api/claims")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());

        verify(claimService, never()).createClaim(any());
    }

    @Test
    void createClaim_InvalidRequest_MissingCustomerId_ShouldReturnBadRequest() throws Exception {
        String invalidRequestJson = "{\"title\":\"Test Claim\",\"description\":\"Test Description\",\"customerId\":null}";

        mockMvc.perform(post("/api/claims")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidRequestJson))
                .andExpect(status().isBadRequest());

        verify(claimService, never()).createClaim(any());
    }

    @Test
    void getAllClaims_ShouldReturnAllClaims() throws Exception {
        List<ClaimResponse> claims = Arrays.asList(claimResponse);
        when(claimService.getAllClaimsWithLastStatus()).thenReturn(claims);

        mockMvc.perform(get("/api/claims"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].title").value("Test Claim"));

        verify(claimService).getAllClaimsWithLastStatus();
    }

    @Test
    void getClaimById_ExistingClaim_ShouldReturnClaimDetails() throws Exception {
        when(claimService.getClaimDetailsById(1L)).thenReturn(claimDetailResponse);

        mockMvc.perform(get("/api/claims/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("Test Claim"))
                .andExpect(jsonPath("$.statusHistory").isArray())
                .andExpect(jsonPath("$.statusHistory[0].status").value("Ingresado"))
                .andExpect(jsonPath("$.attachments").isArray())
                .andExpect(jsonPath("$.attachments[0].fileName").value("test.pdf"));

        verify(claimService).getClaimDetailsById(1L);
    }

    @Test
    void getClaimById_NonExistingClaim_ShouldReturnNotFound() throws Exception {
        when(claimService.getClaimDetailsById(999L)).thenThrow(new ClaimNotFoundException(999L));

        mockMvc.perform(get("/api/claims/999"))
                .andExpect(status().isNotFound());

        verify(claimService).getClaimDetailsById(999L);
    }

    @Test
    void updateClaimStatus_ValidRequest_ShouldReturnOk() throws Exception {
        ClaimStatusRequest statusRequest = new ClaimStatusRequest("En Proceso", "Revisando documentos");

        mockMvc.perform(post("/api/claims/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusRequest)))
                .andExpect(status().isOk());

        verify(claimService).addStatusToClaim(eq(1L), any(ClaimStatusRequest.class));
    }

    @Test
    void updateClaimStatus_NonExistingClaim_ShouldReturnNotFound() throws Exception {
        ClaimStatusRequest statusRequest = new ClaimStatusRequest("En Proceso", "Revisando documentos");
        doThrow(new ClaimNotFoundException(999L)).when(claimService).addStatusToClaim(eq(999L), any());

        mockMvc.perform(post("/api/claims/999/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusRequest)))
                .andExpect(status().isNotFound());

        verify(claimService).addStatusToClaim(eq(999L), any(ClaimStatusRequest.class));
    }

    @Test
    void updateClaimStatus_InvalidRequest_MissingStatus_ShouldReturnBadRequest() throws Exception {
        ClaimStatusRequest invalidRequest = new ClaimStatusRequest("", "Some notes");

        mockMvc.perform(post("/api/claims/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());

        verify(claimService, never()).addStatusToClaim(anyLong(), any());
    }

    @Test
    void uploadAttachment_ValidFile_ShouldReturnOk() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "document.pdf",
                "application/pdf",
                "test content".getBytes()
        );

        mockMvc.perform(multipart("/api/claims/1/attachments")
                        .file(file))
                .andExpect(status().isOk());

        verify(claimService).addAttachmentToClaim(eq(1L), any());
    }

    @Test
    void uploadAttachment_NonExistingClaim_ShouldReturnNotFound() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "document.pdf",
                "application/pdf",
                "test content".getBytes()
        );

        doThrow(new ClaimNotFoundException(999L)).when(claimService).addAttachmentToClaim(eq(999L), any());

        mockMvc.perform(multipart("/api/claims/999/attachments")
                        .file(file))
                .andExpect(status().isNotFound());

        verify(claimService).addAttachmentToClaim(eq(999L), any());
    }

    @Test
    void uploadAttachment_EmptyFile_ShouldReturnBadRequest() throws Exception {
        MockMultipartFile emptyFile = new MockMultipartFile(
                "file",
                "empty.pdf",
                "application/pdf",
                new byte[0]
        );

        doThrow(new RuntimeException("File cannot be empty")).when(claimService).addAttachmentToClaim(eq(1L), any());

        mockMvc.perform(multipart("/api/claims/1/attachments")
                        .file(emptyFile))
                .andExpect(status().isBadRequest());

        verify(claimService).addAttachmentToClaim(eq(1L), any());
    }
}