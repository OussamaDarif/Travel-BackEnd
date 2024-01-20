const { authJwt } = require("../middlewares");

module.exports = function (app) {
  const controller = require("../controllers/logement.controller");

  var router = require("express").Router();


  // Retrieve all Logements
  router.get("/", controller.findAll_logements);

  // Retrieve a single Logement with Slug
  router.get("/:slug", controller.findOne);


  router.post("/create/", [authJwt.verifyToken], controller.createLogement);

  router.post("/create_img/:id", [authJwt.verifyToken], controller.save_image);

  // Delet Logement
  router.delete("/delete/:id", [authJwt.verifyToken], controller.deleteLogement);

  // update Logement
  router.put("/update/:id", [authJwt.verifyToken], controller.updateLogement);

  // update Logement
  router.put("/updateOne/:id", [authJwt.isAuthorized], controller.updateSingleDocument);


  app.use("/api/logements", router);
};