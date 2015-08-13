var express = require('express')
var passport = require('passport')
var router = express.Router()

var libs = process.cwd() + '/libs/'

var db = require(libs + 'db/mongoose')
var Materia = require(libs + 'model/materia')
var role = require(libs + 'role')

router.get('/', function(req, res) {
    Materia.find()
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
    Materia.findById(req.params.id)
        .exec(function(err, materia) {
            if(!materia) {
                res.statusCode = 404
                return res.json({error: 'Not found'})
            }
            if(!err) {
                return res.json({status: 'OK', materia:materia})
            } else {
                res.statusCode = 500
                console.log('Internal error(%d): %s', res.statusCode, err.message)
                return res.json({error: 'Server error'})
            }
        })
})

router.post('/', passport.authenticate('bearer', { session: false }), role.isModerador(), function(req, res) {
    var materia = new Materia({
        nome: req.body.nome,
        codigo: req.body.codigo
    })

    materia.save(function (err) {
        if(!err) {
            return res.json({status: 'OK', materia:materia})
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

router.put('/:id', passport.authenticate('bearer', { session: false }), role.isModerador(), function(req, res) {
    var memberId = req.params.id

    Materia.findById(memberId, function(err, materia) {
        if(!materia) {
            res.statusCode = 404
            return res.json({error: 'Not found'})
        }

        materia.nome = req.body.nome
        materia.codigo = req.body.codigo

        materia.save(function(err) {
            if(!err) {
                return res.json({status: 'OK', materia:materia})
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
    Materia.findByIdAndRemove(req.params.id, function(err, materia) {
        if(!materia) {
            res.statusCode = 404
            return res.json({error: 'Not found'})
        }
        return res.json({status: 'Removed'})
    })
})

module.exports = router
