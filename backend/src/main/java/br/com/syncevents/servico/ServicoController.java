package br.com.syncevents.servico;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import br.com.syncevents.auth.UsuarioAutenticado;
import br.com.syncevents.servico.dto.ServicoRequest;
import br.com.syncevents.servico.dto.ServicoResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/servicos")
@Tag(name = "Serviços")
public class ServicoController {

    private final ServicoService service;

    public ServicoController(ServicoService service) {
        this.service = service;
    }

    @GetMapping("/me")
    @Operation(summary = "ID05: serviços da empresa logada (inclui inativos e rascunhos)")
    public List<ServicoResponse> meus(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        return service.listarMeus(usuario);
    }

    @PostMapping("/me")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "ID05: cria um serviço (rascunho exige só nome e categoria)")
    public ServicoResponse criar(@AuthenticationPrincipal UsuarioAutenticado usuario,
            @Valid @RequestBody ServicoRequest req) {
        return service.criar(usuario, req);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detalhe do serviço (a dona vê também inativos e rascunhos)")
    public ServicoResponse buscar(@AuthenticationPrincipal UsuarioAutenticado usuario, @PathVariable Long id) {
        return service.buscar(usuario, id);
    }

    @PutMapping("/{id}")
    @Operation(summary = "ID05: edita o serviço (só a dona)")
    public ServicoResponse atualizar(@AuthenticationPrincipal UsuarioAutenticado usuario, @PathVariable Long id,
            @Valid @RequestBody ServicoRequest req) {
        return service.atualizar(usuario, id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "ID05: remove o serviço (só a dona)")
    public void excluir(@AuthenticationPrincipal UsuarioAutenticado usuario, @PathVariable Long id) {
        service.excluir(usuario, id);
    }

    @PostMapping(path = "/{id}/fotos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Adiciona uma foto ao serviço (máx. 6)")
    public ServicoResponse adicionarFoto(@AuthenticationPrincipal UsuarioAutenticado usuario, @PathVariable Long id,
            @RequestParam(name = "arquivo", required = false) MultipartFile arquivo) {
        return service.adicionarFoto(usuario, id, arquivo);
    }

    @DeleteMapping("/{id}/fotos/{fotoId}")
    @Operation(summary = "Remove uma foto do serviço")
    public ServicoResponse removerFoto(@AuthenticationPrincipal UsuarioAutenticado usuario, @PathVariable Long id,
            @PathVariable Long fotoId) {
        return service.removerFoto(usuario, id, fotoId);
    }
}
