import { TelaEmConstrucao } from '@/components/TelaEmConstrucao';

export default function ServicosScreen() {
  return (
    <TelaEmConstrucao
      titulo="Meus serviços"
      descricao="Cadastro e edição dos serviços oferecidos"
      icone="briefcase"
      fase={2}
    />
  );
}
