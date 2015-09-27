var passport = require('passport')
var ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy
var BearerStrategy = require('passport-http-bearer').Strategy

var libs = process.cwd() + '/libs/'

var config = require(libs + 'config')


var Usuario = require(libs + 'model/usuario')
var Client = require(libs + 'model/client')
var AccessToken = require(libs + 'model/accessToken')
var RefreshToken = require(libs + 'model/refreshToken')
var email = require(libs + 'email')


passport.use(new ClientPasswordStrategy(
    function(clientId, clientSecret, done) {
        Client.findOne({ clientId: clientId }, function(err, client) {
            if (err) {
                return done(err)
            }

            if (!client) {
                return done(null, false)
            }

            if (client.clientSecret !== clientSecret) {
                return done(null, false)
            }

            return done(null, client)
        })
    }
))

passport.use(new BearerStrategy(
    function(accessToken, done) {
        AccessToken.findOne({ token: accessToken }, function(err, token) {

            if (err) {
                return done(err)
            }

            if (!token) {
                return done(null, false)
            }

            if( Math.round((Date.now()-token.created)/1000) > config.get('security:tokenLife') ) {

                AccessToken.remove({ token: accessToken }, function (err) {
                    if (err) {
                        return done(err)
                    }
                })

                return done(null, false, { message: 'Token expired' })
            }

            Usuario.findById(token.userId, function(err, usuario) {

                if (err) {
                    return done(err)
                }

                if (!usuario) {
                    return done(null, false, { message: 'Unknown usuario' })
                }

                var info = { scope: '*' }
                done(null, usuario, info)
            })
        })
    }
))

var LocalStrategy = require('passport-local').Strategy

passport.serializeUser(function(user, done) {
    done(null, user.id)
})

passport.deserializeUser(function(id, done) {
    Usuario.findById(id, function(err, user) {
        done(err, user)
    })
})

passport.use('local-signup', new LocalStrategy({
    passReqToCallback: true
}, function(req, username, password, done) {
    process.nextTick(function() {
        Usuario.findOne({'username': username}, function(err, user) {
            if(err) {
                return done(err)
            }

            if(user) {
                return done(null, false, req.flash('signupMessage', 'Este usuario já existe'))
            } else {
                var usuario = new Usuario()
                console.log(req.body)
                usuario.nome = req.body.nome
                usuario.email = req.body.email
                usuario.username = username
                usuario.password = password

                usuario.save(function(err) {
                    if(err) {
                        console.log('Internal error: %s', err.message)
                        return done(null, false, req.flash('signupMessage', 'Erro ao salvar o usuário: ' + err.message))
                    }
                    email.sendVerifyToUser(usuario, req.protocol, req.get('host'))
                    return done(null, usuario)
                })
            }
        })
    })
}))

passport.use('local-login', new LocalStrategy({
    passReqToCallback: true
}, function(req, username, password, done) {
    Usuario.findOne({'username': username}, function(err, user) {
        if(err) return done(err)

        if(!user) {
            return done(null, false, req.flash('loginMessage', 'Usuário não encontrado'))
        }

        if(!user.checkPassword(password)) {
            return done(null, false, req.flash('loginMessage', 'Senha incorreta'))
        }

        return done(null, user)
    })
}))
