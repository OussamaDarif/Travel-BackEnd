const mongoose = require("mongoose");

const Equipement = mongoose.model(
  "Equipement",
  new mongoose.Schema({
    name: { type: String, required: true},
    icon: String,
    created: Date,
    updated: Date
  })
);

module.exports = Equipement;
