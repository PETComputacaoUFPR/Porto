var passport = require('passport')
var ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy
var BearerStrategy = require('passport-http-bearer').Strategy

var libs = process.cwd() + '/libs/'

var config = require(libs + 'config')

var Usuario = require(libs + 'model/usuario')
var Client = require(libs + 'model/client')
var AccessToken = require(libs + 'model/accessToken')
var RefreshToken = require(libs + 'model/refreshToken')

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
