import supertest from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../../../app';

describe('Milestone 5.0 - HTTP Security Headers Integration Test Suite', () => {
  const app = createApp();
  const request = supertest(app);

  it('should disable X-Powered-By header across all HTTP responses', async () => {
    const res = await request.get('/health');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('should include X-Content-Type-Options: nosniff header', async () => {
    const res = await request.get('/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('should include clickjacking protection (X-Frame-Options: DENY)', async () => {
    const res = await request.get('/health');
    expect(res.headers['x-frame-options']).toBe('DENY');
  });

  it('should include Referrer Policy (strict-origin-when-cross-origin)', async () => {
    const res = await request.get('/health');
    expect(res.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
  });

  it('should include Cross-Origin Resource Policy (cross-origin)', async () => {
    const res = await request.get('/health');
    expect(res.headers['cross-origin-resource-policy']).toBe('cross-origin');
  });

  it('should NOT include HSTS Strict-Transport-Security during development/test mode', async () => {
    const res = await request.get('/health');
    expect(res.headers['strict-transport-security']).toBeUndefined();
  });
});
