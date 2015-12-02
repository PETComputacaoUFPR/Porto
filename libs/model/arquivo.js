var mongoose = require('mongoose')
var Schema = mongoose.Schema
var Materia = require('./materia')
var Professor = require('./professor')
var Usuario = require('./usuario')

var Arquivo = new Schema({
    nome: {
        type: String,
        required: true
    },
    // Prova ou trabalho
    tipo: {
        type: String,
        default: 'prova'
    },
    // Prova/trabalho 1, 2, 3 ou final
    numero: {
        type: String
    },
    substitutiva: {
        type: Boolean,
        default: false
    },
    ano: {
        type: Number
    },
    semestre: {
        type: Number
    },
    // Caminho até o arquivo
    arquivo: {
        type: String,
        required: true
    },
    // aprovado ou pendente
    status: {
        type: String,
        default: 'pendente'
    },
    // PDF ou imagem?
    tipoArquivo: {
        type: String
    },
    materia: {
        type: Schema.Types.ObjectId,
        ref: 'Materia'
    },
    professor: {
        type: Schema.Types.ObjectId,
        ref: 'Professor'
    },
    // Quem fez o upload
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    },
    // Quem aprovou o upload
    moderador: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    }
})

module.exports = mongoose.model('Arquivo', Arquivo)
