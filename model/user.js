const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  phone: { type: String, required: true },
  stage: { type: Number, required: true },
  
});

module.exports = mongoose.model("users", userSchema);