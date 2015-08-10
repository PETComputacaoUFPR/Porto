var express = require('express')
var passport = require('passport')
var router = express.Router()

var libs = process.cwd() + '/libs/'

var db = require(libs + 'db/mongoose')
var Teacher = require(libs + 'model/teacher')

router.get('/', function(req, res) {
    Teacher.find()
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
    Teacher.findById(req.params.id)
        .exec(function(err, teacher) {
            if(!teacher) {
                res.statusCode = 404
                return res.json({error: 'Not found'})
            }
            if(!err) {
                return res.json({status: 'OK', teacher:teacher})
            } else {
                res.statusCode = 500
                console.log('Internal error(%d): %s', res.statusCode, err.message)
                return res.json({error: 'Server error'})
            }
        })
})

router.post('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    var teacher = new Teacher({
        name: req.body.name
    })

    teacher.save(function (err) {
        if(!err) {
            return res.json({status: 'OK', teacher:teacher})
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

    Teacher.findById(memberId, function(err, teacher) {
        if(!teacher) {
            res.statusCode = 404
            return res.json({error: 'Not found'})
        }

        teacher.name = req.body.name

        teacher.save(function(err) {
            if(!err) {
                return res.json({status: 'OK', teacher:teacher})
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
