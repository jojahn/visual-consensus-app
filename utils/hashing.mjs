export async function hash(data, nonce = "", algorithm = "sha-256") {
  if (typeof crypto === "undefined" || !crypto || !crypto.subtle) {
    return JSON.stringify(data) + nonce;
  }
  const bytes = stringToByteArray(JSON.stringify(data) + nonce);
  const buffer = await crypto.subtle.digest(algorithm, bytes);
  const array = Array.from(new Uint8Array(buffer));
  return array.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function verify(hashValue, data, nonce = "", algorithm = "sha-256") {
  if (typeof crypto === "undefined" || !crypto || !crypto.subtle) {
    const h = JSON.stringify(data) + nonce;
    return h === hashValue;
  }
  const h = await hash(data, nonce, algorithm);
  return h === hashValue;
}

function stringToByteArray(value) {
  const encoder = new TextEncoder();
  return encoder.encode(value);
}
