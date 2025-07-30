package com.example.api.enums;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;

class EstadoReclamoEnumTest {

    @Test
    void getDescripcion_ShouldReturnCorrectDescription() {
        assertThat(EstadoReclamoEnum.INGRESADO.getDescripcion()).isEqualTo("Ingresado");
        assertThat(EstadoReclamoEnum.EN_PROCESO.getDescripcion()).isEqualTo("En Proceso");
        assertThat(EstadoReclamoEnum.RESUELTO.getDescripcion()).isEqualTo("Resuelto");
        assertThat(EstadoReclamoEnum.CERRADO.getDescripcion()).isEqualTo("Cerrado");
        assertThat(EstadoReclamoEnum.RECHAZADO.getDescripcion()).isEqualTo("Rechazado");
        assertThat(EstadoReclamoEnum.ESCALADO.getDescripcion()).isEqualTo("Escalado");
        assertThat(EstadoReclamoEnum.PENDIENTE_INFORMACION.getDescripcion()).isEqualTo("Pendiente Información");
    }

    @Test
    void enumValues_ShouldContainAllExpectedStates() {
        EstadoReclamoEnum[] estados = EstadoReclamoEnum.values();
        
        assertThat(estados).hasSize(7);
        assertThat(estados).containsExactly(
                EstadoReclamoEnum.INGRESADO,
                EstadoReclamoEnum.EN_PROCESO,
                EstadoReclamoEnum.RESUELTO,
                EstadoReclamoEnum.CERRADO,
                EstadoReclamoEnum.RECHAZADO,
                EstadoReclamoEnum.ESCALADO,
                EstadoReclamoEnum.PENDIENTE_INFORMACION
        );
    }
}
