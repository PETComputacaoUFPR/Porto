var express = require('express')
var passport = require('passport')
var router = express.Router()

var libs = process.cwd() + '/libs/'

var role = require(libs + 'role')
var Professor = require(libs + 'model/professor')

router.use(role.isLoggedIn())
router.use(role.isModerador())

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
            req.flash('professoresMessage', JSON.stringify({
                title: 'Salvo!',
                message: 'O professor foi salvo com sucesso.',
                type: 'success'
            }))
            res.redirect('/admin/professores')
        } else {
            req.flash('professoresMessage', JSON.stringify({
                title: 'Erro!',
                message: 'Houve um erro ao salvar o professor. Tente novamente ou contate um adminsitrador.',
                type: 'error'
            }))
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
                req.flash('professoresMessage', JSON.stringify({
                    title: 'Alterado!',
                    message: 'O professor foi editado com sucesso.',
                    type: 'success'
                }))
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
        req.flash('professoresMessage', JSON.stringify({
            title: 'Removido!',
            message: 'O(a) professor(a) ' + professor.nome + ' foi removido(a) com sucesso.',
            type: 'success'
        }))
        res.redirect('/admin/professores')
    })
})

module.exports = router
