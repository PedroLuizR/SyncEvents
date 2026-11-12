import { Feather } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, type ComponentProps } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { mensagemDeErro } from '@/api/client';
import type { EmpresaPublica, TipoEvento } from '@/api/types';
import {
  Banner,
  Button,
  CampoData,
  Card,
  Checkbox,
  Chip,
  EmptyState,
  FotosEditaveis,
  Header,
  ProgressSteps,
  Screen,
  Select,
  Text,
} from '@/components';
import { CampoTexto } from '@/components/form/CampoTexto';
import type { ArquivoImagem } from '@/components/ImagePickerField';
import { TIPOS_EVENTO, rotuloTipoEvento } from '@/constants/tiposEvento';
import { useEmpresaPublica } from '@/hooks/useBusca';
import { useCriarSolicitacao } from '@/hooks/useSolicitacoes';
import { solicitacaoSchema, type SolicitacaoForm } from '@/schemas/solicitacao';
import { colors, fonts, radii, spacing } from '@/theme';
import { aplicarErrosDoServidor } from '@/utils/errosDoServidor';
import { escolherImagem } from '@/utils/escolherImagem';
import { FAIXAS_ORCAMENTO, convidados, formatarDataEvento } from '@/utils/solicitacao';

const MAX_INSPIRACOES = 5;
const CAMPOS_ETAPA1 = [
  'dataEvento',
  'qtdConvidados',
  'local',
  'tipoEvento',
  'aceiteContato',
] as const;

/** Tela 8 do Figma: solicitação de orçamento (ID08) com revisão e confirmação. */
export default function SolicitarOrcamentoScreen() {
  const { empresaId } = useLocalSearchParams<{ empresaId: string }>();
  const empresa = useEmpresaPublica(Number(empresaId));

  if (empresa.isLoading) {
    return (
      <Screen topo={<Header titulo="Solicitar orçamento" />}>
        <ActivityIndicator color={colors.primary} />
      </Screen>
    );
  }
  if (!empresa.data) {
    return (
      <Screen topo={<Header titulo="Solicitar orçamento" />}>
        <EmptyState
          titulo="Não foi possível carregar a empresa"
          descricao={mensagemDeErro(empresa.error)}
          icone="alert-circle"
          acao="Tentar de novo"
          onAcao={() => empresa.refetch()}
        />
      </Screen>
    );
  }
  return <Fluxo empresa={empresa.data} />;
}

