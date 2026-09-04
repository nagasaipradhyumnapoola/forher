/**
 * POST /api/log  — persists a session's running event list to the private
 * GitHub repo. Called automatically by the client on every meaningful event.
 * The GitHub token lives only in this server runtime (env var), never the client.
 */
import { logSession } from '../server/core';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'method_not_allowed' });
    return;
  }
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const result = await logSession(body);
    res.status(200).json(result);
  } catch {
    // Never surface internals; logging must never break the experience.
    res.status(200).json({ ok: false, skipped: true, reason: 'error' });
  }
}
