package com.example.api.repository;

import com.example.api.entity.EstadoReclamo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EstadoReclamoRepository extends JpaRepository<EstadoReclamo, Long> {
}