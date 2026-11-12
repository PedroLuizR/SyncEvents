package br.com.syncevents.auth.dto;

import java.util.List;

import br.com.syncevents.categoria.CategoriaResponse;
import br.com.syncevents.common.TipoEvento;
import br.com.syncevents.usuario.TipoUsuario;

/**
 * Dados do usuário logado.
 *
 * @param perfilId id do cliente ou da empresa
 * @param fotoUrl  foto do cliente ou logo da empresa
 * @param codigo   código público de 6 dígitos (somente empresa)
 */
public record UsuarioResponse(
        Long id,
        String email,
        TipoUsuario tipo,
        Long perfilId,
        String nome,
        String telefone,
        String cidade,
        String fotoUrl,
        String codigo,
        List<TipoEvento> interesses,
        List<CategoriaResponse> categorias) {
}
