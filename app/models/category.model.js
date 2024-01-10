const mongoose = require("mongoose");
var ObjectId = require('mongodb').ObjectID

const Category = mongoose.model(
  "Category",
  new mongoose.Schema({
    name: { type: String, required: true},
    services: [{ type : ObjectId, ref: 'Service', required: true }],
    created: Date,
    updated: Date
  })
);

module.exports = Category;
