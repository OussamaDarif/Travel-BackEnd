const { authJwt } = require("../middlewares");

module.exports = function (app) {
  const controller = require("../controllers/category.controller");

  var router = require("express").Router();


  // Retrieve all Categories
  router.get("/",[authJwt.verifyToken], controller.findAllcategories);

  // Retrieve all Services_category
  router.get("/aggregate", controller.categoriesAggregate);

  router.put("/create/", [authJwt.verifyToken], controller.addCategory);

  // Delet Category
  router.delete("/delete/:id", [authJwt.verifyToken], controller.deleteCategory);

  // Delet Category
  router.put("/update/:id", [authJwt.verifyToken], controller.updateCategory);


  app.use("/api/category", router);
};