import { AbasDoApp } from '@/navigation/AbasDoApp';

export default function AbasEmpresa() {
  return (
    <AbasDoApp
      abas={[
        { nome: 'index', rotulo: 'Painel', icone: 'grid' },
        { nome: 'solicitacoes', rotulo: 'Solicitações', icone: 'inbox' },
        { nome: 'servicos', rotulo: 'Serviços', icone: 'briefcase' },
        { nome: 'perfil', rotulo: 'Perfil', icone: 'user' },
      ]}
    />
  );
}
