package br.com.syncevents.auth;

import br.com.syncevents.usuario.TipoUsuario;

/** Principal colocado no SecurityContext a partir do JWT. */
public record UsuarioAutenticado(Long id, String email, TipoUsuario tipo) {
}
