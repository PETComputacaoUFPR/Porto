var email = require('emailjs')

var libs = process.cwd() + '/libs/'

var VerificationToken = require(libs + 'model/verificationToken')
var config = require(libs + 'config')

var server = email.server.connect({
    user: config.get('default:email:user'),
    password: process.env.EMAILPASSWORD || config.get('default:email:password'),
    host: config.get('default:email:host'),
    ssl: true
})

function sendVerifyToUser(usuario, protocol, host) {
    console.log(server)
    var verificationToken = new VerificationToken({
        userId: usuario._id
    })
    verificationToken.createVerificationToken(function(err, token) {
        if (err) {
            console.log('Não foi possível criar o token')
            return
        }
        var text = 'Olá, ' + usuario.nome + '. Clique neste link para validar sua conta: ' + protocol + '://' + host + '/verify/' + token
        var message = {
            from: 'PET Computação UFPR <pet@inf.ufpr.br>',
            to: usuario.nome + ' <' + usuario.email + '>',
            subject: 'Farol - Confirmação de Conta',
            text: text
        }

        server.send(message, function(err, message) {
            console.log(err || message)
        })
    })
}

module.exports = {
    sendVerifyToUser: function(usuario, protocol, host) {
        sendVerifyToUser(usuario, protocol, host)
    }
}
