var express = require('express')
var passport = require('passport')
var router = express.Router()

var libs = process.cwd() + '/libs/'

var role = require(libs + 'role')
var Professor = require(libs + 'model/professor')

router.use(role.isLoggedIn())

router.get('/', function(req, res) {
    Professor.find()
    .sort([['nome', 'ascending']])
    .exec(function(err, professores) {
        if(!err) {
            return res.render('admin/professores', {user: req.user, professores: professores, message: req.flash('professoresMessage')})
        }
    })
})

router.post('/', function(req, res) {
    var professor = new Professor()
    professor.codigo = req.body.codigo
    professor.nome = req.body.nome

    professor.save(function(err) {
        if(!err) {
            res.redirect('/admin/professores')
        } else {
            req.flash('professoresMessage', 'Erro ao salvar a matéria')
            res.redirect('/admin/professores')
        }
    })
})

router.get('/:id', function(req, res) {
    Professor.findById(req.params.id, function(err, professor) {
        if(!professor) {
            // TODO: redirecionar para 404
            res.redirect('/')
        }

        if(!err) {
            res.render('admin/professorDetails', {user: req.user, professor: professor, message: req.flash('professorDetailsMessage')})
        } else {
            // TODO: redirecionar para 500
            res.redirect('/')
        }
    })
})

router.post('/:id', function(req, res) {
    Professor.findById(req.params.id, function(err, professor) {
        if(!professor) {
            // TODO: redirecionar para 404
            res.redirect('/admin/professor/'+req.params.id)
        }

        professor.codigo = req.body.codigo
        professor.nome = req.body.nome

        professor.save(function(err) {
            if(!err) {
                req.flash('professoresMessage', 'Professor salvo com sucesso')
                res.redirect('/admin/professores')
            } else {
                // TODO: redirecionar para 500
                res.redirect('/')
            }
        })
    })
})

router.get('/delete/:id', function(req, res) {
    Professor.findByIdAndRemove(req.params.id, function(err, professor) {
        if(!professor) {
            // TODO: redirecionar para 500
            res.redirect('/')
        }
        req.flash('professoresMessage', 'Professor removido com sucesso')
        res.redirect('/admin/professores')
    })
})

module.exports = router
