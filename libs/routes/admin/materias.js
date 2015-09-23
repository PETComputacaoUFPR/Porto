var express = require('express')
var passport = require('passport')
var router = express.Router()

var libs = process.cwd() + '/libs/'

var role = require(libs + 'role')
var Materia = require(libs + 'model/materia')

router.use(role.isLoggedIn())

router.get('/', function(req, res) {
    Materia.find()
    .sort([['nome', 'ascending']])
    .exec(function(err, materias) {
        if(!err) {
            return res.render('admin/materias', {user: req.user, materias: materias, message: req.flash('materiasMessage')})
        }
    })
})

router.post('/', function(req, res) {
    var materia = new Materia()
    materia.codigo = req.body.codigo
    materia.nome = req.body.nome

    materia.save(function(err) {
        if(!err) {
            res.redirect('/admin/materias')
        } else {
            req.flash('materiasMessage', 'Erro ao salvar a matéria')
            res.redirect('/admin/materias')
        }
    })
})

router.get('/:id', function(req, res) {
    Materia.findById(req.params.id, function(err, materia) {
        if(!materia) {
            // TODO: redirecionar para 404
            res.redirect('/')
        }

        if(!err) {
            res.render('admin/materiaDetails', {user: req.user, materia: materia, message: req.flash('materiaDetailsMessage')})
        } else {
            // TODO: redirecionar para 500
            res.redirect('/')
        }
    })
})

router.post('/:id', function(req, res) {
    Materia.findById(req.params.id, function(err, materia) {
        if(!materia) {
            // TODO: redirecionar para 404
            res.redirect('/admin/materia/'+req.params.id)
        }

        materia.codigo = req.body.codigo
        materia.nome = req.body.nome

        materia.save(function(err) {
            if(!err) {
                req.flash('materiasMessage', 'Matéria salva com sucesso')
                res.redirect('/admin/materias')
            } else {
                // TODO: redirecionar para 500
                res.redirect('/')
            }
        })
    })
})

router.get('/delete/:id', function(req, res) {
    Materia.findByIdAndRemove(req.params.id, function(err, materia) {
        if(!materia) {
            // TODO: redirecionar para 500
            res.redirect('/')
        }
        req.flash('materiasMessage', 'Matéria removida com sucesso')
        res.redirect('/admin/materias')
    })
})

module.exports = router
