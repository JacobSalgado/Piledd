const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({message: 'NOT AUTHENTICATED'});
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256']});
        req.userId = payload.id;
        next();
    } catch {
        return res.status(401).json({message: 'Session expired. Please log in again'});
    }
}
module.exports = requireAuth;