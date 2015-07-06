var express = require('express')
var router = express.Router()
var passport = require('passport')

var libs = process.cwd() + '/libs/'

var db = require(libs + 'db/mongoose')
var Work = require(libs + 'model/work')

router.get('/', function(req, res) {
    Work.find()
        .populate('task')
        .populate('member')
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
    Work.findById(req.params.id)
        .populate('task')
        .populate('member')
        .exec(function(err, work) {
            if(!work) {
                res.statusCode = 404
                return res.json({error: 'Not found'})
            }
            if(!err) {
                return res.json({status: 'OK', work:work})
            } else {
                res.statusCode = 500
                console.log('Internal error(%d): %s', res.statusCode, err.message)
                return res.json({error: 'Server error'})
        }
    })
})

router.post('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    var work = new Work({
        task: req.body.task,
        member: req.body.member,
        start: req.body.start,
        end: req.body.end
    })

    work.save(function (err) {
        if(!err) {
            return res.json({status: 'OK', work:work})
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

    Work.findById(memberId, function(err, work) {
        if(!work) {
            res.statusCode = 404
            return res.json({error: 'Not found'})
        }

        work.task = req.body.task
        work.member = req.body.member
        work.start = req.body.start
        work.end = req.body.end

        work.save(function(err) {
            if(!err) {
                return res.json({status: 'OK', work:work})
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
