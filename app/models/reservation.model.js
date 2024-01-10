const mongoose = require("mongoose");
var ObjectId = require('mongodb').ObjectID

const Reservation = mongoose.model(
  "Reservation",
  new mongoose.Schema({
    id_client:  [{ type : ObjectId, ref: 'User', required: true  }],
    id_logement:  [{ type : ObjectId, ref: 'Logement', required: true }],
    date_arrivee: { type: Date, required: true},
    date_depart: { type: Date, required: true},
    prix_total: { type: Number, required: true},
    voyageurs: { type: [], required: true},
    type_paiement: { type: String, required: true},
    reservation_number: { type: Number, required: true},
    services: {},
    created: Date,
    updated: Date
  })
);

module.exports = Reservation;
