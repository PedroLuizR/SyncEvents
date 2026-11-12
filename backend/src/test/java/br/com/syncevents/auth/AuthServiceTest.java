package br.com.syncevents.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import br.com.syncevents.auth.dto.CadastroClienteRequest;
import br.com.syncevents.auth.dto.CadastroEmpresaRequest;
import br.com.syncevents.auth.dto.LoginRequest;
import br.com.syncevents.categoria.Categoria;
import br.com.syncevents.categoria.CategoriaRepository;
import br.com.syncevents.cliente.Cliente;
import br.com.syncevents.cliente.ClienteRepository;
import br.com.syncevents.common.ApiException;
import br.com.syncevents.common.TipoEvento;
import br.com.syncevents.empresa.CodigoEmpresaGenerator;
import br.com.syncevents.empresa.Empresa;
import br.com.syncevents.empresa.EmpresaRepository;
import br.com.syncevents.storage.StorageService;
import br.com.syncevents.usuario.TipoUsuario;
import br.com.syncevents.usuario.Usuario;
import br.com.syncevents.usuario.UsuarioRepository;

class AuthServiceTest {

    UsuarioRepository usuarios = mock(UsuarioRepository.class);
    ClienteRepository clientes = mock(ClienteRepository.class);
    EmpresaRepository empresas = mock(EmpresaRepository.class);
    CategoriaRepository categorias = mock(CategoriaRepository.class);
    CodigoEmpresaGenerator codigo = mock(CodigoEmpresaGenerator.class);
    PasswordEncoder encoder = mock(PasswordEncoder.class);
    JwtService jwt = mock(JwtService.class);
    StorageService storage = mock(StorageService.class);

    AuthService service;

    @BeforeEach
    void setUp() {
        service = new AuthService(usuarios, clientes, empresas, categorias, codigo, encoder, jwt, storage);
        when(encoder.encode(anyString())).thenAnswer(i -> "hash:" + i.getArgument(0));
        when(encoder.matches(anyString(), anyString()))
                .thenAnswer(i -> ("hash:" + i.getArgument(0)).equals(i.getArgument(1)));
        when(usuarios.save(any())).thenAnswer(i -> comId(i.getArgument(0), 10L));
        when(clientes.save(any())).thenAnswer(i -> comId(i.getArgument(0), 20L));
        when(empresas.save(any())).thenAnswer(i -> comId(i.getArgument(0), 30L));
        when(jwt.gerar(any())).thenReturn("token-jwt");
        when(codigo.gerar()).thenReturn("123456");
    }

    static <T> T comId(T entidade, long id) {
        ReflectionTestUtils.setField(entidade, "id", id);
        return entidade;
    }

    static CadastroClienteRequest cliente(String email) {
        return new CadastroClienteRequest("  Marina   Alves ", email, "(11) 98765-4321", "São Paulo, SP", "Senha@123",
                List.of(TipoEvento.CASAMENTO, TipoEvento.ANIVERSARIO), true, " ", null);
    }

    static CadastroEmpresaRequest empresa(String email, String cnpj, List<Long> categorias) {
        return new CadastroEmpresaRequest("Ateliê Aurora", cnpj, email, "(11) 3456-7890", "São Paulo, SP",
                categorias, "Decoração autoral", "", "Senha@123", true, null);
    }

    @Test
    void cadastraClienteNormalizandoDados() {
        var resp = service.cadastrarCliente(cliente(" Marina@Email.COM "));

        assertThat(resp.email()).isEqualTo("marina@email.com");
        assertThat(resp.nome()).isEqualTo("Marina Alves");
        assertThat(resp.telefone()).isEqualTo("11987654321");
        assertThat(resp.tipo()).isEqualTo(TipoUsuario.CLIENTE);
        assertThat(resp.perfilId()).isEqualTo(20L);
        assertThat(resp.interesses()).containsExactly(TipoEvento.CASAMENTO, TipoEvento.ANIVERSARIO);
        assertThat(resp.fotoUrl()).isNull();
        verify(storage, never()).salvarImagem(any(), anyString());
    }

    @Test
    void cadastraClienteComFotoECpfOpcionais() {
        when(storage.salvarImagem(any(), anyString())).thenReturn("/files/clientes/x.jpg");
        var foto = new MockMultipartFile("foto", "f.jpg", "image/jpeg", new byte[] {1, 2});
        var req = new CadastroClienteRequest("Marina Alves", "m@e.com", "11987654321", "Recife", "Senha@123",
                null, true, "123.456.789-00", foto);

        var resp = service.cadastrarCliente(req);

        assertThat(resp.fotoUrl()).isEqualTo("/files/clientes/x.jpg");
        assertThat(resp.interesses()).isEmpty();
    }

