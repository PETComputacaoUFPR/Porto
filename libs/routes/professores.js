var express = require('express')
var passport = require('passport')
var router = express.Router()

var libs = process.cwd() + '/libs/'

var db = require(libs + 'db/mongoose')
var Professor = require(libs + 'model/professor')

router.get('/', function(req, res) {
    Professor.find()
        .exec(function(err, professores) {
            if(!err) {
                return res.json(professores)
            } else {
                res.statusCode = 500
                console.log('Internal error(%d): %s', res.statusCode, err.message)
                return res.json({error: 'Server Error'})
            }
        })
})

router.get('/:id', function(req, res) {
    Professor.findById(req.params.id)
        .exec(function(err, professor) {
            if(!professor) {
                res.statusCode = 404
                return res.json({error: 'Not found'})
            }
            if(!err) {
                return res.json({status: 'OK', professor:professor})
            } else {
                res.statusCode = 500
                console.log('Internal error(%d): %s', res.statusCode, err.message)
                return res.json({error: 'Server error'})
            }
        })
})

router.post('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    var professor = new Professor({
        nome: req.body.nome
    })

    professor.save(function (err) {
        if(!err) {
            return res.json({status: 'OK', professor:professor})
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

router.put('/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    var memberId = req.params.id

    Professor.findById(memberId, function(err, professor) {
        if(!professor) {
            res.statusCode = 404
            return res.json({error: 'Not found'})
        }

        professor.nome = req.body.nome

        professor.save(function(err) {
            if(!err) {
                return res.json({status: 'OK', professor:professor})
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
