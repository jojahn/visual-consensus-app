import jsonpack from "jsonpack";

export function encode(obj) {
  let keyMap = {};
  let result = obj;
  const [_result, _keyMap] = minifyKeys(result);
  result = jsonpack.pack(result);
  result = window.btoa ? btoa(result) : result;
  return [result, keyMap];
}

export function decode(obj, keyMap) {
  let result = obj;
  result = atob(result);
  result = jsonpack.unpack(result);
  // result = reconstructKeys(result, keyMap);
  return result;
}

function buildKeyMap(obj) {
  const alreadyUsedKeys = [];
  const keyMap = {};
  Object.keys(obj).forEach(key => {
    let shortKey = key.charAt(0);
    let i = 1;
    while (alreadyUsedKeys.indexOf(shortKey) !== -1 && shortKey.length < key.length) {
      shortKey += key.charAt(i);
      i++;
    }
    alreadyUsedKeys.push(shortKey);
    keyMap[key] = { shortKey, array: {}, nested: {} }; 
    if (obj[key] && Array.isArray(obj[key])) {
      obj[key].forEach(sub => {
        keyMap[key].array = { ...(keyMap[key].array || {}), ...buildKeyMap(sub) };
      });
    } else if (obj[key] && typeof(obj[key]) === "object" && Object.keys(obj[key]).length != 0) {
      keyMap[key].nested = buildKeyMap(obj[key]);
    }
  });
  return keyMap;
}

export function minifyKeys(obj, keyMap = undefined) {
  const result = {};
  keyMap = keyMap ? keyMap : buildKeyMap(obj);
  Object.entries(obj).forEach(([key, value]) => {
    const shortKey = keyMap[key].shortKey;
    result[shortKey] = value;
    if (typeof(keyMap[key].array) === "object" && Object.keys(keyMap[key].array).length != 0) {
      result[shortKey] = result[shortKey].map(sub => {
        const [result, _] = minifyKeys(sub, keyMap[key].array);
        return result;
      });
    } else if (typeof(keyMap[key].nested) === "object" && Object.keys(keyMap[key].nested).length != 0) {
      result[shortKey] = minifyKeys(result[shortKey])[0];
      keyMap[key].nested = buildKeyMap(obj[key]);
    }
  });
  return [result, keyMap];
}

export function reconstructKeys(obj, keyMap) {
  const result = {};
  Object.entries(keyMap).forEach(([key, mapping]) => {
    result[key] = obj[mapping.shortKey];
    if (typeof(keyMap[key].array) === "object" && Object.keys(keyMap[key].array).length != 0) {
      result[key] = obj[mapping.shortKey].map(sub => {
        return reconstructKeys(sub, keyMap[key].array);
      });
    } else if (typeof(keyMap[key].nested) === "object" && Object.keys(keyMap[key].nested).length != 0) {
      result[key] = reconstructKeys(obj[mapping.shortKey], keyMap[key].nested);
    }
  });
  return result;
}