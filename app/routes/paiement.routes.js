const { authJwt } = require("../middlewares");

module.exports = function(app) {
  const controller = require("../controllers/paiement.controller");

  var router = require("express").Router();

  router.post("/gateResponse", controller.callbackResponse);

  router.post("/reservation_confirme",  controller.handleOk);

  router.post("/failResHandler", controller.handleFail);

  app.use("/", router);
};
