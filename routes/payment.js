const express = require("express");
const { PayMe } = require("../controllers/payment");
const router = express.Router();

router.post("/request/account/confirmation",PayMe);
module.exports = router;
