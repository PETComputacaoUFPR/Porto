var express = require('express')
var passport = require('passport')
var router = express.Router()

var libs = process.cwd() + '/libs/'

var db = require(libs + 'db/mongoose')
var Usuario = require(libs + 'model/usuario')

router.get('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    Usuario.find()
        .exec(function(err, users) {
            if(!err) {
                for (var i=0; i < users.length; i++) {
                    u = users[i].toObject()
                    delete u.hashedPassword
                    delete u.salt
                    users[i] = u
                }
                return res.json(users)
            } else {
                res.statusCode = 500
                console.log('Internal error(%d): %s', res.statusCode, err.message)
                return res.json({error: 'Server Error'})
            }
        })
})

router.get('/me', passport.authenticate('bearer', { session: false }), function(req, res) {
    res.json({
        user_id: req.user.userId,
        nome: req.user.nome,
        username: req.user.username,
        admin: req.user.admin,
        moderador: req.user.moderador,
        scope: req.authInfo.scope
    })
})

router.get('/:id', function(req, res) {
    Usuario.findById(req.params.id)
        .exec(function(err, user) {
            if(!user) {
                res.statusCode = 404
                return res.json({error: 'Not found'})
            }
            if(!err) {
                user = user.toObject()
                delete user.hashedPassword
                delete user.salt
                return res.json({status: 'OK', user:user})
            } else {
                res.statusCode = 500
                console.log('Internal error(%d): %s', res.statusCode, err.message)
                return res.json({error: 'Server error'})
            }
        })
})

router.post('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    var user = new Usuario({
        name: req.body.name,
        username: req.body.username,
        password: req.body.password,
        admin: req.body.admin,
        moderator: req.body.moderator
    })

    user.save(function (err) {
        if(!err) {
            return res.json({status: 'OK', user:user})
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

    Usuario.findById(memberId, function(err, user) {
        if(!user) {
            res.statusCode = 404
            return res.json({error: 'Not found'})
        }

        user.name = req.body.name
        user.username = req.body.username
        user.password = req.body.password
        user.admin = req.body.admin
        user.moderator = req.body.moderator

        user.save(function(err) {
            if(!err) {
                return res.json({status: 'OK', user:user})
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
