package br.com.syncevents.seed;

import java.awt.Color;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.EnumSet;
import java.util.HashSet;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import br.com.syncevents.avaliacao.Avaliacao;
import br.com.syncevents.avaliacao.AvaliacaoRepository;
import br.com.syncevents.categoria.Categoria;
import br.com.syncevents.chat.Conversa;
import br.com.syncevents.chat.ConversaRepository;
import br.com.syncevents.categoria.CategoriaRepository;
import br.com.syncevents.cliente.Cliente;
import br.com.syncevents.cliente.ClienteRepository;
import br.com.syncevents.common.TipoEvento;
import br.com.syncevents.common.Textos;
import br.com.syncevents.empresa.CodigoEmpresaGenerator;
import br.com.syncevents.empresa.Empresa;
import br.com.syncevents.empresa.EmpresaRepository;
import br.com.syncevents.empresa.PortfolioFoto;
import br.com.syncevents.empresa.PortfolioFotoRepository;
import br.com.syncevents.servico.ModeloPreco;
import br.com.syncevents.servico.Servico;
import br.com.syncevents.servico.ServicoRepository;
import br.com.syncevents.solicitacao.Solicitacao;
import br.com.syncevents.solicitacao.SolicitacaoRepository;
import br.com.syncevents.solicitacao.StatusProposta;
import br.com.syncevents.solicitacao.StatusSolicitacao;
import br.com.syncevents.storage.StorageService;
import br.com.syncevents.usuario.TipoUsuario;
import br.com.syncevents.usuario.Usuario;
import br.com.syncevents.usuario.UsuarioRepository;

/**
 * Dados de demonstração (Fase 3): ~10 empresas com serviços e fotos e um cliente de teste,
 * para as telas não ficarem vazias. Roda só quando {@code app.seed.demo=true} (perfil dev) e
 * só uma vez: se a primeira empresa de demonstração já existir, não faz nada.
 * Todas as contas usam a senha {@value #SENHA}.
 */
@Component
@ConditionalOnProperty(name = "app.seed.demo", havingValue = "true")
public class DemoSeeder implements ApplicationRunner {

    public static final String SENHA = "Senha@123";
    public static final String EMAIL_CLIENTE = "marina@demo.syncevents.com";
    private static final Logger log = LoggerFactory.getLogger(DemoSeeder.class);

    record ServicoDemo(String nome, String categoria, String descricao, ModeloPreco modelo, Integer min, Integer max,
            List<String> itens) {
    }

    record EmpresaDemo(String email, String nome, String cidade, Color cor, List<String> categorias, String descricao,
            String endereco, List<ServicoDemo> servicos) {
    }

