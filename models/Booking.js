const mongoose = require("mongoose");
const { Schema } = mongoose;

const bookingSchema = new Schema({
  name: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  user: { type: String },
});

const BookingModel = mongoose.model("Booking", bookingSchema);

module.exports = BookingModel;
