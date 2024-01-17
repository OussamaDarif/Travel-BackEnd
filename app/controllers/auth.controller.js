const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const User_google = db.user_google ;
const Role = db.role;
require('dotenv').config();


var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

exports.signup = (req, res) => {
  const user = new User({
    phone: req.body.phone,
    fullname: req.body.fullname,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
    created: new Date(),
    updated: new Date()
  });

  user.save((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
      Role.findOne({ name: "user" }, (err, role) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        user.role = role._id;
        user.save(err => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          res.send({ message: "L'utilisateur a été enregistré avec succès!" });
        });
      });
  });
};

exports.signin = (req, res) => {
  User.findOne({
    email: req.body.email
  })
    .populate("role", "-__v")
    .exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      if (!user) {
        return res.status(404).send({ message: "Utilisateur non trouvé." });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Mot de passe incorrect!"
        });
      }
      delete user.password;
      delete user.phone;

      var token = jwt.sign({ user: user }, config.secret, {
        expiresIn: "20d" // 20 days
      });

      var authorities = [];
          authorities.push("ROLE_" + user.fullname.toUpperCase());

      res.status(200).send({
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        phone: user.phone,
        role: authorities,
        accessToken: token
      });
    });
};

exports.signin_gmail = (req, res) => {
  User_google.findOne({
    email: req.body.email,
    fullname: req.body.fullname,
    idclient: req.body.idclient
  })
    .populate("role", "-__v")
    .exec((err, user_google) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      if (!user_google) {
        signup_gmail(req, res);
        // return res.status(404).send({ message: "Utilisateur non trouvé." });
      } else {
        var token = jwt.sign({ user: user_google }, config.secret, {
          expiresIn: "20d" // 20 days
        });
        
        var authorities = [];
            authorities.push("ROLE_" + user_google.fullname.toUpperCase());

          res.status(200).send({
          id: user_google._id,
          fullname: user_google.fullname,
          email: user_google.email,
          idclient: user_google.idclient,
          role: authorities,
          accessToken: token
        });
      }
    });
};


function signup_gmail(req, res) {
  const user_google = new User_google({
    fullname: req.body.fullname,
    email: req.body.email,
    idclient: req.body.idclient,
    created: new Date(),
    updated: new Date()
  });

  user_google.save((err, user_google) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

  
      Role.findOne({ name: "user" }, (err, role) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        user_google.role = role._id;
        user_google.save(err => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          var token = jwt.sign({ id: user_google.id }, config.secret, {
            expiresIn: "20d" // 20 days
          });
        
          var authorities = [];
              authorities.push("ROLE_" + user_google.fullname.toUpperCase());
  
            res.status(200).send({
            id: user_google._id,
            fullname: user_google.fullname,
            email: user_google.email,
            idclient: user_google.idclient,
            role: authorities,
            accessToken: token
          });

        });
      });
  });
};


exports.emailVerification = (req, res) => {
  User_google.findOne({
    email: req.body.email,
  })
    .populate("role", "-__v")
    .exec((err, user_google) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      if (!user_google) {
        User.findOne({
          email: req.body.email,
        })
          .populate("role", "-__v")
          .exec((err, user_simple) => {
            if (err) {
              res.status(500).send({ message: err });
              return;
            }
            if (user_simple) {
              res.status(200).send({
                user_check: 'isSimpleUser',
              });
            } else {
              res.status(200).send({
                user_check: 'Undefined',
              });
            }
          });
      } else {
          res.status(200).send({
          user_check: 'isGmailUser',
        });
      }
    });
};

