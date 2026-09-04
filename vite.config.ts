import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { logSession, listSessions } from './server/core';

// Dev-only middleware that mirrors the Vercel /api functions, so `npm run dev`
// logs to GitHub exactly like production. Reads the same .env vars server-side;
// the token is never exposed to the browser bundle.
function devApi(env: Record<string, string>): Plugin {
  for (const k of ['GITHUB_TOKEN', 'GITHUB_OWNER', 'GITHUB_REPO', 'GITHUB_BRANCH', 'SESSIONS_DIR', 'ADMIN_PASSWORD']) {
    if (env[k] !== undefined && process.env[k] === undefined) process.env[k] = env[k];
  }

  const readBody = (req: any): Promise<any> =>
    new Promise((resolve) => {
      let data = '';
      req.on('data', (c: any) => (data += c));
      req.on('end', () => {
        try {
          resolve(data ? JSON.parse(data) : {});
        } catch {
          resolve({});
        }
      });
      req.on('error', () => resolve({}));
    });

  return {
    name: 'moksha-dev-api',
    configureServer(server) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        const url = (req.url || '').split('?')[0];
        if (req.method !== 'POST' || (url !== '/api/log' && url !== '/api/sessions')) return next();
        const body = await readBody(req);
        const send = (code: number, obj: unknown) => {
          res.statusCode = code;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(obj));
        };
        try {
          if (url === '/api/log') send(200, await logSession(body));
          else {
            const result = await listSessions(body?.password);
            send(result.ok ? 200 : 401, result);
          }
        } catch {
          send(200, { ok: false, skipped: true });
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), devApi(env)],
    server: {
      port: 3000,
      open: false,
    },
  };
});
