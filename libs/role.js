module.exports = {
    isAdmin: function() {
        return function (req, res, next) {
            console.log(req.params.id)
            if(req.user.admin) {
                next()
            } else {
                res.statusCode = 403
                res.end('Forbidden')
            }
        }
    },

    isModerador: function() {
        return function (req, res, next) {
            if(req.user.moderador || req.user.admin) {
                next()
            } else {
                res.statusCode = 403
                res.end('Forbidden')
            }
        }
    }
}
