/** Link do WhatsApp com DDI do Brasil: https://wa.me/55<numero> */
export function linkWhatsapp(telefone: string, nomeEmpresa?: string): string {
  const texto = nomeEmpresa
    ? `?text=${encodeURIComponent(`Olá, ${nomeEmpresa}! Vi seu perfil no SyncEvents.`)}`
    : '';
  return `https://wa.me/55${telefone.replace(/\D/g, '')}${texto}`;
}
