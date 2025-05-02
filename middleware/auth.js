/**
 * const jwt = require("jsonwebtoken");

function authMiddleware(secret) {
  return function (req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

    if (!token) return res.status(401).json({ msg: "Token missigng" });

    jwt.verify(token, secret, (err, user) => {
      if (err) return res.status(403).json({ msg: "Invalid Token" });

      req.user = user;
      next();
    });
  };
}

module.exports = authMiddleware;

 */

const jwt = require("jsonwebtoken");

module.exports = (secret) => (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ msg: "Token required" });

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ msg: "Invalid token" });
  }
};
