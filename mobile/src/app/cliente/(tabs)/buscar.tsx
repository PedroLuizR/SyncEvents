import { TelaEmConstrucao } from '@/components/TelaEmConstrucao';

export default function BuscarScreen() {
  return (
    <TelaEmConstrucao
      titulo="Buscar"
      descricao="Busca de empresas com filtros por categoria, cidade e ordenação"
      icone="search"
      fase={3}
    />
  );
}
