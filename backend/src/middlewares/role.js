function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    let userRole = req.user?.role?.toLowerCase();
    // Mapping 'pemilik' ke 'owner' agar kompatibel
    if (userRole === 'pemilik') userRole = 'owner';
    const allowed = allowedRoles.map(r => r.toLowerCase());
    if (!userRole || !allowed.includes(userRole)) {
      return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }
    next();
  };
}

module.exports = authorizeRoles; 