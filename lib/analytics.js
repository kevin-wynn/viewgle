const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const analyticsSchema = new Schema({
  url: String,
  params: {},
  query: {},
  body: {},
  method: String,
  ip: {},
  date: Date
});

module.exports = mongoose.model("Analytics", analyticsSchema);
