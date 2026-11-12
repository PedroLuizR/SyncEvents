package br.com.syncevents.storage;

import org.springframework.web.multipart.MultipartFile;

/**
 * Armazenamento de arquivos enviados (logo, fotos, anexos).
 * A implementação atual grava em disco; pode ser trocada por S3/MinIO sem mudar quem usa.
 */
public interface StorageService {

    /**
     * Salva uma imagem e retorna o caminho público (ex.: {@code /files/logos/abc.jpg}).
     *
     * @param pasta subpasta lógica (ex.: "logos", "clientes")
     */
    String salvarImagem(MultipartFile arquivo, String pasta);

    /** Salva bytes já prontos (usado pelo seed de demonstração). Retorna o caminho público. */
    String salvar(byte[] conteudo, String extensao, String pasta);

    /** Remove um arquivo pelo caminho público. Ignora caminhos desconhecidos. */
    void remover(String url);
}
