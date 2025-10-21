/*!
 * ***********************************
 * @ldesign/store v0.1.0           *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:47 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
function fastStringify(value) {
  if (value === null)
    return "null";
  if (value === void 0)
    return "undefined";
  const type = typeof value;
  if (type === "string")
    return `"${value}"`;
  if (type === "number" || type === "boolean")
    return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return "null";
  }
}
function fastParse(value) {
  if (!value || value === "null" || value === "undefined")
    return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
function safeCopy(value) {
  if (typeof structuredClone !== "undefined") {
    try {
      return structuredClone(value);
    } catch {
    }
  }
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return value;
  }
}
function fastEqual(a, b) {
  if (a === b)
    return true;
  if (typeof a !== typeof b)
    return false;
  if (a === null || b === null)
    return a === b;
  if (typeof a !== "object")
    return a === b;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length)
      return false;
    const len2 = a.length;
    for (let i = 0; i < len2; i++) {
      if (!fastEqual(a[i], b[i]))
        return false;
    }
    return true;
  }
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length)
    return false;
  const len = keysA.length;
  for (let i = 0; i < len; i++) {
    const key = keysA[i];
    if (!Object.prototype.hasOwnProperty.call(b, key))
      return false;
    if (!fastEqual(a[key], b[key]))
      return false;
  }
  return true;
}
function shallowCopy(obj) {
  if (obj === null || typeof obj !== "object")
    return obj;
  if (Array.isArray(obj)) {
    return obj.slice();
  }
  return { ...obj };
}

export { fastEqual, fastParse, fastStringify, safeCopy, shallowCopy };
//# sourceMappingURL=fast-serializer.js.map
