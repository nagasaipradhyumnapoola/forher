/**
 * POST /api/sessions  — admin-only. Returns every stored session (parsed +
 * raw markdown) after verifying the admin password server-side. Used by the
 * /admin dashboard. Requires ADMIN_PASSWORD to be set.
 */
import { listSessions } from '../server/core';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'method_not_allowed' });
    return;
  }
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const result = await listSessions(body?.password);
    res.status(result.ok ? 200 : 401).json(result);
  } catch {
    res.status(500).json({ ok: false, error: 'server_error' });
  }
}
