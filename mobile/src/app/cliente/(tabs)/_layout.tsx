import { AbasDoApp } from '@/navigation/AbasDoApp';

export default function AbasCliente() {
  return (
    <AbasDoApp
      abas={[
        { nome: 'index', rotulo: 'Início', icone: 'home' },
        { nome: 'buscar', rotulo: 'Buscar', icone: 'search' },
        { nome: 'solicitacoes', rotulo: 'Solicitações', icone: 'file-text' },
        { nome: 'perfil', rotulo: 'Perfil', icone: 'user' },
      ]}
    />
  );
}
