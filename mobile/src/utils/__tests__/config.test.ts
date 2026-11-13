import { normalizarUrl } from '@/store/config';

it('normaliza o endereço do servidor', () => {
  expect(normalizarUrl('192.168.0.10:8080')).toBe('http://192.168.0.10:8080');
  expect(normalizarUrl(' http://10.0.2.2:8080/ ')).toBe('http://10.0.2.2:8080');
  expect(normalizarUrl('https://api.syncevents.com/api/v1')).toBe('https://api.syncevents.com');
  expect(normalizarUrl('')).toBeNull();
  expect(normalizarUrl('http://')).toBeNull();
});
