var mongoose = require('mongoose')
var Schema = mongoose.Schema

var Professor = new Schema({
    nome: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Professor', Professor)