    static final List<EmpresaDemo> EMPRESAS = List.of(
            new EmpresaDemo("contato@aurora.demo.syncevents.com", "Ateliê Aurora Eventos", "São Paulo, SP",
                    new Color(122, 46, 78), List.of("Decoração", "Buffet"),
                    "Há 8 anos criamos celebrações afetivas com flores, cenografia e gastronomia autoral que traduzem a história de cada cliente.",
                    "Rua Harmonia, 520 - Vila Madalena",
                    List.of(new ServicoDemo("Decoração completa para casamentos", "Decoração",
                            "Projeto personalizado com conceito visual, arranjos florais, mobiliário, mesa do bolo e montagem completa.",
                            ModeloPreco.A_PARTIR_DE, 2800, null,
                            List.of("Projeto visual e moodboard", "Arranjos florais e mesa do bolo", "Mobiliário e iluminação")),
                            new ServicoDemo("Buffet Fazendinha", "Buffet",
                                    "Menu rústico com estações quentes, finger foods e sobremesas da casa para até 150 convidados.",
                                    ModeloPreco.A_PARTIR_DE, 6500, null,
                                    List.of("Cardápio de degustação", "Equipe de garçons", "Louças e talheres")))),
            new EmpresaDemo("ola@jardimsecreto.demo.syncevents.com", "Jardim Secreto Decor", "São Paulo, SP",
                    new Color(84, 120, 82), List.of("Decoração"),
                    "Decoração floral para casamentos ao ar livre, com arcos de flores naturais e ambientação botânica.",
                    "Alameda Lorena, 1200 - Jardins",
                    List.of(new ServicoDemo("Decoração floral para cerimônia", "Decoração",
                            "Arco de flores naturais, corredor florido e arranjos para o altar.",
                            ModeloPreco.A_PARTIR_DE, 3200, null, List.of("Arco floral", "Corredor de pétalas")),
                            new ServicoDemo("Mini wedding botânico", "Decoração",
                                    "Ambientação completa para celebrações de até 50 convidados.",
                                    ModeloPreco.FAIXA, 4500, 9000, List.of("Mesa posta", "Painel de folhagens")))),
            new EmpresaDemo("contato@casaluz.demo.syncevents.com", "Casa Luz Produções", "São Paulo, SP",
                    new Color(166, 112, 54), List.of("Som e luz", "Planejamento"),
                    "Cenografia, iluminação cênica e som para eventos sociais e corporativos.",
                    null,
                    List.of(new ServicoDemo("Iluminação cênica e DJ", "Som e luz",
                            "Projeto de luz, pista de dança iluminada e DJ por até 6 horas.",
                            ModeloPreco.A_PARTIR_DE, 3600, null, List.of("DJ por 6 horas", "Iluminação de pista", "Máquina de fumaça")),
                            new ServicoDemo("Assessoria do dia", "Planejamento",
                                    "Coordenação completa no dia do evento, do cronograma aos fornecedores.",
                                    ModeloPreco.FIXO, 2500, null, List.of("Cronograma", "Coordenação de fornecedores")))),
            new EmpresaDemo("contato@florbela.demo.syncevents.com", "Flor de Mel Festas", "Santo André, SP",
                    new Color(198, 110, 120), List.of("Decoração"),
                    "Decoração afetiva para aniversários, chás e festas infantis, com muito capricho nos detalhes.",
                    "Rua das Figueiras, 88 - Centro",
                    List.of(new ServicoDemo("Festa infantil temática", "Decoração",
                            "Mesa do bolo, painel e lembrancinhas no tema escolhido.",
                            ModeloPreco.A_PARTIR_DE, 1300, null, List.of("Mesa temática", "Painel", "Balões")))),
            new EmpresaDemo("ola@lumefoto.demo.syncevents.com", "Lume Fotografia", "São Paulo, SP",
                    new Color(70, 76, 110), List.of("Fotografia"),
                    "Fotografia documental de casamentos e eventos, com olhar sensível e entrega rápida.",
                    null,
                    List.of(new ServicoDemo("Cobertura de casamento", "Fotografia",
                            "Making of, cerimônia e festa, com galeria online e álbum.",
                            ModeloPreco.A_PARTIR_DE, 3900, null, List.of("Até 10 horas de cobertura", "Galeria online", "Álbum 30x30")),
                            new ServicoDemo("Ensaio pré-wedding", "Fotografia",
                                    "Ensaio de 2 horas em locação à escolha do casal.",
                                    ModeloPreco.FIXO, 950, null, List.of("2 horas", "60 fotos tratadas")))),
            new EmpresaDemo("contato@saborearte.demo.syncevents.com", "Sabor & Arte Buffet", "Rio de Janeiro, RJ",
                    new Color(150, 70, 40), List.of("Buffet", "Bebidas"),
                    "Buffet completo e bar de drinks autorais para casamentos e eventos corporativos.",
                    "Rua Voluntários da Pátria, 300 - Botafogo",
                    List.of(new ServicoDemo("Buffet completo", "Buffet",
                            "Coquetel de entrada, jantar servido e mesa de doces.",
                            ModeloPreco.A_PARTIR_DE, 8500, null, List.of("Coquetel", "Jantar", "Doces finos")),
                            new ServicoDemo("Bar de drinks autorais", "Bebidas",
                                    "Bartenders e carta de drinks personalizada para o evento.",
                                    ModeloPreco.A_PARTIR_DE, 2200, null, List.of("2 bartenders", "Carta personalizada")))),
            new EmpresaDemo("contato@somalto.demo.syncevents.com", "Som Alto Produções", "Belo Horizonte, MG",
                    new Color(40, 90, 120), List.of("Som e luz"),
                    "Sonorização e banda para festas, formaturas e eventos corporativos.",
                    null,
                    List.of(new ServicoDemo("Banda para festa", "Som e luz",
                            "Banda com 5 integrantes e repertório personalizado.",
                            ModeloPreco.FAIXA, 5000, 12000, List.of("5 músicos", "Som e luz básicos")))),
            new EmpresaDemo("contato@celebrar.demo.syncevents.com", "Celebrar Assessoria", "São Paulo, SP",
                    new Color(110, 60, 100), List.of("Planejamento", "Decoração"),
                    "Assessoria e planejamento completo de casamentos, do orçamento ao grande dia.",
                    "Av. Paulista, 1000 - Bela Vista",
                    List.of(new ServicoDemo("Planejamento completo", "Planejamento",
                            "Acompanhamento desde a escolha dos fornecedores até o dia do evento.",
                            ModeloPreco.SOB_CONSULTA, null, null, List.of("Reuniões mensais", "Gestão de orçamento")))),
            new EmpresaDemo("contato@brindes.demo.syncevents.com", "Brinde Certo Bebidas", "Campinas, SP",
                    new Color(130, 100, 30), List.of("Bebidas"),
                    "Bebidas, cervejas artesanais e chopp para festas de todos os tamanhos.",
                    null,
                    List.of(new ServicoDemo("Chopp e cervejas artesanais", "Bebidas",
                            "Chopeira, barris e atendimento durante a festa.",
                            ModeloPreco.A_PARTIR_DE, 1500, null, List.of("Chopeira", "50 litros")))),
            new EmpresaDemo("contato@momentos.demo.syncevents.com", "Momentos Foto & Vídeo", "Rio de Janeiro, RJ",
                    new Color(60, 110, 100), List.of("Fotografia"),
                    "Foto e vídeo para formaturas, aniversários de 15 anos e casamentos.",
                    null,
                    List.of(new ServicoDemo("Foto e vídeo de formatura", "Fotografia",
                            "Cobertura da colação e do baile, com vídeo de melhores momentos.",
                            ModeloPreco.A_PARTIR_DE, 2400, null, List.of("Fotos", "Vídeo de 3 minutos")))));

