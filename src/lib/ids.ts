/** Random id, good enough for local rows and the per-install id. Not cryptographic. */
export function newId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}
