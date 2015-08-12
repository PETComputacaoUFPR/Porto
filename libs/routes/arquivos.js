var express = require('express')
var passport = require('passport')
var router = express.Router()
var multer = require('multer')
var upload = multer({dest: 'uploads/'})

var libs = process.cwd() + '/libs/'

var db = require(libs + 'db/mongoose')
var Arquivo = require(libs + 'model/arquivo')

router.get('/', function(req, res) {
    Arquivo.find()
        .populate('materia')
        .populate('professor')
        .populate('usuario')
        .exec(function(err, members) {
            if(!err) {
                return res.json(members)
            } else {
                res.statusCode = 500
                console.log('Internal error(%d): %s', res.statusCode, err.message)
                return res.json({error: 'Server Error'})
            }
        })
})

router.get('/:id', function(req, res) {
    Arquivo.findById(req.params.id)
        .populate('materia')
        .populate('professor')
        .populate('usuario')
        .exec(function(err, arquivo) {
            if(!arquivo) {
                res.statusCode = 404
                return res.json({error: 'Not found'})
            }
            if(!err) {
                return res.json({status: 'OK', arquivo:arquivo})
            } else {
                res.statusCode = 500
                console.log('Internal error(%d): %s', res.statusCode, err.message)
                return res.json({error: 'Server error'})
            }
        })
})

router.get('/status/:status', function(req, res) {
    Arquivo.find({status: req.params.status})
        .populate('materia')
        .populate('professor')
        .populate('usuario')
        .exec(function(err, tests) {
            if(!err) {
                return res.json(tests)
            } else {
                res.statusCode = 500
                console.log('Internal error(%d): %s', res.statusCode, err.message)
                return res.json({error: 'Server Error'})
            }
        })
})

router.post('/', upload.array('files', 1), passport.authenticate('bearer', { session: false }), function(req, res) {
    for(var f in req.files) {
        file = req.files[f]
        var arquivo = new Arquivo({
            nome: file.originalname,
            tipo: req.body.tipo,
            numero: req.body.numero || 0,
            substitutiva: req.body.substitutiva || false,
            ano: req.body.ano,
            semestre: req.body.semestre,
            arquivo: file.path,
            status: req.body.status || 'pendente',
            tipoArquivo: file.mimetype,
            usuario: req.user.userId
        })

        arquivo.save(function (err) {
            if(!err) {
                return res.json({status: 'OK', file:arquivo})
            } else {
                if(err.name === 'ValidationError') {
                    res.statusCode = 400
                    res.json({error: 'Validation error'})
                } else {
                    res.statusCode = 500
                    res.json({error:'Server error'})
                }
                console.log(err)
                console.log('Internal error(%d): %s', res.statusCode, err.message)
            }
        })
    }
})

router.put('/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    var memberId = req.params.id

    Arquivo.findById(memberId, function(err, arquivo) {
        if(!arquivo) {
            res.statusCode = 404
            return res.json({error: 'Not found'})
        }

        arquivo.numero = req.body.numero
        arquivo.substitutiva = req.body.substitutiva
        arquivo.ano = req.body.ano
        arquivo.semestre = req.body.semestre
        arquivo.tipoArquivo = req.body.tipoArquivo
        arquivo.materia = req.body.materia
        arquivo.professor = req.body.professor

        arquivo.save(function(err) {
            if(!err) {
                return res.json({status: 'OK', arquivo:arquivo})
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

router.put('/status/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    var memberId = req.params.id

    Arquivo.findById(memberId, function(err, arquivo) {
        if(!arquivo) {
            res.statusCode = 404
            return res.json({error: 'Not found'})
        }

        arquivo.status = req.body.status

        arquivo.save(function(err) {
            if(!err) {
                return res.json({status: 'OK', arquivo:arquivo})
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

module.exports = router
