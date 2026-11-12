package br.com.syncevents.auth;

import java.util.EnumSet;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import br.com.syncevents.auth.dto.CadastroClienteRequest;
import br.com.syncevents.auth.dto.CadastroEmpresaRequest;
import br.com.syncevents.auth.dto.LoginRequest;
import br.com.syncevents.auth.dto.LoginResponse;
import br.com.syncevents.auth.dto.UsuarioResponse;
import br.com.syncevents.categoria.Categoria;
import br.com.syncevents.categoria.CategoriaRepository;
import br.com.syncevents.categoria.CategoriaResponse;
import br.com.syncevents.cliente.Cliente;
import br.com.syncevents.cliente.ClienteRepository;
import br.com.syncevents.common.ApiException;
import br.com.syncevents.common.TipoEvento;
import br.com.syncevents.common.Textos;
import br.com.syncevents.common.validacao.Documentos;
import br.com.syncevents.empresa.CodigoEmpresaGenerator;
import br.com.syncevents.empresa.Empresa;
import br.com.syncevents.empresa.EmpresaRepository;
import br.com.syncevents.storage.StorageService;
import br.com.syncevents.usuario.TipoUsuario;
import br.com.syncevents.usuario.Usuario;
import br.com.syncevents.usuario.UsuarioRepository;

@Service
public class AuthService {

    static final String CREDENCIAIS_INVALIDAS = "CREDENCIAIS_INVALIDAS";

    private final UsuarioRepository usuarioRepository;
    private final ClienteRepository clienteRepository;
    private final EmpresaRepository empresaRepository;
    private final CategoriaRepository categoriaRepository;
    private final CodigoEmpresaGenerator codigoGenerator;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final StorageService storage;

    public AuthService(UsuarioRepository usuarioRepository, ClienteRepository clienteRepository,
            EmpresaRepository empresaRepository, CategoriaRepository categoriaRepository,
            CodigoEmpresaGenerator codigoGenerator, PasswordEncoder passwordEncoder, JwtService jwtService,
            StorageService storage) {
        this.usuarioRepository = usuarioRepository;
        this.clienteRepository = clienteRepository;
        this.empresaRepository = empresaRepository;
        this.categoriaRepository = categoriaRepository;
        this.codigoGenerator = codigoGenerator;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.storage = storage;
    }

    @Transactional
    public UsuarioResponse cadastrarCliente(CadastroClienteRequest req) {
        String email = normalizarEmail(req.email());
        garantirEmailLivre(email);

        Usuario usuario = usuarioRepository.save(
                new Usuario(email, passwordEncoder.encode(req.senha()), TipoUsuario.CLIENTE));
        Cliente cliente = new Cliente(usuario, normalizarEspacos(req.nome()),
                Documentos.apenasDigitos(req.telefone()), req.cidade().trim());
        cliente.setInteresses(req.interesses() == null || req.interesses().isEmpty()
                ? EnumSet.noneOf(TipoEvento.class)
                : EnumSet.copyOf(req.interesses()));
        cliente.setCpf(vazioParaNulo(req.cpf()));
        cliente.setFotoUrl(salvarSeHouver(req.foto(), "clientes"));
        return paraResponse(clienteRepository.save(cliente));
    }

