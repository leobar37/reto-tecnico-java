package com.example.api.repository;

import com.example.api.entity.Reclamo;
import com.example.api.entity.EstadoReclamo;
import com.example.api.enums.EstadoReclamoEnum;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class ReclamoRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ReclamoRepository reclamoRepository;

    @Autowired
    private EstadoReclamoRepository estadoReclamoRepository;

    private Reclamo reclamo1;
    private Reclamo reclamo2;

    @BeforeEach
    void setUp() {
        reclamo1 = Reclamo.builder()
                .codigo("CLM-TEST001")
                .titulo("Test Claim 1")
                .descripcion("Description for test claim 1")
                .clienteId(123L)
                .build();

        reclamo2 = Reclamo.builder()
                .codigo("CLM-TEST002")
                .titulo("Test Claim 2")
                .descripcion("Description for test claim 2")
                .clienteId(456L)
                .build();
    }

    @Test
    void save_ShouldPersistReclamo() {
        Reclamo savedReclamo = reclamoRepository.save(reclamo1);

        assertThat(savedReclamo.getId()).isNotNull();
        assertThat(savedReclamo.getCodigo()).isEqualTo("CLM-TEST001");
        assertThat(savedReclamo.getTitulo()).isEqualTo("Test Claim 1");
        assertThat(savedReclamo.getFechaCreacion()).isNotNull();
        assertThat(savedReclamo.getFechaActualizacion()).isNotNull();
    }

    @Test
    void findById_ExistingReclamo_ShouldReturnReclamo() {
        Reclamo savedReclamo = entityManager.persistAndFlush(reclamo1);

        Optional<Reclamo> foundReclamo = reclamoRepository.findById(savedReclamo.getId());

        assertThat(foundReclamo).isPresent();
        assertThat(foundReclamo.get().getCodigo()).isEqualTo("CLM-TEST001");
    }

    @Test
    void findById_NonExistingReclamo_ShouldReturnEmpty() {
        Optional<Reclamo> foundReclamo = reclamoRepository.findById(999L);

        assertThat(foundReclamo).isEmpty();
    }

    @Test
    void findAll_ShouldReturnAllReclamos() {
        entityManager.persist(reclamo1);
        entityManager.persist(reclamo2);
        entityManager.flush();

        List<Reclamo> allReclamos = reclamoRepository.findAll();

        assertThat(allReclamos).hasSize(2);
        assertThat(allReclamos).extracting(Reclamo::getCodigo)
                .containsExactlyInAnyOrder("CLM-TEST001", "CLM-TEST002");
    }

    @Test
    void findAllWithLastStatus_WithoutStatus_ShouldReturnReclamos() {
        Reclamo savedReclamo1 = entityManager.persist(reclamo1);
        Reclamo savedReclamo2 = entityManager.persist(reclamo2);
        entityManager.flush();

        List<Reclamo> reclamosWithStatus = reclamoRepository.findAllWithLastStatus();

        assertThat(reclamosWithStatus).hasSize(2);
        assertThat(reclamosWithStatus).extracting(Reclamo::getCodigo)
                .containsExactlyInAnyOrder("CLM-TEST001", "CLM-TEST002");
    }

    @Test
    void findAllWithLastStatus_WithStatuses_ShouldReturnReclamosWithLatestStatus() {
        Reclamo savedReclamo1 = entityManager.persist(reclamo1);
        entityManager.flush();

        EstadoReclamo status1 = EstadoReclamo.builder()
                .reclamo(savedReclamo1)
                .estado(EstadoReclamoEnum.INGRESADO)
                .notas("Initial status")
                .build();
        entityManager.persist(status1);

        EstadoReclamo status2 = EstadoReclamo.builder()
                .reclamo(savedReclamo1)
                .estado(EstadoReclamoEnum.EN_PROCESO)
                .notas("Updated status")
                .build();
        entityManager.persist(status2);
        entityManager.flush();

        List<Reclamo> reclamosWithStatus = reclamoRepository.findAllWithLastStatus();

        assertThat(reclamosWithStatus).hasSize(1);
        Reclamo reclamoWithStatus = reclamosWithStatus.get(0);
        assertThat(reclamoWithStatus).isNotNull();
        assertThat(reclamoWithStatus.getCodigo()).isEqualTo("CLM-TEST001");
    }

    @Test
    void findByCurrentStatus_ShouldReturnReclamosWithSpecificStatus() {
        Reclamo savedReclamo1 = entityManager.persist(reclamo1);
        Reclamo savedReclamo2 = entityManager.persist(reclamo2);
        entityManager.flush();

        EstadoReclamo status1 = EstadoReclamo.builder()
                .reclamo(savedReclamo1)
                .estado(EstadoReclamoEnum.INGRESADO)
                .notas("Initial status")
                .build();
        entityManager.persist(status1);

        EstadoReclamo status2 = EstadoReclamo.builder()
                .reclamo(savedReclamo2)
                .estado(EstadoReclamoEnum.EN_PROCESO)
                .notas("In progress")
                .build();
        entityManager.persist(status2);
        entityManager.flush();

        List<Reclamo> reclamosEnProceso = reclamoRepository.findByCurrentStatus(EstadoReclamoEnum.EN_PROCESO);

        assertThat(reclamosEnProceso).hasSize(1);
        assertThat(reclamosEnProceso.get(0).getCodigo()).isEqualTo("CLM-TEST002");
    }

    @Test
    void delete_ShouldRemoveReclamo() {
        Reclamo savedReclamo = entityManager.persistAndFlush(reclamo1);
        Long reclamoId = savedReclamo.getId();

        reclamoRepository.delete(savedReclamo);
        entityManager.flush();

        Optional<Reclamo> deletedReclamo = reclamoRepository.findById(reclamoId);
        assertThat(deletedReclamo).isEmpty();
    }

    @Test
    void existsById_ExistingReclamo_ShouldReturnTrue() {
        entityManager.persistAndFlush(reclamo1);

        boolean exists = reclamoRepository.existsById(reclamo1.getId());

        assertThat(exists).isTrue();
    }

    @Test
    void count_ShouldReturnCorrectCount() {
        entityManager.persist(reclamo1);
        entityManager.persist(reclamo2);
        entityManager.flush();

        long count = reclamoRepository.count();

        assertThat(count).isEqualTo(2);
    }
}