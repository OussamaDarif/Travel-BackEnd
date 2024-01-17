const { authJwt } = require("../middlewares");

module.exports = function (app) {
  const controller = require("../controllers/equipement.controller");

  var router = require("express").Router();


  // Retrieve all Equipements
  router.get("/", controller.findAllequipement);

  router.put("/create/:id", [authJwt.verifyToken], controller.addEquipement);

  // Delet Equipement
  router.delete("/delete/:id", [authJwt.verifyToken], controller.deleteEquipement);

  // Delet Equipement
  router.put("/update/:id", [authJwt.verifyToken], controller.updateEquipement);


  app.use("/api/equipement", router);
};