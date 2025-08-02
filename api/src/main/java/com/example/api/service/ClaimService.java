package com.example.api.service;

import com.example.api.dto.CreateClaimRequest;
import com.example.api.dto.ClaimStatusRequest;
import com.example.api.dto.ClaimResponse;
import com.example.api.dto.ClaimDetailResponse;
import com.example.api.dto.PdfExportResponse;
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
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.Base64;
import java.util.stream.Collectors;
import java.io.ByteArrayOutputStream;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;

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
                                        EstadoReclamoEnum currentStatus = reclamo.getEstados().stream()
                                                        .max((e1, e2) -> e1.getFechaCreacion().compareTo(e2.getFechaCreacion()))
                                                        .map(EstadoReclamo::getEstado)
                                                        .orElse(EstadoReclamoEnum.INGRESADO);
                                        
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
        public List<ClaimResponse> getClaimsWithFilters(EstadoReclamoEnum status, String searchText) {
                List<Reclamo> reclamos = reclamoRepository.findWithFilters(status, searchText);
                
                return reclamos.stream()
                                .map(reclamo -> {
                                        EstadoReclamoEnum currentStatus = reclamo.getEstados().stream()
                                                        .max((e1, e2) -> e1.getFechaCreacion().compareTo(e2.getFechaCreacion()))
                                                        .map(EstadoReclamo::getEstado)
                                                        .orElse(EstadoReclamoEnum.INGRESADO);
                                        
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
                
                EstadoReclamoEnum currentStatus = reclamo.getEstados().stream()
                                .max((e1, e2) -> e1.getFechaCreacion().compareTo(e2.getFechaCreacion()))
                                .map(EstadoReclamo::getEstado)
                                .orElse(EstadoReclamoEnum.INGRESADO);
                
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
                                .asesor_email(request.asesor_email())
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

        @Transactional(readOnly = true)
        public PdfExportResponse exportClaimsToPdf() {
                try {
                        List<Reclamo> reclamos = reclamoRepository.findAllWithLastStatus();
                        
                        ByteArrayOutputStream baos = new ByteArrayOutputStream();
                        PdfWriter writer = new PdfWriter(baos);
                        PdfDocument pdfDoc = new PdfDocument(writer);
                        Document document = new Document(pdfDoc);
                        
                        document.add(new Paragraph("Reporte de Reclamos")
                                        .setFontSize(18)
                                        .setTextAlignment(TextAlignment.CENTER));
                        
                        document.add(new Paragraph("Generado el: " + 
                                        LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")))
                                        .setTextAlignment(TextAlignment.CENTER));
                        
                        document.add(new Paragraph(" "));
                        
                        // Define column widths: ID(1), Código(2), Título(3), Cliente ID(1.5), Estado(2), Fecha(2.5)
                        float[] columnWidths = {1f, 2f, 3f, 1.5f, 2f, 2.5f};
                        Table table = new Table(columnWidths);
                        table.setWidth(UnitValue.createPercentValue(100));
                        
                        table.addHeaderCell(new Cell().add(new Paragraph("ID")).setTextAlignment(TextAlignment.CENTER));
                        table.addHeaderCell(new Cell().add(new Paragraph("Código")).setTextAlignment(TextAlignment.CENTER));
                        table.addHeaderCell(new Cell().add(new Paragraph("Título")).setTextAlignment(TextAlignment.CENTER));
                        table.addHeaderCell(new Cell().add(new Paragraph("Cliente ID")).setTextAlignment(TextAlignment.CENTER));
                        table.addHeaderCell(new Cell().add(new Paragraph("Estado")).setTextAlignment(TextAlignment.CENTER));
                        table.addHeaderCell(new Cell().add(new Paragraph("Fecha Creación")).setTextAlignment(TextAlignment.CENTER));
                        
                        for (Reclamo reclamo : reclamos) {
                                EstadoReclamoEnum currentStatus = reclamo.getEstados().stream()
                                                .max((e1, e2) -> e1.getFechaCreacion().compareTo(e2.getFechaCreacion()))
                                                .map(EstadoReclamo::getEstado)
                                                .orElse(EstadoReclamoEnum.INGRESADO);
                                
                                table.addCell(new Cell().add(new Paragraph(String.valueOf(reclamo.getId()))));
                                table.addCell(new Cell().add(new Paragraph(reclamo.getCodigo() != null ? reclamo.getCodigo() : "")));
                                table.addCell(new Cell().add(new Paragraph(reclamo.getTitulo() != null ? reclamo.getTitulo() : "Sin título")));
                                table.addCell(new Cell().add(new Paragraph(String.valueOf(reclamo.getClienteId()))));
                                table.addCell(new Cell().add(new Paragraph(currentStatus.toString())));
                                table.addCell(new Cell().add(new Paragraph(reclamo.getFechaCreacion()
                                                .format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")))));
                        }
                        
                        document.add(table);
                        
                        document.add(new Paragraph(" "));
                        document.add(new Paragraph("Total de reclamos: " + reclamos.size())
                                        .setTextAlignment(TextAlignment.RIGHT));
                        
                        document.close();
                        
                        String base64Content = Base64.getEncoder().encodeToString(baos.toByteArray());
                        String filename = "reclamos_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".pdf";
                        
                        return new PdfExportResponse(base64Content, filename, reclamos.size());
                        
                } catch (Exception e) {
                        throw new RuntimeException("Error generating PDF: " + e.getMessage(), e);
                }
        }
}
