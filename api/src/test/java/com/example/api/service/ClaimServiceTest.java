package com.example.api.service;

import com.example.api.dto.CreateClaimRequest;
import com.example.api.dto.ClaimStatusRequest;
import com.example.api.dto.ClaimResponse;
import com.example.api.dto.ClaimDetailResponse;
import com.example.api.entity.Reclamo;
import com.example.api.entity.EstadoReclamo;
import com.example.api.entity.AdjuntoReclamo;
import com.example.api.exception.ClaimNotFoundException;
import com.example.api.repository.ReclamoRepository;
import com.example.api.repository.EstadoReclamoRepository;
import com.example.api.repository.AdjuntoReclamoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ClaimServiceTest {

    @Mock
    private ReclamoRepository reclamoRepository;

    @Mock
    private EstadoReclamoRepository estadoReclamoRepository;

    @Mock
    private AdjuntoReclamoRepository adjuntoReclamoRepository;

    @Mock
    private MultipartFile multipartFile;

    @InjectMocks
    private ClaimService claimService;

    private CreateClaimRequest createClaimRequest;
    private Reclamo reclamo;
    private EstadoReclamo estadoReclamo;

    @BeforeEach
    void setUp() {
        createClaimRequest = new CreateClaimRequest(
                "Test Claim",
                "Test Description",
                123L
        );

        reclamo = Reclamo.builder()
                .id(1L)
                .codigo("CLM-12345678")
                .titulo("Test Claim")
                .descripcion("Test Description")
                .clienteId(123L)
                .fechaCreacion(LocalDateTime.now())
                .fechaActualizacion(LocalDateTime.now())
                .build();

        estadoReclamo = EstadoReclamo.builder()
                .id(1L)
                .reclamo(reclamo)
                .estado("Ingresado")
                .notas("Reclamo creado exitosamente")
                .fechaCreacion(LocalDateTime.now())
                .build();
    }

    @Test
    void createClaim_ShouldCreateClaimSuccessfully() {
        when(reclamoRepository.save(any(Reclamo.class))).thenReturn(reclamo);
        when(estadoReclamoRepository.save(any(EstadoReclamo.class))).thenReturn(estadoReclamo);

        ClaimResponse result = claimService.createClaim(createClaimRequest);

        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(1L);
        assertThat(result.title()).isEqualTo("Test Claim");
        assertThat(result.description()).isEqualTo("Test Description");
        assertThat(result.customerId()).isEqualTo(123L);
        assertThat(result.currentStatus()).isEqualTo("Ingresado");

        verify(reclamoRepository).save(argThat(r -> 
            r.getTitulo().equals("Test Claim") &&
            r.getDescripcion().equals("Test Description") &&
            r.getClienteId().equals(123L) &&
            r.getCodigo().startsWith("CLM-")
        ));
        verify(estadoReclamoRepository).save(argThat(e ->
            e.getEstado().equals("Ingresado") &&
            e.getNotas().equals("Reclamo creado exitosamente")
        ));
    }

    @Test
    void getAllClaimsWithLastStatus_ShouldReturnAllClaims() {
        List<Reclamo> reclamos = Arrays.asList(reclamo);
        reclamo.setEstados(Arrays.asList(estadoReclamo));

        when(reclamoRepository.findAllWithLastStatus()).thenReturn(reclamos);

        List<ClaimResponse> result = claimService.getAllClaimsWithLastStatus();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).id()).isEqualTo(1L);
        assertThat(result.get(0).currentStatus()).isEqualTo("Ingresado");

        verify(reclamoRepository).findAllWithLastStatus();
    }

    @Test
    void getAllClaimsWithLastStatus_WithoutStatus_ShouldReturnDefaultStatus() {
        reclamo.setEstados(Arrays.asList());
        List<Reclamo> reclamos = Arrays.asList(reclamo);

        when(reclamoRepository.findAllWithLastStatus()).thenReturn(reclamos);

        List<ClaimResponse> result = claimService.getAllClaimsWithLastStatus();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).currentStatus()).isEqualTo("Sin estado");
    }

    @Test
    void getClaimDetailsById_ShouldReturnClaimDetails() {
        AdjuntoReclamo adjunto = AdjuntoReclamo.builder()
                .id(1L)
                .nombreArchivo("test.pdf")
                .tipoContenido("application/pdf")
                .tamanoBytes(1024L)
                .fechaSubida(LocalDateTime.now())
                .build();

        reclamo.setEstados(Arrays.asList(estadoReclamo));
        reclamo.setAdjuntos(Arrays.asList(adjunto));

        when(reclamoRepository.findById(1L)).thenReturn(Optional.of(reclamo));

        ClaimDetailResponse result = claimService.getClaimDetailsById(1L);

        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(1L);
        assertThat(result.statusHistory()).hasSize(1);
        assertThat(result.attachments()).hasSize(1);
        assertThat(result.attachments().get(0).fileName()).isEqualTo("test.pdf");

        verify(reclamoRepository).findById(1L);
    }

    @Test
    void getClaimDetailsById_ClaimNotFound_ShouldThrowException() {
        when(reclamoRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> claimService.getClaimDetailsById(1L))
                .isInstanceOf(ClaimNotFoundException.class);

        verify(reclamoRepository).findById(1L);
    }

    @Test
    void addStatusToClaim_ShouldAddStatusSuccessfully() {
        ClaimStatusRequest statusRequest = new ClaimStatusRequest("En Proceso", "Revisando documentos");

        when(reclamoRepository.findById(1L)).thenReturn(Optional.of(reclamo));

        claimService.addStatusToClaim(1L, statusRequest);

        verify(reclamoRepository).findById(1L);
        verify(estadoReclamoRepository).save(argThat(estado ->
            estado.getEstado().equals("En Proceso") &&
            estado.getNotas().equals("Revisando documentos") &&
            estado.getReclamo().equals(reclamo)
        ));
    }

    @Test
    void addStatusToClaim_ClaimNotFound_ShouldThrowException() {
        ClaimStatusRequest statusRequest = new ClaimStatusRequest("En Proceso", "Revisando documentos");

        when(reclamoRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> claimService.addStatusToClaim(1L, statusRequest))
                .isInstanceOf(ClaimNotFoundException.class);

        verify(reclamoRepository).findById(1L);
        verify(estadoReclamoRepository, never()).save(any());
    }

    @Test
    void addAttachmentToClaim_ShouldAddAttachmentSuccessfully() {
        when(reclamoRepository.findById(1L)).thenReturn(Optional.of(reclamo));
        when(multipartFile.isEmpty()).thenReturn(false);
        when(multipartFile.getOriginalFilename()).thenReturn("document.pdf");
        when(multipartFile.getContentType()).thenReturn("application/pdf");
        when(multipartFile.getSize()).thenReturn(1024L);

        claimService.addAttachmentToClaim(1L, multipartFile);

        verify(reclamoRepository).findById(1L);
        verify(adjuntoReclamoRepository).save(argThat(adjunto ->
            adjunto.getNombreArchivo().equals("document.pdf") &&
            adjunto.getTipoContenido().equals("application/pdf") &&
            adjunto.getTamanoBytes().equals(1024L) &&
            adjunto.getUrlArchivo().equals("/uploads/1/document.pdf") &&
            adjunto.getReclamo().equals(reclamo)
        ));
    }

    @Test
    void addAttachmentToClaim_EmptyFile_ShouldThrowException() {
        when(reclamoRepository.findById(1L)).thenReturn(Optional.of(reclamo));
        when(multipartFile.isEmpty()).thenReturn(true);

        assertThatThrownBy(() -> claimService.addAttachmentToClaim(1L, multipartFile))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("File cannot be empty");

        verify(adjuntoReclamoRepository, never()).save(any());
    }

    @Test
    void addAttachmentToClaim_ClaimNotFound_ShouldThrowException() {
        when(reclamoRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> claimService.addAttachmentToClaim(1L, multipartFile))
                .isInstanceOf(ClaimNotFoundException.class);

        verify(adjuntoReclamoRepository, never()).save(any());
    }
}