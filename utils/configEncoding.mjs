import jsonpack from "jsonpack";

export function encode(value) {
  let result = value;
  result = jsonpack.pack(value);
  result = window.btoa ? btoa(result) : result;
  return result;
}

/* export function minifyKeys(value) {
    const keys = [];
    const keyMap = {};
    const buildKeyMap = (obj) => {
        const alreadyUsedKeys = [];
        const keyMap = {};
        Object.keys(obj).forEach(k => {
            if (keyMap[k]) {
                return;
            }
            let shortKey = key.charAt(0);
            let i = 0;
            while(alreadyUsedKeys.indexOf(shortKey) !== -1 || shortKey.length === k.length) {
                shortKey += key.charAt(i);
            }
        })
        return keyMap;
    }
    Object.keys(value).forEach(k => {
        let usedKey = k;
        let i = 0;
        while(keys.indexOf(usedKey) !== -1) {
            for (let j = 0; j < k.length; j++) {
                usedKey += k.charAt(i + j);
                if (i === k.length-1 && j === k.length-1) {
                    return k
                }
            }
            i++;
        }
    });
    return keyMap;
} */

export function decode(value) {
  let result = value;
  result = jsonpack.unpack(result);
  result = atob(result);
  return result;
}