import type { ComponentProps } from 'react';
import type { Feather } from '@expo/vector-icons';

import { Card } from './Card';
import { EmptyState } from './EmptyState';
import { Screen } from './Screen';
import { Text } from './Text';

/** Placeholder das abas que serão implementadas nas próximas fases. */
export function TelaEmConstrucao({
  titulo,
  descricao,
  icone,
  fase,
}: {
  titulo: string;
  descricao: string;
  icone: ComponentProps<typeof Feather>['name'];
  fase: number;
}) {
  return (
    <Screen>
      <Text variant="title" accessibilityRole="header">
        {titulo}
      </Text>
      <Card>
        <EmptyState titulo="Em breve" descricao={`${descricao} (Fase ${fase})`} icone={icone} />
      </Card>
    </Screen>
  );
}
