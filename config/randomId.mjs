export function randomId() {
  // Prefer random UUID for collision safety
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : randomIdWithBase();
}

function randomIdWithBase(length = 6, base = 36) {
  return Math.random()
    .toString(base)
    .substring(2, length);
}