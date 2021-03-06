var express = require('express')
var passport = require('passport')
var router = express.Router()

var libs = process.cwd() + '/libs/'

var role = require(libs + 'role')
var Materia = require(libs + 'model/materia')

router.use(role.isLoggedIn())
router.use(role.isModerador())

router.get('/', function(req, res) {
    Materia.find()
    .sort([['codigo', 'ascending']])
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
            req.flash('materiasMessage', JSON.stringify({
                title: 'Salva!',
                message: 'A matéria foi criada com sucesso',
                type: 'success'
            }))
            res.redirect('/admin/materias')
        } else {
            req.flash('materiasMessage', JSON.stringify({
                title: 'Erro!',
                message: 'Houve um erro ao salvar a matéria. Tente novamente ou contate um administrador.',
                type: 'error'
            }))
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
                req.flash('materiasMessage', JSON.stringify({
                    title: 'Alterado!',
                    message: 'A matéria foi alterada com sucesso',
                    type: 'success'
                }))
                res.redirect('/admin/materias')
            } else {
                req.flash('materiasMessage', JSON.stringify({
                    title: 'Erro!',
                    message: 'Houve um erro ao editar a matéria. Tente novamente ou contate um administrador.',
                    type: 'error'
                }))
                res.redirect('/admin/materias')
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
        req.flash('materiasMessage', JSON.stringify({
            title: 'Deletada!',
            message: 'A matéria ' + materia.nome + ' foi deletada.',
            type: 'success'
        }))
        res.redirect('/admin/materias')
    })
})

module.exports = router
