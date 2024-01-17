const { authJwt } = require("../middlewares");

module.exports = function(app) {
  const controller = require("../controllers/contact.controller");

  var router = require("express").Router();


  router.put("/create/",controller.addContact);

  // Retrieve all Contacts
  router.get("/", [authJwt.verifyToken], controller.findAllContacts);

  // Delet Contact
  router.delete("/delete/:id", [authJwt.verifyToken], controller.deleteContact);
  
  // Delet Contact
  router.put("/update/:id", [authJwt.verifyToken], controller.updateContact);

  app.use("/api/contact", router);
};
