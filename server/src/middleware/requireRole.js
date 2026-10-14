export function requireRole(...allowedRoles) {
  return function (req, res, next) {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        details: `Requires one of: ${allowedRoles.join(', ')}`,
      });
    }

    next();
  };
}