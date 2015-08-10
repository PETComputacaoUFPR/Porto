var express = require('express')
var passport = require('passport')
var router = express.Router()
var multer = require('multer')
var upload = multer({dest: 'uploads/'})

var libs = process.cwd() + '/libs/'

var db = require(libs + 'db/mongoose')
var Test = require(libs + 'model/test')

router.get('/', function(req, res) {
    Test.find()
        .populate('materia')
        .populate('teacher')
        .populate('user')
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
    Test.findById(req.params.id)
        .populate('materia')
        .populate('teacher')
        .populate('user')
        .exec(function(err, test) {
            if(!test) {
                res.statusCode = 404
                return res.json({error: 'Not found'})
            }
            if(!err) {
                return res.json({status: 'OK', test:test})
            } else {
                res.statusCode = 500
                console.log('Internal error(%d): %s', res.statusCode, err.message)
                return res.json({error: 'Server error'})
            }
        })
})

router.get('/status/:status', function(req, res) {
    Test.find({status: req.params.status})
        .populate('materia')
        .populate('teacher')
        .populate('user')
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
        var test = new Test({
            name: file.originalname,
            type: req.body.type,
            number: req.body.number || 0,
            substituive: req.body.substituive || false,
            year: req.body.year,
            semester: req.body.semester,
            file: file.path,
            status: req.body.status || 'pendente',
            fileType: file.mimetype,
            user: req.user.userId
        })

        test.save(function (err) {
            if(!err) {
                return res.json({status: 'OK', file:test})
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
    }
})

router.put('/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    var memberId = req.params.id

    Test.findById(memberId, function(err, test) {
        if(!test) {
            res.statusCode = 404
            return res.json({error: 'Not found'})
        }

        test.name = req.body.name
        test.type = req.body.type
        test.number = req.body.number
        test.substituive = req.body.substituive
        test.year = req.body.year
        test.semester = req.body.semester
        test.file = req.body.file
        test.fileType = req.body.fileType
        test.materia = req.body.materia
        test.teacher = req.body.teacher
        test.user = req.body.user

        test.save(function(err) {
            if(!err) {
                return res.json({status: 'OK', test:test})
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

    Test.findById(memberId, function(err, test) {
        if(!test) {
            res.statusCode = 404
            return res.json({error: 'Not found'})
        }

        test.status = req.body.status

        test.save(function(err) {
            if(!err) {
                return res.json({status: 'OK', test:test})
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
