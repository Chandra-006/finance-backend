module.exports = (allowedRoles) => {
  return (req, res, next) => {
    // This assignment uses a simple role header instead of full auth.
    const role = req.headers["x-user-role"];

    if (!role) {
      return res.status(401).json({ error: "No role provided" });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Role is valid for this route.
    return next();
  };
};
