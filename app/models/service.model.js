const mongoose = require("mongoose");

const Service = mongoose.model(
  "Service",
  new mongoose.Schema({
    name: { type: String, required: true},
    image: String,
    price: { type: Number, required: true},
    unit_measure: { type: String, required: true},
    description: String,
    created: Date,
    updated: Date
  })
);

module.exports = Service;
