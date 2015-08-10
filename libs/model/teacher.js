var mongoose = require('mongoose')
var Schema = mongoose.Schema

var Teacher = new Schema({
	name: {
		type: String,
		required: true
	}
})

module.exports = mongoose.model('Teacher', Teacher)
