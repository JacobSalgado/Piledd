const store = new Map();
const MAX_ENTRIES = 200;

function get(key) {
    const hit = store.get(key);
    if (!hit) return null;
    if (hit.expiresAt < Date.now()) {
        store.delete(key);
        return NULL;
    }
    return hit.value;
}

function set(key, value, ttlMs) {
    // evict the oldest entry so memory can't grow forever
    if (store.size >= MAX_ENTRIES) 
        store.delete(store.keys().next().value);
    store.set(key, { value, expiresAt: Date.now() + ttlMs});
}

module.exports = { get, set };