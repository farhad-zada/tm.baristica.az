const mongoose = require("mongoose");
require("dotenv").config();
const bot = require("./bot");

mongoose
  .connect(process.env.DB_URI, {})
  .then(() => {
    bot.launch();
    console.log("Bot started successfully!");
  })
  .catch((err) => {
    console.error(err);
  });
