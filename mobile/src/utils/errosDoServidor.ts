import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';

import { camposComErro } from '@/api/client';

/**
 * Aplica no formulário os erros de campo devolvidos pelo backend.
 * Retorna os nomes dos campos que receberam erro.
 */
export function aplicarErrosDoServidor<T extends FieldValues>(
  erro: unknown,
  setError: UseFormSetError<T>,
): string[] {
  const campos = camposComErro(erro);
  Object.entries(campos).forEach(([campo, mensagem]) => {
    setError(campo as Path<T>, { type: 'server', message: mensagem });
  });
  return Object.keys(campos);
}