    private final UsuarioRepository usuarioRepository;
    private final ClienteRepository clienteRepository;
    private final EmpresaRepository empresaRepository;
    private final CategoriaRepository categoriaRepository;
    private final ServicoRepository servicoRepository;
    private final PortfolioFotoRepository portfolioRepository;
    private final CodigoEmpresaGenerator codigoGenerator;
    private final PasswordEncoder passwordEncoder;
    private final StorageService storage;
    private final SolicitacaoRepository solicitacaoRepository;
    private final ConversaRepository conversaRepository;
    private final AvaliacaoRepository avaliacaoRepository;

    public DemoSeeder(UsuarioRepository usuarioRepository, ClienteRepository clienteRepository,
            EmpresaRepository empresaRepository, CategoriaRepository categoriaRepository,
            ServicoRepository servicoRepository, PortfolioFotoRepository portfolioRepository,
            CodigoEmpresaGenerator codigoGenerator, PasswordEncoder passwordEncoder, StorageService storage,
            SolicitacaoRepository solicitacaoRepository, ConversaRepository conversaRepository,
            AvaliacaoRepository avaliacaoRepository) {
        this.usuarioRepository = usuarioRepository;
        this.clienteRepository = clienteRepository;
        this.empresaRepository = empresaRepository;
        this.categoriaRepository = categoriaRepository;
        this.servicoRepository = servicoRepository;
        this.portfolioRepository = portfolioRepository;
        this.codigoGenerator = codigoGenerator;
        this.passwordEncoder = passwordEncoder;
        this.storage = storage;
        this.solicitacaoRepository = solicitacaoRepository;
        this.conversaRepository = conversaRepository;
        this.avaliacaoRepository = avaliacaoRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        semear();
        semearAvaliacoes();
    }

