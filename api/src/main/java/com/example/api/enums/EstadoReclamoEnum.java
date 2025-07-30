package com.example.api.enums;

/**
 * Enum que representa los diferentes estados que puede tener un reclamo.
 */
public enum EstadoReclamoEnum {
    
    INGRESADO("Ingresado"),
    EN_PROCESO("En Proceso"),
    RESUELTO("Resuelto"),
    CERRADO("Cerrado"),
    RECHAZADO("Rechazado"),
    ESCALADO("Escalado"),
    PENDIENTE_INFORMACION("Pendiente Información");
    
    private final String descripcion;
    
    EstadoReclamoEnum(String descripcion) {
        this.descripcion = descripcion;
    }
    
    public String getDescripcion() {
        return descripcion;
    }
}
=