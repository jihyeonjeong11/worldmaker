import { describe, it, expect } from 'vitest';

describe('GET /', () => {
  it('should return 200 OK', async () => {
    const res = await fetch('http://localhost:3000/');
    expect(res.status).toBe(200);
  });
});
