import { dataParaIso } from '@/utils/solicitacao';

import { solicitacaoSchema } from '../solicitacao';

const amanha = dataParaIso(new Date(Date.now() + 86_400_000));

const valido = {
  dataEvento: amanha,
  qtdConvidados: '120',
  local: 'Espaço Jardim',
  tipoEvento: 'CASAMENTO' as const,
  servicoIds: [],
  faixa: 'nao',
  mensagem: '',
  aceiteContato: true,
};

function erros(v: unknown) {
  const r = solicitacaoSchema.safeParse(v);
  return Object.fromEntries((r.error?.issues ?? []).map((i) => [String(i.path[0]), i.message]));
}

it('aceita um pedido válido', () => {
  expect(erros(valido)).toEqual({});
});

it('mostra mensagens claras', () => {
  expect(
    erros({
      ...valido,
      dataEvento: '2020-01-01',
      qtdConvidados: '0',
      local: '',
      tipoEvento: null,
      aceiteContato: false,
    }),
  ).toEqual({
    dataEvento: 'A data do evento não pode estar no passado',
    qtdConvidados: 'Informe o número de convidados',
    local: 'Informe o local do evento',
    tipoEvento: 'Escolha o tipo de evento',
    aceiteContato: 'Autorize o contato da empresa para enviar',
  });
  expect(erros({ ...valido, dataEvento: '' })).toEqual({ dataEvento: 'Informe a data do evento' });
});
