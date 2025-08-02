package com.example.api.entity;

import com.example.api.enums.EstadoReclamoEnum;
import com.example.api.converter.EstadoReclamoConverter;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Entity
@Table(name = "estado_reclamos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EstadoReclamo {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reclamo_id", nullable = false)
    private Reclamo reclamo;
    
    @Convert(converter = EstadoReclamoConverter.class)
    @Column(nullable = false)
    private EstadoReclamoEnum estado;
    
    @Column(columnDefinition = "TEXT")
    private String notas;

    @Column(columnDefinition = "TEXT")
    private String asesor_email;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;


    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
    }
}