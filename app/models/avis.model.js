const mongoose = require("mongoose");
var ObjectId = require('mongodb').ObjectID

const Avis = mongoose.model(
  "Avis",
  new mongoose.Schema({
    fullname:  { type: String, required: true},
    id_client: { type: ObjectId, required: true},
    id_logement: { type: ObjectId, required: true},
    date_avis: { type: String, required: true},
    rating: { type: Number, required: true},
    content_avis: { type: String, required: true},
    created: Date,
    updated: Date
  })
);

module.exports = Avis;