    @Test
    void recusaEmailDuplicado() {
        when(usuarios.existsByEmail("marina@email.com")).thenReturn(true);

        assertThatThrownBy(() -> service.cadastrarCliente(cliente("marina@email.com")))
                .isInstanceOfSatisfying(ApiException.class, e -> {
                    assertThat(e.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
                    assertThat(e.getCampos()).containsEntry("email", "E-mail já cadastrado");
                });
        verify(usuarios, never()).save(any());
    }

    @Test
    void cadastraEmpresaComCodigoECategorias() {
        when(categorias.findAllById(Set.of(1L, 2L)))
                .thenReturn(List.of(comId(new Categoria("Decoração", "star"), 1L), comId(new Categoria("Buffet", "coffee"), 2L)));

        var resp = service.cadastrarEmpresa(empresa("contato@aurora.com", "11.222.333/0001-81", List.of(1L, 2L, 2L)));

        assertThat(resp.codigo()).isEqualTo("123456");
        assertThat(resp.nome()).isEqualTo("Ateliê Aurora");
        assertThat(resp.categorias()).extracting("nome").containsExactly("Decoração", "Buffet");
        assertThat(resp.telefone()).isEqualTo("1134567890");
    }

    @Test
    void recusaCnpjDuplicado() {
        when(empresas.existsByCnpj("11222333000181")).thenReturn(true);
        assertThatThrownBy(() -> service.cadastrarEmpresa(empresa("a@b.com", "11.222.333/0001-81", List.of(1L))))
                .isInstanceOfSatisfying(ApiException.class,
                        e -> assertThat(e.getCampos()).containsEntry("cnpj", "CNPJ já cadastrado"));
    }

    @Test
    void recusaCategoriaInexistente() {
        when(categorias.findAllById(Set.of(99L))).thenReturn(List.of());
        assertThatThrownBy(() -> service.cadastrarEmpresa(empresa("a@b.com", "11222333000181", List.of(99L))))
                .isInstanceOfSatisfying(ApiException.class,
                        e -> assertThat(e.getCampos()).containsKey("categoriaIds"));
    }

    private Usuario usuarioSalvo(String email, TipoUsuario tipo) {
        return comId(new Usuario(email, "hash:Senha@123", tipo), 10L);
    }

    @Test
    void loginDeClienteRetornaToken() {
        Usuario u = usuarioSalvo("m@e.com", TipoUsuario.CLIENTE);
        when(usuarios.findByEmail("m@e.com")).thenReturn(Optional.of(u));
        when(clientes.findByUsuarioId(10L)).thenReturn(Optional.of(comId(new Cliente(u, "Marina", "11987654321", "SP"), 20L)));

        var resp = service.login(new LoginRequest(" m@e.com ", "Senha@123", TipoUsuario.CLIENTE));

        assertThat(resp.token()).isEqualTo("token-jwt");
        assertThat(resp.usuario().nome()).isEqualTo("Marina");
    }

    @Test
    void loginDeEmpresaPorCnpj() {
        Usuario u = usuarioSalvo("contato@aurora.com", TipoUsuario.EMPRESA);
        Empresa e = comId(new Empresa(u, "123456", "Aurora", "11222333000181", "1134567890", "SP"), 30L);
        when(empresas.findByCnpj("11222333000181")).thenReturn(Optional.of(e));
        when(empresas.findByUsuarioId(10L)).thenReturn(Optional.of(e));

        var resp = service.login(new LoginRequest("11.222.333/0001-81", "Senha@123", TipoUsuario.EMPRESA));

        assertThat(resp.usuario().codigo()).isEqualTo("123456");
    }

    @Test
    void loginComSenhaErradaRetorna401() {
        when(usuarios.findByEmail("m@e.com")).thenReturn(Optional.of(usuarioSalvo("m@e.com", TipoUsuario.CLIENTE)));
        assertThatThrownBy(() -> service.login(new LoginRequest("m@e.com", "Errada@123", TipoUsuario.CLIENTE)))
                .isInstanceOfSatisfying(ApiException.class, e -> {
                    assertThat(e.getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED);
                    assertThat(e.getMessage()).isEqualTo("E-mail ou senha incorretos");
                });
    }

    @Test
    void loginComUsuarioInexistenteTemAMesmaMensagem() {
        when(usuarios.findByEmail(anyString())).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.login(new LoginRequest("x@e.com", "Senha@123", TipoUsuario.CLIENTE)))
                .hasMessage("E-mail ou senha incorretos");
    }

    @Test
    void loginNaAbaErradaOrientaOUsuario() {
        when(usuarios.findByEmail("m@e.com")).thenReturn(Optional.of(usuarioSalvo("m@e.com", TipoUsuario.CLIENTE)));
        assertThatThrownBy(() -> service.login(new LoginRequest("m@e.com", "Senha@123", TipoUsuario.EMPRESA)))
                .hasMessage("Esta conta é de cliente. Entre pela aba Cliente.");
    }

    @Test
    void extraiUfDaCidade() {
        assertThat(AuthService.extrairUf("São Paulo, SP")).isEqualTo("SP");
        assertThat(AuthService.extrairUf("Recife,pe")).isEqualTo("PE");
        assertThat(AuthService.extrairUf("Curitiba")).isNull();
    }
}
