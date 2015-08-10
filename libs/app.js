var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var passport = require('passport')
var methodOverride = require('method-override')
var cors = require('cors')

var libs = process.cwd() + '/libs/'
require(libs + 'auth/auth')

var config = require('./config')
var log = require('./log')(module)
var oauth2 = require('./auth/oauth2')

var api = require('./routes/api')
var users = require('./routes/users')
var materias = require('./routes/materias')
var teachers = require('./routes/teachers')
var tests = require('./routes/tests')

var app = express()

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(methodOverride())
app.use(passport.initialize())

app.use('/', api)
app.use('/v1/u', users)
app.use('/v1/materias', materias)
app.use('/v1/professores', teachers)
app.use('/v1/arquivos', tests)
app.use('/oauth/token', oauth2.token)

// catch 404 and forward to error handler
app.use(function(req, res, next){
    res.status(404)
    log.debug('%s %d %s', req.method, res.statusCode, req.url)
    res.json({
    	error: 'Not found'
    })
    return
})

// error handlers
app.use(function(err, req, res, next){
    res.status(err.status || 500)
    log.error('%s %d %s', req.method, res.statusCode, err.message)
    res.json({
    	error: err.message
    })
    return
})

module.exports = app
