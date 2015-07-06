var express = require('express')
var router = express.Router()
var passport = require('passport')

var libs = process.cwd() + '/libs/'

var db = require(libs + 'db/mongoose')
var Task = require(libs + 'model/task')

router.get('/', function(req, res) {
    Task.find()
        .populate('projects')
        .populate('assignee')
        .populate('subtasks')
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
    Task.findById(req.params.id)
        .populate('projects')
        .populate('assignee')
        .populate('subtasks')
        .exec(function(err, task) {
            if(!task) {
                res.statusCode = 404
                return res.json({error: 'Not found'})
            }
            if(!err) {
                return res.json({status: 'OK', task:task})
            } else {
                res.statusCode = 500
                console.log('Internal error(%d): %s', res.statusCode, err.message)
                return res.json({error: 'Server error'})
        }
    })
})

router.post('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    var task = new Task({
        name: req.body.name,
        projects: req.body.projects,
        subtasks: req.body.subtasks,
        timeExpent: req.body.timeExpent,
        assignee: req.body.assignee
    })

    task.save(function (err) {
        if(!err) {
            return res.json({status: 'OK', task:task})
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

    Task.findById(memberId, function(err, task) {
        if(!task) {
            res.statusCode = 404
            return res.json({error: 'Not found'})
        }

        task.name = req.body.name
        task.projects = req.body.projects
        task.subtasks = req.body.subtasks
        task.assignee = req.body.assignee
        task.timeExpent = req.body.timeExpent

        task.save(function(err) {
            if(!err) {
                return res.json({status: 'OK', task:task})
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