    /** Cria os dados se ainda não existirem. Retorna true se criou. */
    @Transactional
    public boolean semear() {
        if (usuarioRepository.existsByEmail(EMPRESAS.get(0).email())) {
            return false;
        }
        String senha = passwordEncoder.encode(SENHA);
        List<Categoria> categorias = categoriaRepository.findAll();

        Usuario uc = usuarioRepository.save(new Usuario(EMAIL_CLIENTE, senha, TipoUsuario.CLIENTE));
        Cliente cliente = new Cliente(uc, "Marina Alves", "11987654321", "São Paulo, SP");
        cliente.setInteresses(EnumSet.of(TipoEvento.CASAMENTO, TipoEvento.ANIVERSARIO));
        clienteRepository.save(cliente);

        long semente = 1;
        for (EmpresaDemo d : EMPRESAS) {
            Usuario u = usuarioRepository.save(new Usuario(d.email(), senha, TipoUsuario.EMPRESA));
            Empresa e = new Empresa(u, codigoGenerator.gerar(), d.nome(), cnpjAleatorio(), "11987654321", d.cidade());
            e.setUf(Textos.extrairUf(d.cidade()));
            e.setDescricao(d.descricao());
            e.setEndereco(d.endereco());
            e.setCategorias(new HashSet<>(categorias.stream().filter(c -> d.categorias().contains(c.getNome())).toList()));
            e.setLogoUrl(storage.salvar(ImagensDemo.logo(d.cor(), iniciais(d.nome())), "jpg", "logos"));
            e.setCapaUrl(storage.salvar(ImagensDemo.foto(d.cor(), semente++, 1200, 675), "jpg", "capas"));
            empresaRepository.save(e);

            for (int i = 0; i < 4; i++) {
                portfolioRepository.save(new PortfolioFoto(e,
                        storage.salvar(ImagensDemo.foto(d.cor(), semente++, 800, 600), "jpg", "portfolio"), i));
            }
            for (ServicoDemo sd : d.servicos()) {
                Servico s = new Servico(e);
                s.setNome(sd.nome());
                s.setDescricao(sd.descricao());
                s.setCategoria(categorias.stream().filter(c -> c.getNome().equals(sd.categoria())).findFirst()
                        .orElseThrow());
                s.setModeloPreco(sd.modelo());
                s.setPrecoMin(sd.min() == null ? null : BigDecimal.valueOf(sd.min()));
                s.setPrecoMax(sd.max() == null ? null : BigDecimal.valueOf(sd.max()));
                s.substituirItens(sd.itens());
                for (int i = 0; i < 2; i++) {
                    s.adicionarFoto(storage.salvar(ImagensDemo.foto(d.cor(), semente++, 800, 600), "jpg", "servicos"));
                }
                servicoRepository.save(s);
            }
        }
        log.info("Dados de demonstração criados: {} empresas e o cliente {} (senha {})", EMPRESAS.size(),
                EMAIL_CLIENTE, SENHA);
        return true;
    }

    record ClienteDemo(String email, String nome, String cidade) {
    }

    static final List<ClienteDemo> AVALIADORES = List.of(
            new ClienteDemo("ana@demo.syncevents.com", "Ana Souza", "São Paulo, SP"),
            new ClienteDemo("bruno@demo.syncevents.com", "Bruno Lima", "Rio de Janeiro, RJ"),
            new ClienteDemo("carla@demo.syncevents.com", "Carla Mendes", "São Paulo, SP"),
            new ClienteDemo("diego@demo.syncevents.com", "Diego Rocha", "Belo Horizonte, MG"));

