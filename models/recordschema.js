var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var recordschema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  bookid: {
    type: Schema.Types.ObjectId,
    ref: "book",
    require: true
  },
  userid: {
    type: Schema.Types.ObjectId,
    ref: "member",
    require: true
  },
  borrowDate: {
    type: Date
  },
  submissionDeadline: {
    type: Date
  },
  deadlineExtended : {
    type : Boolean,
    default : false
  },
  completed: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model("record", recordschema);
