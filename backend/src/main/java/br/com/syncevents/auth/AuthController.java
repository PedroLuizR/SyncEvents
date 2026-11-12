package br.com.syncevents.auth;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import br.com.syncevents.auth.dto.CadastroClienteRequest;
import br.com.syncevents.auth.dto.CadastroEmpresaRequest;
import br.com.syncevents.auth.dto.LoginRequest;
import br.com.syncevents.auth.dto.LoginResponse;
import br.com.syncevents.auth.dto.UsuarioResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Autenticação")
public class AuthController {

    private final AuthService service;

    public AuthController(AuthService service) {
        this.service = service;
    }

    @PostMapping(path = "/cadastro/cliente",
            consumes = {MediaType.MULTIPART_FORM_DATA_VALUE, MediaType.APPLICATION_FORM_URLENCODED_VALUE})
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "ID01: cadastro de cliente (foto e CPF opcionais)")
    public UsuarioResponse cadastrarCliente(@Valid @ModelAttribute CadastroClienteRequest req) {
        return service.cadastrarCliente(req);
    }

    @PostMapping(path = "/cadastro/empresa",
            consumes = {MediaType.MULTIPART_FORM_DATA_VALUE, MediaType.APPLICATION_FORM_URLENCODED_VALUE})
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "ID02: cadastro de empresa (logo e endereço opcionais)")
    public UsuarioResponse cadastrarEmpresa(@Valid @ModelAttribute CadastroEmpresaRequest req) {
        return service.cadastrarEmpresa(req);
    }

    @PostMapping("/login")
    @Operation(summary = "ID03: login com e-mail (ou CNPJ, para empresa) e senha")
    public LoginResponse login(@Valid @RequestBody LoginRequest req) {
        return service.login(req);
    }

    @GetMapping("/me")
    @Operation(summary = "Dados do usuário logado")
    public UsuarioResponse me(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        return service.me(usuario);
    }
}
