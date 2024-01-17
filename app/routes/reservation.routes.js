const { authJwt } = require("../middlewares");

module.exports = function(app) {
  const controller = require("../controllers/reservetion.controller");

  var router = require("express").Router();


  router.put("/create/", [authJwt.isAuthorized],  controller.addReservation);
  // router.get("/create/",  controller.addReservation);
  
  // Retrieve all Reservations
  router.get("/", [authJwt.verifyToken], controller.findAllReservations);
  
  // Retrieve One Reservation
  router.get("/single-reservation/:oid", controller.findSingleReservations);

  // Delet Reservation
  router.delete("/delete/:id", [authJwt.verifyToken], controller.deleteReservation);
  
  router.post("/sendmail/", controller.sendMailConfirmation);

  app.use("/api/reservation", router);
};
