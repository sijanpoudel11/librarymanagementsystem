var mongoose = require("mongoose");

var usersschema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: String,
  address: String,
  contacts: Number,
  joinedYear: String,
  evaluation: String
});
module.exports = mongoose.model("member", usersschema);
