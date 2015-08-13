var faker = require('faker')

var libs = process.cwd() + '/libs/'

var log = require(libs + 'log')(module)
var db = require(libs + 'db/mongoose')
var config = require(libs + 'config')

var Usuario = require(libs + 'model/usuario')
var Client = require(libs + 'model/client')
var AccessToken = require(libs + 'model/accessToken')
var RefreshToken = require(libs + 'model/refreshToken')

Usuario.remove({}, function(err) {
    var usuario = new Usuario({
        nome: config.get('default:usuario:nome'),
        username: config.get('default:usuario:username'),
        password: config.get('default:usuario:password'),
        email: config.get('default:usuario:email'),
        admin: config.get('default:usuario:admin'),
        moderador: config.get('default:usuario:moderador')
    })

    usuario.save(function(err, usuario) {
        if(!err) {
            log.info('New usuario - %s:%s', usuario.username, usuario.password)
        }else {
            return log.error(err)
        }
    })
})

Client.remove({}, function(err) {
    var client = new Client({
        name: config.get('default:client:name'),
        clientId: config.get('default:client:clientId'),
        clientSecret: config.get('default:client:clientSecret')
    })

    client.save(function(err, client) {

        if(!err) {
            log.info('New client - %s:%s', client.clientId, client.clientSecret)
        } else {
            return log.error(err)
        }

    })
})

AccessToken.remove({}, function (err) {
    if (err) {
        return log.error(err)
    }
})

RefreshToken.remove({}, function (err) {
    if (err) {
        return log.error(err)
    }
})

setTimeout(function() {
    db.disconnect()
}, 3000)
