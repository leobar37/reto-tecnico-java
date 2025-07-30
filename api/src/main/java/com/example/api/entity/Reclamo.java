package com.example.api.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "reclamos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reclamo {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String codigo;
    
    @Column(nullable = false)
    private String titulo;
    
    @Column(columnDefinition = "TEXT")
    private String descripcion;
    
    @Column(name = "cliente_id", nullable = false)
    private Long clienteId;
    
    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;
    
    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;
    
    @OneToMany(mappedBy = "reclamo", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<EstadoReclamo> estados;
    
    @OneToMany(mappedBy = "reclamo", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<AdjuntoReclamo> adjuntos;
    
    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
        fechaActualizacion = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        fechaActualizacion = LocalDateTime.now();
    }
}