import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput as RNTextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { urlArquivo } from '@/api/arquivos';
import { mensagemDeErro } from '@/api/client';
import type { Destaque, Solicitacao } from '@/api/types';
import { DESTAQUES } from '@/constants/destaques';
import { useAvaliar } from '@/hooks/useAvaliacoes';
import { colors, fonts, fontSizes, radii, spacing, touchTarget } from '@/theme';

import { Avatar } from './Avatar';
import { Banner } from './Banner';
import { Button } from './Button';
import { Chip } from './Chip';
import { RatingStars } from './RatingStars';
import { Text } from './Text';

const DESCRICAO_NOTA = ['', 'Muito ruim', 'Ruim', 'Regular', 'Boa', 'Excelente'];

/** Tela 10 do Figma: bottom sheet "Evento concluído" para avaliar a empresa (ID11). */
export function FormAvaliacao({
  solicitacao,
  onFechar,
  onAvaliada,
}: {
  solicitacao: Solicitacao | null;
  onFechar: () => void;
  onAvaliada?: () => void;
}) {
  const insets = useSafeAreaInsets();
  const avaliar = useAvaliar();
  const [nota, setNota] = useState(0);
  const [destaques, setDestaques] = useState<Destaque[]>([]);
  const [comentario, setComentario] = useState('');
  const [erroNota, setErroNota] = useState(false);

  const fechar = () => {
    setNota(0);
    setDestaques([]);
    setComentario('');
    setErroNota(false);
    avaliar.reset();
    onFechar();
  };

  const publicar = async () => {
    if (!solicitacao) return;
    if (nota < 1) {
      setErroNota(true);
      return;
    }
    try {
      await avaliar.mutateAsync({
        solicitacaoId: solicitacao.id,
        nota,
        destaques,
        comentario: comentario.trim() || undefined,
      });
      onAvaliada?.();
      fechar();
    } catch {
      // mensagem exibida no banner
    }
  };

  const e = solicitacao?.empresa;

  return (
    <Modal visible={solicitacao != null} transparent animationType="fade" onRequestClose={fechar}>
      <Pressable
        accessibilityRole="button"
        style={styles.fundo}
        onPress={fechar}
        accessibilityLabel="Fechar avaliação"
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View
          style={[styles.folha, { paddingBottom: insets.bottom + spacing.lg }]}
          testID="form-avaliacao"
        >
          <View style={styles.alca} />
          <ScrollView
            contentContainerStyle={{ gap: spacing.lg }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.topo}>
              {e ? (
                <Avatar
                  nome={e.nomeFantasia}
                  uri={urlArquivo(e.logoUrl)}
                  tamanho={48}
                  formato="quadrado"
                />
              ) : null}
              <View style={{ flex: 1 }}>
                <Text variant="overline">Evento concluído</Text>
                <Text variant="subtitle">{e?.nomeFantasia}</Text>
              </View>
              <Pressable
                onPress={fechar}
                accessibilityRole="button"
                accessibilityLabel="Fechar"
                style={styles.fechar}
              >
                <Feather name="x" size={18} color={colors.text} />
              </Pressable>
            </View>

            {avaliar.isError ? (
              <Banner tipo="erro" mensagem={mensagemDeErro(avaliar.error)} />
            ) : null}

            <View style={styles.centro}>
              <Text variant="label">Como foi sua experiência?</Text>
              <RatingStars
                testID="estrelas"
                nota={nota}
                tamanho={34}
                onChange={(n) => {
                  setNota(n);
                  setErroNota(false);
                }}
              />
              <Text variant="caption" color={erroNota ? colors.danger : colors.textMuted}>
                {erroNota
                  ? 'Escolha uma nota de 1 a 5'
                  : DESCRICAO_NOTA[nota] || 'Toque nas estrelas'}
              </Text>
            </View>

            <View style={{ gap: spacing.sm }}>
              <Text variant="label">O que mais se destacou?</Text>
              <View style={styles.chips}>
                {DESTAQUES.map((d) => (
                  <Chip
                    key={d.valor}
                    rotulo={d.rotulo}
                    variante="suave"
                    selecionado={destaques.includes(d.valor)}
                    onPress={() =>
                      setDestaques((atual) =>
                        atual.includes(d.valor)
                          ? atual.filter((x) => x !== d.valor)
                          : [...atual, d.valor],
                      )
                    }
                  />
                ))}
              </View>
            </View>

            <View style={{ gap: spacing.sm }}>
              <Text variant="label">Conte como foi (opcional)</Text>
              <RNTextInput
                testID="comentario-avaliacao"
                value={comentario}
                onChangeText={setComentario}
                placeholder="Equipe impecável, som excelente e iluminação linda..."
                placeholderTextColor={colors.textSubtle}
                multiline
                maxLength={1000}
                accessibilityLabel="Comentário da avaliação"
                style={styles.comentario}
              />
            </View>

            <View style={styles.aviso}>
              <Feather name="shield" size={14} color={colors.success} />
              <Text variant="caption" style={{ flex: 1 }}>
                Avaliação verificada: só quem concluiu um evento pode avaliar. Seu nome aparece
                abreviado.
              </Text>
            </View>

            <Button
              testID="publicar-avaliacao"
              titulo="Publicar avaliação"
              icone="send"
              larguraTotal
              carregando={avaliar.isPending}
              onPress={publicar}
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: colors.overlay },
  folha: {
    maxHeight: '92%',
    backgroundColor: colors.background,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
  },
  alca: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.borderStrong,
    marginBottom: spacing.md,
  },
  topo: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  fechar: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centro: { alignItems: 'center', gap: spacing.xs },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  comentario: {
    minHeight: 96,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    fontFamily: fonts.sans,
    fontSize: fontSizes.md,
    color: colors.text,
    textAlignVertical: 'top',
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null),
  },
  aviso: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
});
