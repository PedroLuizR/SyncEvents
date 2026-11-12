package br.com.syncevents.empresa.dto;

import java.util.Comparator;
import java.util.List;

import br.com.syncevents.categoria.CategoriaResponse;
import br.com.syncevents.empresa.Empresa;
import br.com.syncevents.empresa.PortfolioFoto;
import br.com.syncevents.servico.dto.FotoResponse;

/** Perfil completo da própria empresa (ID04). */
public record EmpresaPerfilResponse(
        Long id,
        String codigo,
        String nomeFantasia,
        String cnpj,
        String email,
        String telefone,
        String cidade,
        String uf,
        String endereco,
        String descricao,
        String logoUrl,
        String capaUrl,
        List<CategoriaResponse> categorias,
        List<FotoResponse> portfolio) {

    public static EmpresaPerfilResponse de(Empresa e, List<PortfolioFoto> portfolio) {
        return new EmpresaPerfilResponse(
                e.getId(), e.getCodigo(), e.getNomeFantasia(), e.getCnpj(), e.getUsuario().getEmail(),
                e.getTelefoneWhatsapp(), e.getCidade(), e.getUf(), e.getEndereco(), e.getDescricao(),
                e.getLogoUrl(), e.getCapaUrl(),
                e.getCategorias().stream().map(CategoriaResponse::de)
                        .sorted(Comparator.comparing(CategoriaResponse::id)).toList(),
                portfolio.stream().map(p -> new FotoResponse(p.getId(), p.getUrl(), p.getOrdem())).toList());
    }
}
