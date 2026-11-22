/// keys that must never come from a client
const BLOCKED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

// recursively removes MongoDB operator keys and dotted keys from user input
function clean(value) {
    if (Array.isArray(value)) return value.map(clean);

    if (value != null && typeof value === 'object') {
        const result = {};
        for (const [key, val] of Object.entries(value)) {
            if (key.startsWith('$') || key.includes('.') || BLOCKED_KEYS.has(key)) continue;
            result[key] = clean(val);
        }
        return result;
    }
    return value;
}

function sanitizeRequest(req, rese, next) {
    if (req.body) req.body = clean(req.body);
    next();
}
module.exports = sanitizeRequest;