package br.com.syncevents.empresa;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Iterator;
import java.util.List;

import org.junit.jupiter.api.Test;

class CodigoEmpresaGeneratorTest {

    EmpresaRepository repository = mock(EmpresaRepository.class);

    @Test
    void geraSeisDigitosComZerosAEsquerda() {
        when(repository.existsByCodigo(anyString())).thenReturn(false);
        var gerador = new CodigoEmpresaGenerator(repository, () -> 42);
        assertThat(gerador.gerar()).isEqualTo("000042");
    }

    @Test
    void tentaDeNovoQuandoCodigoJaExiste() {
        when(repository.existsByCodigo("123456")).thenReturn(true);
        when(repository.existsByCodigo("654321")).thenReturn(false);
        Iterator<Integer> valores = List.of(123456, 654321).iterator();
        var gerador = new CodigoEmpresaGenerator(repository, valores::next);
        assertThat(gerador.gerar()).isEqualTo("654321");
    }

    @Test
    void falhaDepoisDoLimiteDeTentativas() {
        when(repository.existsByCodigo(anyString())).thenReturn(true);
        var gerador = new CodigoEmpresaGenerator(repository, () -> 1);
        assertThatThrownBy(gerador::gerar).isInstanceOf(IllegalStateException.class);
    }

    @Test
    void geradorPadraoSempreProduzSeisDigitos() {
        when(repository.existsByCodigo(anyString())).thenReturn(false);
        var gerador = new CodigoEmpresaGenerator(repository);
        for (int i = 0; i < 200; i++) {
            assertThat(gerador.gerar()).matches("\\d{6}");
        }
    }
}
