export function requireUser(req, res, next) {
  const uid = req.headers['x-user-uid'] || req.body?.uid || req.query?.uid;
  if (!uid || typeof uid !== 'string' || !uid.trim()) {
    return res.status(400).json({ error: 'Thiếu mã người dùng.' });
  }
  req.user = { uid: uid.trim() };
  next();
}
