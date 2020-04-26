var mongoose = require("mongoose");

var booksschema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  tittle: String,
  author: String,
  publishedyear: Number,
  numberOfBooks: Number,
  available: Number
});
module.exports = mongoose.model("book", booksschema);
