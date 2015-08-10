var mongoose = require('mongoose')
var Schema = mongoose.Schema
var Materia = require('./materia')
var Teacher = require('./teacher')
var User = require('./user')

var Test = new Schema({
    name: {
        type: String,
        required: true
    },
    // Test or assignment
    type: {
        type: String,
        default: 'prova'
    },
    // First, second, third or final
    number: {
        type: String
    },
    substituive: {
        type: Boolean,
        default: false
    },
    year: {
        type: Number
    },
    semester: {
        type: Number
    },
    // Path to file
    file: {
        type: String,
        required: true
    },
    // Approved or pendent
    status: {
        type: String,
        default: 'pendente'
    },
    // PDF or image?
    fileType: {
        type: String
    },
    materia: {
        type: Schema.Types.ObjectId,
        ref: 'Materia'
    },
    teacher: {
        type: Schema.Types.ObjectId,
        ref: 'Teacher'
    },
    // Who uploaded
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})

module.exports = mongoose.model('Test', Test)
