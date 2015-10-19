var express = require('express')
var passport = require('passport')
var router = express.Router()

var libs = process.cwd() + '/libs/'

var role = require(libs + 'role')
var Usuario = require(libs + 'model/usuario')

router.use(role.isLoggedIn())
router.use(role.isAdmin())

router.get('/', function(req, res) {
    Usuario.find()
    .sort([['nome', 'ascending']])
    .exec(function(err, usuarios) {
        if(!err) {
            return res.render('admin/usuarios', {user: req.user, usuarios: usuarios, message: req.flash('usuariosMessage')})
        }
    })
})

router.get('/:id', function(req, res) {
    Usuario.findById(req.params.id, function(err, usuario) {
        if(!usuario) {
            // TODO: redirecionar para 404
            res.redirect('/')
        }

        if(!err) {
            res.render('admin/usuarioDetails', {user: req.user, usuario: usuario, message: req.flash('professorDetailsMessage')})
        } else {
            // TODO: redirecionar para 500
            res.redirect('/')
        }
    })
})

router.post('/:id', function(req, res) {
    Usuario.findById(req.params.id, function(err, usuario) {
        if(!usuario) {
            // TODO: redirecionar para 404
            res.redirect('/admin/usuario/'+req.params.id)
        }

        usuario.nome = req.body.nome
        usuario.username = req.body.username
        usuario.email = req.body.email
        usuario.admin = req.body.admin || usuario.admin
        usuario.moderador = req.body.moderador || usuario.moderador

        usuario.save(function(err) {
            if(!err) {
                req.flash('usuariosMessage', 'successEdit')
                res.redirect('/admin/usuarios')
            } else {
                // TODO: redirecionar para 500
                console.log(err);
                res.redirect('/')
            }
        })
    })
})

router.get('/delete/:id', function(req, res) {
    Usuario.findByIdAndRemove(req.params.id, function(err, usuario) {
        if(!usuario) {
            // TODO: redirecionar para 500
            res.redirect('/')
        }
        req.flash('usuariosMessage', 'successDelete')
        res.redirect('/admin/usuarios')
    })
})

module.exports = router
