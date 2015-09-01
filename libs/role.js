module.exports = {
    isAdmin: function() {
        return function (req, res, next) {
            console.log(req.params.id)
            if(req.user.admin) {
                return next()
            } else {
                res.statusCode = 403
                res.json({error: 'Forbidden'})
            }
        }
    },

    isModerador: function() {
        return function (req, res, next) {
            if(req.user.moderador || req.user.admin) {
                return next()
            } else {
                res.statusCode = 403
                res.json({error: 'Forbidden'})
            }
        }
    },

    isVerificado: function() {
        return function (req, res, next) {
            if(req.user.verificado && !req.user.bloqueado) {
                return next()
            } else {
                res.statusCode = 403
                res.json({error: 'Forbidden'})
            }
        }
    },

    isLoggedIn: function() {
        return function(req, res, next) {
            if(req.isAuthenticated()) {
                return next()
            }

            req.flash('loginMessage', 'Você precisa estar logado para acessar essa página')
            res.redirect('/login')
        }
    }
}
