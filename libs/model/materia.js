var mongoose = require('mongoose')
var Schema = mongoose.Schema

var Materia = new Schema({
    nome: {
        type: String,
        required: true
    },
    codigo: {
        type: String,
        required: true,
        unique: true
    }
})

module.exports = mongoose.model('Materia', Materia)
