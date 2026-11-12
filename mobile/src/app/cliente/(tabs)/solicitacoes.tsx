import { TelaEmConstrucao } from '@/components/TelaEmConstrucao';

export default function SolicitacoesClienteScreen() {
  return (
    <TelaEmConstrucao
      titulo="Minhas solicitações"
      descricao="Seus pedidos de orçamento e propostas"
      icone="file-text"
      fase={4}
    />
  );
}
