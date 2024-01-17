const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;
const Role = db.role;

verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized!" });
    }
    Role.findOne({ _id: decoded.user.role['_id'] },
      (err, role) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

          if (role.name === "admin") {
            next();
            return;
          }

        res.status(403).send({ message: "Require Admin Role!" });
        return;
      }
    );
  });
};

isAuthorized = (req, res, next) => {
  let token = req.headers["x-access-token"];
  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized!" });
    }
    next();
  });
};

isAdmin = (req, res, next) => {
  User.findOne({ email: req.body.email }).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    if(user){
      Role.findOne({ _id: user.role },
        (err, role) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }
  
            if (role.name === "admin") {
              next();
              return;
            }
  
          res.status(403).send({ message: "Require Admin Role!" });
          return;
        }
      );
    } else {
      res.status(500).send({ message: err });
      return;
    }
  });
};

const authJwt = {
  verifyToken,
  isAdmin,
  isAuthorized
};
module.exports = authJwt;
