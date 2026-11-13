# Roteiro de testes de sanidade (APK)

Roteiro manual, em uns 20–30 minutos, para conferir no celular se o essencial do SyncEvents funciona.
Use o APK mais recente da aba **Releases**. Ele já aponta para o backend no Railway.
Senha de todas as contas de demonstração: **`Senha@123`**.

Para cada teste, marque ✅ (passou) ou ❌ (falhou). Se falhar, anote o que apareceu na tela e tire um print.

## 0. Antes de começar

| # | Passo | Resultado esperado |
|---|---|---|
| 0.1 | No navegador do celular, abra `https://syncevents-production.up.railway.app/actuator/health` | Aparece `{"status":"UP"}` |
| 0.2 | Instale e abra o APK | Abre a tela de boas-vindas, sem fechar sozinho |
| 0.3 | Toque em **"Servidor · alterar"** e depois em **Testar e salvar** sem mudar o endereço | Mensagem de conexão OK. Volte para a tela de boas-vindas |

## 1. Acesso (login, cadastro, sair)

| # | Passo | Resultado esperado |
|---|---|---|
| 1.1 | Entrar com `marina@demo.syncevents.com` e senha errada | Mensagem de e-mail ou senha inválidos. Continua na tela de login |
| 1.2 | Entrar com `marina@demo.syncevents.com` / `Senha@123` | Abre a área do cliente (Início) |
| 1.3 | Fechar o app pela lista de recentes e abrir de novo | Continua logado |
| 1.4 | **Perfil → Sair** e confirmar | Volta para a tela de boas-vindas |
| 1.5 | Criar uma conta de **cliente** nova, com um e-mail seu de teste | Conta criada e logada automaticamente. CPF e foto são opcionais |
| 1.6 | Tentar criar outra conta com o mesmo e-mail | Aviso de e-mail já cadastrado |
| 1.7 | Criar uma conta de **empresa** nova, com CNPJ de 14 dígitos qualquer | Conta criada, abre a área da empresa |

## 2. Cliente: descobrir empresas

Entre como **Marina**.

| # | Passo | Resultado esperado |
|---|---|---|
| 2.1 | Ver a tela **Início** | Categorias e empresas em destaque aparecem, com logos |
| 2.2 | **Buscar** "buffet" | Aparece Sabor & Arte Buffet |
| 2.3 | Buscar "decoracao" (sem acento) | Aparecem empresas de decoração (busca ignora acento) |
| 2.4 | Aplicar um filtro de cidade ou categoria | A lista muda conforme o filtro |
| 2.5 | Abrir **Ateliê Aurora Eventos** | Capa, logo, nota, portfólio com fotos, serviços com preço e avaliações |
| 2.6 | Tocar em **Compartilhar** | Abre o menu de compartilhar do Android |
| 2.7 | Tocar em **Conversar no WhatsApp** | Abre o WhatsApp (ou o navegador) com a mensagem pronta |

## 3. Fluxo completo de orçamento (cliente ↔ empresa)

Este é o teste mais importante. Use **dois celulares**, ou saia e entre de conta no mesmo aparelho.

| # | Quem | Passo | Resultado esperado |
|---|---|---|---|
| 3.1 | Marina | No perfil do Ateliê Aurora, **Solicitar orçamento**: tipo de evento, data futura, convidados, local e faixa de orçamento | Solicitação enviada. Aparece em **Solicitações** como nova |
| 3.2 | Marina | Tentar enviar sem a data ou com data no passado | O formulário mostra o erro no campo e não envia |
| 3.3 | Aurora (`contato@aurora.demo.syncevents.com`) | Abrir **Solicitações** | A solicitação da Marina aparece no topo |
| 3.4 | Aurora | Abrir a solicitação e **Marcar como em análise** | O status muda |
| 3.5 | Aurora | **Enviar proposta** com valor e descrição | Proposta enviada. O status muda para em negociação |
| 3.6 | Marina | Abrir a solicitação | Aparece o card **Proposta da empresa** com o valor |
| 3.7 | Marina | **Aceitar proposta** e confirmar | Status muda para proposta aceita / confirmada |
| 3.8 | Aurora | Abrir a solicitação e **Marcar evento como concluído** | Status muda para concluído |
| 3.9 | Marina | Na solicitação, **Avaliar empresa**: estrelas e comentário, depois **Publicar avaliação** | Avaliação publicada. O botão de avaliar some |
| 3.10 | Marina | Abrir o perfil do Ateliê Aurora | A avaliação nova aparece e o total de avaliações aumentou |

Teste também o caminho de recusa: crie outra solicitação e, como empresa, toque em **Recusar solicitação**. Faça o mesmo com uma proposta, usando **Recusar proposta** como cliente, e com **Cancelar solicitação** como cliente. O status deve mudar e os botões de ação devem sumir.

## 4. Chat

| # | Quem | Passo | Resultado esperado |
|---|---|---|---|
| 4.1 | Marina | Numa solicitação, **Conversar com a empresa** | Abre a conversa |
| 4.2 | Marina | Enviar "Olá, teste de chat" | A mensagem aparece na hora |
| 4.3 | Aurora | Abrir **Conversas** (ícone de balão) | A conversa aparece com a última mensagem |
| 4.4 | Aurora | Responder | Em até ~5 s a resposta aparece para a Marina, sem precisar sair da tela |
| 4.5 | Ambos | Desligar o Wi-Fi/dados por alguns segundos e religar | O chat volta a funcionar sozinho |

## 5. Empresa: serviços e perfil

Entre como **Aurora**, ou como a empresa criada no teste 1.7.

| # | Passo | Resultado esperado |
|---|---|---|
| 5.1 | **Serviços → Novo**: nome, categoria, descrição, modelo de preço e valor. Depois **Salvar rascunho** | O serviço aparece na lista como rascunho |
| 5.2 | Abrir o serviço, adicionar uma foto da galeria e tocar em **Publicar serviço** | Fica publicado. A foto aparece |
| 5.3 | Entrar como cliente e abrir o perfil dessa empresa | O serviço novo aparece com o preço |
| 5.4 | Como empresa, desativar e depois remover o serviço | Some do perfil público |
| 5.5 | **Perfil → Editar perfil**: mudar descrição, logo e capa, adicionar uma foto no portfólio | Salva. As imagens aparecem no perfil |
| 5.6 | Fazer um novo deploy no Railway e conferir o perfil de novo | As imagens continuam lá. Se sumirem, falta o **volume** em `/data` |

## 6. Robustez

| # | Passo | Resultado esperado |
|---|---|---|
| 6.1 | Com o modo avião ligado, abrir o app e tentar entrar | Mensagem de erro de conexão, sem travar ou fechar |
| 6.2 | Desligar o modo avião e tentar de novo | Funciona |
| 6.3 | Usar o botão **voltar** do Android em várias telas | Volta para a tela anterior. Na tela inicial, sai do app |
| 6.4 | Girar o celular ou aumentar a fonte do sistema | Os textos continuam legíveis e nada fica cortado |

## Se algo falhar

Mande junto:

- o número do teste;
- um print da tela;
- o horário aproximado.

Se houver erro de servidor, inclua também os **Deploy Logs** do Railway (Deployments → View logs).
