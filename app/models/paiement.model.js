const mongoose = require("mongoose");
var ObjectId = require('mongodb').ObjectID

const Paiement = mongoose.model(
  "Paiement",
  new mongoose.Schema({
    oid: { type: String, required: true},
    paiementStatus: { type: String, required: true},
    idReservation: { type : ObjectId, ref: 'Reservation', required: true },
    amount: { type: String},
    currency: { type: String},
    services: { type: Array},
    services_included: { type: Array},
    fees: { type: Array},
    created: Date,
    updated: Date
  })
);

module.exports = Paiement;
