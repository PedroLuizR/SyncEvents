package br.com.syncevents.auth.dto;

public record LoginResponse(String token, UsuarioResponse usuario) {
}
