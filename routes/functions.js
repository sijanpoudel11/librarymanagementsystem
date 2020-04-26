var booksSchema = require('../models/bookschema');
var membersSchema = require("../models//userschema");
var recordSchema = require("../models/recordschema");
module.exports = {
    
returnBooks : function(bookid){
    booksSchema.findById(bookid)
    .exec()
    .then(books=>{
        
        return books;
    })
    .catch(err=>{
        return err;
    })
}

}