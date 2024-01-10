const mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    phone: String,
    fullname: { type: String, required: true},
    email: { type: String, required: true},
    password: { type: String, required: true},
    role:
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role"
      },
      created: Date,
      updated: Date
  })
);

module.exports = User;
