import { describe, it, expect, beforeEach } from 'vitest';
import api from '../api';

describe('api client', () => {
  it('tiene la baseURL correcta', () => {
    expect(api.defaults.baseURL).toBe('/api/');
  });

  it('tiene un interceptor de request registrado', () => {
    expect(api.interceptors.request.handlers.length).toBeGreaterThan(0);
  });

  describe('interceptor de autorización', () => {
    const getInterceptorFn = () => api.interceptors.request.handlers[0].fulfilled;

    beforeEach(() => {
      localStorage.clear();
    });

    it('agrega el header Authorization cuando existe token', () => {
      localStorage.setItem('token', 'mi-token-jwt');
      const config = { headers: {} };
      const result = getInterceptorFn()(config);
      expect(result.headers.Authorization).toBe('Bearer mi-token-jwt');
    });

    it('no agrega Authorization cuando no hay token', () => {
      const config = { headers: {} };
      const result = getInterceptorFn()(config);
      expect(result.headers.Authorization).toBeUndefined();
    });

    it('retorna el config completo sin modificar otros campos', () => {
      localStorage.setItem('token', 'abc');
      const config = { headers: {}, url: '/tickets/', method: 'get' };
      const result = getInterceptorFn()(config);
      expect(result.url).toBe('/tickets/');
      expect(result.method).toBe('get');
    });
  });
});
