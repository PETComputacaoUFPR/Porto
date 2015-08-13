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

Materia.path('codigo').validate(function(value) {
    return /\b[a-zA-Z][a-zA-Z][0-9]+\b/.test(value)
}, 'Class code validation failed')

module.exports = mongoose.model('Materia', Materia)
