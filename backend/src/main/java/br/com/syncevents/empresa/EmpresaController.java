package br.com.syncevents.empresa;

import java.util.List;

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
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import br.com.syncevents.auth.UsuarioAutenticado;
import br.com.syncevents.busca.BuscaService;
import br.com.syncevents.busca.EmpresaPublicaResponse;
import br.com.syncevents.busca.EmpresaResumo;
import br.com.syncevents.busca.FiltroBusca;
import br.com.syncevents.common.Pagina;
import br.com.syncevents.empresa.dto.EmpresaPerfilResponse;
import br.com.syncevents.empresa.dto.EmpresaUpdateRequest;
import br.com.syncevents.servico.ServicoService;
import br.com.syncevents.solicitacao.SolicitacaoService;
import br.com.syncevents.solicitacao.dto.DashboardResponse;
import br.com.syncevents.servico.dto.ServicoResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/empresas")
@Tag(name = "Empresas")
public class EmpresaController {

    private final EmpresaService service;
    private final ServicoService servicoService;
    private final BuscaService buscaService;
    private final SolicitacaoService solicitacaoService;

    public EmpresaController(EmpresaService service, ServicoService servicoService, BuscaService buscaService,
            SolicitacaoService solicitacaoService) {
        this.service = service;
        this.servicoService = servicoService;
        this.buscaService = buscaService;
        this.solicitacaoService = solicitacaoService;
    }

    @GetMapping("/me/dashboard")
    @Operation(summary = "Painel da empresa: visualizações, solicitações e taxa de resposta (30 dias)")
    public DashboardResponse dashboard(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        return solicitacaoService.dashboard(usuario);
    }

    @GetMapping
    @Operation(summary = "ID06: busca por nome, serviço ou categoria, com filtros e paginação",
            description = "ordenar = relevancia | nota | preco. A busca ignora acentos e maiúsculas.")
    public Pagina<EmpresaResumo> buscar(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Long categoriaId,
            @RequestParam(required = false) String cidade,
            @RequestParam(required = false) String ordenar,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        return buscaService.buscar(FiltroBusca.de(q, categoriaId, cidade, ordenar, page, size));
    }

    @GetMapping("/recomendadas")
    @Operation(summary = "Início do cliente: empresas recomendadas (mesma cidade primeiro)")
    public List<EmpresaResumo> recomendadas(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        return buscaService.recomendadas(usuario);
    }

    @GetMapping("/{id:\\d+}")
    @Operation(summary = "ID07: perfil público da empresa (registra a visualização quando é um cliente)")
    public EmpresaPublicaResponse perfil(@AuthenticationPrincipal UsuarioAutenticado usuario, @PathVariable Long id) {
        return buscaService.perfil(usuario, id);
    }

    @GetMapping("/me")
    @Operation(summary = "ID04: perfil da própria empresa")
    public EmpresaPerfilResponse meuPerfil(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        return service.meuPerfil(usuario);
    }

    @PutMapping("/me")
    @Operation(summary = "ID04: editar o próprio perfil (nome, contato, cidade, endereço, descrição, categorias)")
    public EmpresaPerfilResponse atualizar(@AuthenticationPrincipal UsuarioAutenticado usuario,
            @Valid @RequestBody EmpresaUpdateRequest req) {
        return service.atualizar(usuario, req);
    }

    @PostMapping(path = "/me/logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Troca a logo")
    public EmpresaPerfilResponse logo(@AuthenticationPrincipal UsuarioAutenticado usuario,
            @RequestParam(name = "arquivo", required = false) MultipartFile arquivo) {
        return service.enviarLogo(usuario, arquivo);
    }

    @PostMapping(path = "/me/capa", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Troca a foto de capa")
    public EmpresaPerfilResponse capa(@AuthenticationPrincipal UsuarioAutenticado usuario,
            @RequestParam(name = "arquivo", required = false) MultipartFile arquivo) {
        return service.enviarCapa(usuario, arquivo);
    }

    @PostMapping(path = "/me/portfolio", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Adiciona uma foto ao portfólio (máx. 12)")
    public EmpresaPerfilResponse adicionarPortfolio(@AuthenticationPrincipal UsuarioAutenticado usuario,
            @RequestParam(name = "arquivo", required = false) MultipartFile arquivo) {
        return service.adicionarPortfolio(usuario, arquivo);
    }

    @DeleteMapping("/me/portfolio/{fotoId}")
    @Operation(summary = "Remove uma foto do portfólio")
    public EmpresaPerfilResponse removerPortfolio(@AuthenticationPrincipal UsuarioAutenticado usuario,
            @PathVariable Long fotoId) {
        return service.removerPortfolio(usuario, fotoId);
    }

    @GetMapping("/{id}/servicos")
    @Operation(summary = "Serviços ativos e publicados de uma empresa")
    public List<ServicoResponse> servicosDaEmpresa(@PathVariable Long id) {
        return servicoService.listarVisiveisDaEmpresa(id);
    }
}
