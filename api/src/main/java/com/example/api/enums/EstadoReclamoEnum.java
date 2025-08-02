package com.example.api.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

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
    
    @JsonValue
    public String getDescripcion() {
        return descripcion;
    }
    
    @JsonCreator
    public static EstadoReclamoEnum fromValue(String value) {
        // First try to match by description
        for (EstadoReclamoEnum estado : EstadoReclamoEnum.values()) {
            if (estado.descripcion.equals(value)) {
                return estado;
            }
        }
        
        // If not found, try to match by enum name
        try {
            return EstadoReclamoEnum.valueOf(value);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("No enum constant for value: " + value);
        }
    }
}