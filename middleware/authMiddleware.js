const jwt = require("jsonwebtoken");
const Role = require("../models/Role");

function authMiddleware(requiredRoles = []) {
  return async function (req, res, next) {
    const token = req.header("Authorization").split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      if (requiredRoles.length > 0) {
        const userRole = await Role.findById(req.user.role);

        if (!requiredRoles.includes(userRole.roleName)) {
          return res
            .status(403)
            .json({ message: "Forbidden: You do not have the required role" });
        }
      }

      next();
    } catch (error) {
      res.status(401).json({ message: "Token is not valid" });
    }
  };
}

module.exports = authMiddleware;
