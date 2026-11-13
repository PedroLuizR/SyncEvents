package br.com.syncevents.avaliacao;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.syncevents.auth.UsuarioAutenticado;
import br.com.syncevents.avaliacao.dto.AvaliacaoRequest;
import br.com.syncevents.avaliacao.dto.AvaliacaoResponse;
import br.com.syncevents.avaliacao.dto.AvaliacoesEmpresaResponse;
import br.com.syncevents.avaliacao.dto.ResumoAvaliacoes;
import br.com.syncevents.cliente.ClienteRepository;
import br.com.syncevents.common.ApiException;
import br.com.syncevents.common.Pagina;
import br.com.syncevents.common.Textos;
import br.com.syncevents.empresa.EmpresaRepository;
import br.com.syncevents.solicitacao.Solicitacao;
import br.com.syncevents.solicitacao.SolicitacaoRepository;
import br.com.syncevents.solicitacao.StatusSolicitacao;
import br.com.syncevents.usuario.TipoUsuario;

@Service
public class AvaliacaoService {

    static final int TAMANHO_MAXIMO = 50;

    private final AvaliacaoRepository repository;
    private final SolicitacaoRepository solicitacaoRepository;
    private final ClienteRepository clienteRepository;
    private final EmpresaRepository empresaRepository;

    public AvaliacaoService(AvaliacaoRepository repository, SolicitacaoRepository solicitacaoRepository,
            ClienteRepository clienteRepository, EmpresaRepository empresaRepository) {
        this.repository = repository;
        this.solicitacaoRepository = solicitacaoRepository;
        this.clienteRepository = clienteRepository;
        this.empresaRepository = empresaRepository;
    }

    /** ID11: só o cliente da solicitação, só se CONCLUIDA, uma avaliação por solicitação. */
    @Transactional
    public AvaliacaoResponse avaliar(UsuarioAutenticado usuario, AvaliacaoRequest req) {
        if (usuario == null || usuario.tipo() != TipoUsuario.CLIENTE) {
            throw ApiException.acessoNegado("Disponível apenas para clientes");
        }
        Long clienteId = clienteRepository.findByUsuarioId(usuario.id())
                .orElseThrow(() -> ApiException.acessoNegado("Disponível apenas para clientes")).getId();
        Solicitacao s = solicitacaoRepository.buscarComDetalhes(req.solicitacaoId())
                .orElseThrow(() -> ApiException.naoEncontrado("Solicitação não encontrada"));
        if (!s.getCliente().getId().equals(clienteId)) {
            throw ApiException.acessoNegado("Você não participa desta solicitação");
        }
        if (s.getStatus() != StatusSolicitacao.CONCLUIDA) {
            throw ApiException.conflito("Só é possível avaliar depois que o evento for concluído");
        }
        if (repository.existsBySolicitacaoId(s.getId())) {
            throw ApiException.conflito("Você já avaliou este evento");
        }
        String[] destaques = req.destaques() == null ? new String[0]
                : new HashSet<>(req.destaques()).stream().map(Enum::name).sorted().toArray(String[]::new);
        Avaliacao a = repository.save(new Avaliacao(s, req.nota(), Textos.vazioParaNulo(req.comentario()), destaques));
        return AvaliacaoResponse.de(a);
    }

    @Transactional(readOnly = true)
    public AvaliacoesEmpresaResponse daEmpresa(Long empresaId, Integer pagina, Integer tamanho) {
        if (!empresaRepository.existsById(empresaId)) {
            throw ApiException.naoEncontrado("Empresa não encontrada");
        }
        int p = pagina == null || pagina < 0 ? 0 : pagina;
        int t = tamanho == null || tamanho < 1 ? 10 : Math.min(tamanho, TAMANHO_MAXIMO);
        Page<Avaliacao> page = repository.findByEmpresaIdOrderByCriadoEmDescIdDesc(empresaId, PageRequest.of(p, t));
        return new AvaliacoesEmpresaResponse(resumo(empresaId),
                Pagina.de(page.getContent().stream().map(AvaliacaoResponse::de).toList(), p, t, page.getTotalElements()));
    }

    @Transactional(readOnly = true)
    public ResumoAvaliacoes resumo(Long empresaId) {
        Object[] r = repository.resumo(empresaId).get(0);
        long total = r[1] == null ? 0 : ((Number) r[1]).longValue();
        if (total == 0) {
            return new ResumoAvaliacoes(null, 0, null);
        }
        BigDecimal media = BigDecimal.valueOf(((Number) r[0]).doubleValue()).setScale(1, RoundingMode.HALF_UP);
        long boas = r[2] == null ? 0 : ((Number) r[2]).longValue();
        return new ResumoAvaliacoes(media, total, (int) Math.round(boas * 100.0 / total));
    }

    /** Quais destas solicitações já têm avaliação (para o app mostrar o botão "Avaliar"). */
    @Transactional(readOnly = true)
    public Set<Long> avaliadas(Collection<Long> solicitacaoIds) {
        return solicitacaoIds.isEmpty() ? Set.of() : new HashSet<>(repository.solicitacoesAvaliadas(solicitacaoIds));
    }

}