exports.sendMailVerification = (req, res) => {
  if(req.body){
      let user = req.body;
      // let GenerateCode = GenerateText(6)
      const sendMail = (user, callback) => {
          var transport = nodemailer.createTransport({
            host: "mail.travelbyrec.com",
            port: 465,
            secure: true,
            pool: true,
            auth: {
              user: process.env.EMAIL,
              pass: process.env.PASSWORD
          }
        });
        const mailOptions = {
          from: process.env.EMAIL,
          to: `${user.email}`,////////// ⛔ Required ⛔ ////////////
          subject: "Code de validation <TravelByRec>",
          html: "<b>Bonjour, </b>" + ",<br><br>" + "Nous vous remercions d’avoir choisi <b>TravelByRec.</b> <br> " + 
                 ` Vous venez de créer un compte sur TravelByRec,` + ' Avant de pouvoir utiliser votre compte,' + " vous devez vérifier que cette adresse e-mail est bien la vôtre. <br> Votre Code de validation :" + `<b style="color:green; font-size:20px;">${user.v_code}</b> <br><br>` + "Cordialement, <br><br> <b>L\'équipe TravelByRec</b>"
        };
        transport.sendMail(mailOptions, callback);
      }
      sendMail(user, (err, info) => {
        if (err) {
          res.status(400).send({
            error: 'Failed to send email',
          });
        } else {
          res.status(200).send({
            message: 'E-mail envoyé avec succès',
          });
        }
      });
    }
};

exports.passwordOublier = (req, res) => {
  if(req.body){
    let userData = req.body;
    User.findOne({
      email: userData.email,
    })
      .populate("role", "-__v")
      .exec((err, user_simple) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
        if (user_simple) {
          const sendMail = (user, callback) => {
              var transport = nodemailer.createTransport({
                // service: "gmail",
                host: "mail.travelbyrec.com",
                port: 465,
                secure: true,
                pool: true,
                auth: {
                  user: process.env.EMAIL,
                  pass: process.env.PASSWORD
              }
            });
            const mailOptions = {
              from: process.env.EMAIL,
              to: `${userData.email}`,////////// ⛔ Required ⛔ ////////////
              subject: "Votre lien de réinitialisation de mot de passe pour votre compte <TravelByRec>",
              html: "<b>Bonjour </b>" + ` ${user_simple.fullname}` + ",<br><br>" + "Il semble que vous ayez oublié votre mot de passe pour <b>TravelByRec</b>, Si tel est le cas, cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe. <br><br> " + 
               "Réinitialiser mon mot de passe : " + `<b style="color:blue;"> https://travelbyrec.com/authentification/resetPassword/${user_simple._id}</b> <br><br>` + "Si vous n'avez pas oublié votre mot de passe, veuillez ne pas tenir compte de cet e-mail. <br><br>" + "Cordialement, <br><br> <b>L\'équipe TravelByRec</b>"
            };
            transport.sendMail(mailOptions, callback);
          }
          sendMail(userData, (err, info) => {
            if (err) {
              res.status(400).send({
                error: 'Failed to send email',
              });
            } else {
              res.status(200).send({
                message: 'E-mail envoyé avec succès',
              });
            }
          });
        } else {
          res.status(400).send({
            message: 'L\'utilisateur de cet email n\'existe pas',
          });
        }
      });
    }
};


exports.resetPassword = (req, res) => {
  if(req.body){
    let userData = req.body;
    User.findById({
      _id: userData.userId,
    })
      .populate("role", "-__v")
      .exec((err, user_simple) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
        if (user_simple) {
            user_simple.password = bcrypt.hashSync(userData.newPassword, 8);
          User.findByIdAndUpdate(userData.userId, user_simple, {
              useFindAndModify: false
          })
          .then(data => {
              if (!data) {
                  res.status(404).send({
                      message: `Impossible de mettre à jour le mot de passe utilisateur. Peut-être que l'utilisateur n'a pas été trouvé !`
                  });
              } else res.send({
                  message: "Le mot de passe utilisateur a été mis à jour avec succès."
              });
          })
          .catch(err => {
              res.status(500).send({
                  message: "Erreur lors de la mise à jour du mot de passe utilisateur"
              });
          });
        } else {
          res.status(400).send({
            message: 'L\'utilisateur de cet email n\'existe pas',
          });
        }
      });
    }
};
