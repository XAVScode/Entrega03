
const express = require('express');
const router = require('../app/controllers/router');
const app = express();
const PORT = 3000;
const mongoose = require("mongoose");
require("dotenv").config();
const userRoute = require("./routes/user");
const productRoute = require("./routes/product");



app.use(express.static("app"));
app.use("/views", express.static("views"));
// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", userRoute);
app.use("/api", productRoute);
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((error) => console.error(error));

app.use(router);

app.listen(PORT, () => {
    console.log("App on port: " + PORT);
});