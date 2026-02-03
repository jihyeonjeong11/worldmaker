import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Server } from 'http';
import app from '../index.js';

describe('Express Server Test', () => {
  let server: Server;
  const port = 3001; // 테스트용 포트

  // 테스트 시작 전 서버 실행
  beforeAll(() => {
    server = app.listen(port);
  });

  // 테스트 종료 후 서버 종료 (매우 중요: 안 하면 포트가 계속 열려있음)
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
