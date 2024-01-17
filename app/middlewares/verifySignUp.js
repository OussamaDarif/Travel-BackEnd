const db = require("../models");
const ROLES = db.ROLES;
const User = db.user;
const User_google = db.user_google ;

checkDuplicateUsernameOrEmail = (req, res, next) => {
  // fullname
  User.findOne({
    fullname: req.body.fullname
  }).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (user) {
      res.status(400).send({ message: "Opération a échoué! Le nom saisi est déjà utilisé!" });
      return;
    }

    // Email
    User.findOne({
      email: req.body.email
    }).exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      if (user) {
        res.status(400).send({ message: "Opération a échoué! Cet email est déjà utilisé!" });
        return;
      }
      next();
    });
  });


};

checkRolesExisted = (req, res, next) => {
  if (req.body.role) {
      if (!ROLES.includes(req.body.role)) {
        res.status(400).send({
          message: `Opération a échoué! Rôle ${req.body.role} n'existe pas!`
        });
        return;
      }
  }
  next();
};

const verifySignUp = {
  checkDuplicateUsernameOrEmail,
  checkRolesExisted
};

module.exports = verifySignUp;
