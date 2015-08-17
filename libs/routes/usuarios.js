var express = require('express')
var passport = require('passport')
var router = express.Router()
var email = require('emailjs')

var libs = process.cwd() + '/libs/'

var db = require(libs + 'db/mongoose')
var Usuario = require(libs + 'model/usuario')
var VerificationToken = require(libs + 'model/verificationToken')
var role = require(libs + 'role')
var config = require(libs + 'config')

var server = email.server.connect({
    user: config.get('default:email:user'),
    password: process.env.EMAILPASSWORD || config.get('default:email:password'),
    host: 'smtp.gmail.com',
    ssl: true
})

router.get('/', passport.authenticate('bearer', { session: false }), role.isModerador(), function(req, res) {
    Usuario.find()
        .exec(function(err, usuarios) {
            if(!err) {
                for (var i=0; i < usuarios.length; i++) {
                    u = usuarios[i].toObject()
                    delete u.hashedPassword
                    delete u.salt
                    usuarios[i] = u
                }
                return res.json(usuarios)
            } else {
                res.statusCode = 500
                console.log('Internal error(%d): %s', res.statusCode, err.message)
                return res.json({error: 'Server Error'})
            }
        })
})

router.get('/me', passport.authenticate('bearer', { session: false }), function(req, res) {
    res.json({
        user_id: req.user.userId,
        nome: req.user.nome,
        username: req.user.username,
        admin: req.user.admin,
        moderador: req.user.moderador,
        scope: req.authInfo.scope
    })
})

router.get('/verify/:token', function(req, res) {
    var token = req.params.token
    VerificationToken.findOne({token: token}, function(err, vToken) {
        if(err) {
            console.log(err)
            return res.json({error: 'Email verification failed'})
        }
        Usuario.findOne({_id: vToken.userId}, function(err, usuario) {
            usuario.verificado = true
            usuario.save(function(err) {
                if(err) {
                    console.log(err)
                    return res.json({error: 'Email verification failed. Failed to update user'})
                }
                return res.json({status: 'OK'})
            })
        })
    })
})

router.put('/me/edit', passport.authenticate('bearer', { session: false }), function(req, res) {
    Usuario.findById(req.user.userId, function(err, usuario) {
        if(!usuario) {
            res.statusCode = 404
            return res.json({error: 'Not found'})
        }

        if(!err) {
            usuario.nome = req.body.nome || usuario.nome
            usuario.username = req.body.username || usuario.username
            usuario.email = req.body.email || usuario.email
            usuario.password = req.body.password || usuario.password

            usuario.save(function(err) {
                if(!err) {
                    return res.json({status: 'OK', usuario:usuario})
                } else {
                    if(err.name === 'ValidationError') {
                        res.statusCode = 400
                        res.json({error: 'Validation error'})
                    } else {
                        res.statusCode = 500
                        res.json({error: 'Server error'})
                    }
                    console.log('Internal error(%d): %s', res.statusCode, err.message)
                }
            })
        } else {
            res.statusCode = 500
            console.log('Internal error(%d): %s', res.statusCode, err.message)
            return res.json({error: 'Server error'})
        }
    })
})

router.get('/:id', passport.authenticate('bearer', { session: false }), role.isModerador(), function(req, res) {
    Usuario.findById(req.params.id)
        .exec(function(err, usuario) {
            if(!usuario) {
                res.statusCode = 404
                return res.json({error: 'Not found'})
            }
            if(!err) {
                usuario = usuario.toObject()
                delete usuario.hashedPassword
                delete usuario.salt
                return res.json({status: 'OK', usuario:usuario})
            } else {
                res.statusCode = 500
                console.log('Internal error(%d): %s', res.statusCode, err.message)
                return res.json({error: 'Server error'})
            }
        })
})

router.post('/', function(req, res) {
    var usuario = new Usuario({
        nome: req.body.nome,
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        admin: false,
        moderador: false
    })

    usuario.save(function (err) {
        if(!err) {
            var verificationToken = new VerificationToken({
                userId: usuario._id
            })
            verificationToken.createVerificationToken(function(err, token) {
                if (err) {
                    console.log('Não foi possível criar o token')
                }
                var message = {
                    text: req.protocol + '://' + req.get('host') + '/v1/u/verify/' + token,
                    from: 'PET Computação UFPR <pet@inf.ufpr.br>',
                    to: usuario.nome + ' <' + usuario.email + '>',
                    subject: 'Farol - Confirmação de Conta'
                }

                server.send(message, function(err, message) {
                    console.log(err || message)
                })
            })

            return res.json({status: 'OK', usuario:usuario})
        } else {
            if(err.name === 'ValidationError') {
                res.statusCode = 400
                res.json({error: 'Validation error'})
            } else {
                res.statusCode = 500
                res.json({error:'Server error'})
            }
            console.log('Internal error(%d): %s', res.statusCode, err.message)
        }
    })
})

router.put('/:id', passport.authenticate('bearer', { session: false }), role.isAdmin(), function(req, res) {
    Usuario.findById(req.params.id, function(err, usuario) {
        if(!usuario) {
            res.statusCode = 404
            return res.json({error: 'Not found'})
        }

        usuario.admin = req.body.admin || usuario.admin
        usuario.moderador = req.body.moderador || usuario.moderador
        usuario.bloqueado = req.body.bloqueado || usuario.bloqueado

        usuario.save(function(err) {
            if(!err) {
                return res.json({status: 'OK', usuario:usuario})
            } else {
                if(err.name === 'ValidationError') {
                    res.statusCode = 400
                    res.json({error: 'Validation error'})
                } else {
                    res.statusCode = 500
                    res.json({error: 'Server error'})
                }
                console.log('Internal error(%d): %s', res.statusCode, err.message)
            }
        })
    })
})

router.post('/:id/block', passport.authenticate('bearer', { session: false }), role.isModerador(), function(req, res) {
    Usuario.findById(req.params.id, function(err, usuario) {
        if(!usuario) {
            res.statusCode = 404
            return res.json({error: 'Not found'})
        }

        usuario.bloqueado = !usuario.bloqueado

        usuario.save(function(err) {
            if(!err) {
                return res.json({status: 'OK', usuario:usuario})
            } else {
                if(err.name === 'ValidationError') {
                    res.statusCode = 400
                    res.json({error: 'Validation error'})
                } else {
                    res.statusCode = 500
                    res.json({error: 'Server error'})
                }
                console.log('Internal error(%d): %s', res.statusCode, err.message)
            }
        })
    })
})

router.delete('/:id', passport.authenticate('bearer', { session: false }), role.isAdmin(), function(req, res) {
    Usuario.findByIdAndRemove(req.params.id, function(err, usuario) {
        if(!usuario) {
            res.statusCode = 404
            return res.json({error: 'Not found'})
        }
        return res.json({status: 'Removed'})
    })
})

module.exports = router
