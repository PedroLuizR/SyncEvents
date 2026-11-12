package br.com.syncevents.servico;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import br.com.syncevents.auth.UsuarioAutenticado;
import br.com.syncevents.categoria.Categoria;
import br.com.syncevents.categoria.CategoriaRepository;
import br.com.syncevents.common.ApiException;
import br.com.syncevents.empresa.Empresa;
import br.com.syncevents.empresa.EmpresaRepository;
import br.com.syncevents.empresa.EmpresaService;
import br.com.syncevents.servico.dto.ServicoRequest;
import br.com.syncevents.storage.StorageService;
import br.com.syncevents.usuario.TipoUsuario;
import br.com.syncevents.usuario.Usuario;

class ServicoServiceTest {

    ServicoRepository repository = mock(ServicoRepository.class);
    CategoriaRepository categorias = mock(CategoriaRepository.class);
    EmpresaRepository empresas = mock(EmpresaRepository.class);
    EmpresaService empresaService = mock(EmpresaService.class);
    StorageService storage = mock(StorageService.class);
    ServicoService service = new ServicoService(repository, categorias, empresas, empresaService, storage);

    Empresa aurora = empresa(1L, 10L);
    Empresa outra = empresa(2L, 20L);
    UsuarioAutenticado donaAurora = new UsuarioAutenticado(10L, "a@a.com", TipoUsuario.EMPRESA);
    UsuarioAutenticado donaOutra = new UsuarioAutenticado(20L, "b@b.com", TipoUsuario.EMPRESA);
    UsuarioAutenticado cliente = new UsuarioAutenticado(30L, "c@c.com", TipoUsuario.CLIENTE);

    static Empresa empresa(long id, long usuarioId) {
        Usuario u = new Usuario("x@x.com", "h", TipoUsuario.EMPRESA);
        ReflectionTestUtils.setField(u, "id", usuarioId);
        Empresa e = new Empresa(u, "123456", "Empresa " + id, "1122233300018" + id, "11987654321", "SP");
        ReflectionTestUtils.setField(e, "id", id);
        return e;
    }

    static ServicoRequest req(String descricao, ModeloPreco modelo, String min, String max, Boolean rascunho) {
        return new ServicoRequest("Decoração completa", 1L, descricao, modelo,
                min == null ? null : new BigDecimal(min), max == null ? null : new BigDecimal(max),
                null, rascunho, List.of("Projeto", " ", "Montagem"));
    }

    Servico servicoDa(Empresa e, long id) {
        Servico s = new Servico(e);
        ReflectionTestUtils.setField(s, "id", id);
        s.setCategoria(new Categoria("Decoração", "star"));
        s.setNome("Serviço");
        s.setModeloPreco(ModeloPreco.SOB_CONSULTA);
        return s;
    }

