var mongoose = require('mongoose');

var adminschema = new mongoose.Schema({
    username :{
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    }
})

module.exports = mongoose.model('admin',adminschema);