package com.example.api.entity;

import com.example.api.enums.EstadoReclamoEnum;
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
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoReclamoEnum estado;
    
    @Column(columnDefinition = "TEXT")
    private String notas;
    
    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;
    
    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
    }
}