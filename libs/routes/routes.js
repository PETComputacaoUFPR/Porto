var express = require('express')
var passport = require('passport')
var router = express.Router()
var multer = require('multer')
var crypto = require('crypto')
var path = require('path')

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function(req, file, cb) {
        crypto.pseudoRandomBytes(16, function(err, raw) {
            cb(null, raw.toString('hex') + Date.now() + path.extname(file.originalname))
        })
    }
})
var fileFilter = function(req, file, cb) {
    if(file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/png' ||
    file.mimetype === 'application/pdf') {
        cb(null, true)
        return
    }
    var err = new Error('Invalid file')
    err.status = 400
    cb(err)
}
var upload = multer({storage: storage, fileFilter: fileFilter})
var fs = require('fs')

var libs = process.cwd() + '/libs/'
var VerificationToken = require(libs + 'model/verificationToken')
var Usuario = require(libs + 'model/usuario')
var role = require(libs + 'role')

router.get('/', function(req, res) {
    var user = req.user
    if(user) {
        delete user.hashedPassword
        delete user.salt
    }
    res.render('index', {user: user})
})

router.get('/login', function(req, res) {
    res.render('login', {message: req.flash('loginMessage')})
})

router.post('/login', passport.authenticate('local-login', {
    failureRedirect: '/login',
    failureFlash: true
}), function(req, res) {
    if(req.query.url) return res.redirect(req.query.url)
    return res.redirect('/')
})

router.get('/logout', function(req, res) {
    req.logout()
    res.redirect('/')
})

router.get('/signup', function(req, res) {
    res.render('signup', {message: req.flash('signupMessage')})
})

router.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/',
    failureRedirect: '/signup',
    failureFlash: true
}))

router.get('/verify/:token', function(req, res) {
    var token = req.params.token
    var ok = true
    VerificationToken.findOne({token: token}, function(err, vToken) {
        if(err) {
            console.log(err)
            req.flash('verifyMessage', 'A verificação falhou. Entre em contato com um administrador através do e-mail pet@inf.ufpr.br')
            ok = false
        }
        Usuario.findOne({_id: vToken.userId}, function(err, usuario) {
            usuario.verificado = true
            usuario.save(function(err) {
                if(err) {
                    console.log(err)
                    ok = false
                    req.flash('verifyMessage', 'A verificação falhou. Entre em contato com um administrador através do e-mail pet@inf.ufpr.br')
                }
            })
        })
        res.render('verify', {message: req.flash('verifyMessage'), ok: ok})
    })
})

router.get('/conta', role.isLoggedIn(), function(req, res) {
    res.render('conta', {user: req.user})
})

router.get('/upload', role.isLoggedIn(), function(req, res) {
    res.render('upload', {user: req.user})
})

router.post('/upload', role.isLoggedIn(), role.isVerificado(), upload.array('arquivo', 1), function(req, res) {
    var arquivo = req.files[0]
    for (var attr in req.body) {
        arquivo[attr] = req.body[attr]
    }
    arquivo.provaTrabalho = (arquivo.provaTrabalho === 'on')
    arquivo.substitutiva = (arquivo.substitutiva === 'on')
    console.log(arquivo)
    res.render('uploadDetails', {user: req.user, arquivo: arquivo})
})

module.exports = router