const mongoose = require("mongoose");
var ObjectId = require('mongodb').ObjectID

const Logement = mongoose.model(
  "Logement",
  new mongoose.Schema({    
    title: { type: String, required: true},
    slug: { type: String, required: true},
    price: { type: Number, required: true},
    photos: [],
    type: { type: String, required: true},
    bathrooms : Number,
    bedrooms : Number,
    beds : Number,
    details_logement: String,
    reduction : Number,
    cleaning_fees : Number,
    service_fees : Number,
    services_included: [{ type : ObjectId, ref: 'Service' }],
    equipements:  [{ type : ObjectId, ref: 'Equipement' }],
    details_location: String,
    location: [],
    number_fans : [],
    created: Date,
    updated: Date
  })
);

module.exports = Logement;
