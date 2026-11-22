// structured JSON logs written to stdout/stderr
// journald -> rsyslog -> log-vm
function write(level, message, meta = {}) {
    const entry = JSON.stringify({
        time: new Date().toISOString(),
        level,
        message,
        ...meta,
    });

    if (level === 'error') console.error(entry);
    else console.log(entry);
}

module.exports = {
    info: (message, meta) => write('info', message, meta),
    warn: (message, meta) => write('warn', message, meta),
    error: (message, meta) => write('error', message, meta),
};