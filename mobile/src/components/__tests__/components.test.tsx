import { fireEvent, render, screen } from '@testing-library/react-native';
import { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { mascaraTelefone } from '@/utils/masks';

import { Avatar, iniciais } from '../Avatar';
import { Button } from '../Button';
import { Chip } from '../Chip';
import { EmptyState } from '../EmptyState';
import { RatingStars } from '../RatingStars';
import { TabBar } from '../TabBar';
import { TextInput } from '../TextInput';

describe('Button', () => {
  it('dispara onPress', async () => {
    const onPress = jest.fn();
    await render(<Button titulo="Entrar" onPress={onPress} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Entrar' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('não dispara quando desabilitado ou carregando', async () => {
    const onPress = jest.fn();
    await render(
      <>
        <Button titulo="A" onPress={onPress} desabilitado />
        <Button titulo="B" onPress={onPress} carregando testID="b" />
      </>,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'A' }));
    await fireEvent.press(screen.getByRole('button', { name: 'B' }));
    expect(onPress).not.toHaveBeenCalled();
    expect(screen.getByTestId('b-carregando')).toBeTruthy();
  });
});

describe('TextInput', () => {
  function Telefone() {
    const [v, setV] = useState('');
    return <TextInput label="Celular" value={v} onChangeText={setV} mascara={mascaraTelefone} />;
  }

  it('aplica a máscara ao digitar', async () => {
    await render(<Telefone />);
    await fireEvent.changeText(screen.getByLabelText('Celular'), '11987654321');
    expect(screen.getByLabelText('Celular').props.value).toBe('(11) 98765-4321');
  });

  it('exibe a mensagem de erro', async () => {
    await render(<TextInput label="E-mail" erro="E-mail já cadastrado" />);
    expect(screen.getByText('E-mail já cadastrado')).toBeTruthy();
  });

  it('alterna a visibilidade da senha', async () => {
    await render(<TextInput label="Senha" senha />);
    expect(screen.getByLabelText('Senha').props.secureTextEntry).toBe(true);
    await fireEvent.press(screen.getByRole('button', { name: 'Mostrar senha' }));
    expect(screen.getByLabelText('Senha').props.secureTextEntry).toBe(false);
    expect(screen.getByRole('button', { name: 'Ocultar senha' })).toBeTruthy();
  });
});

describe('Chip', () => {
  it('informa o estado selecionado e dispara onPress', async () => {
    const onPress = jest.fn();
    await render(<Chip rotulo="Buffet" selecionado onPress={onPress} />);
    const chip = screen.getByRole('checkbox', { name: 'Buffet' });
    expect(chip).toBeChecked();
    await fireEvent.press(chip);
    expect(onPress).toHaveBeenCalled();
  });
});

describe('RatingStars', () => {
  it('exibe a nota no formato pt-BR', async () => {
    await render(<RatingStars nota={4.9} mostrarNota total={128} />);
    expect(screen.getByText('4,9')).toBeTruthy();
    expect(screen.getByText('(128)')).toBeTruthy();
    expect(screen.getByLabelText('Nota 4,9 de 5')).toBeTruthy();
  });

  it('permite selecionar a nota quando editável', async () => {
    const onChange = jest.fn();
    await render(<RatingStars nota={0} onChange={onChange} />);
    await fireEvent.press(screen.getByRole('button', { name: '4 estrelas' }));
    expect(onChange).toHaveBeenCalledWith(4);
  });
});

describe('Avatar', () => {
  it('gera iniciais', () => {
    expect(iniciais('Ateliê Aurora')).toBe('AA');
    expect(iniciais('Som Alto Produções')).toBe('SP');
    expect(iniciais('marina')).toBe('M');
    expect(iniciais('  ')).toBe('?');
  });

  it('mostra as iniciais sem imagem', async () => {
    await render(<Avatar nome="Marina Alves" />);
    expect(screen.getByText('MA')).toBeTruthy();
  });
});

describe('EmptyState', () => {
  it('mostra título e ação', async () => {
    const onAcao = jest.fn();
    await render(<EmptyState titulo="Nada por aqui" acao="Tentar de novo" onAcao={onAcao} />);
    expect(screen.getByText('Nada por aqui')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Tentar de novo' }));
    expect(onAcao).toHaveBeenCalled();
  });
});

describe('TabBar', () => {
  it('marca a aba ativa e troca de aba', async () => {
    const onSelecionar = jest.fn();
    await render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 360, height: 640 },
          insets: { top: 0, left: 0, right: 0, bottom: 0 },
        }}
      >
        <TabBar
          ativa="inicio"
          onSelecionar={onSelecionar}
          itens={[
            { chave: 'inicio', rotulo: 'Início', icone: 'home' },
            { chave: 'buscar', rotulo: 'Buscar', icone: 'search' },
          ]}
        />
      </SafeAreaProvider>,
    );
    expect(screen.getByRole('tab', { name: 'Início' })).toBeSelected();
    await fireEvent.press(screen.getByRole('tab', { name: 'Buscar' }));
    expect(onSelecionar).toHaveBeenCalledWith('buscar');
  });
});
