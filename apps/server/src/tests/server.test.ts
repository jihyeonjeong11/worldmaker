import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Server } from 'http';
import app from '../index.js';

describe('Express Server Test', () => {
  let server: Server;
  const port = 3001;

  beforeAll(() => {
    server = app.listen(port);
  });

  afterAll(() => {
    server.close();
  });

  it('Should return 200', async () => {
    const res = await fetch(`http://localhost:${port}/`);
    const text = await res.text();

    expect(res.status).toBe(200);
    expect(text).toBe('Worldmaker Server is running!');
  });
});
