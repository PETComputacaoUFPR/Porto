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
var Arquivo = require(libs + 'model/arquivo')
var Materia = require(libs + 'model/materia')
var Professor = require(libs + 'model/professor')
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
    Materia.find(function(err, materias) {
        if(!err) {
            Professor.find(function(err, professores) {
                if(!err) {
                    res.render('upload', {user: req.user, materias: materias, professores: professores})
                }
            })
        }
    })
})

router.post('/upload', role.isLoggedIn(), role.isVerificado(), upload.array('arquivo', 1), function(req, res) {
    /*
    No momento é feito o upload de apenas 1 arquivo. Logo esse for é "inútil"
    */
   console.log(req.body.materia)
   console.log(req.body.professor)
    Materia.find({nome: req.body.materia}).exec(function(err, materia){
        if(!err) {
            Professor.find({nome: req.body.professor}).exec(function(err, professor) {
                if(!err) {
                    console.log(materia)
                    console.log(professor)
                    for(var f in req.files) {
                        file = req.files[f]
                        var arquivo = new Arquivo({
                            nome: file.originalname,
                            tipo: (req.body.provaTrabalho === 'on') ? 'prova' : 'trabalho',
                            numero: req.body.numero || 0,
                            substitutiva: (req.body.substitutiva === 'on'),
                            ano: req.body.ano,
                            semestre: req.body.semestre,
                            arquivo: file.path,
                            status: req.body.status || 'pendente',
                            tipoArquivo: file.mimetype,
                            // TODO: aqui tem que converter o nome/código da máteria e do professor para o _id do mongo
                            materia: materia[0]._id,
                            professor: professor[0]._id,
                            usuario: req.user.userId
                        })

                        arquivo.save(function (err) {
                            if(!err) {
                                console.log(arquivo)
                                res.render('uploadDetails', {user: req.user, arquivo: arquivo, materia: materia[0].nome, professor: professor[0].nome})
                            } else {
                                if(err.name === 'ValidationError') {
                                    res.statusCode = 400
                                    res.json({error: 'Validation error'})
                                } else {
                                    res.statusCode = 500
                                    res.json({error:'Server error'})
                                }
                                console.log('Internal error(%d): %s', res.statusCode, err.message)
                                fs.unlink(file.path, function() {
                                    if(err) console.log(err)
                                })
                            }
                        })
                    }
                }
            })
        }
    })
})

router.get('/upload/cancel/:id', role.isLoggedIn(), role.isVerificado(), function(req, res) {
    Arquivo.findByIdAndRemove(req.params.id, function(err, arquivo) {
        if(!arquivo) {
            res.statusCode = 404
            return res.json({error: 'Not found'})
        }
        fs.unlink(arquivo.arquivo, function() {
            if(err) console.log(err)
        })
        res.redirect('/upload')
    })
})

module.exports = router
