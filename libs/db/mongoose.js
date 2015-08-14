var mongoose = require('mongoose')

var libs = process.cwd() + '/libs/'

var log = require(libs + 'log')(module)
var config = require(libs + 'config')

var uri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || config.get('mongoose:uri')

mongoose.connect(uri)

var db = mongoose.connection

db.on('error', function (err) {
	log.error('Connection error:', err.message)
})

db.once('open', function callback () {
	log.info("Connected to DB")
})

module.exports = mongoose
