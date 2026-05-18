/**
 * @param {unknown} error
 * @returns {string}
 */
export function getApiErrorMessage(error) {
  const data = error?.response?.data;
  if (data && typeof data === 'object') {
    const msg = /** @type {Record<string, unknown>} */ (data).message;
    if (typeof msg === 'string' && msg.trim()) return msg;
    if (Array.isArray(msg) && msg.length) {
      return msg.map((x) => String(x)).filter(Boolean).join('. ');
    }
    const err = /** @type {Record<string, unknown>} */ (data).error;
    if (typeof err === 'string' && err.trim()) return err;
    const m2 = /** @type {Record<string, unknown>} */ (data).msg;
    if (typeof m2 === 'string' && m2.trim()) return m2;
    const errors = /** @type {Record<string, unknown>} */ (data).errors;
    if (errors && typeof errors === 'object') {
      const first = Object.values(errors)[0];
      if (Array.isArray(first) && first[0] != null) return String(first[0]);
      if (typeof first === 'string' && first.trim()) return first;
    }
  }
  if (error instanceof Error && error.message) return error.message;
  return 'Something went wrong. Please try again.';
}
