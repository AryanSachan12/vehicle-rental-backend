const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
  fullName: String,
  userName: { type: String, unique: true },
  password: String,
  drivingLicenseNumber: String,
  address: String,
  email: { type: String, unique: true },
  contactNumber: { type: String, unique: true },
});

const UserModel = mongoose.model("User", UserSchema);
module.exports = UserModel;
