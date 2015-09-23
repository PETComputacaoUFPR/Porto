var express = require('express')
var passport = require('passport')
var router = express.Router()

var libs = process.cwd() + '/libs/'

var role = require(libs + 'role')
var Usuario = require(libs + 'model/usuario')
var Arquivo = require(libs + 'model/arquivo')
var Materia = require(libs + 'model/materia')

router.use(role.isLoggedIn())

router.get('/', function(req, res) {
    Arquivo.count({}, function(err, count) {
        if(err) {
            console.log(err.message)
        } else {
            res.render('admin/admin', {user: req.user, pendentes: count})
        }
    })
})


router.get('/uploads', function(req, res) {
    Arquivo.find({status: 'pendente'})
        .populate('materia')
        .populate('professor')
        .populate('usuario')
        .exec(function(err, arquivos) {
            if(!err) {
                return res.render('admin/uploads', {user: req.user , uploads: arquivos})
            } else {
                // TODO: redirecionar para página de erro
            }
        })
})

module.exports = router