function Fluxo({ empresa }: { empresa: EmpresaPublica }) {
  const [etapa, setEtapa] = useState<1 | 2 | 3>(1);
  const [inspiracoes, setInspiracoes] = useState<ArquivoImagem[]>([]);
  const [enviadaId, setEnviadaId] = useState<number | null>(null);
  const criar = useCriarSolicitacao();

  const { control, handleSubmit, trigger, setError, getValues, setValue } =
    useForm<SolicitacaoForm>({
      resolver: zodResolver(solicitacaoSchema),
      defaultValues: {
        dataEvento: '',
        qtdConvidados: '',
        local: '',
        tipoEvento: null,
        servicoIds: [],
        faixa: 'nao',
        mensagem: '',
        aceiteContato: false,
      },
    });
  const valores = useWatch({ control });

  async function revisar() {
    if (await trigger([...CAMPOS_ETAPA1])) setEtapa(2);
  }

  const enviar = handleSubmit(async (v) => {
    const faixa = FAIXAS_ORCAMENTO.find((f) => f.chave === v.faixa);
    try {
      const s = await criar.mutateAsync({
        dados: {
          empresaId: empresa.id,
          tipoEvento: v.tipoEvento as TipoEvento,
          dataEvento: v.dataEvento,
          qtdConvidados: Number(v.qtdConvidados),
          local: v.local.trim(),
          servicoIds: v.servicoIds,
          orcamentoMin: faixa?.min ?? null,
          orcamentoMax: faixa?.max ?? null,
          mensagem: v.mensagem.trim() || undefined,
          aceiteContato: v.aceiteContato,
        },
        anexos: inspiracoes,
      });
      setEnviadaId(s.id);
      setEtapa(3);
    } catch (e) {
      if (aplicarErrosDoServidor(e, setError).length > 0) setEtapa(1);
    }
  });

  const alternarServico = (id: number) => {
    const atuais = getValues('servicoIds');
    setValue('servicoIds', atuais.includes(id) ? atuais.filter((x) => x !== id) : [...atuais, id]);
  };

  if (etapa === 3) {
    return (
      <Screen
        topo={<ProgressSteps total={3} atual={3} />}
        rodape={
          <View style={{ gap: spacing.sm }}>
            <Button
              testID="ver-solicitacao"
              titulo="Ver minhas solicitações"
              larguraTotal
              onPress={() => {
                router.dismissAll();
                router.navigate('/cliente/solicitacoes');
              }}
            />
            <Button
              titulo="Voltar ao início"
              variante="texto"
              larguraTotal
              onPress={() => {
                router.dismissAll();
                router.navigate('/cliente');
              }}
            />
          </View>
        }
      >
        <View style={styles.confirmacao} testID={`solicitacao-enviada-${enviadaId}`}>
          <View style={styles.confirmacaoIcone}>
            <Feather name="check" size={36} color={colors.onPrimary} />
          </View>
          <Text variant="display" style={styles.centro}>
            Solicitação enviada!
          </Text>
          <Text variant="body" color={colors.textMuted} style={styles.centro}>
            {empresa.nomeFantasia} vai analisar seu pedido e responder por aqui. Você acompanha tudo
            em “Minhas solicitações”.
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      topo={
        <>
          <Header
            titulo="Solicitar orçamento"
            subtitulo={empresa.nomeFantasia}
            onVoltar={etapa === 2 ? () => setEtapa(1) : undefined}
          />
          <ProgressSteps total={3} atual={etapa} />
        </>
      }
      rodape={
        etapa === 1 ? (
          <Button
            testID="revisar"
            titulo="Revisar solicitação"
            icone="arrow-right"
            larguraTotal
            onPress={revisar}
          />
        ) : (
          <View style={{ gap: spacing.sm }}>
            <Button
              testID="enviar-solicitacao"
              titulo="Enviar solicitação"
              icone="send"
              larguraTotal
              carregando={criar.isPending}
              onPress={enviar}
            />
            <Button titulo="Editar" variante="texto" larguraTotal onPress={() => setEtapa(1)} />
          </View>
        )
      }
    >
      {criar.isError ? <Banner tipo="erro" mensagem={mensagemDeErro(criar.error)} /> : null}

      {etapa === 1 ? (
        <>
          <View style={{ gap: spacing.xs }}>
            <Text variant="title">Conte sobre seu evento</Text>
            <Text variant="body" color={colors.textMuted}>
              Quanto mais detalhes, mais precisa será a proposta.
            </Text>
          </View>

          <View style={styles.linha}>
            <View style={styles.metade}>
              <Controller
                control={control}
                name="dataEvento"
                render={({ field, fieldState }) => (
                  <CampoData
                    testID="campo-data"
                    label="Data"
                    valor={field.value}
                    onChange={field.onChange}
                    minimo={new Date()}
                    erro={fieldState.error?.message}
                  />
                )}
              />
            </View>
            <View style={styles.metade}>
              <CampoTexto
                control={control}
                name="qtdConvidados"
                testID="campo-convidados"
                label="Convidados"
                placeholder="120"
                icone="users"
                keyboardType="number-pad"
                mascara={(v) => v.replace(/\D/g, '').slice(0, 6)}
              />
            </View>
          </View>

          <CampoTexto
            control={control}
            name="local"
            testID="campo-local"
            label="Local do evento"
            placeholder="Espaço Jardim das Oliveiras, Cotia"
            icone="map-pin"
          />

          <Controller
            control={control}
            name="tipoEvento"
            render={({ field, fieldState }) => (
              <View style={styles.grupo}>
                <Text variant="label">Tipo de evento</Text>
                <View style={styles.chips}>
                  {TIPOS_EVENTO.map((t) => (
                    <Chip
                      key={t.valor}
                      rotulo={t.rotulo}
                      selecionado={field.value === t.valor}
                      onPress={() => field.onChange(t.valor)}
                    />
                  ))}
                </View>
                {fieldState.error ? (
                  <Text variant="caption" color={colors.danger}>
                    {fieldState.error.message}
                  </Text>
                ) : null}
              </View>
            )}
          />

          {empresa.servicos.length > 0 ? (
            <Controller
              control={control}
              name="servicoIds"
              render={({ field }) => (
                <View style={styles.grupo}>
                  <View style={styles.cabecalhoGrupo}>
                    <Text variant="label">Serviços desejados</Text>
                    <Text variant="caption">Selecione um ou mais</Text>
                  </View>
                  <View style={styles.chips}>
                    {empresa.servicos.map((s) => (
                      <Chip
                        key={s.id}
                        rotulo={s.nome}
                        selecionado={field.value.includes(s.id)}
                        onPress={() => alternarServico(s.id)}
                      />
                    ))}
                  </View>
                </View>
              )}
            />
          ) : null}

          <Controller
            control={control}
            name="faixa"
            render={({ field }) => (
              <Select
                testID="campo-faixa"
                label="Faixa de orçamento"
                opcoes={FAIXAS_ORCAMENTO.map((f) => ({ valor: f.chave, rotulo: f.rotulo }))}
                valor={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <CampoTexto
            control={control}
            name="mensagem"
            testID="campo-mensagem"
            label="Mensagem para a empresa"
            placeholder="Conte o estilo que você imagina, referências e o que é mais importante para você."
            multiline
          />

          <FotosEditaveis
            titulo="Inspirações (opcional)"
            fotos={inspiracoes.map((f) => ({ chave: f.uri, uri: f.uri }))}
            maximo={MAX_INSPIRACOES}
            onAdicionar={async () => {
              const f = await escolherImagem([4, 3]);
              if (f) setInspiracoes((atual) => [...atual, f]);
            }}
            onRemover={(chave) => setInspiracoes((atual) => atual.filter((f) => f.uri !== chave))}
          />

          <Controller
            control={control}
            name="aceiteContato"
            render={({ field, fieldState }) => (
              <Checkbox
                testID="aceite-contato"
                marcado={field.value}
                onChange={field.onChange}
                erro={fieldState.error?.message}
              >
                Autorizo {empresa.nomeFantasia} a entrar em contato comigo sobre este pedido. Meus
                dados de contato são compartilhados só com esta empresa.
              </Checkbox>
            )}
          />
        </>
      ) : (
        <>
          <View style={{ gap: spacing.xs }}>
            <Text variant="title">Revise sua solicitação</Text>
            <Text variant="body" color={colors.textMuted}>
              Confira os dados antes de enviar para {empresa.nomeFantasia}.
            </Text>
          </View>
          <Card>
            <View style={{ gap: spacing.md }}>
              <Linha
                icone="calendar"
                rotulo="Data"
                valor={valores.dataEvento ? formatarDataEvento(valores.dataEvento) : ''}
              />
              <Linha
                icone="users"
                rotulo="Convidados"
                valor={convidados(Number(valores.qtdConvidados))}
              />
              <Linha icone="map-pin" rotulo="Local" valor={valores.local ?? ''} />
              <Linha
                icone="gift"
                rotulo="Tipo de evento"
                valor={valores.tipoEvento ? rotuloTipoEvento(valores.tipoEvento) : ''}
              />
              <Linha
                icone="briefcase"
                rotulo="Serviços"
                valor={
                  empresa.servicos
                    .filter((s) => valores.servicoIds?.includes(s.id))
                    .map((s) => s.nome)
                    .join(', ') || 'A combinar'
                }
              />
              <Linha
                icone="dollar-sign"
                rotulo="Faixa de orçamento"
                valor={FAIXAS_ORCAMENTO.find((f) => f.chave === valores.faixa)?.rotulo ?? ''}
              />
              {valores.mensagem?.trim() ? (
                <Linha icone="message-square" rotulo="Mensagem" valor={valores.mensagem} />
              ) : null}
              {inspiracoes.length > 0 ? (
                <Linha
                  icone="image"
                  rotulo="Inspirações"
                  valor={`${inspiracoes.length} imagem(ns)`}
                />
              ) : null}
            </View>
          </Card>
          <Pressable onPress={() => setEtapa(1)} accessibilityRole="button" style={styles.editar}>
            <Feather name="edit-2" size={14} color={colors.primary} />
            <Text style={styles.editarTexto}>Editar informações</Text>
          </Pressable>
        </>
      )}
    </Screen>
  );
}

function Linha({
  icone,
  rotulo,
  valor,
}: {
  icone: ComponentProps<typeof Feather>['name'];
  rotulo: string;
  valor: string;
}) {
  return (
    <View style={styles.linhaResumo}>
      <Feather name={icone} size={16} color={colors.primary} />
      <View style={{ flex: 1 }}>
        <Text variant="caption">{rotulo}</Text>
        <Text variant="body">{valor}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  linha: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  metade: { flex: 1 },
  grupo: { gap: spacing.sm },
  cabecalhoGrupo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  linhaResumo: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  editar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'center',
    padding: spacing.sm,
  },
  editarTexto: { fontFamily: fonts.sansSemibold, color: colors.primary },
  confirmacao: { alignItems: 'center', gap: spacing.lg, paddingTop: spacing.xxxl },
  confirmacaoIcone: {
    width: 80,
    height: 80,
    borderRadius: radii.pill,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centro: { textAlign: 'center' },
});
