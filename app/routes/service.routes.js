const { authJwt } = require("../middlewares");

module.exports = function(app) {
  const controller = require("../controllers/service.controller");

  var router = require("express").Router();


  router.post("/create/:id", [authJwt.verifyToken], controller.addService);

  // Retrieve all Services
  router.get("/",[authJwt.verifyToken], controller.findAllservices);

  // Delet Service
  router.delete("/delete/:id", [authJwt.verifyToken], controller.deleteService);
  
  // Delet Service
  router.put("/update/:id", [authJwt.verifyToken], controller.updateService);

  app.use("/api/service", router);
};
