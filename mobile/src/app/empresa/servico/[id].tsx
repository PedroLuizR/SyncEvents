import { Feather } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { urlArquivo } from '@/api/arquivos';
import { mensagemDeErro } from '@/api/client';
import type { Foto, Servico } from '@/api/types';
import {
  Banner,
  Button,
  EmptyState,
  FotosEditaveis,
  Header,
  ListaItens,
  Screen,
  Select,
  SwitchCard,
  Text,
} from '@/components';
import { CampoTexto } from '@/components/form/CampoTexto';
import type { ArquivoImagem } from '@/components/ImagePickerField';
import { useCategorias } from '@/hooks/useAuth';
import { useExcluirServico, useSalvarServico, useServico } from '@/hooks/useServicos';
import {
  SERVICO_VAZIO,
  errosDePublicacao,
  servicoSchema,
  type ServicoForm,
} from '@/schemas/servico';
import { useSessionStore } from '@/store/session';
import { colors, radii, spacing, touchTarget } from '@/theme';
import { confirmar } from '@/utils/confirmar';
import { aplicarErrosDoServidor } from '@/utils/errosDoServidor';
import { escolherImagem } from '@/utils/escolherImagem';
import { mascaraMoeda } from '@/utils/masks';
import { MODELOS_PRECO, moedaParaNumero, numeroParaMoeda } from '@/utils/servico';

const MAX_FOTOS = 6;

/** Tela 12 do Figma: cadastro / edição de serviço (ID05). Rota "novo" = criação. */
export default function ServicoFormScreen() {
  const { id: idParam } = useLocalSearchParams<{ id: string }>();
  const id = idParam && idParam !== 'novo' ? Number(idParam) : null;
  const servico = useServico(id);

  if (id != null && servico.isLoading) {
    return (
      <Screen topo={<Header titulo="Editar serviço" />}>
        <ActivityIndicator color={colors.primary} />
      </Screen>
    );
  }
  if (id != null && servico.isError) {
    return (
      <Screen topo={<Header titulo="Editar serviço" />}>
        <EmptyState
          titulo="Não foi possível carregar"
          descricao={mensagemDeErro(servico.error)}
          icone="alert-circle"
          acao="Tentar de novo"
          onAcao={() => servico.refetch()}
        />
      </Screen>
    );
  }

  return <Formulario key={id ?? 'novo'} id={id} inicial={servico.data} />;
}

