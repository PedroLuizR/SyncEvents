import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Avatar,
  Button,
  Card,
  Chip,
  EmptyState,
  RatingStars,
  SectionHeader,
  TabBar,
  Text,
  TextInput,
} from '@/components';
import { colors, spacing } from '@/theme';
import { formatarMoeda, mascaraCnpj, mascaraTelefone } from '@/utils/masks';

const CATEGORIAS = ['Decoração', 'Buffet', 'Fotografia', 'Som e luz'];

/**
 * Fase 0: catálogo do design system.
 * Na Fase 1 esta rota passa a ser a tela de boas-vindas.
 */
export default function CatalogoScreen() {
  const [selecionadas, setSelecionadas] = useState<string[]>(['Decoração']);
  const [telefone, setTelefone] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [nota, setNota] = useState(4);
  const [aba, setAba] = useState('inicio');

  const alternar = (c: string) =>
    setSelecionadas((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]));

  return (
    <SafeAreaView style={styles.tela} edges={['top']}>
      <ScrollView contentContainerStyle={styles.conteudo}>
        <Text variant="overline">SyncEvents · Fase 0</Text>
        <Text variant="display">Catálogo de componentes</Text>
        <Text variant="body" color={colors.textMuted}>
          Momentos especiais começam com boas escolhas.
        </Text>

        <SectionHeader titulo="Botões" />
        <Button
          titulo="Continuar como cliente"
          icone="arrow-right"
          iconePosicao="fim"
          larguraTotal
        />
        <Button titulo="Salvar rascunho" variante="contorno" larguraTotal />
        <Button titulo="Em breve" variante="secundario" larguraTotal />
        <View style={styles.linha}>
          <Button titulo="Ver detalhes" variante="contorno" compacto />
          <Button titulo="Responder" compacto />
          <Button titulo="Enviando" compacto carregando />
        </View>
        <Button titulo="Esqueci minha senha" variante="texto" />

        <SectionHeader titulo="Campos" />
        <TextInput
          label="E-mail"
          placeholder="marina@email.com"
          icone="mail"
          keyboardType="email-address"
        />
        <TextInput label="Senha" placeholder="••••••••" senha icone="lock" />
        <TextInput
          label="Celular"
          placeholder="(11) 98765-4321"
          keyboardType="phone-pad"
          value={telefone}
          onChangeText={setTelefone}
          mascara={mascaraTelefone}
        />
        <TextInput
          label="CNPJ"
          placeholder="00.000.000/0000-00"
          keyboardType="number-pad"
          value={cnpj}
          onChangeText={setCnpj}
          mascara={mascaraCnpj}
          erro={cnpj.length > 0 && cnpj.length < 18 ? 'CNPJ incompleto' : undefined}
        />
        <TextInput label="Sobre a empresa" placeholder="Conte um pouco..." multiline />

        <SectionHeader titulo="Chips" acao="Ver todas" onAcao={() => setSelecionadas([])} />
        <View style={styles.chips}>
          {CATEGORIAS.map((c) => (
            <Chip
              key={c}
              rotulo={c}
              selecionado={selecionadas.includes(c)}
              onPress={() => alternar(c)}
            />
          ))}
        </View>

        <SectionHeader titulo="Card e avaliação" />
        <Card onPress={() => undefined} accessibilityLabel="Ateliê Aurora">
          <View style={styles.cardLinha}>
            <Avatar nome="Ateliê Aurora" formato="quadrado" tamanho={48} />
            <View style={styles.flex}>
              <Text variant="overline">Decoração</Text>
              <Text variant="bodyStrong">Ateliê Aurora</Text>
              <Text variant="caption">São Paulo, SP · a partir de {formatarMoeda(2800)}</Text>
            </View>
            <RatingStars nota={4.9} mostrarNota />
          </View>
        </Card>
        <View style={styles.linha}>
          <Avatar nome="Marina Alves" />
          <Avatar nome="Som Alto Produções" tamanho={56} />
        </View>
        <Text variant="label">Toque para avaliar:</Text>
        <RatingStars nota={nota} onChange={setNota} tamanho={28} />

        <SectionHeader titulo="Estado vazio" />
        <Card>
          <EmptyState
            titulo="Nenhuma solicitação"
            descricao="Quando você pedir um orçamento, ele aparece aqui."
            acao="Buscar empresas"
            onAcao={() => undefined}
          />
        </Card>
      </ScrollView>
      <TabBar
        ativa={aba}
        onSelecionar={setAba}
        itens={[
          { chave: 'inicio', rotulo: 'Início', icone: 'home' },
          { chave: 'buscar', rotulo: 'Buscar', icone: 'search' },
          { chave: 'solicitacoes', rotulo: 'Pedidos', icone: 'file-text' },
          { chave: 'perfil', rotulo: 'Perfil', icone: 'user' },
        ]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.background },
  conteudo: { padding: spacing.xl, gap: spacing.lg, paddingBottom: spacing.xxxl },
  linha: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  cardLinha: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  flex: { flex: 1, gap: spacing.xxs },
});
