var express = require('express')
var passport = require('passport')
var router = express.Router()

var libs = process.cwd() + '/libs/'

var role = require(libs + 'role')

router.get('/', function(req, res) {
    var user = req.user
    if(user) {
        delete user.hashedPassword
        delete user.salt
    }
    res.render('index', {user: user})
})

router.get('/login', function(req, res) {
    res.render('login', {message: req.flash('loginMessage')})
})

router.post('/login', passport.authenticate('local-login', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

router.get('/signup', function(req, res) {
    res.render('signup', {message: req.flash('signupMessage')})
})

router.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/',
    failureRedirect: '/signup',
    failureFlash: true
}))

module.exports = router
