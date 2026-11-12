package br.com.syncevents.empresa;

import java.security.SecureRandom;
import java.util.function.IntSupplier;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/** Gera o código público de 6 dígitos da empresa, garantindo que seja único. */
@Component
public class CodigoEmpresaGenerator {

    static final int MAX_TENTATIVAS = 20;

    private final EmpresaRepository repository;
    private final IntSupplier aleatorio;

    @Autowired
    public CodigoEmpresaGenerator(EmpresaRepository repository) {
        this(repository, new SecureRandom()::nextInt);
    }

    CodigoEmpresaGenerator(EmpresaRepository repository, IntSupplier aleatorio) {
        this.repository = repository;
        this.aleatorio = aleatorio;
    }

    public String gerar() {
        for (int i = 0; i < MAX_TENTATIVAS; i++) {
            String codigo = "%06d".formatted(Math.floorMod(aleatorio.getAsInt(), 1_000_000));
            if (!repository.existsByCodigo(codigo)) {
                return codigo;
            }
        }
        throw new IllegalStateException("Não foi possível gerar um código único para a empresa");
    }
}
