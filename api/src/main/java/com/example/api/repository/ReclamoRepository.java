package com.example.api.repository;

import com.example.api.entity.Reclamo;
import com.example.api.enums.EstadoReclamoEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReclamoRepository extends JpaRepository<Reclamo, Long> {
    
    /**
     * Consulta optimizada para obtener todos los reclamos con su último estado
     */
    @Query("SELECT r FROM Reclamo r " +
           "LEFT JOIN FETCH r.estados e " +
           "WHERE e.fechaCreacion = (" +
           "    SELECT MAX(e2.fechaCreacion) " +
           "    FROM EstadoReclamo e2 " +
           "    WHERE e2.reclamo.id = r.id" +
           ") OR e IS NULL " +
           "ORDER BY r.fechaCreacion DESC")
    List<Reclamo> findAllWithLastStatus();
    
    /**
     * Busca un reclamo por su código único
     */
    Optional<Reclamo> findByCodigo(String codigo);
    
    /**
     * Verifica si existe un reclamo con el código dado
     */
    boolean existsByCodigo(String codigo);
    
    /**
     * Busca reclamos que tienen un estado específico como último estado
     */
    @Query("SELECT r FROM Reclamo r " +
           "JOIN r.estados e " +
           "WHERE e.estado = :estado " +
           "AND e.fechaCreacion = (" +
           "    SELECT MAX(e2.fechaCreacion) " +
           "    FROM EstadoReclamo e2 " +
           "    WHERE e2.reclamo.id = r.id" +
           ") " +
           "ORDER BY r.fechaCreacion DESC")
    List<Reclamo> findByCurrentStatus(@Param("estado") EstadoReclamoEnum estado);
}