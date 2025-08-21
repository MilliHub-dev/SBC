export function requireAdmin(req, res, next) {
  const key = req.headers['x-admin-key'];
  if (!process.env.ADMIN_API_KEY) {
    return res.status(500).json({ success: false, error: 'ADMIN_KEY_NOT_CONFIGURED' });
  }
  if (!key || key !== process.env.ADMIN_API_KEY) {
    return res.status(403).json({ success: false, error: 'FORBIDDEN' });
  }
  next();
}


