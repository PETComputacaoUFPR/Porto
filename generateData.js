var faker = require('faker')
var fs = require('fs')

var libs = process.cwd() + '/libs/'

var log = require(libs + 'log')(module)
var db = require(libs + 'db/mongoose')
var config = require(libs + 'config')

var Usuario = require(libs + 'model/usuario')
var Client = require(libs + 'model/client')
var Materia = require(libs + 'model/materia')
var Professor = require(libs + 'model/professor')
var Arquivo = require(libs + 'model/arquivo')
var AccessToken = require(libs + 'model/accessToken')
var RefreshToken = require(libs + 'model/refreshToken')

var inserts = require(libs + 'data/inserts')

Arquivo.remove({}, function(err) {
    var dir = process.cwd() + '/uploads/'
    try{
        var files = fs.readdirSync(dir)
    } catch(e) {
        log.error(e)
    }
    if(files.length > 0) {
        for(var i = 0; i < files.length; i++) {
            var filePath = dir + files[i]
            if(fs.statSync(filePath).isFile()) {
                fs.unlinkSync(filePath)
            }
        }
    }
})

Materia.remove({}, function(err) {
    inserts.materias.forEach(function(m){
        var materia  = new Materia({
            codigo: m.codigo,
            nome: m.nome
        })

        materia.save(function(err, materia) {
            if(!err) {
                log.info('Materia - %s:%s', materia.codigo, materia.nome)
            } else {
                log.error(err.message)
            }
        })
    })
})

Professor.remove({}, function(err) {
    inserts.professores.forEach(function(p){
        var professor  = new Professor({
            nome: p.nome
        })

        professor.save(function(err, professor) {
            if(!err) {
                log.info('Professor - %s', professor.nome)
            } else {
                log.error(err.message)
            }
        })
    })
})

Usuario.remove({}, function(err) {
    var usuario = new Usuario({
        nome: config.get('default:usuario:nome'),
        username: config.get('default:usuario:username'),
        password: config.get('default:usuario:password'),
        email: config.get('default:usuario:email'),
        admin: config.get('default:usuario:admin'),
        moderador: config.get('default:usuario:moderador'),
        verificado: true
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
