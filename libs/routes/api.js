var express = require('express')
var passport = require('passport')
var router = express.Router()

router.get('/', function (req, res) {
    res.json({
        status: 'OK'
    })
})

module.exports = router
