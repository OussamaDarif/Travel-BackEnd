const mongoose = require("mongoose");

const Contact = mongoose.model(
  "Contact",
  new mongoose.Schema({
    nom: { type: String, required: true},
    prenom: { type: String, required: true},
    telephone: { type: String, required: true},
    sujet: { type: String, required: true},
    message: { type: String, required: true},
    created: Date,
    updated: Date
  })
);

module.exports = Contact;
