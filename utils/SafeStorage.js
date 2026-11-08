export class SafeStorage {
  #store = null;
  #mem = new Map(); // fallback when storage is blocked (private mode, sandboxed iframes)
  #prefix;

  constructor({ prefix = "", storage = "localStorage" } = {}) {
    this.#prefix = prefix;
    try {
      const s = window[storage];
      const t = "__ss_test__";
      s.setItem(t, "1");
      s.removeItem(t);
      this.#store = s;
    } catch { this.#store = null; }
  }

  get persistent() {
    return this.#store !== null;
  }

  #k(key) {
    return this.#prefix + key;
  }

  get(key, fallback = null) {
    try {
      const k = this.#k(key);
      const raw = this.#store ? this.#store.getItem(k) : this.#mem.get(k);
      return raw == null ? fallback : JSON.parse(raw);
    } catch { return fallback; } // corrupted JSON or access error
  }

  set(key, value) {
    try {
      const raw = JSON.stringify(value);
      if (raw === undefined) return this.remove(key); // undefined/functions can't be serialized
      const k = this.#k(key);
      this.#store ? this.#store.setItem(k, raw) : this.#mem.set(k, raw);
      return true;
    } catch { return false; } // quota exceeded, circular reference, etc.
  }

  has(key) {
    try {
      const k = this.#k(key);
      return (this.#store ? this.#store.getItem(k) : this.#mem.get(k)) != null;
    } catch { return false; }
  }

  remove(key) {
    try {
      const k = this.#k(key);
      this.#store ? this.#store.removeItem(k) : this.#mem.delete(k);
      return true;
    } catch { return false; }
  }

  clear() {
    try {
      if (!this.#store) {
        for (const k of [...this.#mem.keys()]) {
          if (k.startsWith(this.#prefix)) this.#mem.delete(k);
        }
        return true;
      }
      // Only remove our own keys, not the whole origin's storage
      const mine = [];
      for (let i = 0; i < this.#store.length; i++) {
        const k = this.#store.key(i);
        if (k && k.startsWith(this.#prefix)) mine.push(k);
      }
      mine.forEach((k) => this.#store.removeItem(k));
      return true;
    } catch { return false; }
  }
}