    @Transactional
    public UsuarioResponse cadastrarEmpresa(CadastroEmpresaRequest req) {
        String email = normalizarEmail(req.email());
        String cnpj = Documentos.apenasDigitos(req.cnpj());
        garantirEmailLivre(email);
        if (empresaRepository.existsByCnpj(cnpj)) {
            throw ApiException.campoInvalido("cnpj", "CNPJ já cadastrado");
        }
        Set<Long> ids = new HashSet<>(req.categoriaIds());
        List<Categoria> categorias = categoriaRepository.findAllById(ids);
        if (categorias.size() != ids.size()) {
            throw ApiException.campoInvalido("categoriaIds", "Categoria inválida");
        }

        Usuario usuario = usuarioRepository.save(
                new Usuario(email, passwordEncoder.encode(req.senha()), TipoUsuario.EMPRESA));
        String cidade = req.cidade().trim();
        Empresa empresa = new Empresa(usuario, codigoGenerator.gerar(), req.nomeFantasia().trim(), cnpj,
                Documentos.apenasDigitos(req.telefone()), cidade);
        empresa.setUf(extrairUf(cidade));
        empresa.setEndereco(vazioParaNulo(req.endereco()));
        empresa.setDescricao(vazioParaNulo(req.descricao()));
        empresa.setCategorias(new HashSet<>(categorias));
        empresa.setLogoUrl(salvarSeHouver(req.logo(), "logos"));
        return paraResponse(empresaRepository.save(empresa));
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest req) {
        Usuario usuario = buscarParaLogin(req)
                .filter(u -> passwordEncoder.matches(req.senha(), u.getSenhaHash()))
                .orElseThrow(() -> credenciaisInvalidas(req.tipo()));
        if (!usuario.isAtivo()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, CREDENCIAIS_INVALIDAS, "Esta conta está desativada");
        }
        if (usuario.getTipo() != req.tipo()) {
            String aba = usuario.getTipo() == TipoUsuario.CLIENTE ? "Cliente" : "Empresa";
            throw new ApiException(HttpStatus.UNAUTHORIZED, CREDENCIAIS_INVALIDAS,
                    "Esta conta é de " + aba.toLowerCase(Locale.ROOT) + ". Entre pela aba " + aba + ".");
        }
        return new LoginResponse(jwtService.gerar(usuario), dadosDe(usuario));
    }

    @Transactional(readOnly = true)
    public UsuarioResponse me(UsuarioAutenticado autenticado) {
        Usuario usuario = usuarioRepository.findById(autenticado.id())
                .filter(Usuario::isAtivo)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "NAO_AUTENTICADO",
                        "Faça login para continuar"));
        return dadosDe(usuario);
    }

    private java.util.Optional<Usuario> buscarParaLogin(LoginRequest req) {
        String login = req.login().trim();
        if (req.tipo() == TipoUsuario.EMPRESA && !login.contains("@")) {
            return empresaRepository.findByCnpj(Documentos.apenasDigitos(login)).map(Empresa::getUsuario);
        }
        return usuarioRepository.findByEmail(login);
    }

    private UsuarioResponse dadosDe(Usuario usuario) {
        if (usuario.getTipo() == TipoUsuario.CLIENTE) {
            return clienteRepository.findByUsuarioId(usuario.getId()).map(this::paraResponse)
                    .orElseThrow(() -> new IllegalStateException("Cliente sem perfil: " + usuario.getId()));
        }
        return empresaRepository.findByUsuarioId(usuario.getId()).map(this::paraResponse)
                .orElseThrow(() -> new IllegalStateException("Empresa sem perfil: " + usuario.getId()));
    }

    private UsuarioResponse paraResponse(Cliente c) {
        Usuario u = c.getUsuario();
        return new UsuarioResponse(u.getId(), u.getEmail(), u.getTipo(), c.getId(), c.getNome(), c.getTelefone(),
                c.getCidade(), c.getFotoUrl(), null, c.getInteresses().stream().sorted().toList(), null);
    }

    private UsuarioResponse paraResponse(Empresa e) {
        Usuario u = e.getUsuario();
        List<CategoriaResponse> categorias = e.getCategorias().stream()
                .map(CategoriaResponse::de)
                .sorted(java.util.Comparator.comparing(CategoriaResponse::id))
                .toList();
        return new UsuarioResponse(u.getId(), u.getEmail(), u.getTipo(), e.getId(), e.getNomeFantasia(),
                e.getTelefoneWhatsapp(), e.getCidade(), e.getLogoUrl(), e.getCodigo(), null, categorias);
    }

    private void garantirEmailLivre(String email) {
        if (usuarioRepository.existsByEmail(email)) {
            throw ApiException.campoInvalido("email", "E-mail já cadastrado");
        }
    }

    private String salvarSeHouver(MultipartFile arquivo, String pasta) {
        return arquivo == null || arquivo.isEmpty() ? null : storage.salvarImagem(arquivo, pasta);
    }

    private static ApiException credenciaisInvalidas(TipoUsuario tipo) {
        String mensagem = tipo == TipoUsuario.EMPRESA
                ? "E-mail/CNPJ ou senha incorretos"
                : "E-mail ou senha incorretos";
        return new ApiException(HttpStatus.UNAUTHORIZED, CREDENCIAIS_INVALIDAS, mensagem);
    }

    static String normalizarEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    static String normalizarEspacos(String valor) {
        return Textos.normalizarEspacos(valor);
    }

    static String vazioParaNulo(String valor) {
        return Textos.vazioParaNulo(valor);
    }

    static String extrairUf(String cidade) {
        return Textos.extrairUf(cidade);
    }
}
