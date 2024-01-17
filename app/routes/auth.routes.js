const { authJwt } = require("../middlewares");
const { verifySignUp } = require("../middlewares");
const controller = require("../controllers/auth.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/auth/signup", [verifySignUp.checkDuplicateUsernameOrEmail, verifySignUp.checkRolesExisted], controller.signup);
  app.post("/api/auth/signin", controller.signin);
  app.get("/api/auth/isAuthorized", [authJwt.isAuthorized]);
  app.post("/api/auth/signin/admin",  [authJwt.isAdmin], controller.signin);
  app.post("/api/auth/emailVerification", controller.emailVerification);
  app.post("/api/auth/forgotPwdMail", controller.passwordOublier);
  app.post("/api/auth/sendMailVerif", controller.sendMailVerification);
  app.post("/api/auth/resetPassword", controller.resetPassword);

  app.post("/api/auth/google_signin", [verifySignUp.checkRolesExisted], controller.signin_gmail);
};
