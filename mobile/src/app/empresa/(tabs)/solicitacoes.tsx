import { TelaEmConstrucao } from '@/components/TelaEmConstrucao';

export default function SolicitacoesEmpresaScreen() {
  return (
    <TelaEmConstrucao
      titulo="Solicitações"
      descricao="Pedidos de orçamento recebidos, status e propostas"
      icone="inbox"
      fase={4}
    />
  );
}
