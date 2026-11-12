package br.com.syncevents.solicitacao;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import br.com.syncevents.auth.UsuarioAutenticado;
import br.com.syncevents.solicitacao.dto.PropostaRequest;
import br.com.syncevents.solicitacao.dto.RespostaPropostaRequest;
import br.com.syncevents.solicitacao.dto.SolicitacaoRequest;
import br.com.syncevents.solicitacao.dto.SolicitacaoResponse;
import br.com.syncevents.solicitacao.dto.StatusRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Solicitações de orçamento")
public class SolicitacaoController {

    private final SolicitacaoService service;

    public SolicitacaoController(SolicitacaoService service) {
        this.service = service;
    }

    @PostMapping("/solicitacoes")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "ID08: cliente pede orçamento (cria também a conversa)")
    public SolicitacaoResponse criar(@AuthenticationPrincipal UsuarioAutenticado usuario,
            @Valid @RequestBody SolicitacaoRequest req) {
        return service.criar(usuario, req);
    }

    @PostMapping(path = "/solicitacoes/{id}/anexos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Cliente anexa imagem de inspiração (máx. 5)")
    public SolicitacaoResponse anexo(@AuthenticationPrincipal UsuarioAutenticado usuario, @PathVariable Long id,
            @RequestParam(name = "arquivo", required = false) MultipartFile arquivo) {
        return service.adicionarAnexo(usuario, id, arquivo);
    }

    @GetMapping("/solicitacoes/me")
    @Operation(summary = "Cliente: suas solicitações. Empresa: recebidas (ID10). status=PENDENTE,EM_ANALISE...")
    public List<SolicitacaoResponse> minhas(@AuthenticationPrincipal UsuarioAutenticado usuario,
            @RequestParam(required = false) String status) {
        return service.listarMinhas(usuario, status);
    }

    @GetMapping("/solicitacoes/{id}")
    @Operation(summary = "Detalhe (só cliente e empresa envolvidos)")
    public SolicitacaoResponse buscar(@AuthenticationPrincipal UsuarioAutenticado usuario, @PathVariable Long id) {
        return service.buscar(usuario, id);
    }

    @PatchMapping("/solicitacoes/{id}/status")
    @Operation(summary = "ID10: empresa muda o status (EM_ANALISE, RECUSADA, CONCLUIDA); 409 se a transição é inválida")
    public SolicitacaoResponse status(@AuthenticationPrincipal UsuarioAutenticado usuario, @PathVariable Long id,
            @Valid @RequestBody StatusRequest req) {
        return service.mudarStatus(usuario, id, req.status());
    }

    @PostMapping("/solicitacoes/{id}/propostas")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Empresa envia proposta (status vai para EM_NEGOCIACAO)")
    public SolicitacaoResponse proposta(@AuthenticationPrincipal UsuarioAutenticado usuario, @PathVariable Long id,
            @Valid @RequestBody PropostaRequest req) {
        return service.enviarProposta(usuario, id, req);
    }

    @PatchMapping("/propostas/{id}")
    @Operation(summary = "Cliente aceita ou recusa a proposta")
    public SolicitacaoResponse responder(@AuthenticationPrincipal UsuarioAutenticado usuario, @PathVariable Long id,
            @Valid @RequestBody RespostaPropostaRequest req) {
        return service.responderProposta(usuario, id, req.status());
    }

    @PatchMapping("/solicitacoes/{id}/cancelar")
    @Operation(summary = "Cliente cancela (antes de aceitar uma proposta)")
    public SolicitacaoResponse cancelar(@AuthenticationPrincipal UsuarioAutenticado usuario, @PathVariable Long id) {
        return service.cancelar(usuario, id);
    }
}
