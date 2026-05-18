/**
 * Normalize token field from various backend response shapes.
 * @param {unknown} payload
 * @returns {string | null}
 */
export function extractAuthToken(payload) {
  if (!payload || typeof payload !== 'object') return null;
  const p = /** @type {Record<string, unknown>} */ (payload);
  if (typeof p.accessToken === 'string') return p.accessToken;
  if (typeof p.token === 'string') return p.token;
  const inner = p.data;
  if (inner && typeof inner === 'object') {
    const d = /** @type {Record<string, unknown>} */ (inner);
    if (typeof d.access_token === 'string') return d.access_token;
    if (typeof d.accessToken === 'string') return d.accessToken;
    if (typeof d.token === 'string') return d.token;
  }
  return null;
}