function Formulario({ id, inicial }: { id: number | null; inicial?: Servico }) {
  const usuario = useSessionStore((s) => s.usuario);
  const categorias = useCategorias();
  const salvar = useSalvarServico();
  const excluir = useExcluirServico();

  const [fotosSalvas, setFotosSalvas] = useState<Foto[]>(inicial?.fotos ?? []);
  const [fotosRemovidas, setFotosRemovidas] = useState<Foto[]>([]);
  const [novasFotos, setNovasFotos] = useState<ArquivoImagem[]>([]);
  const [salvando, setSalvando] = useState<'rascunho' | 'publicar' | null>(null);

  const { control, handleSubmit, setError, getValues, clearErrors } = useForm<ServicoForm>({
    resolver: zodResolver(servicoSchema),
    defaultValues: inicial
      ? {
          nome: inicial.nome,
          categoriaId: inicial.categoria.id,
          descricao: inicial.descricao ?? '',
          modeloPreco: inicial.modeloPreco,
          precoMin: numeroParaMoeda(inicial.precoMin),
          precoMax: numeroParaMoeda(inicial.precoMax),
          ativo: inicial.ativo,
          itensInclusos: inicial.itensInclusos,
        }
      : SERVICO_VAZIO,
  });

  const modelo = useWatch({ control, name: 'modeloPreco' });
  const categoriaId = useWatch({ control, name: 'categoriaId' });
  const nomeCategoria = categorias.data?.find((c) => c.id === categoriaId)?.nome;

  useEffect(() => {
    if (modelo !== 'FAIXA') clearErrors('precoMax');
    if (modelo === 'SOB_CONSULTA') clearErrors('precoMin');
  }, [modelo, clearErrors]);

  const fotos = useMemo(
    () => [
      ...fotosSalvas.map((f) => ({ chave: `s-${f.id}`, uri: urlArquivo(f.url) ?? f.url })),
      ...novasFotos.map((f) => ({ chave: `n-${f.uri}`, uri: f.uri })),
    ],
    [fotosSalvas, novasFotos],
  );

  async function adicionarFoto() {
    const arquivo = await escolherImagem([4, 3]);
    if (arquivo) setNovasFotos((atual) => [...atual, arquivo]);
  }

  function removerFoto(chave: string) {
    if (chave.startsWith('s-')) {
      const foto = fotosSalvas.find((f) => `s-${f.id}` === chave);
      if (!foto) return;
      setFotosSalvas((atual) => atual.filter((f) => f.id !== foto.id));
      setFotosRemovidas((atual) => [...atual, foto]);
    } else {
      setNovasFotos((atual) => atual.filter((f) => `n-${f.uri}` !== chave));
    }
  }

  const enviar = (rascunho: boolean) =>
    handleSubmit(async (valores) => {
      const erros = errosDePublicacao(valores, rascunho);
      const campos = Object.entries(erros) as [keyof ServicoForm, string][];
      if (campos.length > 0) {
        campos.forEach(([campo, message]) => setError(campo, { type: 'publicacao', message }));
        return;
      }
      setSalvando(rascunho ? 'rascunho' : 'publicar');
      try {
        await salvar.mutateAsync({
          id,
          dados: {
            nome: valores.nome.trim(),
            categoriaId: valores.categoriaId,
            descricao: valores.descricao.trim() || undefined,
            modeloPreco: valores.modeloPreco,
            precoMin:
              valores.modeloPreco === 'SOB_CONSULTA' ? null : moedaParaNumero(valores.precoMin),
            precoMax: valores.modeloPreco === 'FAIXA' ? moedaParaNumero(valores.precoMax) : null,
            ativo: valores.ativo,
            rascunho,
            itensInclusos: valores.itensInclusos,
          },
          novasFotos,
          fotosRemovidas,
        });
        router.back();
      } catch (e) {
        aplicarErrosDoServidor(e, setError);
      } finally {
        setSalvando(null);
      }
    })();

  const pedirExclusao = () =>
    confirmar({
      titulo: 'Excluir serviço',
      mensagem: `"${getValues('nome') || 'Este serviço'}" será removido e deixará de aparecer para os clientes. Esta ação não pode ser desfeita.`,
      acao: 'Excluir',
      onConfirmar: async () => {
        if (id == null) return;
        await excluir.mutateAsync(id);
        router.back();
      },
    });

  const publicado = inicial != null && !inicial.rascunho;

  return (
    <Screen
      topo={
        <Header
          titulo={id == null ? 'Novo serviço' : 'Editar serviço'}
          subtitulo={[usuario?.nome, nomeCategoria].filter(Boolean).join(' · ')}
          direita={
            id != null ? (
              <Pressable
                testID="excluir-servico"
                onPress={pedirExclusao}
                accessibilityRole="button"
                accessibilityLabel="Excluir serviço"
                style={styles.lixeira}
              >
                <Feather name="trash-2" size={18} color={colors.danger} />
              </Pressable>
            ) : null
          }
        />
      }
      rodape={
        <View style={styles.rodape}>
          <Button
            testID="salvar-rascunho"
            titulo="Salvar rascunho"
            variante="contorno"
            style={styles.botao}
            carregando={salvando === 'rascunho'}
            desabilitado={salvando != null}
            onPress={() => enviar(true)}
          />
          <Button
            testID="publicar-servico"
            titulo={publicado ? 'Atualizar serviço' : 'Publicar serviço'}
            style={styles.botao}
            carregando={salvando === 'publicar'}
            desabilitado={salvando != null}
            onPress={() => enviar(false)}
          />
        </View>
      }
    >
      {salvar.isError ? <Banner tipo="erro" mensagem={mensagemDeErro(salvar.error)} /> : null}
      {excluir.isError ? <Banner tipo="erro" mensagem={mensagemDeErro(excluir.error)} /> : null}

      <Controller
        control={control}
        name="ativo"
        render={({ field }) => (
          <SwitchCard
            testID="servico-ativo"
            titulo={field.value ? 'Serviço ativo' : 'Serviço inativo'}
            descricao={
              field.value
                ? 'Visível no perfil e nos resultados de busca'
                : 'Oculto para os clientes até você reativar'
            }
            valor={field.value}
            onChange={field.onChange}
          />
        )}
      />

      <FotosEditaveis
        titulo="Fotos do serviço"
        fotos={fotos}
        maximo={MAX_FOTOS}
        onAdicionar={adicionarFoto}
        onRemover={removerFoto}
      />

      <CampoTexto
        control={control}
        name="nome"
        testID="campo-nome-servico"
        label="Nome do serviço"
        placeholder="Decoração completa para casamentos"
      />

      <Controller
        control={control}
        name="categoriaId"
        render={({ field, fieldState }) => (
          <Select
            testID="campo-categoria"
            label="Categoria"
            placeholder={categorias.isLoading ? 'Carregando...' : 'Selecione a categoria'}
            opcoes={(categorias.data ?? []).map((c) => ({ valor: c.id, rotulo: c.nome }))}
            valor={field.value}
            onChange={field.onChange}
            erro={fieldState.error?.message}
          />
        )}
      />

      <CampoTexto
        control={control}
        name="descricao"
        testID="campo-descricao"
        label="Descrição"
        placeholder="Projeto personalizado com conceito visual, arranjos florais, mobiliário e montagem completa."
        multiline
      />

      <View style={styles.linha}>
        <View style={styles.metade}>
          <Controller
            control={control}
            name="modeloPreco"
            render={({ field, fieldState }) => (
              <Select
                testID="campo-modelo-preco"
                label="Modelo de preço"
                opcoes={MODELOS_PRECO}
                valor={field.value}
                onChange={field.onChange}
                erro={fieldState.error?.message}
              />
            )}
          />
        </View>
        {modelo && modelo !== 'SOB_CONSULTA' ? (
          <View style={styles.metade}>
            <CampoTexto
              control={control}
              name="precoMin"
              testID="campo-preco-min"
              label={
                modelo === 'FAIXA' ? 'Valor mínimo' : modelo === 'FIXO' ? 'Valor' : 'Valor inicial'
              }
              placeholder="R$ 0,00"
              keyboardType="number-pad"
              mascara={mascaraMoeda}
            />
          </View>
        ) : null}
      </View>
      {modelo === 'FAIXA' ? (
        <CampoTexto
          control={control}
          name="precoMax"
          testID="campo-preco-max"
          label="Valor máximo"
          placeholder="R$ 0,00"
          keyboardType="number-pad"
          mascara={mascaraMoeda}
        />
      ) : null}

      <Controller
        control={control}
        name="itensInclusos"
        render={({ field }) => (
          <ListaItens
            titulo="O que está incluso"
            itens={field.value}
            onChange={field.onChange}
            placeholder="Ex.: Projeto visual e moodboard"
          />
        )}
      />

      {inicial?.rascunho ? (
        <Text variant="caption">
          Este serviço é um rascunho e ainda não aparece para os clientes.
        </Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  lixeira: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rodape: { flexDirection: 'row', gap: spacing.md },
  botao: { flex: 1, paddingHorizontal: spacing.md },
  linha: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  metade: { flex: 1 },
});
