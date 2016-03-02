var express = require('express')
var passport = require('passport')
var router = express.Router()

var libs = process.cwd() + '/libs/'

var role = require(libs + 'role')
var Usuario = require(libs + 'model/usuario')
var Arquivo = require(libs + 'model/arquivo')
var Materia = require(libs + 'model/materia')

router.use(role.isLoggedIn())
router.use(role.isModerador())

router.get('/', function(req, res) {
    Arquivo.count({}, function(err, count) {
        if(err) {
            console.log(err.message)
        } else {
            res.render('admin/admin', {user: req.user, pendentes: count})
        }
    })
})

module.exports = router
