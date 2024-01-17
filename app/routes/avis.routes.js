const { authJwt } = require("../middlewares");

module.exports = function(app) {
  const controller = require("../controllers/avis.controller");

  var router = require("express").Router();


  router.post("/create/", [authJwt.verifyToken], controller.addAvis);

  // Retrieve Avis
  router.get("/",[authJwt.verifyToken], controller.fetchavis);

  // Delet Avis
  router.delete("/delete/:id", [authJwt.verifyToken], controller.deleteAvis);
  

  app.use("/api/avis", router);
};
