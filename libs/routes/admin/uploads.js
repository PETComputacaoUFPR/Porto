var express = require('express')
var passport = require('passport')
var router = express.Router()
var fs = require("fs")

var libs = process.cwd() + '/libs/'

var role = require(libs + 'role')
var Usuario = require(libs + 'model/usuario')
var Arquivo = require(libs + 'model/arquivo')
var Materia = require(libs + 'model/materia')

router.use(role.isLoggedIn())
router.use(role.isModerador())

router.get('/', function(req, res) {
    Arquivo.find({status: 'pendente'})
        .populate('materia')
        .populate('professor')
        .populate('usuario')
        .exec(function(err, arquivos) {
            if(!err) {
                return res.render('admin/uploads', {user: req.user , uploads: arquivos, message: req.flash('uploadsMessage')})
            } else {
                // TODO: redirecionar para página de erro
            }
        })
})

router.get('/aprovar/:id', function(req, res) {
    Arquivo.findById(req.params.id, function(err, arquivo) {
        if(!arquivo) {
            //TODO: redirecionar para 404
            res.redirect('/')
        }
        
        if(!err) {
            arquivo.status = "aprovado"
            arquivo.save(function(err) {
                if(!err) {
                    req.flash('uploadsMessage', JSON.stringify({
                        title: 'Aprovado!',
                        message: 'O arquivo foi aprovado com sucesso',
                        type: 'success'
                    }))
                    res.redirect('/admin/uploads')
                } else {
                    req.flash('uploadsMessage', JSON.stringify({
                        title: 'Erro!',
                        message: 'Houve um erro ao aprovar o arquivo. Tente novamente ou contate um administrador.',
                        type: 'error'
                    }))
                    res.redirect('/admin/uploads')
                }
            })
        } else {
            res.redirect('/')
        }
    })
})

router.get('/reprovar/:id', function(req, res) {
    Arquivo.findByIdAndRemove(req.params.id, function(err, arquivo) {
        if(!arquivo) {
            //TODO: redirecionar para 404
            res.redirect('/')
        }
        
        if(!err) {
            fs.unlink(arquivo.arquivo, function() {
                if(err) log.error(err)
            })
            
            req.flash('uploadsMessage', JSON.stringify({
                title: 'Reprovado!',
                message: 'O arquivo foi reprovado.',
                type: 'success'
            }))
            res.redirect('/admin/uploads')
        } else {
            res.redirect('/')
        }
    })
})


module.exports = router
