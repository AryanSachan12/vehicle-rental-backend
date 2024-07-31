const mongoose = require("mongoose");
const { Schema } = mongoose;

const ListingSchema = new Schema({
  url: String,
  name: String,
  monthlyRate: String,
  dailyRate: String,
  extraPrice: String,
  type: String,
});

const ListingModel = mongoose.model("Listings", ListingSchema);

module.exports = ListingModel;
