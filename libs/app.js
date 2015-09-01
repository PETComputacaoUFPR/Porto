var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var passport = require('passport')
var methodOverride = require('method-override')
var cors = require('cors')
var compression = require('compression')
var session = require('express-session')
var flash = require('connect-flash')

var libs = process.cwd() + '/libs/'
require(libs + 'auth/auth')

var config = require('./config')
var log = require('./log')(module)
var oauth2 = require('./auth/oauth2')

var rotas = require('./routes/routes')
var api = require('./routes/api/api')
var usuarios = require('./routes/api/usuarios')
var materias = require('./routes/api/materias')
var professores = require('./routes/api/professores')
var arquivos = require('./routes/api/arquivos')

var app = express()

app.set('json spaces', 2)
app.set('view engine', 'ejs')
app.set('views', process.cwd() + '/client/views')
app.use(express.static('client/public'))
app.use('/bower_components', express.static('bower_components'))
app.use(compression({level: 9}))
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(methodOverride())
app.use(session({secret: 'KeepItSecret'}))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())

// Rotas da aplicação
app.use('/', rotas)

// Pasta pública onde ficam os uploads
app.use('/uploads', express.static('uploads'))

// Rotas da API REST
app.use('/api/*', cors())
app.use('/api/', api)
app.use('/api/u', usuarios)
app.use('/api/materias', materias)
app.use('/api/professores', professores)
app.use('/api/arquivos', arquivos)
app.use('/api/oauth/token', oauth2.token)

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