    @BeforeEach
    void setUp() {
        when(empresaService.daUsuario(donaAurora)).thenReturn(aurora);
        when(empresaService.daUsuario(donaOutra)).thenReturn(outra);
        when(categorias.findById(1L)).thenReturn(Optional.of(new Categoria("Decoração", "star")));
        when(repository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(repository.saveAndFlush(any())).thenAnswer(i -> i.getArgument(0));
    }

    // ---- regras de publicação ----

    @Test
    void rascunhoExigeSoNomeECategoria() {
        assertThat(ServicoService.validarPublicacao(req(null, null, null, null, true), true)).isEmpty();
    }

    @Test
    void publicarExigeDescricaoEModelo() {
        assertThat(ServicoService.validarPublicacao(req(" ", null, null, null, false), false))
                .containsEntry("descricao", "Descreva o serviço")
                .containsEntry("modeloPreco", "Escolha o modelo de preço");
    }

    @Test
    void precoObrigatorioConformeModelo() {
        assertThat(ServicoService.validarPublicacao(req("x", ModeloPreco.A_PARTIR_DE, null, null, false), false))
                .containsOnlyKeys("precoMin");
        assertThat(ServicoService.validarPublicacao(req("x", ModeloPreco.FAIXA, "100", null, false), false))
                .containsOnlyKeys("precoMax");
        assertThat(ServicoService.validarPublicacao(req("x", ModeloPreco.SOB_CONSULTA, null, null, false), false))
                .isEmpty();
    }

    @Test
    void faixaComMaximoMenorQueMinimoERecusadaMesmoEmRascunho() {
        assertThat(ServicoService.validarPublicacao(req(null, ModeloPreco.FAIXA, "500", "100", true), true))
                .containsEntry("precoMax", "O valor máximo deve ser maior ou igual ao mínimo");
    }

    @Test
    void criaNormalizandoPrecosEItens() {
        var resp = service.criar(donaAurora, req("Projeto completo", ModeloPreco.A_PARTIR_DE, "2800", "9999", false));

        assertThat(resp.precoMin()).isEqualByComparingTo("2800");
        assertThat(resp.precoMax()).isNull(); // máximo só vale para FAIXA
        assertThat(resp.itensInclusos()).containsExactly("Projeto", "Montagem");
        assertThat(resp.ativo()).isTrue();
        assertThat(resp.rascunho()).isFalse();
        assertThat(resp.empresaId()).isEqualTo(1L);
    }

    @Test
    void sobConsultaDescartaPrecos() {
        var resp = service.criar(donaAurora, req("x", ModeloPreco.SOB_CONSULTA, "100", "200", false));
        assertThat(resp.precoMin()).isNull();
        assertThat(resp.precoMax()).isNull();
    }

    @Test
    void publicacaoInvalidaRetorna400ComCampos() {
        assertThatThrownBy(() -> service.criar(donaAurora, req(null, ModeloPreco.FIXO, null, null, false)))
                .isInstanceOfSatisfying(ApiException.class, e -> {
                    assertThat(e.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
                    assertThat(e.getCampos()).containsKeys("descricao", "precoMin");
                });
        verify(repository, never()).save(any());
    }

    // ---- posse ----

    @Test
    void outraEmpresaNaoEdita() {
        when(repository.buscarComDetalhes(5L)).thenReturn(Optional.of(servicoDa(aurora, 5L)));
        assertThatThrownBy(() -> service.atualizar(donaOutra, 5L, req("x", ModeloPreco.SOB_CONSULTA, null, null, false)))
                .isInstanceOfSatisfying(ApiException.class,
                        e -> assertThat(e.getStatus()).isEqualTo(HttpStatus.FORBIDDEN));
    }

    @Test
    void outraEmpresaNaoExclui() {
        when(repository.buscarComDetalhes(5L)).thenReturn(Optional.of(servicoDa(aurora, 5L)));
        assertThatThrownBy(() -> service.excluir(donaOutra, 5L))
                .isInstanceOfSatisfying(ApiException.class,
                        e -> assertThat(e.getStatus()).isEqualTo(HttpStatus.FORBIDDEN));
        verify(repository, never()).delete(any());
    }

    @Test
    void servicoInexistenteRetorna404() {
        when(repository.buscarComDetalhes(9L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.excluir(donaAurora, 9L))
                .isInstanceOfSatisfying(ApiException.class,
                        e -> assertThat(e.getStatus()).isEqualTo(HttpStatus.NOT_FOUND));
    }

    @Test
    void excluirRemoveAsFotosDoDisco() {
        Servico s = servicoDa(aurora, 5L);
        s.adicionarFoto("/files/servicos/a.jpg");
        when(repository.buscarComDetalhes(5L)).thenReturn(Optional.of(s));
        service.excluir(donaAurora, 5L);
        verify(repository).delete(s);
        verify(storage).remover("/files/servicos/a.jpg");
    }

    @Test
    void rascunhoEInativoSoAparecemParaADona() {
        Servico s = servicoDa(aurora, 5L);
        s.setRascunho(true);
        when(repository.buscarComDetalhes(5L)).thenReturn(Optional.of(s));

        assertThat(service.buscar(donaAurora, 5L).rascunho()).isTrue();
        assertThatThrownBy(() -> service.buscar(cliente, 5L)).isInstanceOf(ApiException.class);
        assertThatThrownBy(() -> service.buscar(donaOutra, 5L)).isInstanceOf(ApiException.class);
    }

    @Test
    void limiteDeSeisFotos() {
        Servico s = servicoDa(aurora, 5L);
        for (int i = 0; i < 6; i++) {
            s.adicionarFoto("/files/servicos/" + i + ".jpg");
        }
        when(repository.buscarComDetalhes(5L)).thenReturn(Optional.of(s));
        var foto = new MockMultipartFile("arquivo", "f.jpg", "image/jpeg", new byte[] {1});
        assertThatThrownBy(() -> service.adicionarFoto(donaAurora, 5L, foto))
                .isInstanceOfSatisfying(ApiException.class,
                        e -> assertThat(e.getCampos()).containsEntry("fotos", "No máximo 6 fotos por serviço"));
    }
}
