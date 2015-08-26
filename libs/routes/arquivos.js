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
    console.log(file.mimetype)
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

var db = require(libs + 'db/mongoose')
var Arquivo = require(libs + 'model/arquivo')
var role = require(libs + 'role')

router.use(passport.authenticate('bearer', { session: false }))

router.get('/', role.isModerador(), function(req, res) {
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

router.get('/:id', role.isModerador(), function(req, res) {
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

router.get('/status/:status', role.isModerador(), function(req, res) {
    Arquivo.find({status: req.params.status})
        .populate('materia')
        .populate('professor')
        .populate('usuario')
        .exec(function(err, tests) {
            if(!err) {
                return res.json({arquivos: tests})
            } else {
                res.statusCode = 500
                console.log('Internal error(%d): %s', res.statusCode, err.message)
                return res.json({error: 'Server Error'})
            }
        })
})

router.post('/', role.isVerificado(), upload.array('files', 1), function(req, res) {
    /*
    No momento é feito o upload de apenas 1 arquivo. Logo esse for é "inútil"
    Mas, na verdade, este for está já está pensando quando vierem multiplas imagens
    */
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
                console.log('Internal error(%d): %s', res.statusCode, err.message)
                fs.unlink(file.path, function() {
                    if(err) console.log(err)
                })
            }
        })
    }
})

router.put('/:id', function(req, res) {

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

router.put('/:id/status', role.isModerador(), function(req, res) {
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

router.delete('/:id', role.isModerador(), function(req, res) {
    Arquivo.findByIdAndRemove(req.params.id, function(err, arquivo) {
        if(!arquivo) {
            res.statusCode = 404
            return res.json({error: 'Not found'})
        }
        return res.json({status: 'Removed'})
    })
})

module.exports = router
