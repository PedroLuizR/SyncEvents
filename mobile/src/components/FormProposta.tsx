import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { propostaSchema, type PropostaForm } from '@/schemas/proposta';
import { colors, radii, spacing } from '@/theme';
import { mascaraMoeda } from '@/utils/masks';
import { moedaParaNumero } from '@/utils/servico';

import { Banner } from './Banner';
import { Button } from './Button';
import { CampoTexto } from './form/CampoTexto';
import { Text } from './Text';

/** Folha inferior para a empresa enviar uma proposta (valor + o que está incluso). */
export function FormProposta({
  visivel,
  onFechar,
  onEnviar,
  enviando,
  erro,
}: {
  visivel: boolean;
  onFechar: () => void;
  onEnviar: (dados: { valor: number; descricao: string }) => void;
  enviando: boolean;
  erro?: string;
}) {
  const insets = useSafeAreaInsets();
  const { control, handleSubmit } = useForm<PropostaForm>({
    resolver: zodResolver(propostaSchema),
    defaultValues: { valor: '', descricao: '' },
  });
  const enviar = handleSubmit((d) =>
    onEnviar({ valor: moedaParaNumero(d.valor) ?? 0, descricao: d.descricao.trim() }),
  );

  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={onFechar}>
      <Pressable style={styles.fundo} onPress={onFechar} accessibilityLabel="Fechar" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.folha, { paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={styles.alca} />
          <Text variant="subtitle">Enviar proposta</Text>
          <Text variant="caption">O cliente recebe a proposta e pode aceitar ou recusar.</Text>
          {erro ? <Banner tipo="erro" mensagem={erro} /> : null}
          <CampoTexto
            control={control}
            name="valor"
            testID="proposta-valor"
            label="Valor total"
            placeholder="R$ 0,00"
            keyboardType="number-pad"
            mascara={mascaraMoeda}
          />
          <CampoTexto
            control={control}
            name="descricao"
            testID="proposta-descricao"
            label="O que está incluso"
            placeholder="Ex.: projeto visual, arranjos florais, montagem e desmontagem."
            multiline
          />
          <View style={styles.botoes}>
            <Button titulo="Cancelar" variante="contorno" style={styles.flex} onPress={onFechar} />
            <Button
              testID="confirmar-proposta"
              titulo="Enviar proposta"
              icone="send"
              style={styles.flex}
              carregando={enviando}
              onPress={enviar}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: colors.overlay },
  folha: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
  alca: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.borderStrong,
  },
  botoes: { flexDirection: 'row', gap: spacing.md },
  flex: { flex: 1 },
});
