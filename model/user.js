const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    phone: { type: String, required: true },
    stage: { type: Number, required: true },
    qty: { type: Number, required: true },
    amount: { type: Number, required: true },
    payment_key: { type: String, required: true },
    merchant_name: { type: String, required: true },
    account_no: { type: String, required: true },
    bank: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("users", userSchema);
