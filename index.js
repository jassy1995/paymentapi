const express = require("express");
const app = express();
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const mongoose = require("mongoose");
const paymentRoute = require("./routes/payment");
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const PORT = process.env.PORT || 3899;
//database connection
const db = process.env.mongoURI;
mongoose.Promise = global.Promise;
mongoose
  .connect(db, {
    useFindAndModify: false,
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } },
    replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } },
  })
  .then(() => console.log("MongoDB successfully connected"))
  .catch((err) => console.log(`Database couldn't be connected to: ${err}`));

//for security during deployment
app.use(helmet());
app.use(compression());
//solve cors problem
app.use(cors());
//allow request from frontend
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//route
app.use("/payment", paymentRoute);
//initial page
app.route("/").get(function (req, res) {
  res.sendFile(process.cwd() + "/index.html");
});

//serving the application
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
