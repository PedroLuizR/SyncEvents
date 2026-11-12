package br.com.syncevents.storage;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import br.com.syncevents.common.ApiException;
import br.com.syncevents.config.AppProperties;

@Service
public class LocalStorageService implements StorageService {

    public static final String PREFIXO_PUBLICO = "/files/";
    static final long TAMANHO_MAXIMO = 5L * 1024 * 1024;

    private static final Map<String, String> EXTENSOES = Map.of(
            "image/jpeg", "jpg",
            "image/png", "png",
            "image/webp", "webp");

    private final Path raiz;

    public LocalStorageService(AppProperties props) {
        String dir = props.storage() != null && props.storage().diretorio() != null
                ? props.storage().diretorio()
                : "uploads";
        this.raiz = Path.of(dir).toAbsolutePath().normalize();
    }

    public Path getRaiz() {
        return raiz;
    }

    @Override
    public String salvarImagem(MultipartFile arquivo, String pasta) {
        String extensao = EXTENSOES.get(arquivo.getContentType());
        if (extensao == null) {
            throw ApiException.campoInvalido("arquivo", "Envie uma imagem PNG, JPG ou WEBP");
        }
        if (arquivo.getSize() > TAMANHO_MAXIMO) {
            throw ApiException.campoInvalido("arquivo", "A imagem deve ter até 5 MB");
        }
        String nome = UUID.randomUUID() + "." + extensao;
        Path destino = raiz.resolve(pasta).resolve(nome).normalize();
        if (!destino.startsWith(raiz)) {
            throw new IllegalArgumentException("Pasta inválida: " + pasta);
        }
        try (InputStream in = arquivo.getInputStream()) {
            Files.createDirectories(destino.getParent());
            Files.copy(in, destino, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new IllegalStateException("Falha ao salvar arquivo", e);
        }
        return PREFIXO_PUBLICO + pasta + "/" + nome;
    }

    @Override
    public String salvar(byte[] conteudo, String extensao, String pasta) {
        String nome = UUID.randomUUID() + "." + extensao;
        Path destino = raiz.resolve(pasta).resolve(nome).normalize();
        if (!destino.startsWith(raiz)) {
            throw new IllegalArgumentException("Pasta inválida: " + pasta);
        }
        try {
            Files.createDirectories(destino.getParent());
            Files.write(destino, conteudo);
        } catch (IOException e) {
            throw new IllegalStateException("Falha ao salvar arquivo", e);
        }
        return PREFIXO_PUBLICO + pasta + "/" + nome;
    }

    @Override
    public void remover(String url) {
        if (url == null || !url.startsWith(PREFIXO_PUBLICO)) {
            return;
        }
        Path alvo = raiz.resolve(url.substring(PREFIXO_PUBLICO.length())).normalize();
        if (!alvo.startsWith(raiz)) {
            return;
        }
        try {
            Files.deleteIfExists(alvo);
        } catch (IOException ignored) {
            // arquivo órfão não impede a operação
        }
    }
}
