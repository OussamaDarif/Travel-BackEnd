const dbConfig = require("../config/db.config.js");

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
db.user = require("./user.model");
db.user_google = require("./user-google-auth.model");
db.service = require("./service.model");
db.category = require("./category.model");
db.equipement = require("./equipement.model");
db.logement = require("./logement.model ");
db.contact = require("./contact.model");
db.reservation = require("./reservation.model");
db.avis = require("./avis.model");
db.role = require("./role.model");
db.paiement = require("./paiement.model");

db.ROLES = ["user", "admin"];

module.exports = db;
