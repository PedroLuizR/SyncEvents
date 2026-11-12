import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { colors, fonts, fontSizes, radii, spacing, touchTarget } from '@/theme';
import { dataParaIso, formatarDataEvento } from '@/utils/solicitacao';

import { Text } from './Text';
import { TextInput } from './TextInput';

export interface CampoDataProps {
  label: string;
  /** yyyy-MM-dd */
  valor: string;
  onChange: (iso: string) => void;
  minimo?: Date;
  erro?: string;
  testID?: string;
}

function mascaraDataBr(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 8);
  return d.replace(/^(\d{2})(\d)/, '$1/$2').replace(/^(\d{2})\/(\d{2})(\d)/, '$1/$2/$3');
}

function brParaIso(br: string): string {
  const m = br.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : '';
}

function isoParaBr(iso: string): string {
  const [a, m, d] = iso.split('-');
  return iso ? `${d}/${m}/${a}` : '';
}

/** Campo de data: seletor nativo no Android/iOS; texto com máscara dd/mm/aaaa na web. */
export function CampoData({ label, valor, onChange, minimo, erro, testID }: CampoDataProps) {
  const [aberto, setAberto] = useState(false);
  const [textoWeb, setTextoWeb] = useState(isoParaBr(valor));

  if (Platform.OS === 'web') {
    return (
      <TextInput
        testID={testID}
        label={label}
        placeholder="dd/mm/aaaa"
        icone="calendar"
        keyboardType="number-pad"
        value={textoWeb}
        onChangeText={(t) => {
          const br = mascaraDataBr(t);
          setTextoWeb(br);
          onChange(brParaIso(br));
        }}
        erro={erro}
      />
    );
  }

  const data = valor ? new Date(`${valor}T12:00:00`) : (minimo ?? new Date());
  return (
    <View style={styles.container}>
      <Text variant="label">{label}</Text>
      <Pressable
        testID={testID}
        onPress={() => setAberto(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${valor ? formatarDataEvento(valor) : 'selecionar'}`}
        style={[styles.campo, { borderColor: erro ? colors.danger : colors.border }]}
      >
        <Feather name="calendar" size={18} color={colors.textMuted} />
        <Text style={[styles.valor, !valor && { color: colors.textSubtle }]}>
          {valor ? formatarDataEvento(valor) : 'Selecionar'}
        </Text>
      </Pressable>
      {erro ? (
        <Text variant="caption" color={colors.danger}>
          {erro}
        </Text>
      ) : null}
      {aberto ? (
        <DateTimePicker
          value={data}
          mode="date"
          minimumDate={minimo}
          onChange={(evento, escolhida) => {
            setAberto(Platform.OS === 'ios');
            if (evento.type === 'set' && escolhida) onChange(dataParaIso(escolhida));
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  campo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: touchTarget,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderRadius: radii.md,
  },
  valor: { fontFamily: fonts.sans, fontSize: fontSizes.md, color: colors.text },
});
