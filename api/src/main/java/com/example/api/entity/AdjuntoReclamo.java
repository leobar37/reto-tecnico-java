package com.example.api.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Entity
@Table(name = "adjunto_reclamos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdjuntoReclamo {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reclamo_id", nullable = false)
    private Reclamo reclamo;
    
    @Column(name = "nombre_archivo", nullable = false)
    private String nombreArchivo;
    
    @Column(name = "tipo_contenido")
    private String tipoContenido;
    
    @Column(name = "tamano_bytes")
    private Long tamanoBytes;
    
    @Column(name = "url_archivo", nullable = false)
    private String urlArchivo;
    
    @Column(name = "fecha_subida", nullable = false)
    private LocalDateTime fechaSubida;
    
    @PrePersist
    protected void onCreate() {
        fechaSubida = LocalDateTime.now();
    }
}