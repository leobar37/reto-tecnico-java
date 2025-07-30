package com.example.api.service;

import com.example.api.dto.CreateClaimRequest;
import com.example.api.dto.ClaimStatusRequest;
import com.example.api.dto.ClaimResponse;
import com.example.api.dto.ClaimDetailResponse;
import com.example.api.entity.Reclamo;
import com.example.api.entity.EstadoReclamo;
import com.example.api.entity.AdjuntoReclamo;
import com.example.api.enums.EstadoReclamoEnum;
import com.example.api.exception.ClaimNotFoundException;
import com.example.api.repository.ReclamoRepository;
import com.example.api.repository.EstadoReclamoRepository;
import com.example.api.repository.AdjuntoReclamoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClaimService {

        private final ReclamoRepository reclamoRepository;
        private final EstadoReclamoRepository estadoReclamoRepository;
        private final AdjuntoReclamoRepository adjuntoReclamoRepository;

        @Transactional
        public ClaimResponse createClaim(CreateClaimRequest request) {
                String codigo = "CLM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
                
                Reclamo reclamo = Reclamo.builder()
                                .codigo(codigo)
                                .titulo(request.title())
                                .descripcion(request.description())
                                .clienteId(request.customerId())
                                .build();
                
                Reclamo savedReclamo = reclamoRepository.save(reclamo);
                
                EstadoReclamo initialStatus = EstadoReclamo.builder()
                                .reclamo(savedReclamo)
                                .estado(EstadoReclamoEnum.INGRESADO)
                                .notas("Reclamo creado exitosamente")
                                .build();
                
                EstadoReclamo savedStatus = estadoReclamoRepository.save(initialStatus);
                
                return new ClaimResponse(
                                savedReclamo.getId(),
                                savedReclamo.getTitulo(),
                                savedReclamo.getDescripcion(),
                                savedReclamo.getClienteId(),
                                savedStatus.getEstado(),
                                savedReclamo.getFechaCreacion(),
                                savedReclamo.getFechaActualizacion()
                );
        }

        @Transactional(readOnly = true)
        public List<ClaimResponse> getAllClaimsWithLastStatus() {
                List<Reclamo> reclamos = reclamoRepository.findAllWithLastStatus();
                
                return reclamos.stream()
                                .map(reclamo -> {
                                        String currentStatus = reclamo.getEstados().stream()
                                                        .max((e1, e2) -> e1.getFechaCreacion().compareTo(e2.getFechaCreacion()))
                                                        .map(EstadoReclamo::getEstado)
                                                        .orElse("Sin estado");
                                        
                                        return new ClaimResponse(
                                                        reclamo.getId(),
                                                        reclamo.getTitulo(),
                                                        reclamo.getDescripcion(),
                                                        reclamo.getClienteId(),
                                                        currentStatus,
                                                        reclamo.getFechaCreacion(),
                                                        reclamo.getFechaActualizacion()
                                        );
                                })
                                .collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        public ClaimDetailResponse getClaimDetailsById(Long id) {
                Reclamo reclamo = reclamoRepository.findById(id)
                                .orElseThrow(() -> new ClaimNotFoundException(id));
                
                List<ClaimDetailResponse.ClaimStatusHistory> statusHistory = reclamo.getEstados().stream()
                                .map(estado -> new ClaimDetailResponse.ClaimStatusHistory(
                                                estado.getId(),
                                                estado.getEstado(),
                                                estado.getNotas(),
                                                estado.getFechaCreacion()
                                ))
                                .collect(Collectors.toList());
                
                List<ClaimDetailResponse.ClaimAttachment> attachments = reclamo.getAdjuntos().stream()
                                .map(adjunto -> new ClaimDetailResponse.ClaimAttachment(
                                                adjunto.getId(),
                                                adjunto.getNombreArchivo(),
                                                adjunto.getTipoContenido(),
                                                adjunto.getTamanoBytes(),
                                                adjunto.getFechaSubida()
                                ))
                                .collect(Collectors.toList());
                
                String currentStatus = reclamo.getEstados().stream()
                                .max((e1, e2) -> e1.getFechaCreacion().compareTo(e2.getFechaCreacion()))
                                .map(EstadoReclamo::getEstado)
                                .orElse("Sin estado");
                
                return new ClaimDetailResponse(
                                reclamo.getId(),
                                reclamo.getTitulo(),
                                reclamo.getDescripcion(),
                                reclamo.getClienteId(),
                                currentStatus,
                                reclamo.getFechaCreacion(),
                                reclamo.getFechaActualizacion(),
                                statusHistory,
                                attachments
                );
        }

        @Transactional
        public void addStatusToClaim(Long claimId, ClaimStatusRequest request) {
                Reclamo reclamo = reclamoRepository.findById(claimId)
                                .orElseThrow(() -> new ClaimNotFoundException(claimId));
                
                EstadoReclamo newStatus = EstadoReclamo.builder()
                                .reclamo(reclamo)
                                .estado(request.status())
                                .notas(request.notes())
                                .build();
                
                estadoReclamoRepository.save(newStatus);
        }

        @Transactional
        public void addAttachmentToClaim(Long claimId, MultipartFile file) {
                Reclamo reclamo = reclamoRepository.findById(claimId)
                                .orElseThrow(() -> new ClaimNotFoundException(claimId));
                
                if (file.isEmpty()) {
                        throw new RuntimeException("File cannot be empty");
                }
                
                String fileName = file.getOriginalFilename();
                String filePath = "/uploads/" + claimId + "/" + fileName;
                
                AdjuntoReclamo attachment = AdjuntoReclamo.builder()
                                .reclamo(reclamo)
                                .nombreArchivo(fileName)
                                .tipoContenido(file.getContentType())
                                .tamanoBytes(file.getSize())
                                .urlArchivo(filePath)
                                .build();
                
                adjuntoReclamoRepository.save(attachment);
        }
}
