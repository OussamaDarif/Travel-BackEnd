const mongoose = require("mongoose");

const User_google = mongoose.model(
  "User_google",
  new mongoose.Schema({
    fullname: { type: String, required: true},
    email: { type: String, required: true},
    idclient: String,
    role: 
      {
        type:  mongoose.Schema.Types.ObjectId,
        ref: "Role"
      },
      created: Date,
      updated: Date
  })
);

module.exports = User_google;
