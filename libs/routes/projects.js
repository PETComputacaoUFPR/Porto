var express = require('express')
var router = express.Router()
var passport = require('passport')

var libs = process.cwd() + '/libs/'

var db = require(libs + 'db/mongoose')
var Project = require(libs + 'model/project')

router.get('/', function(req, res) {
    Project.find()
        .populate('members')
        .populate('tasks')
        .populate('leader')
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
    Project.findById(req.params.id)
        .populate('members')
        .populate('tasks')
        .populate('leader')
        .exec(function(err, project) {
            if(!project) {
                res.statusCode = 404
                return res.json({error: 'Not found'})
            }
            if(!err) {
                return res.json({status: 'OK', project:project})
            } else {
                res.statusCode = 500
                console.log('Internal error(%d): %s', res.statusCode, err.message)
                return res.json({error: 'Server error'})
            }
        })
})

router.post('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    var project = new Project({
        name: req.body.name,
        members: req.body.members,
        tasks: req.body.tasks,
        color: req.body.color,
        leader: req.body.leader
    })

    project.save(function (err) {
        if(!err) {
            return res.json({status: 'OK', project:project})
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

    Project.findById(memberId, function(err, project) {
        if(!project) {
            res.statusCode = 404
            return res.json({error: 'Not found'})
        }

        project.name = req.body.name
        project.members = req.body.members
        project.tasks = req.body.tasks
        project.color = req.body.color
        project.leader = req.body.leader

        project.save(function(err) {
            if(!err) {
                return res.json({status: 'OK', project:project})
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