    /** nota, comentário e destaques usados em rodízio */
    private static final List<Object[]> COMENTARIOS = List.of(
            new Object[] {5, "Equipe impecável e muito atenciosa. Fez toda a diferença na nossa festa!",
                new String[] {"ATENDIMENTO", "QUALIDADE"}},
            new Object[] {5, "Tudo pronto no horário combinado e exatamente como no projeto.",
                new String[] {"PONTUALIDADE", "QUALIDADE"}},
            new Object[] {4, "Muito bom! Só demorou um pouco para responder no começo.",
                new String[] {"QUALIDADE", "CUSTO_BENEFICIO"}},
            new Object[] {5, "Superou as expectativas. Recomendo de olhos fechados.",
                new String[] {"ATENDIMENTO", "CUSTO_BENEFICIO", "QUALIDADE"}},
            new Object[] {3, "Serviço correto, mas esperávamos um pouco mais de capricho nos detalhes.",
                new String[] {"PONTUALIDADE"}},
            new Object[] {5, null, new String[] {"ATENDIMENTO"}});

    /**
     * Avaliações de demonstração (Fase 6). Seguem a regra do sistema: cada uma vem de uma solicitação
     * CONCLUIDA, com proposta aceita, de um cliente de demonstração. Roda uma vez (se ainda não há avaliações).
     */
    @Transactional
    public boolean semearAvaliacoes() {
        if (avaliacaoRepository.count() > 0 || !usuarioRepository.existsByEmail(EMPRESAS.get(0).email())) {
            return false;
        }
        String senha = passwordEncoder.encode(SENHA);
        List<Cliente> clientes = AVALIADORES.stream().map(c -> {
            Usuario u = usuarioRepository.findByEmail(c.email())
                    .orElseGet(() -> usuarioRepository.save(new Usuario(c.email(), senha, TipoUsuario.CLIENTE)));
            return clienteRepository.findByUsuarioId(u.getId())
                    .orElseGet(() -> clienteRepository.save(new Cliente(u, c.nome(), "11912345678", c.cidade())));
        }).toList();

        int i = 0;
        int criadas = 0;
        for (int e = 0; e < EMPRESAS.size(); e++) {
            EmpresaDemo d = EMPRESAS.get(e);
            Empresa empresa = usuarioRepository.findByEmail(d.email())
                    .flatMap(u -> empresaRepository.findByUsuarioId(u.getId())).orElse(null);
            if (empresa == null) {
                continue;
            }
            int quantas = 2 + (e % 3); // 2 a 4 avaliações por empresa
            for (int k = 0; k < quantas; k++, i++) {
                Cliente cliente = clientes.get(i % clientes.size());
                Object[] c = COMENTARIOS.get(i % COMENTARIOS.size());
                Solicitacao s = new Solicitacao(cliente, empresa);
                s.setTipoEvento(TipoEvento.values()[i % 5]);
                s.setDataEvento(LocalDate.now().minusDays(15L + i * 9L));
                s.setQtdConvidados(60 + (i % 5) * 30);
                s.setLocal(cliente.getCidade());
                s.setAceiteContato(true);
                s.adicionarProposta(BigDecimal.valueOf(2000L + (i % 7) * 1500L), "Pacote completo para o evento.")
                        .setStatus(StatusProposta.ACEITA);
                s.setStatus(StatusSolicitacao.CONCLUIDA);
                solicitacaoRepository.save(s);
                conversaRepository.save(new Conversa(s));
                avaliacaoRepository.save(new Avaliacao(s, (Integer) c[0], (String) c[1], (String[]) c[2]));
                criadas++;
            }
        }
        log.info("Avaliações de demonstração criadas: {}", criadas);
        return true;
    }

    static String iniciais(String nome) {
        String[] partes = nome.split("\\s+");
        return (partes[0].substring(0, 1) + (partes.length > 1 ? partes[1].substring(0, 1) : "")).toUpperCase();
    }

    private String cnpjAleatorio() {
        String cnpj;
        do {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < 14; i++) {
                sb.append(ThreadLocalRandom.current().nextInt(10));
            }
            cnpj = sb.toString();
        } while (empresaRepository.existsByCnpj(cnpj));
        return cnpj;
    }
}
