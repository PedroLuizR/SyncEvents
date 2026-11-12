import { useController, type Control, type FieldValues, type Path } from 'react-hook-form';

import { TextInput, type TextInputProps } from '../TextInput';

export interface CampoTextoProps<T extends FieldValues> extends Omit<
  TextInputProps,
  'value' | 'onChangeText' | 'erro'
> {
  control: Control<T>;
  name: Path<T>;
}

/** TextInput ligado ao react-hook-form (valor, alteração e mensagem de erro). */
export function CampoTexto<T extends FieldValues>({ control, name, ...rest }: CampoTextoProps<T>) {
  const {
    field: { value, onChange, onBlur },
    fieldState: { error },
  } = useController({ control, name });
  return (
    <TextInput
      {...rest}
      value={(value as string | undefined) ?? ''}
      onChangeText={onChange}
      onBlur={onBlur}
      erro={error?.message}
    />
  );
}
