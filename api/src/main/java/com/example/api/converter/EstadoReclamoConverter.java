package com.example.api.converter;

import com.example.api.enums.EstadoReclamoEnum;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class EstadoReclamoConverter implements AttributeConverter<EstadoReclamoEnum, String> {

    @Override
    public String convertToDatabaseColumn(EstadoReclamoEnum estado) {
        if (estado == null) {
            return null;
        }
        return estado.getDescripcion();
    }

    @Override
    public EstadoReclamoEnum convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty()) {
            return null;
        }
        
        // Try to find by description first
        for (EstadoReclamoEnum estado : EstadoReclamoEnum.values()) {
            if (estado.getDescripcion().equals(dbData)) {
                return estado;
            }
        }
    
        try {
            return EstadoReclamoEnum.valueOf(dbData);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Unknown estado: " + dbData);
        }
    }
}
