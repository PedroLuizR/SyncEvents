package br.com.syncevents.avaliacao;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import br.com.syncevents.auth.UsuarioAutenticado;
import br.com.syncevents.avaliacao.dto.AvaliacaoRequest;
import br.com.syncevents.avaliacao.dto.AvaliacaoResponse;
import br.com.syncevents.avaliacao.dto.AvaliacoesEmpresaResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Avaliações")
public class AvaliacaoController {

    private final AvaliacaoService service;

    public AvaliacaoController(AvaliacaoService service) {
        this.service = service;
    }

    @PostMapping("/avaliacoes")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "ID11: cliente avalia um evento concluído (uma vez por solicitação)")
    public AvaliacaoResponse avaliar(@AuthenticationPrincipal UsuarioAutenticado usuario,
            @Valid @RequestBody AvaliacaoRequest req) {
        return service.avaliar(usuario, req);
    }

    @GetMapping("/empresas/{id}/avaliacoes")
    @Operation(summary = "Avaliações da empresa (mais recentes primeiro) + média, total e % que recomendam")
    public AvaliacoesEmpresaResponse daEmpresa(@PathVariable Long id, @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        return service.daEmpresa(id, page, size);
    }
}
