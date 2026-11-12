import { rotuloCategorias, textoPreco } from '@/components/EmpresaCard';

import { linkWhatsapp } from '../whatsapp';

it('monta o link do WhatsApp com DDI 55', () => {
  expect(linkWhatsapp('(11) 98765-4321')).toBe('https://wa.me/5511987654321');
  expect(linkWhatsapp('11987654321', 'Ateliê Aurora')).toBe(
    'https://wa.me/5511987654321?text=Ol%C3%A1%2C%20Ateli%C3%AA%20Aurora!%20Vi%20seu%20perfil%20no%20SyncEvents.',
  );
});

it('rótulos do card de empresa', () => {
  const categorias = [
    { id: 1, nome: 'Decoração', icone: 'star' },
    { id: 2, nome: 'Buffet', icone: 'coffee' },
    { id: 3, nome: 'Bebidas', icone: 'droplet' },
  ];
  expect(rotuloCategorias({ categorias })).toBe('Decoração & Buffet');
  expect(textoPreco(2800)).toBe('A partir de R$ 2.800');
  expect(textoPreco(undefined)).toBe('Preço sob consulta');
});
