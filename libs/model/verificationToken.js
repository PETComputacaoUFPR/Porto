var mongoose = require('mongoose')
var Schema = mongoose.Schema
var Usuario = require('./usuario')
var uuid = require('node-uuid')

var VerificationToken = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Usuario'
    },
    token: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
        expires: '4h'
    }
})

VerificationToken.methods.createVerificationToken = function(done) {
    var verificationToken = this
    var token = uuid.v4()
    verificationToken.set('token', token)
    verificationToken.save(function(err) {
        if (err) return done(err)
        console.log('Verification Token', verificationToken)
        return done(null, token)
    })
}

module.exports = mongoose.model('VerificationToken', VerificationToken)
